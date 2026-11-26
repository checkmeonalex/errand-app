import type { Task } from '@errand/types';
import { formatNaira, WRITING_MATERIALS_PRICE } from '../constants/priceSuggestions';

// What the runner supplies as part of the job (its cost is in the price), so
// nobody turns up without it. Null when there's nothing extra.
export function whatToBring(task: Pick<Task, 'category' | 'extra_fields'>): string | null {
  const answers = task.extra_fields ?? {};
  if (task.category === 'laundry') return 'Detergent (included in the price)';
  if (answers.format === 'Handwritten' && answers.materials !== true) {
    return `A notebook and pen (the price includes ${formatNaira(WRITING_MATERIALS_PRICE)} for them)`;
  }
  return null;
}
