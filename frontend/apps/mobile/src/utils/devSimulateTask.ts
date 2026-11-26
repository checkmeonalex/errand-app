import type { Task, TaskRunner } from '@errand/types';

// DEV ONLY. With no backend, no runner can accept a task, so these fake the
// runner's side one step at a time: accept → start (code appears) → handover.
// Used by DevTaskSimulator; never reachable in a release build.
//
// The test runner is deliberately plain: no invented name, rating or history,
// so it looks like what it is (a new runner with no reviews) and nothing fake
// can be mistaken for real data.
const TEST_RUNNER: TaskRunner = {
  id: 'dev-test-runner',
  first_name: 'Test runner',
  rating: null,
  completed_count: 0,
};

// What the runner's next action would be, as a button label; null when the
// task has no next runner step.
export function nextSimulatedStepLabel(task: Task): string | null {
  switch (task.status) {
    case 'posted':
      return 'Simulate: a runner accepts';
    case 'accepted':
      return 'Simulate: runner starts the task';
    case 'in-progress':
      return 'Simulate: runner enters the code at handover';
    default:
      return null;
  }
}

// The task after the runner's next action.
export function simulateNextStep(task: Task): Task {
  const updated_at = new Date().toISOString();
  switch (task.status) {
    case 'posted':
      return { ...task, status: 'accepted', runner: TEST_RUNNER, runner_id: TEST_RUNNER.id, updated_at };
    case 'accepted':
      // The backend makes the code at accept; the poster only sees it from here.
      return { ...task, status: 'in-progress', otp: randomCode(), updated_at };
    case 'in-progress':
      return { ...task, status: 'completed', updated_at };
    default:
      return task;
  }
}

// A 4-digit handover code. Stand-in for the one the backend makes at accept.
export function randomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
