// Questions reused across several categories. Every set ends with where,
// when, accept window and extra info; NO_PURCHASE and DURATION are used by
// the "Other" sets.

import type { Question, ShowIf } from './questionTypes';
import {
  formatNaira,
  MIN_WRITING_PAGES,
  WRITING_MATERIALS_PRICE,
  writingRateFor,
} from './priceSuggestions';

export function where(label: string, showIf?: ShowIf): Question {
  return {
    id: 'location',
    type: 'text',
    label,
    placeholder: 'Hostel, block, room or landmark',
    showIf,
  };
}

export function when(label = 'When do you need it done?'): Question {
  return {
    id: 'deadline',
    type: 'choice',
    label,
    options: ['Within 3 hours', 'Today', 'Tomorrow', 'This week'],
  };
}

// How long the task stays live waiting for a runner before it's taken down
// and refunded; the poster picks, up to 72 hours. Minutes are used to set the
// task's accept_by time on payment.
export const ACCEPT_WINDOWS = [
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '3 hours', minutes: 180 },
  { label: '6 hours', minutes: 360 },
  { label: '12 hours', minutes: 720 },
  { label: '24 hours', minutes: 1440 },
  { label: '48 hours', minutes: 2880 },
  { label: '72 hours', minutes: 4320 },
] as const;

// Longest accept window that still leaves the runner time to do the task,
// for each "When do you need it done?" answer.
const MAX_ACCEPT_MINUTES_BY_DEADLINE: Record<string, number> = {
  'Within 3 hours': 60,
  Today: 360,
  Tomorrow: 1440,
  'This week': 4320,
};

export const ACCEPT_WINDOW: Question = {
  id: 'acceptWindow',
  type: 'choice',
  label: 'Take it down if no one accepts within',
  options: ACCEPT_WINDOWS.map((window) => window.label),
  // Only offer windows that fit the chosen deadline (all of them until one is picked).
  limitOptions: (answers) => windowsForDeadline(answers.deadline).map((window) => window.label),
};

// Accept windows that fit a "When do you need it done?" answer (all of them
// until one is picked). Also used when a poster gives a live task more time.
export function windowsForDeadline(deadline: unknown) {
  const max = MAX_ACCEPT_MINUTES_BY_DEADLINE[String(deadline)] ?? Infinity;
  return ACCEPT_WINDOWS.filter((window) => window.minutes <= max);
}

export function getAcceptWindowMinutes(label: unknown): number | null {
  return ACCEPT_WINDOWS.find((window) => window.label === label)?.minutes ?? null;
}

export const EXTRA_INFO: Question = {
  id: 'extraInfo',
  type: 'text',
  label: 'Anything else the runner should know?',
  placeholder: 'Extra details, timing, how to reach you...',
  multiline: true,
  optional: true,
};

// ── Note writing and assignment typing (priced per page) ──

// Asked before the page count, so the price per page is known.
export const WRITING_FORMAT: Question = {
  id: 'format',
  type: 'choice',
  label: 'Handwritten or typed?',
  options: ['Handwritten', 'Typed'],
};

// `id` differs per set ('pages' for notes, 'length' for assignments).
export function writingPages(id: string): Question {
  return {
    id,
    type: 'number',
    label: `How many pages? (at least ${MIN_WRITING_PAGES})`,
    unit: 'pages',
    min: MIN_WRITING_PAGES,
    pricePerUnit: writingRateFor,
  };
}

// Handwritten only. Unticked, the runner buys a notebook and pen, so their cost
// is added to the minimum price automatically (runners never pay out of pocket).
export const WRITING_MATERIALS: Question = {
  id: 'materials',
  type: 'confirm',
  label: "I'll provide the notebook and pen",
  optional: true,
  uncheckedNote: `The runner will buy a notebook and pen, so ${formatNaira(WRITING_MATERIALS_PRICE)} is added to the minimum price.`,
  priceIfUnchecked: WRITING_MATERIALS_PRICE,
  showIf: { questionId: 'format', equals: 'Handwritten' },
};

// Launch rule: runners never spend their own money (overview §6).
export const NO_PURCHASE: Question = {
  id: 'needsPurchase',
  type: 'choice',
  label: 'Will the runner need to buy anything?',
  options: ['No', 'Yes'],
  blockIf: {
    equals: 'Yes',
    message: "Tasks that need the runner to buy items aren't supported yet.",
  },
};

export const DURATION: Question = {
  id: 'duration',
  type: 'choice',
  label: 'Roughly how long will it take?',
  options: ['Under 30 min', 'About 1 hour', '2+ hours'],
};
