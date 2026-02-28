const normalizeUrl = (url: string) => url.replace(/\/+$/, "");
const stripApiSuffix = (url: string) => normalizeUrl(url).replace(/(\/api)+$/, "");

const FALLBACK_URLS = [
  "https://autoszczech.ch",
  "https://autoszczech-backend.onrender.com",
  "https://autoszczech-api.onrender.com",
];

const API_CACHE_KEY = "autoszczech.apiUrl";
const PROBE_TIMEOUT_MS = 900;

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

    const cached = window.localStorage.getItem(API_CACHE_KEY)?.trim();
    if (cached) {
      candidates.unshift(cached);
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

const probeApiUrl = async (candidate: string, timeoutMs = PROBE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${candidate}/api/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (response.ok) {
      return candidate;
    }
  } catch {
    // Silent on purpose: probes are best-effort and run frequently.
  } finally {
    clearTimeout(timeout);
  }
  return null;
};

const persistResolvedUrl = (url: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(API_CACHE_KEY, url);
  } catch {
    // ignore storage errors
  }
};

export const getApiUrl = async (): Promise<string> => {
  if (resolvedApiUrlPromise) {
    return resolvedApiUrlPromise;
  }

  const candidates = resolveSyncCandidates();

  resolvedApiUrlPromise = (async () => {
    const [first, ...rest] = candidates;

    if (!first) {
      return FALLBACK_URLS[0];
    }

    const preferred = await probeApiUrl(first, PROBE_TIMEOUT_MS);
    if (preferred) {
      persistResolvedUrl(preferred);
      return preferred;
    }

    if (rest.length > 0) {
      const winner = await new Promise<string | null>((resolve) => {
        let pending = rest.length;
        let settled = false;

        rest.forEach((candidate) => {
          probeApiUrl(candidate).then((result) => {
            if (settled) return;

            if (result) {
              settled = true;
              resolve(result);
              return;
            }

            pending -= 1;
            if (pending === 0) resolve(null);
          });
        });
      });

      if (winner) {
        persistResolvedUrl(winner);
        return winner;
      }
    }

    persistResolvedUrl(first);
    return first;
  })().catch(() => FALLBACK_URLS[0]);

  return resolvedApiUrlPromise;
};

export const API_URL = resolveSyncCandidates()[0] ?? FALLBACK_URLS[0];
