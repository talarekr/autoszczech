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

const buildUrl = (
  config: FtpImporterConfig,
  fileName?: string,
  directory?: string,
  options: { includeCredentials?: boolean } = {}
) => {
  if (!config.host) {
    throw new Error("FTP host is not configured");
  }
  const url = new URL(`ftp://${config.host}`);
  if (config.port) {
    url.port = String(config.port);
  }
  if (options.includeCredentials !== false) {
    if (config.user) {
      url.username = config.user;
    }
    if (config.password) {
      url.password = config.password;
    }
  }
  const path = joinPath(directory, fileName);
  url.pathname = path.length > 0 ? `/${path}` : "/";
  return url;
};

const resolveCurlAuthArgs = (config: FtpImporterConfig) => {
  if (!config.user && !config.password) {
    return [] as string[];
  }
  return ["--user", `${config.user ?? ""}:${config.password ?? ""}`];
};

const listRemoteFiles = async (config: FtpImporterConfig, directory: string): Promise<string[]> => {
  const url = buildUrl(config, undefined, directory, { includeCredentials: false });
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  const args = ["--silent", "--list-only", ...resolveCurlAuthArgs(config), url.href];
  const { stdout } = await execFileAsync("curl", args, {
    maxBuffer: config.maxDownloadBytes,
  });
  return stdout
    .toString()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const downloadRemoteFile = async (config: FtpImporterConfig, name: string, directory: string): Promise<Buffer> => {
  const url = buildUrl(config, name, directory, { includeCredentials: false });
  const args = ["--silent", "--show-error", "--fail", ...resolveCurlAuthArgs(config), url.href];
  const { stdout } = await execFileAsync("curl", args, {
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

const resolveProviderFromFilename = (filename: string, fallback?: string): string | undefined => {
  const normalized = path.basename(filename).toLowerCase();
  const compact = normalized.replace(/[^a-z0-9]+/g, "");

  if (normalized.startsWith("axa_")) {
    return "AXA";
  }

  if (normalized.startsWith("allianz_")) {
    return "ALLIANZ";
  }

  if (normalized.startsWith("scc_")) {
    return "SCC";
  }

  if (normalized.startsWith("best")) {
    return "BEST";
  }

  if (normalized.startsWith("offer_detail") || compact.startsWith("offerdetail")) {
    return "REST";
  }

  return fallback;
};

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const resolveRestIdFromFilename = (filename?: string | null) => {
  if (!filename) return "";
  const match = filename.match(/offer_detail[_-]?(\d+)/i);
  return match?.[1] ?? "";
};

const resolveDisplayId = (
  raw: Record<string, unknown>,
  provider?: string,
  filename?: string
): string | null => {
  const directValue = raw["offer_id"];
  const direct =
    typeof directValue === "string"
      ? directValue.trim()
      : typeof directValue === "number" && Number.isFinite(directValue)
      ? String(directValue)
      : "";
  if (direct) {
    return provider === "REST" && !direct.startsWith("REST_") ? `REST_${direct}` : direct;
  }
  const vehicle = (raw["vehicle"] ?? {}) as Record<string, unknown>;
  const ref = typeof vehicle["Referenz"] === "string" ? vehicle["Referenz"].trim() : "";
  if (ref) {
    return provider === "REST" && !ref.startsWith("REST_") ? `REST_${ref}` : ref;
  }
  if (provider === "REST") {
    const restId = resolveRestIdFromFilename(filename);
    return restId ? `REST_${restId}` : null;
  }
  return null;
};

const normalizeImageEntries = async (
  config: FtpImporterConfig,
  payload: Record<string, unknown>,
  context: { checksum: string; prefix: string; provider?: string; filename?: string }
): Promise<{ payload: Record<string, unknown> | null }> => {
  const rawImages = Array.isArray(payload["offer_images"])
    ? (payload["offer_images"] as unknown[]).filter((value): value is string =>
        typeof value === "string" && value.trim().length > 0
      )
    : [];

  if (rawImages.length === 0) {
    return { payload };
  }

  const baseDisplayId = resolveDisplayId(payload, context.provider, context.filename);
  if (context.provider === "REST" && !baseDisplayId) {
    const normalizedPayload = { ...payload, __skipRestImport: true, __skipReason: "missing_display_id" };
    return { payload: normalizedPayload };
  }

  const displayId = baseDisplayId ?? `aukcja-${context.checksum.slice(0, 8)}`;
  const displaySegment = sanitizeSegment(displayId, "aukcja");
  const targetDir = path.join(config.localImageDir, displaySegment);
  await ensureDir(targetDir);

  const seen = new Set<string>();
  const successfulDownloads: {
    index: number;
    originalName: string;
    relativePath: string;
  }[] = [];

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
      successfulDownloads.push({
        index,
        originalName: remoteName,
        relativePath,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(context.prefix, `Failed to fetch image ${remoteName}:`, err.message);
    }
  }

  const attemptCount = rawImages.length;
  const sortedDownloads = successfulDownloads.sort((a, b) => a.index - b.index);

  let orderedDownloads = [...sortedDownloads];
  if (context.provider === "REST") {
    const secondImage = sortedDownloads.find((image) => image.index === 1);
    const remaining = sortedDownloads.filter((image) => image.index !== 1);
    orderedDownloads = secondImage ? [secondImage, ...remaining] : remaining;
  }

  const normalizedImages = orderedDownloads.map((image) => image.relativePath);
  const mainImage = orderedDownloads[0];
  const downloadedImageCount = orderedDownloads.length;

  if (context.provider === "REST") {
    console.info(
      `${context.prefix} REST provider=${context.provider ?? "REST"}, offer=${displayId}, file=${context.filename ?? "<unknown>"}, imagesAttempted=${attemptCount}, imagesDownloaded=${downloadedImageCount}, mainImage=${mainImage?.originalName ?? "-"}`
    );
  }

  if (context.provider === "REST" && downloadedImageCount === 0) {
    return {
      payload: {
        ...payload,
        offer_id: displayId,
        __skipRestImport: true,
        __skipReason: "no_images_downloaded",
      },
    };
  }

  if (normalizedImages.length === 0) {
    return { payload };
  }

  return {
    payload: {
      ...payload,
      offer_id: displayId,
      offer_images: normalizedImages,
    },
  };
};

const preparePayload = async (
  config: FtpImporterConfig,
  payload: unknown,
  context: { checksum: string; prefix: string; provider?: string; filename?: string }
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
        if (normalized.payload) {
          transformed.push(normalized.payload);
        }
      }
    }
    return transformed;
  }

  const normalized = await normalizeImageEntries(config, payload as Record<string, unknown>, context);
  return normalized.payload ?? null;
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
        const provider = resolveProviderFromFilename(rawName, config.fallbackProvider);
        const normalizedPayload = await preparePayload(config, payload, {
          checksum,
          prefix,
          provider,
          filename: relativePath,
        });
        summary = await importInsurancePayload(normalizedPayload, {
          imageBaseUrl: config.imageBaseUrl,
          fallbackProvider: provider,
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
