import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

// Morning 5am–noon, afternoon noon–5pm, evening 5pm–5am (phone's local time).
function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const RECHECK_EVERY_MS = 60_000;

// The greeting for right now. Re-checks every minute and whenever the app
// comes back to the foreground, so it never goes stale while left open.
export function useGreeting(): string {
  const [greeting, setGreeting] = useState(() => greetingFor(new Date()));

  useEffect(() => {
    const update = () => setGreeting(greetingFor(new Date()));
    const timer = setInterval(update, RECHECK_EVERY_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') update();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);

  return greeting;
}
