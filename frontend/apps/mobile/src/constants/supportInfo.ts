// Contact details, legal links and FAQ for Settings. Anything set to null
// shows as "coming soon" in the app, so nothing fake is ever displayed.
// Fill these in when they exist (needed before publishing to the app stores).

// e.g. '2348012345678' (international format, no +).
export const SUPPORT_WHATSAPP: string | null = null;
export const SUPPORT_EMAIL: string | null = null;

export const TERMS_URL: string | null = null;
export const PRIVACY_POLICY_URL: string | null = null;

// Link people can tap in an invite; null until the app is in the stores.
export const INVITE_LINK: string | null = null;

// Answers here describe how Taskly actually works (PROJECT_OVERVIEW.md).
export const FAQ: { question: string; answer: string }[] = [
  {
    question: 'When do I pay?',
    answer:
      "Before your task goes live. Your money is held safely by Taskly and only released to the runner when you give them your handover code.",
  },
  {
    question: "What if nobody accepts my task?",
    answer:
      'It comes down at the time you chose ("Take it down if no one accepts within") and you get a full refund.',
  },
  {
    question: 'What is the handover code?',
    answer:
      "A code only you can see once your runner starts. Don't give it to them until your task is completed: entering it pays them.",
  },
  {
    question: 'Can I cancel a task?',
    answer:
      "Yes, before anyone accepts it, from the task's page. You get a full refund. If a runner accepted but isn't replying, you can release them after about 15 minutes.",
  },
  {
    question: 'Who are the runners?',
    answer:
      'Students verified by Taskly: matric number, student ID, photo and bank account are checked before anyone can accept tasks.',
  },
  {
    question: 'Why are some prices set?',
    answer:
      'Each kind of task has a minimum price so runners are paid fairly. You can always offer more.',
  },
];
