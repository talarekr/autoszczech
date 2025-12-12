import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { URL } from "node:url";

import prisma from "../lib/prisma.js";
import { importInsurancePayload } from "../lib/insuranceImporter.js";
import { parseFtpEnvConfig, type FtpImporterConfig } from "../lib/ftpConfig.js";

const execFileAsync = promisify(execFile);

const joinPath = (...segments: (string | undefined)[]) =>
  segments
    .filter((segment): segment is string => Boolean(segment && segment.trim().length > 0))
    .map((segment) => segment.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");

const buildUrl = (config: FtpImporterConfig, fileName?: string, directory?: string) => {
  if (!config.host) {
    throw new Error("FTP host is not configured");
  }
  const url = new URL(`ftp://${config.host}`);
  if (config.port) {
    url.port = String(config.port);
  }
  if (config.user) {
    url.username = config.user;
  }
  if (config.password) {
    url.password = config.password;
  }
  const path = joinPath(directory, fileName);
  url.pathname = path.length > 0 ? `/${path}` : "/";
  return url;
};

const listRemoteFiles = async (config: FtpImporterConfig, directory: string): Promise<string[]> => {
  const url = buildUrl(config, undefined, directory);
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  const { stdout } = await execFileAsync("curl", ["--silent", "--list-only", url.href], {
    maxBuffer: config.maxDownloadBytes,
  });
  return stdout
    .toString()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const downloadRemoteFile = async (config: FtpImporterConfig, name: string, directory: string): Promise<Buffer> => {
  const url = buildUrl(config, name, directory);
  const { stdout } = await execFileAsync("curl", ["--silent", url.href], {
    encoding: "buffer",
    maxBuffer: config.maxDownloadBytes,
  });
  return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
};

const recordImportJob = async (
  filename: string,
  checksum: string,
  summary: { total: number; added: number; updated: number; skipped: number; errors: string[] }
) => {
  await prisma.importJob.upsert({
    where: { filename },
    create: {
      filename,
      checksum,
      total: summary.total,
      added: summary.added,
      updated: summary.updated,
      skipped: summary.skipped,
      errors: summary.errors.length ? summary.errors : undefined,
    },
    update: {
      checksum,
      total: summary.total,
      added: summary.added,
      updated: summary.updated,
      skipped: summary.skipped,
      errors: summary.errors.length ? summary.errors : undefined,
      processedAt: new Date(),
    },
  });
};

const recordErrorJob = async (filename: string, checksum: string | null, error: Error) => {
  await prisma.importJob.upsert({
    where: { filename },
    create: {
      filename,
      checksum: checksum ?? undefined,
      total: 0,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: [error.message],
    },
    update: {
      checksum: checksum ?? undefined,
      total: 0,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: [error.message],
      processedAt: new Date(),
    },
  });
};

const shouldSkip = (existing: { checksum: string | null } | null, checksum: string, forceImport: boolean) =>
  !forceImport && Boolean(existing?.checksum && existing.checksum === checksum);

const sanitizeSegment = (value: string, fallback: string) => {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return normalized || fallback;
};

const sanitizeFileName = (value: string, fallback: string) => {
  const baseName = value.split("/").pop() ?? value;
  const ext = path.extname(baseName);
  const nameWithoutExt = path.basename(baseName, ext);
  const safeName = sanitizeSegment(nameWithoutExt, fallback);
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "").toLowerCase();
  return `${safeName}${safeExt || ".jpg"}`;
};

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const resolveDisplayId = (raw: Record<string, unknown>): string | null => {
  const direct = typeof raw["offer_id"] === "string" ? raw["offer_id"].trim() : "";
  if (direct) {
    return direct;
  }
  const vehicle = (raw["vehicle"] ?? {}) as Record<string, unknown>;
  const ref = typeof vehicle["Referenz"] === "string" ? vehicle["Referenz"].trim() : "";
  if (ref) {
    return ref;
  }
  return null;
};

const normalizeImageEntries = async (
  config: FtpImporterConfig,
  payload: Record<string, unknown>,
  context: { checksum: string; prefix: string }
): Promise<Record<string, unknown>> => {
  const rawImages = Array.isArray(payload["offer_images"])
    ? (payload["offer_images"] as unknown[]).filter((value): value is string =>
        typeof value === "string" && value.trim().length > 0
      )
    : [];

  if (rawImages.length === 0) {
    return payload;
  }

  const displayId = resolveDisplayId(payload) ?? `aukcja-${context.checksum.slice(0, 8)}`;
  const displaySegment = sanitizeSegment(displayId, "aukcja");
  const targetDir = path.join(config.localImageDir, displaySegment);
  await ensureDir(targetDir);

  const seen = new Set<string>();
  const normalizedImages: string[] = [];

  for (let index = 0; index < rawImages.length; index += 1) {
    const remoteName = rawImages[index];
    let safeFileName = sanitizeFileName(remoteName, `zdjecie-${index + 1}`);
    if (seen.has(safeFileName)) {
      const base = path.basename(safeFileName, path.extname(safeFileName));
      const ext = path.extname(safeFileName) || ".jpg";
      let suffix = 2;
      while (seen.has(safeFileName)) {
        safeFileName = `${base}-${suffix}${ext}`;
        suffix += 1;
      }
    }
    seen.add(safeFileName);

    try {
      const buffer = await downloadRemoteFile(config, remoteName, config.imageDirectory);
      const absolutePath = path.join(targetDir, safeFileName);
      await fs.writeFile(absolutePath, buffer);
      const relativePath = path.posix.join(displaySegment, safeFileName);
      normalizedImages.push(relativePath);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(context.prefix, `Failed to fetch image ${remoteName}:`, err.message);
    }
  }

  if (normalizedImages.length === 0) {
    return payload;
  }

  return {
    ...payload,
    offer_images: normalizedImages,
  };
};

const preparePayload = async (
  config: FtpImporterConfig,
  payload: unknown,
  context: { checksum: string; prefix: string }
): Promise<unknown> => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if (Array.isArray(payload)) {
    const transformed: Record<string, unknown>[] = [];
    for (const entry of payload) {
      if (entry && typeof entry === "object") {
        const normalized = await normalizeImageEntries(
          config,
          entry as Record<string, unknown>,
          context
        );
        transformed.push(normalized);
      }
    }
    return transformed;
  }

  return normalizeImageEntries(config, payload as Record<string, unknown>, context);
};

export interface FtpImportReport {
  filesSeen: number;
  processed: number;
  added: number;
  updated: number;
  skipped: number;
  errors: { file: string; message: string }[];
}

let running = false;
let lastRun: { at: Date; result: FtpImportReport; config: FtpImporterConfig } | null = null;

const runImportCycle = async (config: FtpImporterConfig): Promise<FtpImportReport> => {
  const prefix = "[ftp-importer]";
  const report: FtpImportReport = {
    filesSeen: 0,
    processed: 0,
    added: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const files = await listRemoteFiles(config, config.jsonDirectory);
  report.filesSeen = files.length;

  const forceImport = (await prisma.car.count()) === 0;
  if (forceImport) {
    console.info(prefix, "Car table empty; forcing re-import of all FTP JSON files");
  }

  for (const rawName of files) {
    if (!rawName.toLowerCase().endsWith(".json")) {
      continue;
    }
    const relativePath = joinPath(config.jsonDirectory, rawName);
    try {
      const buffer = await downloadRemoteFile(config, rawName, config.jsonDirectory);
      const checksum = createHash("sha256").update(buffer).digest("hex");
      const existing = await prisma.importJob.findUnique({ where: { filename: relativePath } });

      if (shouldSkip(existing, checksum, forceImport)) {
        continue;
      }

      let summary;
      try {
        const payload = JSON.parse(buffer.toString("utf-8"));
        const normalizedPayload = await preparePayload(config, payload, {
          checksum,
          prefix,
        });
        summary = await importInsurancePayload(normalizedPayload, {
          imageBaseUrl: config.imageBaseUrl,
          fallbackProvider: config.fallbackProvider,
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        await recordErrorJob(relativePath, checksum, err);
        report.errors.push({ file: relativePath, message: err.message });
        console.error(prefix, `Failed to import ${relativePath}:`, err.message);
        continue;
      }

      report.processed += 1;
      report.added += summary.added;
      report.updated += summary.updated;
      report.skipped += summary.skipped;

      await recordImportJob(relativePath, checksum, summary);
      console.info(
        prefix,
        `Imported ${relativePath}: added=${summary.added}, updated=${summary.updated}, skipped=${summary.skipped}`
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(prefix, `Unhandled error processing ${relativePath}:`, err.message);
      report.errors.push({ file: relativePath, message: err.message });
      await recordErrorJob(relativePath, null, err);
    }
  }

  return report;
};

export const runFtpImportOnce = async (
  configOverride?: FtpImporterConfig
): Promise<{ running: boolean; report: FtpImportReport }> => {
  const config = configOverride ?? parseFtpEnvConfig();

  if (running) {
    return { running: true, report: lastRun?.result ?? { filesSeen: 0, processed: 0, added: 0, updated: 0, skipped: 0, errors: [] } };
  }

  running = true;
  try {
    await ensureDir(config.localImageDir);
    const report = await runImportCycle(config);
    lastRun = { at: new Date(), result: report, config };
    return { running: false, report };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    lastRun = {
      at: new Date(),
      result: {
        filesSeen: 0,
        processed: 0,
        added: 0,
        updated: 0,
        skipped: 0,
        errors: [{ file: "<list>", message: err.message }],
      },
      config,
    };
    throw err;
  } finally {
    running = false;
  }
};

export const getFtpImportStatus = () => ({
  running,
  lastRun,
});

export const startFtpImportLoop = async (configOverride?: FtpImporterConfig) => {
  const config = configOverride ?? parseFtpEnvConfig();
  const prefix = "[ftp-importer]";

  await ensureDir(config.localImageDir);

  await runFtpImportOnce(config);
  const timer = setInterval(() => {
    runFtpImportOnce(config).catch((error) => {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(prefix, "Scheduled import failed:", err.message);
    });
  }, config.pollMs);

  if (typeof timer.unref === "function") {
    timer.unref();
  }
  console.info(
    prefix,
    `Watching ftp://${config.host}${config.jsonDirectory ? `/${config.jsonDirectory}` : ""}`
  );
  return { stop: () => clearInterval(timer) };
};
