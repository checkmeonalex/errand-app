// Task prices: each category's (or subcategory's) minimum — enforced, the
// poster can't continue to payment below it — plus per-unit rates and the
// hints and home-card tags built from them. Change a number here and every
// screen follows.
//
// TODO: once there's real completed-task data, tune these from what posters
// actually paid (via @errand/api).

import type { CategoryId } from './categories';
import type { Answers, Question } from './questionTypes';

// The platform-wide floor; no task can be cheaper than this.
export const MINIMUM_TASK_PRICE = 500;

// Laundry is priced per item, detergent and ironing included (the runner
// supplies detergent as part of the job; overview §6).
export const LAUNDRY_PRICE_PER_ITEM = 500;

// Note writing and assignment typing are priced per page; handwritten costs
// more because it's slower. At least MIN_WRITING_PAGES pages per task.
export const WRITING_PRICE_PER_PAGE = { Handwritten: 250, Typed: 150 } as const;
export const MIN_WRITING_PAGES = 4;

export const TUTORING_PRICE_PER_HOUR = 1500;

// Added to a handwritten task's minimum when the poster doesn't provide the
// notebook and pen, so the runner never buys them out of pocket.
export const WRITING_MATERIALS_PRICE = 500;

// Per-page rate for the chosen format; null until handwritten/typed is picked.
export function writingRateFor(answers: Answers): number | null {
  return WRITING_PRICE_PER_PAGE[answers.format as keyof typeof WRITING_PRICE_PER_PAGE] ?? null;
}

// Lowest price allowed (decided 2026-10-19). A subcategory entry overrides
// its category's. Per-unit tasks (laundry, notes, assignment, tutoring) also
// can't go below count × rate, worked out from the answers.
const CATEGORY_MINIMUMS: Record<Exclude<CategoryId, 'tech'>, number> = {
  printing: 500,
  laundry: LAUNDRY_PRICE_PER_ITEM,
  academic: 1500,
  household: 1500,
  other: MINIMUM_TASK_PRICE,
};

const SUBCATEGORY_MINIMUMS: Record<string, number> = {
  notes: MIN_WRITING_PAGES * WRITING_PRICE_PER_PAGE.Typed,
  assignment: MIN_WRITING_PAGES * WRITING_PRICE_PER_PAGE.Typed,
  tutoring: TUTORING_PRICE_PER_HOUR,
};

// 1500 → "₦1,500". Written by hand because number formatting differs across
// Android/iOS/web JavaScript engines.
export function formatNaira(amount: number): string {
  return `₦${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function baseMinimum(categoryId: string | undefined, subcategoryId?: string): number {
  return (
    (subcategoryId ? SUBCATEGORY_MINIMUMS[subcategoryId] : undefined) ??
    CATEGORY_MINIMUMS[categoryId as keyof typeof CATEGORY_MINIMUMS] ??
    MINIMUM_TASK_PRICE
  );
}

// count × rate for per-unit tasks, once both are known.
function perUnitTotal(questions: Question[], answers: Answers) {
  for (const q of questions) {
    if (q.type === 'number' && q.pricePerUnit) {
      const each = typeof q.pricePerUnit === 'function' ? q.pricePerUnit(answers) : q.pricePerUnit;
      const count = Number(answers[q.id]);
      if (each && count > 0) return { count, unit: q.unit, each, total: count * each };
    }
  }
  return null;
}

// Extras added while a box is unticked (e.g. ₦500 for notebook and pen).
function uncheckedExtras(questions: Question[], answers: Answers) {
  return questions.flatMap((q) =>
    q.type === 'confirm' && q.priceIfUnchecked && answers[q.id] !== true
      ? [{ amount: q.priceIfUnchecked, label: q.id }]
      : [],
  );
}

// The lowest price this task can be posted at, given its answers so far.
export function getMinimumPrice(
  categoryId: string | undefined,
  subcategoryId: string | undefined,
  questions: Question[],
  answers: Answers,
): number {
  const perUnit = perUnitTotal(questions, answers);
  const extras = uncheckedExtras(questions, answers).reduce((sum, extra) => sum + extra.amount, 0);
  return (
    Math.max(MINIMUM_TASK_PRICE, baseMinimum(categoryId, subcategoryId), perUnit?.total ?? 0) +
    extras
  );
}

// Hint before the units are known, for per-unit kinds of task.
const PER_UNIT_HINTS: Record<string, string> = {
  laundry: `${formatNaira(LAUNDRY_PRICE_PER_ITEM)} per item`,
  notes: `${formatNaira(WRITING_PRICE_PER_PAGE.Handwritten)}/page handwritten, ${formatNaira(WRITING_PRICE_PER_PAGE.Typed)}/page typed (min ${MIN_WRITING_PAGES} pages)`,
  assignment: `${formatNaira(WRITING_PRICE_PER_PAGE.Handwritten)}/page handwritten, ${formatNaira(WRITING_PRICE_PER_PAGE.Typed)}/page typed (min ${MIN_WRITING_PAGES} pages)`,
  tutoring: `${formatNaira(TUTORING_PRICE_PER_HOUR)} per hour`,
};

// How an extra reads in the hint, keyed by the question id that adds it.
const EXTRA_LABELS: Record<string, string> = { materials: 'notebook & pen' };

const MORE_FOR: Partial<Record<CategoryId, string>> = {
  printing: 'more for more pages',
  academic: 'more for more effort',
  household: 'more for bigger tasks',
  other: 'more for more effort',
};

// The hint under the post-task price field, e.g. "From ₦1,500, more for
// bigger tasks", or once units are known "From ₦2,500 (10 pages × ₦250)".
export function getPriceHintForAnswers(
  categoryId: string | undefined,
  subcategoryId: string | undefined,
  questions: Question[],
  answers: Answers,
): string {
  const perUnit = perUnitTotal(questions, answers);
  if (perUnit) {
    const minimum = getMinimumPrice(categoryId, subcategoryId, questions, answers);
    const extras = uncheckedExtras(questions, answers)
      .map((extra) => ` + ${formatNaira(extra.amount)} ${EXTRA_LABELS[extra.label] ?? 'extras'}`)
      .join('');
    return `From ${formatNaira(minimum)} (${perUnit.count} ${perUnit.unit} × ${formatNaira(perUnit.each)}${extras})`;
  }
  const perUnitHint = PER_UNIT_HINTS[subcategoryId ?? categoryId ?? ''];
  if (perUnitHint) return perUnitHint;
  const more = MORE_FOR[categoryId as CategoryId];
  return `From ${formatNaira(baseMinimum(categoryId, subcategoryId))}${more ? `, ${more}` : ''}`;
}

// Short version for the category cards on the home screen: the cheapest
// task you can post in that category.
export function getPriceTag(categoryId: string | undefined): string | undefined {
  if (!(categoryId && categoryId in CATEGORY_MINIMUMS)) return undefined;
  if (categoryId === 'laundry') return `${formatNaira(LAUNDRY_PRICE_PER_ITEM)} / item`;
  const cheapest =
    categoryId === 'academic'
      ? Math.min(CATEGORY_MINIMUMS.academic, SUBCATEGORY_MINIMUMS.notes, SUBCATEGORY_MINIMUMS.assignment)
      : baseMinimum(categoryId);
  return `From ${formatNaira(cheapest)}`;
}

// Quick "+₦…" chips on Raise price (a live task nobody has accepted yet).
export const PRICE_RAISE_STEPS = [200, 500, 1000];
