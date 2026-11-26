import type { LeaderboardWindow, Task } from '@errand/types';

// Counts from the user's real tasks. Only completed tasks count (escrow
// released), the same rule the leaderboards use.

// When each leaderboard period started (local time): weekly boards reset on
// Monday 00:00, monthly on the 1st, yearly on 1 January. 'all' has no start.
export function periodStart(period: LeaderboardWindow, now = new Date()): Date | undefined {
  switch (period) {
    case 'week': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      return start;
    }
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    case 'all':
      return undefined;
  }
}

export function completedCount(tasks: Pick<Task, 'status' | 'updated_at'>[], since?: Date): number {
  return tasks.filter(
    (task) => task.status === 'completed' && (!since || new Date(task.updated_at) >= since),
  ).length;
}

// Tasks that were actually paid for (a paid task always has accept_by),
// so unpaid drafts and tasks cancelled before payment don't count.
export function paidTaskCount(tasks: Pick<Task, 'accept_by'>[]): number {
  return tasks.filter((task) => Boolean(task.accept_by)).length;
}

// "Total spent" (overview §9): only money released from escrow, i.e.
// completed tasks. Never shown on public boards.
export function totalSpent(tasks: Pick<Task, 'status' | 'price'>[]): number {
  return tasks.filter((task) => task.status === 'completed').reduce((sum, task) => sum + task.price, 0);
}
