import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Task } from '@errand/types';
import { getAcceptWindowMinutes } from '../constants/sharedQuestions';
import { LOCAL_USER_ID } from '../constants/localUser';
import { useNotifications } from './NotificationsContext';
import { loadJSON, removeKey, saveJSON, STORAGE_KEYS } from '../storage/storage';
import { simulateNextStep as devSimulateNextStep } from '../utils/devSimulateTask';

// What the post-task form hands over; the rest of a Task is filled in here.
export type NewTask = Pick<Task, 'title' | 'description' | 'category' | 'subcategory' | 'price'> & {
  extra_fields: Record<string, unknown>;
};

type TasksContextValue = {
  // The poster's tasks, newest first.
  tasks: Task[];
  // True until saved tasks have been read on launch.
  isLoading: boolean;
  // Creates the task unpaid ('pending-payment'); runners can't see it yet.
  addTask: (task: NewTask) => Promise<Task>;
  // Marks it paid: it goes live ('posted') with an accept_by deadline.
  payForTask: (taskId: string) => Promise<Task>;
  // Before anyone accepts: takes it down ('closed'); refunded if it was paid.
  cancelTask: (taskId: string) => Promise<void>;
  // Accepted runner didn't reply: back to 'posted' for someone else.
  releaseRunner: (taskId: string) => Promise<void>;
  // DEV ONLY: fake the runner's next step (see utils/devSimulateTask).
  simulateNextStep: (taskId: string) => Promise<void>;
  // Wipes every task saved on this device (used by Delete account).
  clearAll: () => Promise<void>;
  // A reported problem while money is held: payment pauses for review.
  openDispute: (taskId: string) => Promise<void>;
  // Nobody's accepted yet: a higher price (after paying the difference)…
  raisePrice: (taskId: string, newPrice: number) => Promise<void>;
  // …or more time before it comes down (from now).
  extendAcceptWindow: (taskId: string, minutes: number) => Promise<void>;
  // Applies a change to one task and saves it. For RunnerJobsContext, which
  // shares this store until the backend gives runners their own lists.
  updateTask: (taskId: string, change: (task: Task) => Task) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

const EXPIRY_CHECK_MS = 60_000;

// LOCAL task store so posted tasks show up before the backend exists. Tasks
// are saved on this device only (phone and web don't share them).
// TODO: replace with @errand/api: tasks.listMine, tasks.create,
// payments.initialize/status. Screens use useTasks() and won't need to change.
export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotifications();
  // Always-current list, so two quick changes can't overwrite each other.
  const tasksRef = useRef<Task[]>([]);
  // Resolves once saved tasks are loaded, so a change made during launch
  // can't overwrite them.
  const loaded = useRef<Promise<void> | null>(null);

  async function commit(next: Task[]) {
    tasksRef.current = next;
    setTasks(next);
    await saveJSON(STORAGE_KEYS.tasks, next);
  }

  // Stand-in for the backend job: a live task nobody accepted by accept_by
  // is taken down ('closed') and refunded.
  // TODO: remove once the backend closes and refunds expired tasks.
  function closeExpired() {
    const now = Date.now();
    const expired: string[] = [];
    const next = tasksRef.current.map((task) => {
      if (task.status === 'posted' && task.accept_by && Date.parse(task.accept_by) <= now) {
        expired.push(task.id);
        return { ...task, status: 'closed' as const, updated_at: new Date().toISOString() };
      }
      return task;
    });
    if (expired.length) {
      commit(next);
      expired.forEach((taskId) => notify('task-refunded', taskId));
    }
  }

  useEffect(() => {
    loaded.current = loadJSON<Task[]>(STORAGE_KEYS.tasks).then((saved) => {
      tasksRef.current = saved ?? [];
      setTasks(tasksRef.current);
      setIsLoading(false);
      closeExpired();
    });
    const timer = setInterval(closeExpired, EXPIRY_CHECK_MS);
    return () => clearInterval(timer);
  }, []);

  async function addTask(newTask: NewTask): Promise<Task> {
    await loaded.current;
    const now = new Date().toISOString();
    const task: Task = {
      ...newTask,
      id: `local-${Date.now()}`,
      creator_id: LOCAL_USER_ID,
      status: 'pending-payment',
      created_at: now,
      updated_at: now,
    };
    await commit([task, ...tasksRef.current]);
    return task;
  }

  async function payForTask(taskId: string): Promise<Task> {
    await loaded.current;
    const task = tasksRef.current.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'pending-payment') return task;

    const minutes = getAcceptWindowMinutes(task.extra_fields?.acceptWindow) ?? 60;
    const paidAt = new Date();
    const paid: Task = {
      ...task,
      status: 'posted',
      paid_at: paidAt.toISOString(),
      accept_by: new Date(paidAt.getTime() + minutes * 60_000).toISOString(),
      updated_at: paidAt.toISOString(),
    };
    await commit(tasksRef.current.map((t) => (t.id === taskId ? paid : t)));
    await notify('task-live', taskId);
    return paid;
  }

  // Applies `change` to one task and saves; a no-op if the task is missing.
  async function updateTask(taskId: string, change: (task: Task) => Task) {
    await loaded.current;
    await commit(tasksRef.current.map((t) => (t.id === taskId ? change(t) : t)));
  }

  // TODO: tasks.cancel via @errand/api (backend refunds via Paystack).
  async function cancelTask(taskId: string) {
    await updateTask(taskId, (task) =>
      task.status === 'pending-payment' || task.status === 'posted'
        ? { ...task, status: 'closed', updated_at: new Date().toISOString() }
        : task,
    );
  }

  // TODO: tasks.releaseRunner via @errand/api.
  async function releaseRunner(taskId: string) {
    await updateTask(taskId, (task) =>
      task.status === 'accepted'
        ? {
            ...task,
            status: 'posted',
            runner: undefined,
            runner_id: undefined,
            otp: undefined,
            updated_at: new Date().toISOString(),
          }
        : task,
    );
  }

  // TODO: reports.create with is_dispute does this on the backend.
  async function openDispute(taskId: string) {
    await updateTask(taskId, (task) =>
      task.status === 'accepted' || task.status === 'in-progress'
        ? { ...task, status: 'disputed', updated_at: new Date().toISOString() }
        : task,
    );
  }

  // TODO: tasks.raisePrice via @errand/api, after the top-up payment clears.
  async function raisePrice(taskId: string, newPrice: number) {
    await updateTask(taskId, (task) =>
      task.status === 'posted' && newPrice > task.price
        ? { ...task, price: newPrice, updated_at: new Date().toISOString() }
        : task,
    );
  }

  // TODO: tasks.extendAcceptWindow via @errand/api.
  async function extendAcceptWindow(taskId: string, minutes: number) {
    await updateTask(taskId, (task) =>
      task.status === 'posted'
        ? { ...task, accept_by: new Date(Date.now() + minutes * 60_000).toISOString(), updated_at: new Date().toISOString() }
        : task,
    );
  }

  async function clearAll() {
    await loaded.current;
    tasksRef.current = [];
    setTasks([]);
    await removeKey(STORAGE_KEYS.tasks);
  }

  async function simulateNextStep(taskId: string) {
    if (!__DEV__) return;
    await updateTask(taskId, devSimulateNextStep);
    // The runner's step is something the poster is told about.
    const status = tasksRef.current.find((t) => t.id === taskId)?.status;
    const kind = status === 'accepted' ? 'runner-accepted' : status === 'in-progress' ? 'task-started' : status === 'completed' ? 'task-done' : null;
    if (kind) await notify(kind, taskId);
  }

  return (
    <TasksContext.Provider
      value={{ tasks, isLoading, addTask, payForTask, cancelTask, releaseRunner, simulateNextStep, clearAll, openDispute, raisePrice, extendAcceptWindow, updateTask }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
