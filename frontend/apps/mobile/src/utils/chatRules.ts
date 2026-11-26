import type { Task } from '@errand/types';

// Chat opens when a runner accepts. It turns read-only once the task is
// done or refunded (kept for records and disputes); a disputed task's chat
// stays open so both sides can talk to support.
export function canSendMessages(task: Pick<Task, 'status' | 'runner'>): boolean {
  if (!task.runner) return false;
  return task.status === 'accepted' || task.status === 'in-progress' || task.status === 'disputed';
}
