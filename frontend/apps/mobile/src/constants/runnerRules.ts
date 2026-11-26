// The rules a runner works under (overview §5). The backend enforces them;
// the app shows them and blocks what it can.

// Tasks a runner can hold at the same time. Finish one to take another.
export const MAX_ACTIVE_JOBS = 2;

// Dropping a task within this many minutes of accepting is free.
export const FREE_DROP_MINUTES = 5;

// Drops (after the free minutes) before the runner's account is reviewed.
export const DROPS_BEFORE_REVIEW = 3;

// Wrong handover-code tries before the task locks and goes to review.
export const MAX_CODE_ATTEMPTS = 5;

// Digits in a handover code (made by the backend at accept).
export const HANDOVER_CODE_LENGTH = 4;

// Taskly's cut of each task, taken from the runner's payout. Only used to
// estimate payouts until the backend sends `Task.payout` (the backend owns
// the real fee, so changing it needs no app update).
export const TASKLY_FEE_RATE = 0.05;
export const TASKLY_MIN_FEE = 50;

// Shown on a runner's first accept (and kept in Profile → Help later).
export const RUNNER_RULES = [
  'Once you accept, the poster is counting on you.',
  `You can drop a task for free in the first ${FREE_DROP_MINUTES} minutes. After that, each drop counts against you, and ${DROPS_BEFORE_REVIEW} drops means your runner account is reviewed.`,
  `You can hold ${MAX_ACTIVE_JOBS} tasks at a time. Finish one to take another.`,
  "You're paid when you enter the poster's handover code at handover. Never ask for it early.",
];
