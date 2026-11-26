import type { Task } from '@errand/types';
import { ON_MY_WAY } from '../constants/progressUpdates';
import type { TimelineStep } from './taskTimeline';

// The runner's own step tracker: Accepted → On my way → Started → Done.
// "On my way" is a progress update, not a status, so it's read from updates.
const LABELS = ['Accepted', 'On my way', 'Started', 'Done'];

export function hasLeft(task: Pick<Task, 'updates'>): boolean {
  return Boolean(task.updates?.some((update) => update.kind === ON_MY_WAY.id));
}

export function runnerTimeline(task: Pick<Task, 'status' | 'updates'>): TimelineStep[] {
  if (task.status === 'disputed') {
    return [...LABELS.slice(0, 3).map((label) => ({ label, state: 'done' as const })), { label: 'Under review', state: 'stopped' }];
  }
  const position =
    task.status === 'completed' ? LABELS.length : task.status === 'in-progress' ? 2 : hasLeft(task) ? 1 : 0;
  return LABELS.map((label, index) => ({
    label,
    state: index < position ? 'done' : index === position ? 'current' : 'upcoming',
  }));
}
