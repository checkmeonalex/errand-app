// A user can hold access to either or both modes on one account.
// 'admin' stays separate — it is never a mode a user switches into.
export type UserMode = 'poster' | 'runner';
export type UserRole = UserMode | 'admin';

export interface Profile {
  id: string;
  phone: string;
  full_name: string;
  // Any email (Gmail etc.); verified with a 6-digit code at sign-up.
  email?: string;
  email_verified?: boolean;
  // Matric number: collected at runner verification (checked by a person
  // against the student ID); not asked of posters.
  school_id?: string;
  hostel?: string;
  // Profile photo (required for posters and runners). Stored in the
  // backend's "avatars" bucket; each user can only replace their own.
  avatar_url?: string;

  // Which modes this account currently has access to. 'runner' is only
  // added once RunnerProfile verification is complete — see below.
  roles: UserRole[];

  // Which mode the UI is currently showing. Lives on the profile (not
  // just local app state) so it's remembered across sessions/devices.
  active_mode: UserMode;

  // Poster-side trust/reputation. Kept separate from runner trust —
  // being a reliable poster says nothing about reliability as a runner.
  poster_trust_level: 'new' | 'verified' | 'trusted';
  poster_rating: number;
  poster_completion_count: number;

  // Badges the backend has awarded (never removed once earned).
  badges?: BadgeId[];
  // Safeguard: users can hide themselves from public leaderboards.
  show_on_leaderboards?: boolean;

  created_at: string;
}

// pioneer_poster: one of the first 15 posters whose first task completed.
// pioneer_runner: one of the first 15 runners to pass verification.
// top_poster / top_runner: in the top 10 of last week's board.
export type BadgeId = 'pioneer_poster' | 'pioneer_runner' | 'top_poster' | 'top_runner';

export type LeaderboardBoard = 'posters' | 'runners';
// week resets Monday, month on the 1st, year on 1 January (Africa/Lagos).
export type LeaderboardWindow = 'week' | 'month' | 'year' | 'all';

// One row of a leaderboard, as returned by leaderboard.get. Scores are
// worked out on the backend (anti-farming rules apply there).
export interface LeaderboardEntry {
  user_id: string;
  rank: number;
  // First name + last initial, e.g. "Seun A.". Never full names.
  display_name: string;
  avatar_url?: string;
  completed_count: number;
  rating: number | null;
  score: number;
  badges: BadgeId[];
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  // The signed-in user's own row, even when outside the shown entries;
  // null if they're not on this board (opted out, or not a runner).
  me: LeaderboardEntry | null;
}

// Only exists once a user has gone through runner verification.
// Absence of a RunnerProfile row for a user == they haven't verified
// into runner mode yet, regardless of what `roles` says.
export interface RunnerProfile {
  profile_id: string; // FK -> Profile.id
  matric_number: string;
  department?: string;
  level?: string;
  id_document_url?: string;
  bank_account_number?: string;
  bank_name?: string;
  categories: string[]; // which task categories this runner is willing to take
  trust_level: 'new' | 'verified' | 'trusted';
  rating: number;
  completion_count: number;
  verified_at?: string;
}

// pending-payment: created but not paid, so not visible to runners yet.
// posted: paid and live. closed: taken down (e.g. nobody accepted in time) and refunded.
export type TaskStatus =
  | 'pending-payment'
  | 'posted'
  | 'accepted'
  | 'in-progress'
  | 'completed'
  | 'closed'
  | 'disputed';

export interface Task {
  id: string;
  creator_id: string;
  runner_id?: string;
  title: string;
  description: string;
  category: string;
  // Kind of task inside the category, e.g. 'tutoring' under 'academic'.
  subcategory?: string;
  price: number;
  // The poster's answers to the category questions (overview §6), as JSON.
  extra_fields?: Record<string, unknown>;
  status: TaskStatus;
  // Handover code. Created by the backend when a runner accepts; sent ONLY to
  // the poster, and only once the task is 'in-progress'. The runner types it
  // in at handover to release payment.
  otp?: string;
  // Who accepted, as returned by tasks.get (not a column on the tasks table).
  runner?: TaskRunner;
  // Who posted it, sent to the runner once they accept (not a column).
  poster?: TaskPoster;
  // What the runner takes home after Taskly's fee. Sent ONLY to runners
  // (feed, job); posters never see it.
  payout?: number;
  // When the current runner accepted (drop rules count from here).
  accepted_at?: string;
  // The runner's one-tap progress updates, oldest first (task_updates rows).
  updates?: TaskUpdate[];
  // When the poster's payment was confirmed (escrow). Used for payment history.
  paid_at?: string;
  // If no runner accepts by this time, the task is taken down and refunded.
  // Set when payment succeeds (paid time + the poster's chosen accept window).
  accept_by?: string;
  location_start?: string;
  location_end?: string;
  created_at: string;
  updated_at: string;
}

// The little the runner sees about the poster, once they accept.
export interface TaskPoster {
  id: string;
  first_name: string;
  avatar_url?: string;
}

// One tap from the runner while working, e.g. "On my way". `kind` is an id
// from the app's list (frontend src/constants/progressUpdates.ts).
export interface TaskUpdate {
  id: string;
  task_id: string;
  kind: string;
  created_at: string;
}

// Someone asking to become a runner. Signed-in posters send their user id so
// they can be given priority.
export interface RunnerWaitlistEntry {
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  department_level: string;
  categories: string[];
  created_at: string;
}

// The little the poster sees about the runner who accepted their task.
export interface TaskRunner {
  id: string;
  first_name: string;
  avatar_url?: string;
  // Optional extras for the runner profile; shown only when the backend sends them.
  badges?: BadgeId[];
  on_time_rate?: number; // 0–1
  member_since?: string; // ISO date
  categories?: string[]; // category ids they take
  // Average of their reviews; null for a new runner with none yet.
  rating: number | null;
  completed_count: number;
}

// A poster's rating of the runner after a task is done (one per task).
export interface Review {
  id: string;
  task_id: string;
  rater_id: string;
  ratee_id: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  comment?: string;
  created_at: string;
}

export type ReportReason =
  | 'no-show'
  | 'not-done-properly'
  | 'damaged-or-missing'
  | 'asked-for-money'
  | 'rude-or-unsafe'
  | 'other';

// A problem a poster reports. While money is held it opens a dispute
// (payment paused); after completion it's a report for Taskly to review.
export interface Report {
  id: string;
  task_id: string;
  reporter_id: string;
  reason: ReportReason;
  details: string;
  photos: string[];
  // Disputes only: what the poster wants.
  wants?: 'full-refund' | 'part-refund' | 'just-reporting';
  is_dispute: boolean;
  created_at: string;
}

// Something that happened to one of the user's tasks, shown in the in-app
// notifications list (and sent as a push if their settings allow).
export type NotificationKind =
  | 'task-live'
  | 'runner-accepted'
  | 'task-started'
  | 'task-done'
  | 'task-refunded'
  | 'new-message';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  task_id: string;
  created_at: string;
}

// One chat message. There's one chat per task, so messages belong to a task.
export interface Message {
  id: string;
  task_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  task_id: string;
  amount: number;
  status: 'pending' | 'escrow' | 'released' | 'refunded';
  created_at: string;
}
