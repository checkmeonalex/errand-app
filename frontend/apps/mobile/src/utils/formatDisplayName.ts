import { getFirstName } from './getFirstName';

// "seun adeyemi" → "Seun A.", the only form of a name shown on public boards
// (never full names). Returns null when there's no usable name.
export function formatDisplayName(fullName: string | null | undefined): string | null {
  const first = getFirstName(fullName);
  if (!first) return null;
  const parts = fullName!.trim().split(/\s+/);
  const lastInitial = parts.length > 1 ? ` ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : '';
  return first + lastInitial;
}
