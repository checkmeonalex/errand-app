import type { NotificationKind, Task } from '@errand/types';
import type { IconName } from '../components/Icon';

type NotificationText = { icon: IconName; title: string; body: string; opens: 'task' | 'chat' };

// The words and icon for each kind of notification, filled in from the real
// task (title, runner's name). `opens` says where tapping it goes.
export function notificationText(kind: NotificationKind, task?: Pick<Task, 'title' | 'runner'>): NotificationText {
  const title = task?.title ?? 'your task';
  const runner = task?.runner?.first_name ?? 'Your runner';

  switch (kind) {
    case 'task-live':
      return { icon: 'radio-outline', title: 'Your task is live', body: `“${title}” is paid and waiting for a runner.`, opens: 'task' };
    case 'runner-accepted':
      return { icon: 'person-add-outline', title: `${runner} accepted your task`, body: `“${title}”. Say hello in the chat.`, opens: 'chat' };
    case 'task-started':
      return { icon: 'play-outline', title: `${runner} started your task`, body: `“${title}”. Your handover code is ready.`, opens: 'task' };
    case 'task-done':
      return { icon: 'checkmark-circle-outline', title: 'Task done', body: `“${title}” is complete. How did ${runner} do?`, opens: 'task' };
    case 'task-refunded':
      return { icon: 'return-down-back-outline', title: 'Refund on its way', body: `Nobody accepted “${title}” in time, so it came down and you're being refunded.`, opens: 'task' };
    case 'new-message':
      return { icon: 'chatbubble-outline', title: `New message from ${runner}`, body: `About “${title}”.`, opens: 'chat' };
  }
}
