import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Task } from '@errand/types';
import { CATEGORIES, type CategoryId } from '../constants/categories';
import { LOCAL_USER_ID } from '../constants/localUser';
import { FREE_DROP_MINUTES, MAX_ACTIVE_JOBS, MAX_CODE_ATTEMPTS } from '../constants/runnerRules';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationsContext';
import { useTasks } from './TasksContext';
import { usePersistentList } from '../hooks/usePersistentList';
import { loadJSON, removeKey, saveJSON, STORAGE_KEYS } from '../storage/storage';
import { randomCode } from '../utils/devSimulateTask';
import { getFirstName } from '../utils/getFirstName';

export type AcceptResult = 'accepted' | 'taken' | 'limit';
export type CodeResult = { result: 'released' | 'wrong' | 'locked'; attemptsLeft: number };

type RunnerJobsContextValue = {
  // Live tasks this runner can accept, newest first.
  feed: Task[];
  // Every task this runner accepted (any status), newest first.
  jobs: Task[];
  activeJobs: Task[];
  canAcceptMore: boolean;
  // The categories the Taskly team signed this runner up for.
  categories: CategoryId[];
  // Whether they've seen the rules (shown once, on their first accept).
  rulesSeen: boolean;
  markRulesSeen: () => Promise<void>;
  // Drops that counted against them (after the free minutes).
  countedDrops: number;
  acceptTask: (taskId: string) => Promise<AcceptResult>;
  postUpdate: (taskId: string, kind: string) => Promise<void>;
  // "Start task": the poster's handover code becomes visible to them.
  startTask: (taskId: string) => Promise<void>;
  enterCode: (taskId: string, code: string) => Promise<CodeResult>;
  // Only before starting; returns whether this drop counted.
  dropTask: (taskId: string) => Promise<boolean>;
  // Wipes runner data saved on this device (used by Delete account).
  clearAll: () => Promise<void>;
};

const RunnerJobsContext = createContext<RunnerJobsContextValue | undefined>(undefined);

const isActive = (task: Task) => task.status === 'accepted' || task.status === 'in-progress';

// Whether dropping this task now would count against the runner.
export function dropCounts(task: Pick<Task, 'accepted_at'>, now = Date.now()): boolean {
  return !task.accepted_at || now - Date.parse(task.accepted_at) > FREE_DROP_MINUTES * 60_000;
}

// The runner's side of tasks. With no backend there are no other people's
// tasks, so in DEV builds the feed is the tasks you posted yourself: switch
// to runner mode and accept your own task to play both sides with real data.
// TODO: replace with @errand/api: runner.feed (polled every 15–30 s, only the
// runner's categories), runner.myJobs, tasks.accept, tasks.postUpdate,
// tasks.start, tasks.complete, tasks.drop. Screens won't need to change.
export function RunnerJobsProvider({ children }: { children: React.ReactNode }) {
  const { tasks, updateTask } = useTasks();
  const { user } = useAuth();
  const { notify } = useNotifications();
  const drops = usePersistentList<string>(STORAGE_KEYS.runnerDrops);
  const [rulesSeen, setRulesSeen] = useState(false);
  // Wrong code tries per task. TODO: the backend counts these (tasks.complete).
  const [codeAttempts, setCodeAttempts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadJSON<boolean>(STORAGE_KEYS.runnerRulesSeen).then((seen) => setRulesSeen(Boolean(seen)));
  }, []);

  // TODO: from the runner's profile (RunnerProfile.categories, set by the team).
  const categories = CATEGORIES.filter((category) => !category.comingSoon).map((category) => category.id);
  const feed = __DEV__ ? tasks.filter((task) => task.status === 'posted' && categories.includes(task.category as CategoryId)) : [];
  const jobs = tasks.filter((task) => task.runner_id === LOCAL_USER_ID);
  const activeJobs = jobs.filter(isActive);
  const completedCount = jobs.filter((task) => task.status === 'completed').length;
  const now = () => new Date().toISOString();

  async function markRulesSeen() {
    setRulesSeen(true);
    await saveJSON(STORAGE_KEYS.runnerRulesSeen, true);
  }

  async function acceptTask(taskId: string): Promise<AcceptResult> {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status !== 'posted') return 'taken';
    if (activeJobs.length >= MAX_ACTIVE_JOBS) return 'limit';
    await updateTask(taskId, (t) =>
      t.status !== 'posted'
        ? t
        : {
            ...t,
            status: 'accepted',
            runner_id: LOCAL_USER_ID,
            runner: {
              id: LOCAL_USER_ID,
              first_name: getFirstName(user?.full_name) ?? 'Your runner',
              avatar_url: user?.avatar_url,
              rating: null,
              completed_count: completedCount,
            },
            // DEV: you posted it, so you're also the poster.
            poster: t.poster ?? { id: t.creator_id, first_name: getFirstName(user?.full_name) ?? 'The poster', avatar_url: user?.avatar_url },
            accepted_at: now(),
            updates: [],
            updated_at: now(),
          },
    );
    await notify('runner-accepted', taskId);
    return 'accepted';
  }

  async function postUpdate(taskId: string, kind: string) {
    const created_at = now();
    await updateTask(taskId, (t) =>
      isActive(t) ? { ...t, updates: [...(t.updates ?? []), { id: `${taskId}-${Date.now()}`, task_id: taskId, kind, created_at }], updated_at: created_at } : t,
    );
  }

  async function startTask(taskId: string) {
    // The backend makes the code at accept; here it appears on start, which is
    // when the poster first sees it anyway.
    await updateTask(taskId, (t) =>
      t.status === 'accepted' ? { ...t, status: 'in-progress', otp: t.otp ?? randomCode(), updated_at: now() } : t,
    );
    await notify('task-started', taskId);
  }

  async function enterCode(taskId: string, code: string): Promise<CodeResult> {
    const task = tasks.find((t) => t.id === taskId);
    if (task?.status === 'in-progress' && code === task.otp) {
      await updateTask(taskId, (t) => ({ ...t, status: 'completed', updated_at: now() }));
      await notify('task-done', taskId);
      return { result: 'released', attemptsLeft: 0 };
    }
    const tries = (codeAttempts[taskId] ?? 0) + 1;
    setCodeAttempts({ ...codeAttempts, [taskId]: tries });
    if (tries >= MAX_CODE_ATTEMPTS) {
      await updateTask(taskId, (t) => (t.status === 'in-progress' ? { ...t, status: 'disputed', updated_at: now() } : t));
      return { result: 'locked', attemptsLeft: 0 };
    }
    return { result: 'wrong', attemptsLeft: MAX_CODE_ATTEMPTS - tries };
  }

  async function dropTask(taskId: string): Promise<boolean> {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status !== 'accepted') return false;
    const counted = dropCounts(task);
    // Back in the feed for someone else, as if never accepted.
    await updateTask(taskId, (t) => ({
      ...t,
      status: 'posted',
      runner_id: undefined,
      runner: undefined,
      poster: undefined,
      otp: undefined,
      accepted_at: undefined,
      updates: undefined,
      updated_at: now(),
    }));
    if (counted) await drops.add(now());
    return counted;
  }

  async function clearAll() {
    await drops.clearAll();
    setRulesSeen(false);
    await Promise.all([STORAGE_KEYS.runnerRulesSeen, STORAGE_KEYS.runnerWaitlist, STORAGE_KEYS.devRunnerAccess].map(removeKey));
  }

  return (
    <RunnerJobsContext.Provider
      value={{
        feed,
        jobs,
        activeJobs,
        canAcceptMore: activeJobs.length < MAX_ACTIVE_JOBS,
        categories,
        rulesSeen,
        markRulesSeen,
        countedDrops: drops.items.length,
        acceptTask,
        postUpdate,
        startTask,
        enterCode,
        dropTask,
        clearAll,
      }}
    >
      {children}
    </RunnerJobsContext.Provider>
  );
}

export function useRunnerJobs() {
  const context = useContext(RunnerJobsContext);
  if (!context) {
    throw new Error('useRunnerJobs must be used within a RunnerJobsProvider');
  }
  return context;
}
