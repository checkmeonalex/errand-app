import type { Task } from '@errand/types';

type Navigation = { navigate: (screen: string, params?: object) => void };

// Where tapping one of the poster's tasks goes: an unpaid task returns to
// checkout; anything else opens its detail.
export function openTask(navigation: Navigation, task: Pick<Task, 'id' | 'status'>) {
  if (task.status === 'pending-payment') {
    navigation.navigate('Checkout', { taskId: task.id });
  } else {
    navigation.navigate('TaskDetail', { taskId: task.id });
  }
}
