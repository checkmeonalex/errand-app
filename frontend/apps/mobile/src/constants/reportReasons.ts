import type { Report, ReportReason } from '@errand/types';

export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: 'no-show', label: "Runner didn't show up" },
  { id: 'not-done-properly', label: "Task wasn't done properly" },
  { id: 'damaged-or-missing', label: 'Something was damaged or missing' },
  { id: 'asked-for-money', label: 'Runner asked for money outside Taskly' },
  { id: 'rude-or-unsafe', label: 'Runner was rude or I felt unsafe' },
  { id: 'other', label: 'Something else' },
];

// What a poster can ask for when the report pauses a payment.
export const REPORT_WANTS: { id: NonNullable<Report['wants']>; label: string }[] = [
  { id: 'full-refund', label: 'Full refund' },
  { id: 'part-refund', label: 'Part refund' },
  { id: 'just-reporting', label: 'Just letting you know' },
];

export const MAX_REPORT_PHOTOS = 3;

// After a task is done (money already released), problems can still be
// reported for this long, for Taskly to review.
export const REPORT_AFTER_DONE_HOURS = 48;
