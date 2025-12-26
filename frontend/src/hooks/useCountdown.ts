import { useEffect, useMemo, useState } from "react";

interface CountdownState {
  ended: boolean;
  short: string;
  long: string;
  targetDate: Date | null;
}

function calculateCountdown(target?: string | Date | null): CountdownState {
  if (!target) {
    return {
      ended: true,
      short: "Brak daty zakończenia",
      long: "Brak daty zakończenia",
      targetDate: null
    };
  }

  const targetDate = target instanceof Date ? target : new Date(target);
  const endTime = targetDate.getTime();

  if (Number.isNaN(endTime)) {
    return {
      ended: true,
      short: "Brak daty zakończenia",
      long: "Brak daty zakończenia",
      targetDate: null
    };
  }

  const diff = endTime - Date.now();

  if (diff <= 0) {
    return {
      ended: true,
      short: "Aukcja zakończona",
      long: "Aukcja zakończona",
      targetDate
    };
  }

  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  const timeWithSeconds = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const long = `${days > 0 ? `${days} dni ` : ""}${timeWithSeconds}`;
  let short: string;
  if (days > 0) short = `${days} dni ${timeWithSeconds}`;
  else if (hours > 0) short = `${timeWithSeconds}`;
  else short = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return {
    ended: false,
    short,
    long,
    targetDate
  };
}

export function useCountdown(target?: string | Date | null): CountdownState {
  const [state, setState] = useState<CountdownState>(() => calculateCountdown(target));

  useEffect(() => {
    setState(calculateCountdown(target));
    if (!target) return;

    const interval = window.setInterval(() => {
      setState(calculateCountdown(target));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [target]);

  return useMemo(() => state, [state]);
}
