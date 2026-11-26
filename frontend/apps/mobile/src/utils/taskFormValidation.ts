// Rules for the post-task form: when an answer counts as missing, and when
// a price is acceptable. Used by PostTaskScreen.

import type { AnswerValue, Question } from '../constants/questionTypes';
import { formatNaira } from '../constants/priceSuggestions';

// An error message if a required question is unanswered, otherwise null.
// Optional questions and file uploads (not built yet) are never required.
export function getAnswerError(question: Question, value: AnswerValue): string | null {
  if (question.optional || question.type === 'file') return null;

  switch (question.type) {
    case 'choice':
      // A pick that's no longer offered (e.g. an accept window that doesn't
      // fit a newly chosen deadline) counts as unanswered.
      return typeof value === 'string' && question.options.includes(value) ? null : 'Pick one';
    case 'multi':
      return Array.isArray(value) && value.length > 0 ? null : 'Pick at least one';
    case 'number': {
      const min = question.min ?? 1;
      return typeof value === 'string' && value !== '' && Number(value) >= min
        ? null
        : `Enter ${min === 0 ? 'a number' : `at least ${min}`}`;
    }
    case 'text':
      return typeof value === 'string' && value.trim() ? null : 'Fill this in';
    case 'confirm':
      return value === true ? null : 'Tick to confirm';
  }
}

// The price must reach the task's minimum (its category's floor, or for
// laundry items × ₦500; see getMinimumPrice). Below it, no payment.
export function getPriceError(price: string, minimum: number): string | null {
  if (!price) return 'Enter a price';
  if (Number(price) < minimum) {
    return `The minimum for this task is ${formatNaira(minimum)}`;
  }
  return null;
}
