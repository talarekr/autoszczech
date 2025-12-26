const normalizeUrl = (url: string) => url.replace(/\/+$/, "");
const stripApiSuffix = (url: string) => normalizeUrl(url).replace(/(\/api)+$/, "");

const FALLBACK_URLS = [
  "https://autoszczech-backend.onrender.com",
  "https://autoszczech.ch",
  "https://autoszczech-api.onrender.com",
];

const resolveSyncCandidates = (): string[] => {
  const envUrl = import.meta.env.VITE_API_URL?.toString().trim();
  const candidates: string[] = [];

  if (envUrl) {
    candidates.push(envUrl);
  }

  if (typeof window !== "undefined") {
    const { hostname, protocol, port } = window.location;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      candidates.push(`${protocol}//${hostname}:10000`);
    }

    if (protocol.startsWith("http")) {
      const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
      candidates.push(origin);
    }
  }

  candidates.push(...FALLBACK_URLS);

  const normalized = candidates.map(stripApiSuffix).map(normalizeUrl).filter(Boolean);

  const seen = new Set<string>();
  return normalized.filter((url) => {
    if (seen.has(url)) {
      return false;
    }
    seen.add(url);
    return true;
  });
};

let resolvedApiUrlPromise: Promise<string> | null = null;

const probeApiUrl = async (candidate: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${candidate}/api/health`, { signal: controller.signal });
    if (response.ok) {
      return candidate;
    }
  } catch (error) {
    console.warn(`API probe failed for ${candidate}`, error);
  } finally {
    clearTimeout(timeout);
  }
  return null;
};

export const getApiUrl = async (): Promise<string> => {
  if (resolvedApiUrlPromise) {
    return resolvedApiUrlPromise;
  }

  const candidates = resolveSyncCandidates();

  resolvedApiUrlPromise = (async () => {
    for (const candidate of candidates) {
      const ok = await probeApiUrl(candidate);
      if (ok) return ok;
    }
    return FALLBACK_URLS[0];
  })();

  return resolvedApiUrlPromise;
};

export const API_URL = resolveSyncCandidates()[0] ?? FALLBACK_URLS[0];
