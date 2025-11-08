import { useEffect, useMemo, useState } from "react";

export interface CountdownState {
  totalMs: number;
  expired: boolean;
  label: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCountdown(target?: string | null): CountdownState | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [target]);

  return useMemo(() => {
    if (!target) return null;
    const targetMs = new Date(target).getTime();
    if (Number.isNaN(targetMs)) return null;

    const diff = targetMs - now;
    const expired = diff <= 0;
    const safeDiff = expired ? 0 : diff;

    const days = Math.floor(safeDiff / (24 * 3600 * 1000));
    const hours = Math.floor((safeDiff % (24 * 3600 * 1000)) / (3600 * 1000));
    const minutes = Math.floor((safeDiff % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((safeDiff % (60 * 1000)) / 1000);

    const label = expired
      ? "0 d 00 h 00 min"
      : `${days} d ${hours.toString().padStart(2, "0")} h ${minutes.toString().padStart(2, "0")} min`;

    return {
      totalMs: diff,
      expired,
      label,
      days,
      hours,
      minutes,
      seconds,
    };
  }, [now, target]);
}
