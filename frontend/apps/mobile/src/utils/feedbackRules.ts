import type { Task } from '@errand/types';
import { RATE_WITHIN_DAYS } from '../constants/reviewTags';
import { REPORT_AFTER_DONE_HOURS } from '../constants/reportReasons';

const HOUR_MS = 3_600_000;

// Done tasks can be rated for RATE_WITHIN_DAYS after completion.
export function canRate(task: Pick<Task, 'status' | 'updated_at' | 'runner'>, now = Date.now()): boolean {
  if (task.status !== 'completed' || !task.runner) return false;
  return now - Date.parse(task.updated_at) <= RATE_WITHIN_DAYS * 24 * HOUR_MS;
}

// What "Report a problem" does for this task right now:
// 'dispute' – money is still held, so the payment pauses for review;
// 'report' – done within REPORT_AFTER_DONE_HOURS, a report for Taskly to review;
// null – nothing to report (not accepted yet, already disputed, or too late).
export function reportKind(
  task: Pick<Task, 'status' | 'updated_at' | 'runner'>,
  now = Date.now(),
): 'dispute' | 'report' | null {
  if (!task.runner) return null;
  if (task.status === 'accepted' || task.status === 'in-progress') return 'dispute';
  if (task.status === 'completed' && now - Date.parse(task.updated_at) <= REPORT_AFTER_DONE_HOURS * HOUR_MS) {
    return 'report';
  }
  return null;
}
