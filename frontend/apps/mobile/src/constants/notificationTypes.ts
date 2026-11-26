// Every kind of notification a poster can turn on or off in Settings. The
// backend checks these before sending a push (all on by default).

export type NotificationKey =
  | 'runnerAccepted'
  | 'taskStarted'
  | 'newMessage'
  | 'taskDone'
  | 'refunds'
  | 'tipsAndNews';

export const NOTIFICATION_TYPES: { key: NotificationKey; label: string; description: string }[] = [
  { key: 'runnerAccepted', label: 'Runner accepted', description: 'When a runner takes your task' },
  { key: 'taskStarted', label: 'Task started', description: 'When the runner starts working on it' },
  { key: 'newMessage', label: 'New messages', description: 'Chat messages from your runner' },
  { key: 'taskDone', label: 'Task done', description: 'When your task is completed and paid out' },
  { key: 'refunds', label: 'Refunds', description: 'When a task comes down and you get your money back' },
  { key: 'tipsAndNews', label: 'Tips and news', description: 'New categories and features on Taskly' },
];
