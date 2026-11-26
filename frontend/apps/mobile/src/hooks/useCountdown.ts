import { useEffect, useState } from 'react';

// Seconds left until something is allowed again (e.g. "Resend in 0:42").
// restart() starts it over.
export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) return;
    const timer = setTimeout(() => setLeft((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  return { left, restart: () => setLeft(seconds) };
}

// 42 → "0:42"
export function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
