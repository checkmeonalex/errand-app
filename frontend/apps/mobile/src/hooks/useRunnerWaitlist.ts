import { useEffect, useState } from 'react';
import type { RunnerWaitlistEntry } from '@errand/types';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../storage/storage';

// Whether this device already joined the runner waitlist, and joining it.
// TODO: runners.joinWaitlist(entry) via @errand/api (the backend stores the
// list; Taskly opens spots in batches, signed-in posters first).
export function useRunnerWaitlist() {
  const [entry, setEntry] = useState<RunnerWaitlistEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJSON<RunnerWaitlistEntry>(STORAGE_KEYS.runnerWaitlist).then((saved) => {
      setEntry(saved);
      setIsLoading(false);
    });
  }, []);

  async function join(details: Omit<RunnerWaitlistEntry, 'created_at'>) {
    const saved = { ...details, created_at: new Date().toISOString() };
    setEntry(saved);
    await saveJSON(STORAGE_KEYS.runnerWaitlist, saved);
  }

  return { entry, isLoading, join };
}
