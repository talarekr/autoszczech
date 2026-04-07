import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

let detectedTool: "cwebp" | "none" | null = null;
const THUMB_SOFT_MAX_BYTES = 100 * 1024;
const THUMB_RETRY_MAX_BYTES = 120 * 1024;
const THUMB_HARD_MAX_BYTES = 300 * 1024;
const processorCache: { sharpLoader: Promise<null | ((input: Buffer) => any)> | null } = {
  sharpLoader: null,
};

const hasBinary = async (name: string) => {
  try {
    await execFileAsync("which", [name]);
    return true;
  } catch {
    return false;
  }
};

const detectTool = async () => {
  if (detectedTool) return detectedTool;
  detectedTool = (await hasBinary("cwebp")) ? "cwebp" : "none";
  return detectedTool;
};

const ensureDir = async (filePath: string) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
};

const loadSharp = async () => {
  if (!processorCache.sharpLoader) {
    const moduleName = "sharp";
    processorCache.sharpLoader = import(moduleName)
      .then((module) => {
        const factory = (module as { default?: unknown }).default;
        return typeof factory === "function" ? (factory as (input: Buffer) => any) : null;
      })
      .catch(() => null);
  }
  return processorCache.sharpLoader;
};

export const createWebpVariant = async (
  sourceBuffer: Buffer,
  outputAbsolutePath: string,
  options: { width: number; quality: number; variant: "thumb" | "detail" }
) => {
  await ensureDir(outputAbsolutePath);
  const isThumb = options.variant === "thumb";
  const attempts = isThumb
    ? [
        { width: Math.min(options.width, 320), quality: Math.min(options.quality, 60) },
        { width: 300, quality: 55 },
        { width: 280, quality: 50 },
      ]
    : [{ width: options.width, quality: options.quality }];

  const renderWithCwebp = async (width: number, quality: number) => {
    const tmpInput = path.join(os.tmpdir(), `autoszczech-${Date.now()}-${Math.random().toString(36).slice(2)}.img`);
    const tmpOutput = path.join(os.tmpdir(), `autoszczech-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`);
    await fs.writeFile(tmpInput, sourceBuffer);

    try {
      await execFileAsync("cwebp", [
        "-quiet",
        "-metadata",
        "none",
        "-q",
        String(quality),
        "-resize",
        String(width),
        "0",
        tmpInput,
        "-o",
        tmpOutput,
      ]);
      const output = await fs.readFile(tmpOutput);
      return output;
    } finally {
      await fs.unlink(tmpInput).catch(() => undefined);
      await fs.unlink(tmpOutput).catch(() => undefined);
    }
  };

  const tool = await detectTool();
  const sharpFactory = tool === "cwebp" ? null : await loadSharp();

  let bestOutput: Buffer | null = null;

  for (const attempt of attempts) {
    const output =
      tool === "cwebp"
        ? await renderWithCwebp(attempt.width, attempt.quality)
        : sharpFactory
        ? await sharpFactory(sourceBuffer)
            .rotate()
            .resize({ width: attempt.width, fit: "inside", withoutEnlargement: true })
            .webp({ quality: attempt.quality, effort: 6 })
            .toBuffer()
        : null;
    if (!output) {
      throw new Error("Brak cwebp i brak sharp — nie można wygenerować wariantu WebP.");
    }
    bestOutput = output;
    if (!isThumb) break;
    if (output.length <= THUMB_SOFT_MAX_BYTES) break;
    if (output.length <= THUMB_RETRY_MAX_BYTES && attempt === attempts[attempts.length - 1]) break;
  }

  if (!bestOutput) {
    throw new Error(`Nie udało się wygenerować wariantu ${options.variant} dla ${outputAbsolutePath}`);
  }

  if (isThumb && bestOutput.length > THUMB_HARD_MAX_BYTES) {
    throw new Error(`Miniatura przekracza limit ${THUMB_HARD_MAX_BYTES} B: ${outputAbsolutePath} (${bestOutput.length} B)`);
  }

  await fs.writeFile(outputAbsolutePath, bestOutput);
};

export const getImageProcessorInfo = async () => ({
  tool: await detectTool(),
  sharpAvailable: Boolean(await loadSharp()),
});
