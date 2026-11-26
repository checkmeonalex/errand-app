// ISO time → "3:40 PM" today, "3:40 PM tomorrow", or "Wed 3:40 PM" further
// out. Written by hand because date formatting differs across
// Android/iOS/web JavaScript engines.
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatTime(iso: string): string {
  const date = new Date(iso);
  const time = clockTime(date);

  const days = daysFromToday(date);
  if (days === 0) return time;
  if (days === 1) return `${time} tomorrow`;
  return `${WEEKDAYS[date.getDay()]} ${time}`;
}

// Whole calendar days between today and `date` (0 = today).
function daysFromToday(date: Date): number {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOf(date) - startOf(new Date())) / 86_400_000);
}

// "3:40 PM". Also used by formatDate.
export function clockTime(date: Date): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
}
