import type { Car } from "../types/car";

export interface HomeListingsCacheEntry {
  cars: Car[];
  totalCount: number;
  loadedCount: number;
  isComplete: boolean;
  scrollY: number;
}

const cache = new Map<string, HomeListingsCacheEntry>();

export const getHomeListingsCache = (key: string) => cache.get(key);

export const setHomeListingsCache = (key: string, entry: HomeListingsCacheEntry) => {
  cache.set(key, entry);
};
