import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

let detectedTool: "cwebp" | "none" | null = null;

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

export const createWebpVariant = async (
  sourceBuffer: Buffer,
  outputAbsolutePath: string,
  options: { width: number; quality: number }
) => {
  await ensureDir(outputAbsolutePath);
  const tool = await detectTool();

  if (tool === "cwebp") {
    const tmpInput = path.join(os.tmpdir(), `autoszczech-${Date.now()}-${Math.random().toString(36).slice(2)}.img`);
    await fs.writeFile(tmpInput, sourceBuffer);

    try {
      await execFileAsync("cwebp", [
        "-quiet",
        "-q",
        String(options.quality),
        "-resize",
        String(options.width),
        "0",
        tmpInput,
        "-o",
        outputAbsolutePath,
      ]);
      return;
    } finally {
      await fs.unlink(tmpInput).catch(() => undefined);
    }
  }

  // Fallback when cwebp is unavailable in runtime image.
  // We still persist the file under the expected variant name so URLs remain stable.
  await fs.writeFile(outputAbsolutePath, sourceBuffer);
};

export const getImageProcessorInfo = async () => ({ tool: await detectTool() });
