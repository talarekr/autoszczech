import path from "node:path";

export interface FtpImporterConfig {
  host: string;
  port?: number;
  user?: string;
  password?: string;
  jsonDirectory: string;
  imageDirectory: string;
  pollMs: number;
  imageBaseUrl: string;
  fallbackProvider?: string;
  maxDownloadBytes: number;
  localImageDir: string;
}

const sanitizeDirectory = (value: string | undefined, fallback: string): string => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.replace(/^\/+|\/+$/g, "");
};

const resolveLocalImageDir = (value: string | undefined): string => {
  const candidate = (value ?? "").trim();
  if (!candidate) {
    return path.resolve("storage/ftp-images");
  }
  return path.isAbsolute(candidate) ? candidate : path.resolve(candidate);
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const defaultBackendBase = () => {
  const explicit = (process.env.PUBLIC_BACKEND_URL ?? "").trim();
  if (explicit) {
    return trimTrailingSlash(explicit);
  }
  const port = (process.env.PORT ?? "10000").trim();
  return `http://localhost:${port}`;
};

const normalizeBaseUrl = (value: string | undefined): string => {
  const candidate = (value ?? "").trim();
  if (!candidate) {
    return `${defaultBackendBase()}/uploads/ftp`;
  }
  if (/^https?:/i.test(candidate)) {
    return trimTrailingSlash(candidate);
  }
  const backendBase = defaultBackendBase();
  const normalizedPath = candidate.startsWith("/") ? candidate : `/${candidate}`;
  return `${backendBase}${trimTrailingSlash(normalizedPath)}`;
};

export const parseFtpEnvConfig = (): FtpImporterConfig => {
  const host = (process.env.FTP_HOST ?? "hosting2580517.online.pro").trim();
  const port = process.env.FTP_PORT ? Number(process.env.FTP_PORT) : undefined;
  const pollMs = process.env.FTP_POLL_INTERVAL_MS
    ? Number(process.env.FTP_POLL_INTERVAL_MS)
    : 1_800_000;
  const maxBytes = process.env.FTP_MAX_DOWNLOAD_MB
    ? Number(process.env.FTP_MAX_DOWNLOAD_MB) * 1024 * 1024
    : 25 * 1024 * 1024;

  if (!host) {
    throw new Error("FTP importer enabled but FTP_HOST is missing");
  }

  return {
    host,
    port: Number.isFinite(port) ? port : undefined,
    user: process.env.FTP_USER ?? "hosting2580517",
    password: process.env.FTP_PASSWORD ?? "autoszczech12!!",
    jsonDirectory: sanitizeDirectory(process.env.FTP_JSON_DIRECTORY, "uploads/json"),
    imageDirectory: sanitizeDirectory(process.env.FTP_IMAGE_DIRECTORY, "uploads/images"),
    pollMs: Number.isFinite(pollMs) && pollMs > 0 ? pollMs : 1_800_000,
    imageBaseUrl: normalizeBaseUrl(process.env.FTP_PUBLIC_IMAGE_BASE),
    fallbackProvider: process.env.FTP_FALLBACK_PROVIDER ?? undefined,
    maxDownloadBytes: Number.isFinite(maxBytes) && maxBytes > 0 ? maxBytes : 25 * 1024 * 1024,
    localImageDir: resolveLocalImageDir(process.env.FTP_LOCAL_IMAGE_DIR),
  };
};

export const resolvePublicImagePath = (imageBaseUrl: string): string => {
  try {
    const parsed = new URL(imageBaseUrl);
    const pathname = parsed.pathname || "/";
    if (pathname === "/") {
      return "/uploads/ftp";
    }
    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  } catch (_error) {
    const normalized = imageBaseUrl.startsWith("/") ? imageBaseUrl : `/${imageBaseUrl}`;
    return normalized.endsWith("/") && normalized !== "/" ? normalized.slice(0, -1) : normalized;
  }
};
