import type { Level } from '../constants/levels';

export type LevelProgress = {
  title: string;
  // Next level's title and how many more completed tasks reach it; null at the top.
  next: { title: string; remaining: number } | null;
  // 0–1 progress from this level to the next (1 at the top level).
  progress: number;
};

// Where `completed` tasks put someone on a level ladder.
export function getLevel(levels: Level[], completed: number): LevelProgress {
  let index = 0;
  levels.forEach((level, i) => {
    if (completed >= level.minCompleted) index = i;
  });
  const current = levels[index];
  const nextLevel = levels[index + 1];
  if (!nextLevel) return { title: current.title, next: null, progress: 1 };

  const span = nextLevel.minCompleted - current.minCompleted;
  return {
    title: current.title,
    next: { title: nextLevel.title, remaining: nextLevel.minCompleted - completed },
    progress: (completed - current.minCompleted) / span,
  };
}
