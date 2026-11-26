// Level titles by number of completed tasks (escrow released). Posters and
// runners have their own ladders. Thresholds are starting guesses; tune them
// once real activity exists.

export type Level = { title: string; minCompleted: number };

export const POSTER_LEVELS: Level[] = [
  { title: 'Newcomer', minCompleted: 0 },
  { title: 'Regular', minCompleted: 5 },
  { title: 'Valued', minCompleted: 15 },
  { title: 'Campus Legend', minCompleted: 40 },
];

export const RUNNER_LEVELS: Level[] = [
  { title: 'Rookie', minCompleted: 0 },
  { title: 'Runner', minCompleted: 5 },
  { title: 'Pro', minCompleted: 20 },
  { title: 'Legend', minCompleted: 50 },
];
