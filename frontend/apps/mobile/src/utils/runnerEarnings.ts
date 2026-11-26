import type { Task } from '@errand/types';
import { payoutFor } from './runnerPayout';
import { periodStart } from './taskStats';

// A runner's earnings from their completed jobs (paid at handover).
// TODO: runner.earnings from @errand/api once payouts are real.
export function runnerEarnings(jobs: Pick<Task, 'status' | 'price' | 'payout' | 'updated_at'>[], now = new Date()) {
  const paid = jobs.filter((job) => job.status === 'completed');
  const weekStart = periodStart('week', now)?.getTime() ?? 0;
  const thisWeek = paid.filter((job) => Date.parse(job.updated_at) >= weekStart);
  const sum = (list: typeof paid) => list.reduce((total, job) => total + payoutFor(job), 0);
  return { allTime: sum(paid), thisWeek: sum(thisWeek), tasksThisWeek: thisWeek.length };
}
