export const TASK_STATUS = {
  POSTED: 'posted',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  DISPUTED: 'disputed',
} as const;

export const USER_ROLES = {
  USER: 'user',
  RUNNER: 'runner',
  ADMIN: 'admin',
} as const;

export const TRUST_LEVELS = {
  NEW: 'new',
  VERIFIED: 'verified',
  TRUSTED: 'trusted',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  ESCROW: 'escrow',
  RELEASED: 'released',
  REFUNDED: 'refunded',
} as const;
