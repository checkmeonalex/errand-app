// Rules for the profile details asked at sign-up and in Edit profile, so both
// accept exactly the same things.

export type ProfileFields = {
  fullName: string;
  email: string;
  phone: string;
  hostel: string;
};

export const MIN_PHONE_LENGTH = 10;

// Good enough to catch typos; the emailed code proves it's real.
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isProfileComplete(fields: ProfileFields): boolean {
  return (
    fields.fullName.trim().length > 1 &&
    isValidEmail(fields.email) &&
    fields.phone.trim().length >= MIN_PHONE_LENGTH &&
    fields.hostel.trim().length > 0
  );
}

// "seun.adeyemi@gmail.com" → "se***@gmail.com", for "we sent a code to…".
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}
