# CLAUDE.md

Claude Code reads this file automatically at the start of every session.

## First, read the project overview
Read `PROJECT_OVERVIEW.md` in the repo root before doing anything. It holds the product
decisions (categories, pricing, payments, modes, gamification, design system) and the
conventions. If code and the overview disagree, tell the user instead of guessing.

## Who you are working with
Seun is the frontend developer (React Native + Expo, TypeScript). A different teammate owns
the backend, so do not build backend logic. Mock data and TODO comments pointing at
`@errand/api` are fine.

## Rules
- Follow section 12 (Conventions) of `PROJECT_OVERVIEW.md`.
- Import theme tokens from `src/theme`, never hardcode colors.
- Categories live only in `src/constants/categories.ts`; suggested prices only in
  `src/constants/priceSuggestions.ts`. Do not duplicate them in screens.
- Use "task", not "errand", in any user-facing text.
- Keep the code clean and well organized: small files, one job each, short comments
  explaining why, not what.

## Keeping the overview current
When the user tells you a product decision changed (a category, price, rule), update
`PROJECT_OVERVIEW.md` in the same change as the code, and say what you changed.

## Recent decisions (newest first)
- Expo SDK 58 (2026-11-26): upgraded from 54 because Expo Go on both the App Store and Google Play is now 58.
  Needs Node.js 22.13+. Use `expo install` for versions; start the app from the repo root with `pnpm start` / `pnpm web`.
- Runner app (2026-10-26): four tabs (Find tasks · My jobs · Ranks · Profile); earnings card on runner
  home (no Earnings tab). Runners see "You earn ₦X" (+ fee on preview); posters never do. First accept shows
  the rules once, then one tap. Max 2 tasks at once. Drop free within 5 min, then counts; 3 → review. Taken
  task says "This task is taken". No invite codes: Seun adds the first 15 by hand; everyone else (posters
  first) joins the waitlist via RunnerSignupScreen. Poster home shows tasks done, never money.
- Live task nobody accepted: "Not accepted yet?" on Task detail → Raise price (pay only the difference,
  only upward) or Give it more time (windows that fit the deadline). Notifications inbox behind a bell on
  home. Payment history rows open a Receipt with Share. A runner with no reviews shows "New", never a rating.
- Launch: runners are hand-added (Seun signs up the first 15 in person = runner Pioneers, no invite
  codes; others join a waitlist, opened in batches when tasks wait >30 min). Posters sign up openly. Verification is a
  free email code for everyone (no SMS yet, no automatic matric check; runners vetted by a person).
  Poster sign-up: name, email, phone, hostel, password → verify email → photo. Posters can rate
  runners (one per task, within 7 days) and report problems (dispute while money is held, review
  within 48 h after done).
- Profile settings (overview §7): Edit profile, Change password, Payment history, Notifications,
  Privacy & safety, Preferences, Invite friends, Help & support, About, Delete account. Support
  contact, Terms, Privacy policy and invite link live in `src/constants/supportInfo.ts` and show
  "Coming soon" while null (never fake values).
- Profile photo is required for posters and runners (camera or gallery, square, can be changed
  but not removed). Required step after sign-up; use the `Avatar` component wherever a person shows, and
  `ProfilePhotoButton` for the signed-in user's own photo (home top left, Profile).
- Ranks: Top Posters (composite: completed + runner rating + pay-on-time + dispute-free; never
  spend) and Top Runners, each for week / month / year / all time. Pioneer badge = first 15 posters with a completed
  task + first 15 verified runners. Levels and badges per overview §9. Real data only: no sample
  people or numbers anywhere; empty states until the backend fills them.
- Checkout: summary + total + Pay only (no method picker). Pay opens Paystack's own page in the
  in-app browser (expo-web-browser; works on phones and web), which handles card / transfer / USSD,
  then returns to taskly://payment-complete → "Checking…" → paid / waiting for transfer. Never
  collect card details in Taskly; don't use react-native-paystack-webview (breaks on web). Total
  shows only the task price. Dev builds use a mock Paystack sheet.
- Live tracking: a poster's own tasks + chats update live (Supabase Realtime) with push
  notifications and a refresh on app return; runner feed stays on 15–30 s polling. No GPS in MVP.
  Runner one-tap progress updates are designed (overview §5) and come with the runner app.
- Chat: one thread per task, opens when a runner accepts. Phone numbers allowed, with a safety
  banner. Read-only once done or refunded (disputed stays open). Quick replies: Where are you? /
  I'm at the meeting spot / Running a bit late / Thank you!
- Handover code: only the poster sees it, on Task detail and as a button pinned in the chat, once
  the runner taps Start (in-progress),
  behind tap-to-reveal. Task records are never auto-deleted (backend is the source of truth);
  uploaded files are deleted 30 days after completion. Tasks tab has Active / Completed tabs
  (disputed tasks stay in Active).
- Laundry's ₦500/item includes detergent and ironing; the runner supplies detergent as part of
  the job (like printing includes printing cost). Don't ask posters to provide it.
- Poster pays the full price BEFORE a task goes live (escrow) and picks an accept deadline
  (max 72 hours; only options that fit the "when do you need it done" answer are shown);
  nobody accepts in time → taken down and refunded. First verified runner to
  accept gets the task (no applicant list). Runner is paid on OTP at handover. Taskly's 5%
  (min ₦50) comes from the runner's payout and covers Paystack fees (provisional; margin
  warning in overview §5). Never show posters how Taskly earns (no fee lines in the app).
- Tech and repairs is NOT in the launch list. Show it as a disabled "Coming soon" card until
  there are enough verified runners who can handle repairs.
- Launch categories: Printing, Laundry, Academic, Household tasks, Other.
- Each category's minimum price is enforced (can't continue to payment below it): Printing ₦500,
  Laundry ₦500 per item, Note writing / Assignment typing ₦250 per page handwritten or ₦150 typed
  (min 4 pages), Tutoring ₦1,500 per hour, Other academic help ₦1,500, Household ₦1,500, Other
  ₦500. Handwritten tasks ask "I'll provide the notebook and pen"; unticked, ₦500 is added to the
  minimum price automatically. Defined once in `src/constants/priceSuggestions.ts`.
- Food, queueing and shopping are out at launch (runner would spend own money).


# Development Rules

**Rule 1: Always read first**
Before taking any action, always read:
- `CLAUDE.md`
- `PROJECT_OVERVIEW.md`

If either file doesn't exist, tell me and create it before doing anything else.
 Make sure each code is placed in its own file and is labelled accordingly, i want a very organised codebase that woud be easy to read by other devs, so PLEASE fufill this requirement.

**Rule 2: Challenge the direction**
Think critically about the direction we're heading. If you think this isn't the fastest or simplest path to a working app, suggest a better alternative. Don't just execute. Push back when there's a faster, smarter, or more effective way to get where I'm trying to go. Check any suggestion against `PROJECT_OVERVIEW.md` first so you don't reopen a decision that is already settled.

**Rule 3: Quality gate**
Don't call a feature done until it passes this check:
- Matches the design system (theme tokens only, no hardcoded colors or font sizes).
- Follows the folder structure and conventions in `PROJECT_OVERVIEW.md`.
- Handles empty, loading and error states.
- Contains no duplicated logic or leftover placeholder code, unless it's marked with a TODO that names the `@errand/api` call it replaces.
- Uses "task", never "errand", in anything the user sees.
Rate the work honestly out of 10. If it's below 9, say what's wrong and fix it before reporting back.

**Rule 4: Test before you respond**
After making any code changes, run the type check (`tsc`), the relevant tests, or start the dev server to check for errors before responding. Never say "done" if the code is untested. If you can't run something, say so plainly.

**Rule 5: Keep context small**
Always find ways to reduce the context and the number of files. If something can work the same with less code or fewer files, optimize it and tell me. Flag any file that is redundant or unnecessary and ask before deleting it. Keep things as simple as possible.

**Rule 6: Keep the docs in sync**
When a product decision changes (a category, price, rule or flow), update `PROJECT_OVERVIEW.md` in the same change as the code, and tell me what you changed. At the end of each task, add one specific suggestion for improving the app or the workflow (a gap, a missing state, a quick win) under "Suggestions" in `PROJECT_OVERVIEW.md`. Keep each suggestion to one line.