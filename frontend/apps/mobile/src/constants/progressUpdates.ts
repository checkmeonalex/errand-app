// One-tap updates a runner sends while working (overview §5 "Live tracking"),
// so posters feel tracked without GPS. Ids are what the backend stores in
// task_updates.kind; labels are what both sides see.

export type ProgressUpdate = { id: string; label: string };

// The first step on every job, and the runner's main button before Start.
export const ON_MY_WAY: ProgressUpdate = { id: 'on-my-way', label: 'On my way' };

const SHARED: ProgressUpdate[] = [
  { id: 'at-meeting-spot', label: 'At the meeting spot' },
  { id: 'running-late', label: 'Running late' },
];

// Keyed by subcategory id first, then category id.
const BY_KIND: Record<string, ProgressUpdate[]> = {
  printing: [
    { id: 'printing-now', label: 'Printing now' },
    { id: 'binding', label: 'Binding' },
  ],
  laundry: [
    { id: 'washing', label: 'Washing' },
    { id: 'drying', label: 'Drying' },
    { id: 'ironing', label: 'Ironing' },
  ],
  notes: [{ id: 'writing-now', label: 'Writing now' }],
  assignment: [{ id: 'typing-now', label: 'Typing now' }],
  tutoring: [{ id: 'session-started', label: 'Session started' }],
  cleaning: [{ id: 'cleaning-now', label: 'Cleaning now' }],
  water: [{ id: 'fetching-now', label: 'Fetching now' }],
};

// The quick updates offered on a job (On my way has its own button).
export function progressUpdatesFor(category: string, subcategory?: string): ProgressUpdate[] {
  return [...(BY_KIND[subcategory ?? ''] ?? BY_KIND[category] ?? []), ...SHARED];
}

export function progressLabel(kind: string): string {
  if (kind === ON_MY_WAY.id) return ON_MY_WAY.label;
  return [...Object.values(BY_KIND).flat(), ...SHARED].find((update) => update.id === kind)?.label ?? 'Update';
}
