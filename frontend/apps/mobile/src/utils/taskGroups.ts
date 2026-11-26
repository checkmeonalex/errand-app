import type { Task, TaskStatus } from '@errand/types';

// Which tasks still need the poster's attention ("Active") versus finished
// ones ("Completed": done, or closed and refunded). A disputed task stays
// Active because it still needs the poster. Used by home and the Tasks tab.
const ACTIVE_STATUSES: TaskStatus[] = [
  'pending-payment',
  'posted',
  'accepted',
  'in-progress',
  'disputed',
];

export function isActiveTask(task: Pick<Task, 'status'>): boolean {
  return ACTIVE_STATUSES.includes(task.status);
}
