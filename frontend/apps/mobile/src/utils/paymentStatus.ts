import type { Task } from '@errand/types';
import { wasPaid } from './taskTimeline';

// What happened to the money for one paid task, as shown in Payment history.
export type PaymentState = 'held' | 'paid-out' | 'refunded' | 'under-review';

export const PAYMENT_STATE_LABEL: Record<PaymentState, string> = {
  held: 'Held safely',
  'paid-out': 'Paid to runner',
  refunded: 'Refunded',
  'under-review': 'Under review',
};

// Null for tasks that were never paid (drafts, or cancelled before paying).
export function getPaymentState(task: Pick<Task, 'status' | 'accept_by'>): PaymentState | null {
  if (!wasPaid(task)) return null;
  switch (task.status) {
    case 'completed':
      return 'paid-out';
    case 'closed':
      return 'refunded';
    case 'disputed':
      return 'under-review';
    default:
      return 'held';
  }
}

// When the payment happened. Tasks paid before paid_at existed fall back to
// their creation time.
export function paidAt(task: Pick<Task, 'paid_at' | 'created_at'>): string {
  return task.paid_at ?? task.created_at;
}
