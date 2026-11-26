// Shown in Settings → Privacy & safety. Each tip matches how Taskly works
// (PROJECT_OVERVIEW.md §5).
import type { IconName } from '../components/Icon';

export const SAFETY_TIPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'lock-closed-outline',
    title: 'Your money is held safely',
    text: "You pay Taskly before your task goes live. The runner only gets paid when you give them your handover code.",
  },
  {
    icon: 'key-outline',
    title: 'Guard your handover code',
    text: "Don't give it to anyone until your task is completed. Taskly will never ask you for it.",
  },
  {
    icon: 'chatbubbles-outline',
    title: 'Keep payment in Taskly',
    text: 'Never send money to a runner directly or pay extra outside the app. If someone asks, report it.',
  },
  {
    icon: 'people-outline',
    title: 'Meet in public spots',
    text: 'For handovers, pick busy, well-lit places on campus like your hostel entrance or a faculty building.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Every runner is verified',
    text: 'Runners pass a student check (matric number, ID and photo) before they can accept tasks.',
  },
];
