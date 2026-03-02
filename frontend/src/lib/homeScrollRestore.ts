export const HOME_SCROLL_RESTORE_KEY = "autoszczech:home-scroll-restore";

export interface HomeScrollRestoreSnapshot {
  queryKey: string;
  carId: number;
  offsetWithinCard: number;
}

export const readHomeScrollRestore = (): HomeScrollRestoreSnapshot | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(HOME_SCROLL_RESTORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<HomeScrollRestoreSnapshot>;

    if (
      typeof parsed.queryKey === "string"
      && Number.isFinite(parsed.carId)
      && Number.isFinite(parsed.offsetWithinCard)
    ) {
      return {
        queryKey: parsed.queryKey,
        carId: Number(parsed.carId),
        offsetWithinCard: Number(parsed.offsetWithinCard),
      };
    }

    return null;
  } catch {
    return null;
  }
};

export const writeHomeScrollRestore = (snapshot: HomeScrollRestoreSnapshot) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(HOME_SCROLL_RESTORE_KEY, JSON.stringify(snapshot));
};

export const clearHomeScrollRestore = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(HOME_SCROLL_RESTORE_KEY);
};
