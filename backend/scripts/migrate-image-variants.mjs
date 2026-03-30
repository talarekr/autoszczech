#!/usr/bin/env node
import path from "node:path";
import { promises as fs } from "node:fs";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const execFileAsync = promisify(execFile);

const THUMB = { width: 400, quality: 68, suffix: ".thumb.webp" };
const DETAIL = { width: 1200, quality: 78, suffix: ".detail.webp" };

const localImageDir = path.resolve(process.env.FTP_LOCAL_IMAGE_DIR || "uploads/images");
const shouldDeleteOriginals = process.argv.includes("--delete-originals");

const isRemote = (value) => /^https?:\/\//i.test(value);
const hasVariantSuffix = (value) =>
  value.endsWith(THUMB.suffix) || value.endsWith(DETAIL.suffix) || value.endsWith(".avif");

const replaceExtWithSuffix = (file, suffix) => {
  const ext = path.extname(file);
  const base = ext ? file.slice(0, -ext.length) : file;
  return `${base}${suffix}`;
};

const ensureDir = async (target) => fs.mkdir(path.dirname(target), { recursive: true });
const hasBinary = async (name) => {
  try {
    await execFileAsync("which", [name]);
    return true;
  } catch {
    return false;
  }
};

const getSizeSafe = async (file) => {
  try {
    const stat = await fs.stat(file);
    return stat.size;
  } catch {
    return 0;
  }
};

const renderVariant = async (sourceBuffer, outputFile, variant, canUseCwebp) => {
  await ensureDir(outputFile);
  if (!canUseCwebp) {
    await fs.writeFile(outputFile, sourceBuffer);
    return;
  }

  const tmpInput = path.join(os.tmpdir(), `autoszczech-migrate-${Date.now()}-${Math.random().toString(36).slice(2)}.img`);
  await fs.writeFile(tmpInput, sourceBuffer);
  try {
    await execFileAsync("cwebp", [
      "-quiet",
      "-q",
      String(variant.quality),
      "-resize",
      String(variant.width),
      "0",
      tmpInput,
      "-o",
      outputFile,
    ]);
  } finally {
    await fs.unlink(tmpInput).catch(() => undefined);
  }
};

const report = {
  processed: 0,
  converted: 0,
  skippedRemote: 0,
  missingSource: 0,
  beforeBytes: 0,
  thumbBytes: 0,
  detailBytes: 0,
  originalsDeleted: 0,
};

const rows = await prisma.carImage.findMany({
  orderBy: [{ carId: "asc" }, { order: "asc" }, { id: "asc" }],
  select: { id: true, url: true },
});
const canUseCwebp = await hasBinary("cwebp");

for (const row of rows) {
  report.processed += 1;
  const current = row.url.trim();

  if (!current) continue;
  if (isRemote(current)) {
    report.skippedRemote += 1;
    continue;
  }

  const detailRel = current.endsWith(DETAIL.suffix) ? current : replaceExtWithSuffix(current, DETAIL.suffix);
  const thumbRel = current.endsWith(THUMB.suffix) ? current : replaceExtWithSuffix(current, THUMB.suffix);
  const sourceRel = hasVariantSuffix(current) ? detailRel : current;

  const sourceAbs = path.join(localImageDir, sourceRel);
  const detailAbs = path.join(localImageDir, detailRel);
  const thumbAbs = path.join(localImageDir, thumbRel);

  const sourceBuffer = await fs.readFile(sourceAbs).catch(() => null);
  if (!sourceBuffer) {
    report.missingSource += 1;
    continue;
  }

  report.beforeBytes += await getSizeSafe(sourceAbs);

  if (!(await getSizeSafe(detailAbs))) {
    await renderVariant(sourceBuffer, detailAbs, DETAIL, canUseCwebp);
  }
  if (!(await getSizeSafe(thumbAbs))) {
    await renderVariant(sourceBuffer, thumbAbs, THUMB, canUseCwebp);
  }

  report.thumbBytes += await getSizeSafe(thumbAbs);
  report.detailBytes += await getSizeSafe(detailAbs);

  if (row.url !== detailRel) {
    await prisma.carImage.update({ where: { id: row.id }, data: { url: detailRel } });
    report.converted += 1;
  }

  if (shouldDeleteOriginals && !hasVariantSuffix(current)) {
    await fs.unlink(sourceAbs).catch(() => undefined);
    report.originalsDeleted += 1;
  }
}

await prisma.$disconnect();

const avgBefore = report.processed ? report.beforeBytes / report.processed : 0;
const avgThumb = report.processed ? report.thumbBytes / report.processed : 0;
const avgDetail = report.processed ? report.detailBytes / report.processed : 0;

const estimatedBandwidthDropPct = avgBefore > 0 ? Math.max(0, (1 - avgThumb / avgBefore) * 100) : 0;
const estimatedDiskDropPct = avgBefore > 0 ? Math.max(0, (1 - (avgThumb + avgDetail) / avgBefore) * 100) : 0;

console.log("[image-migration] completed");
console.log(
  JSON.stringify(
    {
      ...report,
      avgBeforeBytes: Math.round(avgBefore),
      avgThumbBytes: Math.round(avgThumb),
      avgDetailBytes: Math.round(avgDetail),
      estimatedBandwidthDropPct: Number(estimatedBandwidthDropPct.toFixed(1)),
      estimatedDiskDropPct: Number(estimatedDiskDropPct.toFixed(1)),
      localImageDir,
      deleteOriginals: shouldDeleteOriginals,
      imageTool: canUseCwebp ? "cwebp" : "copy-fallback",
    },
    null,
    2
  )
);
