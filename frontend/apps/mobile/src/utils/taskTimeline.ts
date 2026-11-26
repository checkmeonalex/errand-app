import type { Task, TaskStatus } from '@errand/types';

// The step tracker on Task detail: Paid → Live → Accepted → In progress → Done.
// 'stopped' marks where a task left the normal path (refunded, under review).
export type StepState = 'done' | 'current' | 'upcoming' | 'stopped';
export type TimelineStep = { label: string; state: StepState };

const LABELS = ['Paid', 'Live', 'Accepted', 'In progress', 'Done'];

// How far along the normal path each status is (index of the current step).
const POSITION: Partial<Record<TaskStatus, number>> = {
  'pending-payment': 0,
  posted: 1,
  accepted: 2,
  'in-progress': 3,
  completed: 4,
};

// A task only gets accept_by when it's paid, so a closed task without one was
// cancelled before payment (nothing to refund).
export function wasPaid(task: Pick<Task, 'accept_by'>): boolean {
  return Boolean(task.accept_by);
}

export function getTimeline(task: Pick<Task, 'status' | 'accept_by'>): TimelineStep[] {
  const { status } = task;
  if (status === 'closed') {
    // Taken down before anyone did it: nobody accepted, or the poster cancelled.
    return wasPaid(task)
      ? [...doneSteps(2), { label: 'Taken down · refunded', state: 'stopped' }]
      : [{ label: 'Cancelled before payment', state: 'stopped' }];
  }
  if (status === 'disputed') {
    return [...doneSteps(4), { label: 'Under review', state: 'stopped' }];
  }

  const position = POSITION[status] ?? 0;
  return LABELS.map((label, index) => ({
    // Before payment the first step reads "Pay", not "Paid".
    label: index === 0 && status === 'pending-payment' ? 'Pay' : label,
    state:
      status === 'completed' || index < position
        ? 'done'
        : index === position
          ? 'current'
          : 'upcoming',
  }));
}

function doneSteps(count: number): TimelineStep[] {
  return LABELS.slice(0, count).map((label) => ({ label, state: 'done' }));
}
