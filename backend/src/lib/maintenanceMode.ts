import { promises as fs } from "node:fs";
import path from "node:path";

type MaintenanceState = {
  enabled: boolean;
  updatedAt: string | null;
};

const defaultState: MaintenanceState = {
  enabled: false,
  updatedAt: null,
};

const stateFilePath = path.resolve(process.env.MAINTENANCE_STATE_FILE || ".maintenance-state.json");

let stateCache: MaintenanceState | null = null;

const normalizeState = (value: unknown): MaintenanceState => {
  if (!value || typeof value !== "object") {
    return defaultState;
  }

  const candidate = value as Partial<MaintenanceState>;
  return {
    enabled: candidate.enabled === true,
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : null,
  };
};

const readState = async () => {
  if (stateCache) {
    return stateCache;
  }

  try {
    const raw = await fs.readFile(stateFilePath, "utf8");
    stateCache = normalizeState(JSON.parse(raw));
    return stateCache;
  } catch {
    stateCache = defaultState;
    return stateCache;
  }
};

export const getMaintenanceState = async (): Promise<MaintenanceState> => readState();

export const setMaintenanceMode = async (enabled: boolean): Promise<MaintenanceState> => {
  const nextState: MaintenanceState = {
    enabled,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(stateFilePath, JSON.stringify(nextState, null, 2), "utf8");
  stateCache = nextState;
  return nextState;
};
