// "seun  adeyemi" → "Seun". Returns null when there's no usable name, so
// callers can choose their own fallback (e.g. "Hi there").
export function getFirstName(fullName: string | null | undefined): string | null {
  const first = fullName?.trim().split(/\s+/)[0];
  if (!first) return null;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
