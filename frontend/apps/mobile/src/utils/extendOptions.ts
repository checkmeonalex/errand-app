import type { Task } from '@errand/types';
import { windowsForDeadline } from '../constants/sharedQuestions';

// Ways to give a live, unaccepted task more time: the accept windows that fit
// its deadline and would actually end later than it ends now.
export function extendOptions(task: Pick<Task, 'accept_by' | 'extra_fields'>, now = Date.now()) {
  const endsAt = task.accept_by ? Date.parse(task.accept_by) : now;
  return windowsForDeadline(task.extra_fields?.deadline).filter(
    (window) => now + window.minutes * 60_000 > endsAt,
  );
}
