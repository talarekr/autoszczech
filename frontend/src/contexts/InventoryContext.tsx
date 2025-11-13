import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { sampleCars } from "../data/sampleCars";
import type { Car, CarSource } from "../types/car";
import type { InsuranceCarSeed } from "@shared/importers/insurance";

export interface CarUpsertInput extends InsuranceCarSeed {
  id?: number;
  source?: CarSource;
  offers?: Car["offers"];
}

export interface ImportSummary {
  added: number;
  updated: number;
  skipped: number;
  total: number;
}

interface InventoryContextValue {
  cars: Car[];
  baseCars: Car[];
  importedCars: Car[];
  replaceBaseCars: (cars: CarUpsertInput[], source?: CarSource) => void;
  registerImportedCars: (cars: CarUpsertInput[]) => ImportSummary;
  findCarByIdentifier: (identifier: string | number) => Car | undefined;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

const DEFAULT_SOURCE_BY_MODE: Record<CarSource, CarSource> = {
  sample: "sample",
  api: "api",
  imported: "imported",
};

const FALLBACK_DISPLAY_PREFIX = "OFFER";
const STORAGE_KEY = "autoszczech:inventory:imported";

const sanitizeDisplayId = (value?: string | null) => value?.trim() ?? "";

const normalizeMileage = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  if (typeof value === "string") {
    const numeric = Number(value.replace(/[^0-9.,-]/g, "").replace(/,/g, "."));
    if (Number.isFinite(numeric)) {
      return Math.max(0, Math.round(numeric));
    }
  }

  return 0;
};

const normalizeYear = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9]/g, ""));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return new Date().getFullYear();
};

const ensureIdFactory = (allocate: () => number) => (candidate?: number | string): number => {
  if (typeof candidate === "number" && Number.isFinite(candidate)) {
    return candidate;
  }
  if (typeof candidate === "string") {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return allocate();
};

const buildKey = (payload: { displayId?: string; id?: number }) => {
  const displayId = sanitizeDisplayId(payload.displayId);
  if (displayId) {
    return displayId.toUpperCase();
  }
  if (typeof payload.id === "number" && Number.isFinite(payload.id)) {
    return String(payload.id);
  }
  return undefined;
};

const normalizeSeed = (
  seed: CarUpsertInput,
  fallbackSource: CarSource,
  ensureId: (candidate?: number | string) => number
): Car => {
  const id = ensureId(seed.id ?? seed.displayId);
  const displayId = sanitizeDisplayId(seed.displayId) || `${FALLBACK_DISPLAY_PREFIX}-${id}`;

  const normalizedSource = (() => {
    const provided = seed.source ?? fallbackSource;
    if (!provided) return fallbackSource;
    const candidate = typeof provided === "string" ? provided.toLowerCase() : provided;
    if (candidate === "api" || candidate === "sample" || candidate === "imported") {
      return candidate;
    }
    return fallbackSource;
  })();

  return {
    ...seed,
    id,
    displayId,
    source: normalizedSource,
    mileage: normalizeMileage(seed.mileage),
    year: normalizeYear(seed.year),
  } as Car;
};

const getNextId = (cars: Car[]): number => {
  const maxId = cars.reduce((max, car) => {
    if (typeof car.id === "number" && Number.isFinite(car.id)) {
      return Math.max(max, car.id);
    }
    return max;
  }, 0);
  return maxId + 1;
};

const mergeInventories = (
  base: Car[],
  imported: Car[],
  seeds: CarUpsertInput[],
  allocateId: (candidate?: number | string) => number
) => {
  const baseMap = new Map<string, number>();
  const importedMap = new Map<string, number>();

  base.forEach((car, index) => {
    const key = buildKey(car);
    if (key) {
      baseMap.set(key, index);
    }
  });

  imported.forEach((car, index) => {
    const key = buildKey(car);
    if (key) {
      importedMap.set(key, index);
    }
  });

  const nextBase = [...base];
  const nextImported = [...imported];

  let added = 0;
  let updated = 0;
  let skipped = 0;

  seeds.forEach((seed) => {
    const key = buildKey(seed);
    if (!key) {
      skipped += 1;
      return;
    }

    if (baseMap.has(key)) {
      const index = baseMap.get(key)!;
      const existing = nextBase[index];
      nextBase[index] = {
        ...existing,
        ...normalizeSeed({ ...existing, ...seed, id: existing.id }, existing.source ?? "api", allocateId),
        id: existing.id,
        source: existing.source ?? "api",
      };
      updated += 1;
      return;
    }

    if (importedMap.has(key)) {
      const index = importedMap.get(key)!;
      const existing = nextImported[index];
      nextImported[index] = {
        ...existing,
        ...normalizeSeed({ ...existing, ...seed, id: existing.id }, "imported", allocateId),
        id: existing.id,
        source: "imported",
      };
      updated += 1;
      return;
    }

    const normalized = normalizeSeed({ ...seed, source: "imported" }, "imported", allocateId);
    nextImported.push(normalized);
    importedMap.set(buildKey(normalized)!, nextImported.length - 1);
    added += 1;
  });

  return {
    base: nextBase,
    imported: nextImported,
    summary: {
      added,
      updated,
      skipped,
      total: seeds.length,
    },
  };
};

const readStoredSeeds = (): CarUpsertInput[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CarUpsertInput[];
  } catch {
    return [];
  }
};

const persistImported = (cars: Car[]) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (cars.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
    }
  } catch {
    // ignore storage errors
  }
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  const storedSeeds = useMemo(() => readStoredSeeds(), []);

  const initialBase = useMemo(
    () =>
      sampleCars.map((car) =>
        normalizeSeed(
          {
            ...car,
            source: car.source ?? "sample",
          },
          "sample",
          () => car.id
        )
      ),
    []
  );

  const initialImported = useMemo(
    () =>
      storedSeeds.map((seed, index) =>
        normalizeSeed(
          {
            ...seed,
            source: seed.source ?? "imported",
            id: seed.id ?? initialBase.length + index + 1,
          },
          "imported",
          () => initialBase.length + index + 1
        )
      ),
    [storedSeeds, initialBase]
  );

  const [baseCars, setBaseCars] = useState<Car[]>(initialBase);
  const [importedCars, setImportedCars] = useState<Car[]>(initialImported);

  const baseRef = useRef(baseCars);
  const importedRef = useRef(importedCars);
  const nextIdRef = useRef<number>(getNextId([...initialBase, ...initialImported]));

  useEffect(() => {
    baseRef.current = baseCars;
  }, [baseCars]);

  useEffect(() => {
    importedRef.current = importedCars;
  }, [importedCars]);

  useEffect(() => {
    persistImported(importedCars);
  }, [importedCars]);

  const updateNextId = useCallback(() => {
    const combined = [...baseRef.current, ...importedRef.current];
    nextIdRef.current = getNextId(combined);
  }, []);

  const allocateId = useCallback(
    (candidate?: number | string) => {
      if (candidate !== undefined) {
        const numeric = Number(candidate);
        if (Number.isFinite(numeric)) {
          return numeric;
        }
      }
      const next = nextIdRef.current;
      nextIdRef.current += 1;
      return next;
    },
    []
  );

  const replaceBaseCars = useCallback(
    (seeds: CarUpsertInput[], source: CarSource = "api") => {
      const ensureId = ensureIdFactory(allocateId);
      const normalized = seeds.map((seed) =>
        normalizeSeed(
          {
            ...seed,
            source: seed.source ?? DEFAULT_SOURCE_BY_MODE[source] ?? source,
          },
          DEFAULT_SOURCE_BY_MODE[source] ?? source,
          ensureId
        )
      );

      baseRef.current = normalized;
      setBaseCars(normalized);
      updateNextId();
    },
    [allocateId, updateNextId]
  );

  const registerImportedCars = useCallback(
    (seeds: CarUpsertInput[]): ImportSummary => {
      const ensureId = ensureIdFactory(allocateId);
      const { base: nextBase, imported: nextImported, summary } = mergeInventories(
        baseRef.current,
        importedRef.current,
        seeds,
        ensureId
      );

      baseRef.current = nextBase;
      importedRef.current = nextImported;
      setBaseCars(nextBase);
      setImportedCars(nextImported);
      updateNextId();

      return summary;
    },
    [allocateId, updateNextId]
  );

  const cars = useMemo(() => [...baseCars, ...importedCars], [baseCars, importedCars]);

  const findCarByIdentifier = useCallback(
    (identifier: string | number) => {
      const normalized = String(identifier).trim();
      return cars.find(
        (car) =>
          String(car.id) === normalized ||
          sanitizeDisplayId(car.displayId).toUpperCase() === normalized.toUpperCase()
      );
    },
    [cars]
  );

  const value = useMemo<InventoryContextValue>(
    () => ({
      cars,
      baseCars,
      importedCars,
      replaceBaseCars,
      registerImportedCars,
      findCarByIdentifier,
    }),
    [cars, baseCars, importedCars, replaceBaseCars, registerImportedCars, findCarByIdentifier]
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
