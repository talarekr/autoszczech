import path from "node:path";

export type ImageVariant = "thumb" | "detail";

export const IMAGE_VARIANT_CONFIG: Record<ImageVariant, { width: number; quality: number }> = {
  thumb: { width: 400, quality: 68 },
  detail: { width: 1200, quality: 78 },
};

const DETAIL_SUFFIX = ".detail.webp";
const THUMB_SUFFIX = ".thumb.webp";

export const buildVariantRelativePath = (inputPath: string, variant: ImageVariant) => {
  const normalized = inputPath.replace(/\\/g, "/");
  const ext = path.extname(normalized);
  const withoutExt = ext ? normalized.slice(0, -ext.length) : normalized;
  const suffix = variant === "thumb" ? THUMB_SUFFIX : DETAIL_SUFFIX;
  return `${withoutExt}${suffix}`;
};

export const toThumbVariantPath = (imageUrl: string) => {
  const trimmed = imageUrl.trim();
  if (!trimmed) return trimmed;

  if (trimmed.endsWith(DETAIL_SUFFIX)) {
    return trimmed.slice(0, -DETAIL_SUFFIX.length) + THUMB_SUFFIX;
  }

  if (trimmed.endsWith(THUMB_SUFFIX)) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    if (trimmed.includes("w=")) return trimmed;
    return `${trimmed}${trimmed.includes("?") ? "&" : "?"}w=400`;
  }

  return buildVariantRelativePath(trimmed, "thumb");
};

export const toDetailVariantPath = (imageUrl: string) => {
  const trimmed = imageUrl.trim();
  if (!trimmed) return trimmed;

  if (trimmed.endsWith(THUMB_SUFFIX)) {
    return trimmed.slice(0, -THUMB_SUFFIX.length) + DETAIL_SUFFIX;
  }

  if (trimmed.endsWith(DETAIL_SUFFIX)) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return buildVariantRelativePath(trimmed, "detail");
};

export const isVariantFileName = (fileName: string) =>
  fileName.endsWith(DETAIL_SUFFIX) || fileName.endsWith(THUMB_SUFFIX) || fileName.endsWith(".avif");
