import { clockTime } from './formatTime';

// ISO time → "22 Oct 2026, 3:40 PM". For records like payments and receipts,
// where "Wed" (formatTime) would be ambiguous. Hand-written for the same
// reason as formatTime: engines format dates differently.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${clockTime(date)}`;
}
