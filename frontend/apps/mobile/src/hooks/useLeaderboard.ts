import { useMemo } from 'react';
import type { LeaderboardBoard, LeaderboardResponse, LeaderboardWindow } from '@errand/types';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { useTasks } from '../context/TasksContext';
import { LOCAL_USER_ID } from '../constants/localUser';
import { completedCount, periodStart } from '../utils/taskStats';
import { formatDisplayName } from '../utils/formatDisplayName';

type LeaderboardState = LeaderboardResponse & {
  isLoading: boolean;
  // Why `me` is null, so the screen can explain it.
  meMissingReason: 'opted-out' | 'not-a-runner' | null;
};

// One leaderboard (posters or runners; this week, month, year or all time).
//
// TODO: fetch @errand/api leaderboard.get(board, period) → { entries, me }.
// Other students' rows can only come from the backend, so `entries` is empty
// until then (no fake people). `me` is real already: the poster's own
// completed tasks, counted from their saved tasks. Rank and score are
// worked out by the backend, so they're 0 (unranked) here.
export function useLeaderboard(board: LeaderboardBoard, period: LeaderboardWindow): LeaderboardState {
  const { user } = useAuth();
  const { hasRunnerAccess } = useMode();
  const { tasks, isLoading } = useTasks();

  return useMemo(() => {
    const optedOut = user?.show_on_leaderboards === false;
    const notARunner = board === 'runners' && !hasRunnerAccess;
    const meMissingReason = optedOut ? 'opted-out' : notARunner ? 'not-a-runner' : null;

    const me =
      meMissingReason === null
        ? {
            user_id: LOCAL_USER_ID,
            rank: 0,
            display_name: formatDisplayName(user?.full_name) ?? 'You',
            avatar_url: user?.avatar_url,
            // Posters' own tasks; a runner's jobs come from the backend.
            completed_count:
              board === 'posters' ? completedCount(tasks, periodStart(period)) : 0,
            rating: null,
            score: 0,
            badges: user?.badges ?? [],
          }
        : null;

    return { entries: [], me, isLoading, meMissingReason };
  }, [board, period, user, hasRunnerAccess, tasks, isLoading]);
}
