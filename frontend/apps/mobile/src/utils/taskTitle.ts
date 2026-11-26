// Helpers for building a task's title from the poster's answers, e.g.
// "Print & bind · 20 pages". Used by the title() of each question set.

import type { AnswerValue } from '../constants/questionTypes';

// Joins the non-empty parts with " · ".
export function joinTitle(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(' · ');
}

// "20" + "pages" → "20 pages"; undefined if unanswered.
export function countLabel(value: AnswerValue, unit: string): string | undefined {
  return typeof value === 'string' && value ? `${value} ${unit}` : undefined;
}

// A trimmed text answer, or undefined if blank.
export function text(value: AnswerValue): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
