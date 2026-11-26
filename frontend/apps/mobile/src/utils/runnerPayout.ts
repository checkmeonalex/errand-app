import type { Task } from '@errand/types';
import { TASKLY_FEE_RATE, TASKLY_MIN_FEE } from '../constants/runnerRules';

// What the runner takes home for a task. Runner screens only: posters never
// see the fee. Uses the backend's `payout` when sent, else an estimate.
// TODO: always use Task.payout once runner.feed / runner.myJobs send it.
export function payoutFor(task: Pick<Task, 'price' | 'payout'>): number {
  return task.payout ?? task.price - feeFor(task.price);
}

export function feeFor(price: number): number {
  return Math.max(Math.round(price * TASKLY_FEE_RATE), TASKLY_MIN_FEE);
}
