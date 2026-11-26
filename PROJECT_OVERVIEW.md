# Project Overview

> Read this first. It explains what we are building, why, what has been decided,
> what is built, and what is still open. For hard engineering rules see `CLAUDE.md`.
> For the database design see `docs/architecture/schema.md`.
> **Backend teammate:** start with §16 (Backend handoff): the data the app sends, the API calls it
> expects, what's mocked, and the questions waiting on you. It's updated with every frontend change.

## 1. What this is

A **campus task marketplace for Nigerian students**, launching at **Yaba Tech (Lagos)** first.

- A student (the **poster**) posts a task they need done and sets a fixed price.
- Other verified students (the **runners**) accept it and earn money. The first verified runner to accept gets it.
- The poster picks one runner. Payment is held in **escrow** and released when the task is done.

Examples of tasks: printing and binding assignments, assignment/note writing and typing,
laundry, household tasks (cleaning, fetching water). Phone and laptop repairs come later.

**Goal:** become the trusted way for students to get small jobs done and earn on campus,
replacing WhatsApp-group requests where people get scammed (paid but nothing delivered,
or work done but never paid). Expand to other campuses only after one campus works.

**Naming:** use the word **task** (not "errand") everywhere in UI and code copy.
The app is named **Taskly** (CAC/trademark check still pending). "Errandly" is already taken by
two live Nigerian apps, so do not use it. Older mockups used "Hustle" as a placeholder.
The repo/package names (`errand-app`, `@errand/*`) are legacy and can stay.

## 2. Team and ownership

- **Seun** is the product decision-maker and works **only on the frontend** (mobile + web + admin UI).
- A **separate teammate owns the backend** (Supabase, payments, API).
- `@errand/types` (in `frontend/packages/types`) is the **shared contract** between frontend
  and backend. When a feature needs a new data shape, define it there first, and record it in §16.
- **Every frontend change is documented in this file** (§16 for anything the backend needs), in the
  same change as the code.
- Frontend must never be the only thing enforcing a rule involving money or permissions.
  The backend enforces; the frontend only reflects.

## 3. Positioning and competitors

Existing apps: DexTask (FUTA, mobility + gigs), NaijaCampusRunz (5% fee, escrow, student ID
verification, many schools claimed), CampusRun (Nile University, handover confirmation code),
UniMart (prototype), TaskAlley (Nigeria-wide, bidding, already has one-account-two-roles,
escrow, chat). Globally: TaskRabbit, Airtasker, Thumbtack.

Escrow, verification and in-app chat are **table stakes now**, not differentiators. Ours are:

1. **Single-campus focus** with real student verification (own one campus before spreading).
2. **Fixed price set by the poster** (no open bidding or haggling).
3. **Light gamification**: leaderboards, streaks, levels, badges (see section 9).

Biggest risk is **cold start** (runners open the app and see no tasks). Prefer decisions that
help supply and demand show up together on one campus.

## 4. Core product decisions (settled)

| Topic | Decision |
|---|---|
| Who gets the task | **First verified runner to accept** gets it. No applicant list. The poster sees who it is (rating, completed count) in the chat header and can **release them** if they don't reply within ~15 min; the task goes back to the feed. Only one runner can win: the backend must lock the task on accept. (Decided 2026-10-18; replaced "poster picks from applicants".) |
| Paying | The poster **pays the full price before the task goes live** (held in escrow). Runners only ever see paid tasks, so they never chase anyone for money. (Decided 2026-10-19.) |
| Accept deadline | The poster chooses how long the task stays live waiting for a runner: 30 min, 1, 3, 6, 12, 24, 48 or **72 h (the maximum)**. Nobody accepts by then → taken down and **fully refunded**. The choices **only show times that fit the "When do you need it done?" answer**: "Within 3 hours" → 30 min or 1 h; "Today" → up to 6 h; "Tomorrow" → up to 24 h; "This week" → up to 72 h. Changing the deadline clears a pick that no longer fits. |
| Pricing | The **poster sets a fixed price** per task. No negotiation, no runner bidding. |
| Price floor | **Each category has an enforced minimum** (decided 2026-10-19): Printing ₦500, Laundry ₦500 **per item** (so 8 items → ₦4,000), Academic: **note writing and assignment typing ₦250/page handwritten or ₦150/page typed, at least 4 pages, + ₦500 if handwritten and the poster isn't providing the notebook and pen**; **tutoring ₦1,500/hour**; other academic help ₦1,500. Household ₦1,500 (every subsection), Other ₦500. Below it, the poster **can't continue to payment**. ₦500 stays the platform-wide floor. |
| Price guidance | The hint under the price field shows the category minimum ("From ₦1,500, more for more pages and effort"; laundry: "From ₦4,000 (8 items × ₦500)"). Minimums, hints and home-card tags all come from one table in `src/constants/priceSuggestions.ts`; tune it later from real completed tasks. |
| Accounts | **One account, two modes** (poster and runner). Switch from the Profile tab. |
| Runner access | Runner mode only unlocks once the **Taskly team adds you as a runner** (no invite codes, decided 2026-10-26): at launch Seun meets and signs up the first 15 in person; later (strangers from the waitlist) matric number, department/level, **student ID photo + selfie holding it, checked by a person**, profile photo, bank account for payouts, categories they'll take. |
| Profile photo | **Required for posters and runners** (decided 2026-10-22): they meet in person, so both should be recognisable. Taken with the camera or chosen from the gallery, cropped square. It can be changed but not removed. |
| Poster signup | Light: name, **email** (any email; most students don't use a school email), phone (for contact, not verified yet), hostel/area, password → **verify email** (6-digit code) → required profile photo. No matric number for posters. |
| Verification at launch (decided 2026-10-22) | **Email code for everyone** (free; SMS costs ~₦4–₦6 per text and there's no budget yet). **Matric numbers can't be checked automatically** (no access to Yaba Tech's records, never scrape the portal), so runners are **vetted by a person**. SMS for runners comes later when there are funds. |
| Launch plan (decided 2026-10-22) | **Runners are invite-only**: Seun handpicks the first 15 (people he knows), who Seun signs up in person (no invite codes) and become the 15 runner Pioneers. Everyone else, including posters tapping "Become a runner" in Profile (they get **priority**), joins a **waitlist** (also measures runner supply). **Posters are open**: they pay before anything happens, so they can't scam runners, and every turned-away poster is a lost task (cold start, §3). Open the waitlist **in batches (~10)** when tasks often wait >30 min to be accepted or the 15 can't keep up; hold while runners are idle. |
| Trust | Poster trust and runner trust are **separate** (own level, rating, completion count). Levels: `new → verified → trusted`. |
| Chat | **One chat thread per task**, opened the moment a runner accepts. Chat icon top-right on home opens a **list of threads**. Quick-reply chips plus free text. **Phone numbers are allowed** (calls help at handover), with a safety banner instead. **Read-only once the task is done or refunded** (kept for records); a disputed task's chat stays open. (Decided 2026-10-20.) |
| Maps | **No map in MVP.** Pickup/drop-off use a dropdown of named campus locations. |
| Live updates | **Runner feed:** polling every 15 to 30 s (many tasks, simpler). **A poster's own tasks and chats: live from day one** via Supabase Realtime, plus **push notifications** at key moments and a refresh when the app comes back to the foreground (decided 2026-10-20; see §5 "Live tracking"). No GPS/map tracking in MVP. |
| Paywall | **None.** App is free to download, post and accept tasks. Revenue is a take rate on completed tasks. |

## 5. Task lifecycle and payments

Statuses (in `@errand/types`):
`pending-payment → posted → accepted → in-progress → completed | closed | disputed`.
(`pending-payment` = created but unpaid, invisible to runners. `closed` also covers "nobody accepted
in time, refunded".)

Flow:
1. Poster picks a category, answers its questions, sets the price and the **accept deadline**.
2. Poster taps **Pay** on the **Checkout** screen and pays on **Paystack's page** (card, bank transfer or USSD, through
   Paystack's secure page; Taskly never takes card details) → money held in **escrow**. Until paid,
   the task is `pending-payment` ("Awaiting payment") and runners can't see it.
3. Paid → the task goes **live** (`posted`) with `accept_by` = paid time + the chosen window.
4. Verified runners see it in their feed. The **first to tap Accept gets it** → `accepted`, chat opens.
5. If the runner doesn't reply in chat within ~15 min, the poster can **release** them (no penalty for
   the poster); the task goes back to `posted`.
6. Nobody accepts by `accept_by`, or the poster cancels before anyone accepts → taken down (`closed`)
   and **fully refunded**. While it is live, Task detail offers **"Not accepted yet?"** (decided 2026-10-22):
   **Raise price** (the poster pays only the difference through Paystack; runners see the new price) or
   **Give it more time** (new `accept_by` = now + a window that still fits the deadline and ends later
   than the current one). Prices can only go up, and only while `posted`.
7. Poster and runner coordinate in the task chat. The runner can also tap one-tap **progress updates**
   ("On my way", "Printing now"…) that show live on the poster's timeline and in the chat (planned, see
   "Live tracking").
8. Completion is confirmed by a **one-time code (OTP)**: the poster has it, the runner enters it
   at handover. Correct code → money released to the runner **straight away**. (Not at accept:
   otherwise a runner could get paid and vanish.)
   **The handover code (decided 2026-10-20):** the backend creates it when a runner accepts and stores
   it hashed. Only the **poster's** app ever gets it, on Task detail **and as a "Show handover code" button
   pinned in the chat** (handover usually happens mid-chat), and only once the runner taps
   **Start task** (status `in-progress`), behind "Tap to show". Not at accept (a dodgy runner could ask
   for it before doing anything); not only after "done" (a runner with no data at the door would leave
   the poster unable to hand over). The runner types it in; **5 wrong tries lock it** and the task goes
   to dispute.
9. Safety net: **auto-release after a timeout** (24 to 48 h) if the poster goes silent, so runners
   are not left unpaid. Disputes go to manual review.

**Fee (provisional, 2026-10-19; can still change before launch):** Taskly takes **5% (minimum ₦50) from
the runner's payout** on release. The poster pays exactly the task price, nothing extra. **Taskly's 5%
covers Paystack's fees.** The app never shows posters how Taskly earns: no fee lines on the payment
screen. The fee lives only in the backend's payout logic, so changing it needs no app update.
⚠️ See "Unit economics" below: at 5%, tasks between ₦2,500 and about ₦3,150 lose money.

### Runner rules (decided 2026-10-26)

- **Take-home shown:** runners see "You earn ₦X" (price − Taskly's fee) on every card, plus "Task ₦Y · Taskly fee
  ₦Z" on the preview. Posters still never see the fee.
- **Accepting:** the first accept ever shows the rules sheet ("Take this task?": commitment, drop rules, 2-task
  limit, never ask for the code early) → Yes, accept. After that, Accept is one tap.
- **Limit:** at most **2 tasks at the same time**; finish one to take another.
- **Dropping:** only before starting. Free within **5 minutes** of accepting; after that each drop counts, and
  **3 counted drops → the runner account is reviewed**. A dropped task goes back to the feed.
- **Doing it:** one big next-step button: **I'm on my way → Start task → Enter handover code**. Start makes the
  task `in-progress` (the poster's code appears for them). **5 wrong codes** lock the task → `disputed`.
- A task someone else accepted shows **"This task is taken"** (never "someone got there first").

### Keeping tasks (retention, decided 2026-10-20)

- **Task records are never auto-deleted.** Disputes, payment reconciliation, ratings, completion counts,
  "total spent", leaderboards, "post again" and tuning price minimums all depend on them. They live in
  the **backend database** (the source of truth); the phone only keeps a copy.
- **Uploaded files** (assignment PDFs, photos) are deleted **30 days after completion** (private, costly
  to store; the Nigeria Data Protection Act favours keeping only what's needed).
- **Chat messages:** kept for disputes, then deleted after a set period (backend decides, e.g. 6 months).
- In the app, finished tasks move to the **Completed** tab of the Tasks screen. Later: let posters *hide* a
  task from their list without deleting the record.

### Live tracking (how it works, decided 2026-10-20)

The poster watches their task move (Accepted → In progress → Done, plus chat and progress updates)
without refreshing. Three layers, each for a different moment:

1. **Supabase Realtime (app open):** the poster's app keeps a websocket open and subscribes to *their own*
   task rows and their chats' messages (and progress updates). When the backend changes a row, the app
   gets it within about a second and the timeline / chat / badge update by themselves.
2. **Push notifications (app closed):** Expo Notifications + FCM. The backend sends one on: runner
   accepted, runner started, new chat message, progress update, task done, task taken down + refunded.
3. **Refresh on return:** when the app comes back to the foreground it reloads the poster's tasks once,
   catching anything missed while the phone slept the connection.

In the app only `TasksContext` and `ChatContext` change when this lands (load from the API, then
subscribe); every screen already reads from them.

**Runner progress updates (designed, not built):** one-tap updates the runner sends while working, so
posters feel "tracked" without GPS. Shared ones: *On my way*, *At the meeting spot*, *Running late*.
Per category: printing *Printing now*, *Binding*; laundry *Washing*, *Drying*, *Ironing*; notes /
assignment *Writing now* / *Typing now*; tutoring *Session started*; cleaning *Cleaning now*; water
*Fetching now*. Each shows as the note under the current timeline step ("On my way · 2:40 PM") and as a
small grey line in the chat (not a chat bubble). Needs the runner app, so it's built with the runner side.

### Unit economics (estimate, 2026-10-19)

Paystack Nigeria (verify on paystack.com before launch): local payments **1.5% + ₦100**, the ₦100
waived under ₦2,500, capped at ₦2,000; transfers out about **₦10** for payouts up to ₦5,000.
Refunds probably don't return Paystack's fee, so every expired/cancelled task costs us that fee.

What Taskly keeps per completed task at **5%** (fee − Paystack in − payout transfer):

| Task price | Taskly fee | Paystack in | Payout | **Kept** |
|---|---|---|---|---|
| ₦500 | ₦50 (min) | ₦7.50 | ₦10 | **₦32.50** |
| ₦1,000 | ₦50 (min) | ₦15 | ₦10 | **₦25** |
| ₦2,000 | ₦100 | ₦30 | ₦10 | **₦60** |
| ₦2,500 | ₦125 | ₦137.50 | ₦10 | **−₦22.50** |
| ₦3,000 | ₦150 | ₦145 | ₦10 | **−₦5** |
| ₦4,000 | ₦200 | ₦160 | ₦10 | **₦30** |
| ₦5,000 | ₦250 | ₦175 | ₦10 | **₦65** |

With a realistic launch mix (printing 35% at ~₦1,000, laundry 25% at ~₦4,000, academic 15% at
~₦2,500, household 15% at ~₦2,000, other 10% at ~₦1,000; average task ≈ ₦2,125) Taskly keeps
**≈ ₦24 per task** at 5%, about ₦15 after refund losses. At **7%** it's **≈ ₦67** (≈ ₦58 after refunds).

Yearly, one campus, ~240 active days:

| Scenario | Completed tasks / year | Money moved (GMV) | Kept at 5% | Kept at 7% |
|---|---|---|---|---|
| Pilot (10 a day) | 2,400 | ≈ ₦5.1M | ≈ ₦36k–59k | ≈ ₦140k |
| Traction (60 a day) | 14,400 | ≈ ₦30.6M | ≈ ₦216k–351k | ≈ ₦835k |
| Strong (250 a day) | 60,000 | ≈ ₦127.5M | ≈ ₦0.9M–1.5M | ≈ ₦3.5M |

Running costs are roughly **₦0.7M–1M a year** (Supabase Pro ~$25/month, Apple $99/year, Google $25
once, SMS for sign-in). So **one campus at 5% does not cover costs** except near the "strong" case.
Options are in §14.

Proposed, not yet confirmed (discuss with backend before building):
- **Tasks that need a purchase** (post-launch only; excluded at launch, see section 6): split price into **item cost** and
  **service fee**. Item cost is released to the runner up front so cash-poor students can take
  the task; service fee stays in escrow. Gate this behind trust level and cap the amount by tier.
  Require a receipt photo, auto-flag tasks with no progress after about 2 hours.
- Paystack or Flutterwave handle pay-in and transfers. "Escrow" is a status we manage
  (`pending → escrow → released | refunded`), not a feature of the processor.

## 6. Categories

Five categories at launch (IDs used in code, defined once in `src/constants/categories.ts`):

| ID | Label | Subsections | **Minimum price (enforced)** and hint |
|---|---|---|---|
| `printing` | Printing | none | **₦500**. "From ₦500, more for more pages" |
| `laundry` | Laundry | none | **₦500 × items**. "₦500 per item", then "From ₦4,000 (8 items × ₦500)" (detergent and ironing are included in the price; the hint doesn't say so) |
| `academic` | Academic | Note writing, Assignment typing, Tutoring, Other academic help | Notes & assignment: **₦250/page handwritten, ₦150/page typed, min 4 pages** ("From ₦2,500 (10 pages × ₦250)"). Tutoring: **₦1,500/hour**. Other academic help: **₦1,500**. Home card: "From ₦600" |
| `household` | Household tasks | Cleaning, Fetching water, Other household task | **₦1,500**. "From ₦1,500, more for bigger tasks" |
| `other` | Other | none | **₦500**. "From ₦500, more for more effort" |

Hints live in `src/constants/priceSuggestions.ts`.

**Coming later: `tech` (Tech and repairs, phone/laptop fixes).** Decided to hold it back because the
runner handles someone's expensive device. Show it as a disabled "Coming soon" card on the poster
home (tap count = demand signal). Open it only once enough verified runners say they can do repairs;
ask "Can you fix phones or laptops?" during runner sign-up to build that list. Proposed rules when it
launches: labour only (poster supplies parts), done in person on campus, verified/trusted runners only,
before/after photos, extra fields (device type, issue, who supplies parts). Draft price hint: ₦1,000 – ₦5,000+.

These minimums are **enforced**: the poster can't pay for a task priced below its category minimum. They're
still starting guesses (the survey didn't ask about prices), so revisit them once real tasks exist (§14).

**Out of scope at launch:** food and groceries, queueing, and shopping/errands. These need the runner
to spend their own money, which was judged too risky for now. Tasks under Other must not require the
runner to pay for items up front. Printing price includes the printing cost, and **laundry's ₦500/item
includes detergent** (decided 2026-10-19), so the runner never fronts money: those supplies are part
of the job they're paid for.
Cleaning asks Light / Normal / Heavy; other categories don't have an effort picker.

### Category questions (settled)

Tapping a category opens its questions so the poster is clear about what they want. Categories with
subsections (Academic, Household) first ask which kind, on `ChooseSubcategoryScreen`. To the user each
one feels like its own screen; in code it is **one screen** (`screens/poster/PostTaskScreen.tsx`) reading
the questions from config (`src/constants/categoryQuestions.ts`). No separate screens per category.

Every set ends with: **where** (text for now; campus-location dropdown later), **when** (Within 3 hours /
Today / Tomorrow / This week), **extra info** (optional), then **price**. The task title is built from the
answers (e.g. "Print & bind · 20 pages"), so the poster never types one.

| Set | Questions |
|---|---|
| Printing | service (print / print & bind / photocopy / scan / laminate), document upload, pages, copies, B&W or colour, paper size (A4/A3) |
| Laundry | service (wash & iron / iron only / wash only), number of items (price hint shows items × ₦500), item types, heavy items?, pickup spot |
| Note writing | course code, what to write, handwritten or typed, pages (min 4; priced per page), "I'll provide the notebook and pen" (handwritten only, optional; **unticked adds ₦500 to the minimum price automatically**, so it can't go to payment without covering the materials), source upload |
| Assignment typing | course code, paste work or describe it, upload work, handwritten or typed, pages (min 4; priced per page), notebook-and-pen tick box (same as notes). Notice: runners type or handwrite work the student already did; they **don't write or answer assignments** (keeps us safe with the school) |
| Tutoring | course/subject, topic, hours (priced per hour), in person or online, level (ND1–HND2). "Where" only asked if in person |
| Cleaning | areas (multi), rooms, "I'll provide the supplies" (must tick), Light/Normal/Heavy |
| Fetching water | containers, size (bucket / 25L keg), water source, floor, "I'll provide the containers" (must tick) |
| Other | description, "Will the runner need to buy anything?" (**Yes blocks posting**), duration, photo |
| Other academic help | course code, what help is needed, buy anything? (Yes blocks), duration. Notice: runners won't write or answer graded work |
| Other household task | what task, buy anything? (Yes blocks), duration, "I'll provide anything needed" (must tick) |

Every category with subsections ends its list with an "Other" option, so nothing falls through the gaps.

File uploads show "coming soon" until the backend has storage. Answers are stored on the task as a
flexible `extra_fields` JSON value. Printing tasks will need a **PDF attachment** (Supabase Storage,
private; visible only to the runner who accepts, not to everyone browsing the feed).

Add new categories by editing config, not by building new screens.

## 7. Design system

- Palette: navy `#0B1E3F` as the brand color, white backgrounds, light-blue tint `#E6F1FB` with
  `#0C447C` text for badges and icon chips, warning orange `#D85A30`.
- Navy is an **accent**, not a big fill. Header is slim; the main CTA card overlaps the
  navy/white edge (negative margin) so it does not read as a solid slab.
- **Never hardcode hex values or font sizes.** Import from `src/theme/colors.ts` and `typography.ts`
  (icon sizes too: `iconSizes`).
- **Icons:** Ionicons via `@expo/vector-icons`, always through `src/components/Icon.tsx` (one place to
  swap the set). No emoji as icons. Icons sit in round light-blue badges (`accentLight` + `accentText`).
- **Back button:** a round light-blue badge with a navy arrow, on every pushed screen. Starting and tab
  screens have none (nothing to go back to).
- **Tab bar:** every tab has an icon, filled when active and outline when not.
- Poster home: navy header with rounded bottom corners (**your profile photo top left**, plain and
  minimal, no badge or ring: tap → Take a photo / Choose from gallery / View profile; then the time-of-day greeting; **notifications bell** and chat button, each with an orange unread
  badge, "99+" above 99), the "What do you want done?" card overlapping the header edge with a soft shadow,
  a 2-column category grid (icon, label, short price line like "From ₦500"), then "Active tasks" with
  "See all" and task cards (icon, title, category · price, one status pill).
- **Task detail** (poster): category + title + big price; a card with the **step timeline**
  (Paid → Live → Accepted → In progress → Done; a cancelled/refunded or disputed task shows where it
  stopped) and one plain sentence on what happens next; **"Not accepted yet?"** card while live (Raise price · Give it more time; the second only when a
  longer window still fits the deadline); **runner card** (photo, first name, ★ rating or **"New"** for a
  runner with no ratings yet, tasks done, Verified) once accepted; **handover code** (tap to reveal) once in progress; "Task details"
  (the poster's answers); and a **pinned bottom bar** with the action for that status: Pay ₦X, Cancel
  and refund (live), Chat with {runner} + "not replying? Release them" (accepted), Chat (in progress),
  Post again (done/closed). Cancel and Release need a second tap to confirm.
- **Profile & settings** (decided 2026-10-22, modelled on Uber, Bolt, TaskRabbit, Airtasker, Glovo, Chowdeck,
  OPay, Jumia): photo, name, stats, level, badges, then grouped rows (icon, label, ›), each opening its own
  screen with a back button:
  - **Account:** Edit profile (name, phone, school email/matric, hostel; phone/email changes will need a
    code later) · Change password.
  - **Payments** (poster): Payment history: every paid task newest first with Held safely / Paid to
    runner / Refunded / Under review, plus "Paid to runners" and "Refunded" totals. Real data only. Dates show in full ("22 Oct 2026, 3:40 PM").
    Tap a payment → **Receipt**: amount, status, task, category, paid on, where the money is now (held / paid
    to {runner} / refunded / under review), reference (the task id until Paystack's reference arrives) and
    **Share receipt** (phone share sheet). Only what the poster paid; never Taskly's cut.
  - **Settings:** Notifications (on/off: runner accepted, task started, new messages, task done, refunds,
    tips & news) · Privacy & safety (leaderboard switch + "How Taskly keeps you safe" tips) · Preferences
    (default meeting spot that pre-fills "Where?", vibration on tap).
  - **More:** Invite friends (phone share sheet) · Help & support (FAQ + WhatsApp / email) · About (app
    name and version from app.json, Terms, Privacy policy).
  - Switch mode · Log out · **Delete account** (type DELETE; blocked while a paid task is still active so
    money is released or refunded first; wipes everything on the device).
  - **Support contact, Terms, Privacy policy and the invite link show "Coming soon"** until set in
    `src/constants/supportInfo.ts` (one value each). **Terms + Privacy policy are required before the app
    stores will publish Taskly.**
  - Not now: saved cards (Paystack), dark mode, language, blocked users, 2FA, payout account (runner side).
- **Rate your runner** (opens once when a task becomes done; otherwise a "How was {runner}?" card on Task detail
  for 7 days): runner photo, 5 tappable stars (required), tags that match the stars (good: On time · Friendly ·
  Great quality · Good communication; 1–2★: Late · Poor quality · Didn't reply · Rude), optional comment (300),
  Submit / Rate later. 1–2★ also offers "Had a real problem? Report it". One rating per task, final.
- **Report a problem** (Task detail link and ⚑ in the chat header): step 1 the reason (6 options; "rude or unsafe"
  shows a safety note: go somewhere busy, campus security, call 112), step 2 details (required), up to 3 photos,
  and for disputes "What would you like?" (Full refund · Part refund · Just letting you know). Then "Report sent".
- **Runner profile** (tap the runner card): photo, name, Verified, badges, ★ rating, tasks done (+ on-time % and
  member since when the backend sends them), level, categories, reviews, "Report this runner". Only real data.
- **Tasks tab:** **Active / Completed** tabs (Active = awaiting payment, live, accepted, in progress,
  disputed, since a dispute still needs the poster; Completed = done, or closed and refunded), each
  with its own empty state.
- **Checkout** (after "Continue to payment"): summary card (icon, title, category · where, "Needed: Today ·
  live for 3 hours"), **Total** = the task price only (no fee lines), safety note (held until the handover
  code, full refund if nobody accepts), pinned **Pay ₦X** with "🔒 Card, bank transfer or USSD · Secured
  by Paystack". **No method picker:** Paystack's page offers card / transfer / USSD itself (decided
  2026-10-22, removed ours so users don't choose twice).
- **Pay → Paystack → back (decided 2026-10-22):** Pay opens **Paystack's own page in the in-app browser**
  (`expo-web-browser`: a sheet over Taskly on phones, a popup on web). The user pays there; Paystack
  returns them to `taskly://payment-complete` and the sheet closes. Then Checkout shows **"Checking your
  payment…"** while the backend confirms → **"Paid and live"**. Bank transfers that haven't landed show
  **"Waiting for your transfer"** (task stays Awaiting payment; they're notified when it's live). Failed →
  "Payment didn't go through. You haven't been charged."; closed → "Payment cancelled. Your task is saved
  under Awaiting payment." Dev builds open a mock Paystack sheet (succeed / transfer pending / fail / close).
  On web, Paystack's popup returns to the website's **`/payment-complete`** page, which loads the app and
  closes the popup (`WebBrowser.maybeCompleteAuthSession()` in `App.tsx`), so the website must serve the app
  at that path.
  **Why not `react-native-paystack-webview`:** it doesn't work on web (our app code also ships as the
  website), embedded web views break some bank 3-D Secure / USSD redirects, it hides paystack.com's
  address (less trust), and it starts payments from the app with a Paystack key. Don't switch to it.
- **Chat list** (home chat icon): one row per task with a runner: initial avatar, runner name, task title,
  last message, time, orange unread count; newest activity first. Empty: "Chats open when a runner
  accepts one of your tasks."
- **Chat thread:** tappable header (runner initial, name, ★ rating, task title → opens Task detail); safety
  banner ("Keep payment in Taskly. Don't give your handover code until your task is completed."); my messages
  navy on the right, theirs light blue on the left, with times; quick replies (Where are you? · I'm at
  the meeting spot · Running a bit late · Thank you!, edit in `src/constants/quickReplies.ts`); text box
  with a round send button. While the task is **in progress**, a **"Show handover code"** button sits
  pinned above the quick replies (tap to show, tap to hide). Done/refunded tasks show "This task is
  done. Chat is read-only."
- The home chat badge shows the real unread count.
- **Notifications inbox** (home bell, decided 2026-10-22): every update about the poster's tasks, newest first
  (icon, title, one line, time; unread ones marked). Kinds: task live · runner accepted · runner started (code
  ready) · task done (rate them) · taken down + refunded · new message. Tapping opens the task, or the chat for
  accepted / new message. Opening the inbox marks all as read. Empty: "Updates about your tasks will show
  here." The same events become push notifications once the backend sends them.
- **Raise price** (from "Not accepted yet?"): current price, quick chips **+₦200 · +₦500 · +₦1,000** (in
  `priceSuggestions.ts`) or type a new total, "You'll pay ₦X more", pinned **Pay ₦X** → Paystack (mock sheet in
  dev) → "Price raised to ₦Y". Failed: "You haven't been charged." Transfer pending: raised once it lands.
- **No sample people in the app** (decided 2026-10-22): the dev simulator's runner is "Test runner" (no rating,
  0 tasks) and its replies are "Test message N from the runner", so nothing fake looks real.
- **Web preview:** the app is shown in a centered phone-width column (max 480px) on wide screens.
- **Tap feedback:** everything tappable uses `PressableScale`: it springs down slightly and bounces back,
  with a light haptic tick on main actions (off for Back and text links; none on web).
- **Home card:** title "What do you need done?" with example requests that fade and rise every 3 s
  (list in `src/constants/taskExamples.ts`).
- **Greeting:** "Good morning" 5am–noon, "Good afternoon" noon–5pm, "Good evening" otherwise, then
  "Hi {first name}". No hardcoded names.
- **Runner app (built 2026-10-26), four tabs: Find tasks · My jobs · Ranks · Profile.**
  - **Find tasks (home):** navy header with photo, greeting and the **earnings card** ("Earned all time ₦X",
    "This week ₦Y · N tasks" → Earnings). Then "Find tasks" + "1 of 2 tasks", category filter chips (the
    runner's categories), task cards: "You earn ₦X" biggest, where · needed, posted time. At 2 tasks a banner says
    "You have 2 tasks on. Finish one to take another." Empty: "No tasks right now".
  - **Task preview:** category, title, "You earn ₦X", "Task ₦Y · Taskly fee ₦Z", **Bring:** (detergent for
    laundry; notebook and pen when a handwritten task's poster didn't provide them), the poster's answers, pinned
    **Accept task**. Gone or taken → "This task is taken".
  - **Job:** title, "You earn", runner timeline (Accepted → On my way → Started → Done) with the latest update
    under it, one-line status, **quick updates** chips (category ones + At the meeting spot · Running late),
    "Posted by {poster}" + Chat, Bring, details, "Can't do it any more? Drop this task" (second tap confirms and
    says whether it counts, e.g. "1 of 3"). Pinned: next-step button + "Chat with {poster}".
  - **Enter handover code:** 4 boxes, "Ask {poster} for their code once you've handed everything over", tries left
    on a wrong code, then **"Payment released: ₦X is on its way to your bank"** or "Task locked for review".
  - **My jobs:** Active / Completed, cards with Accepted / In progress / Under review / Paid.
  - **Earnings** (from the card): All time + This week tiles, then each paid or held job.
  - **Chat** reuses the poster chat: the header shows the poster (tap → job), no handover code, no report yet.
  - **Profile** in runner mode: Tasks done + On now (no money; earnings live on home), runner level and badges.
- **Poster home** shows "N tasks done" under the greeting once there is one; **never money** (spend stays in
  Payment history, decided 2026-10-26).
- The poster's **Task detail** shows the runner's latest one-tap update under the timeline ("On my way · 2:40 PM").
- Gamification styling: effects belong on **numbers and moments** (rank, streak, level-up), not
  on body text, titles, prices or buttons. Do not use game-style fonts. Trust matters because money is involved.

## 8. Onboarding

Flow: Onboarding → "What brings you here?" (I need something done / I want to earn) → sign-up form
for that starting mode → **"Verify your email"** (6-digit code; resend after 60 s; "Wrong email? Change it";
"check your spam folder") → **"Add your photo"** (required, no skip: Take a photo / Choose from gallery,
preview, "Use this photo") → home. Anyone signed in without a photo (e.g. after log-in) sees the same
step first. The choice sets the **starting mode only**; the other mode can
be added later from Profile (runner needs verification). Returning users: Onboarding → Log in
→ home, with Forgot password → Reset password (code + new password) → Log in.

There is **one** auth flow, in `src/screens/auth/`. Poster sign-up asks for full name, email, phone,
hostel/area and password. **Email verification is back** (free code; decided 2026-10-22) and also runs when
the email is changed in Edit profile. Log in uses email or phone + password; Forgot password emails a
code. **Runner sign-up = the waitlist** ("I want to earn" on role select, or "Become a runner" in Profile):
full name, email, phone (prefilled when signed in), department and level, tasks they'd like to do (launch
categories) → "You're on the waitlist" (we email when a spot opens). No invite codes. Dev builds add "DEV:
skip the waitlist and become a runner" so the runner app can be tried.

**Names:** the app uses the **first name** from the sign-up "Full name" (no usernames for now; display
handles come with the Ranks leaderboard, §9). After a mock log-in the name isn't known yet, so home
says "Hi there" until the backend returns the profile.

Auth is **mocked** in `src/context/AuthContext.tsx` (any details sign you in) until the backend's auth
is ready. Profile has a "Log out" link.

### Saved on the device (until the backend exists)

AsyncStorage (`src/storage/storage.ts`, one wrapper, all keys listed there as `taskly:v1:*`) keeps:
- **Session**: signed in + name/phone, so reloads keep you in. Cleared on log out. **Never the password.**
- **Posted tasks** (`src/context/TasksContext.tsx`): "Post task" saves locally; home "Active tasks" and
  the Tasks tab read them. Kept on log out so they're there for testing.
- **Active mode**: reopens in poster/runner mode (only if the account still has access).
- **Settings** (`src/context/SettingsContext.tsx`, key `taskly:v1:settings`): notification choices, default
  meeting spot, vibration. Cleared by Delete account.
- **Chats** (`src/context/ChatContext.tsx`): messages and "last opened" times, for unread counts. Only on
  this device: nobody else receives them until the backend exists.

Data stays on that one device or browser. When the backend lands, TasksContext swaps to `@errand/api`
(screens unchanged) and the real session moves to `expo-secure-store` or the Supabase client's storage,
since AsyncStorage is not encrypted.

## 9. Ranks, levels and badges (decided 2026-10-20)

Light, habit-tracker style, not a full game. **Everything shows real data only:** no sample people or
numbers. Until the backend exists, boards show "No rankings yet" plus the user's own real row.

**Ranks tab** (bottom nav, both modes): **Top Posters | Top Runners**, each for **Week** (resets
Monday), **Month** (resets on the 1st), **Year** (resets 1 January) or **All time** (never resets), so
people keep getting fresh chances to top a board while the all-time record stays. The user's own row
is pinned at the bottom ("2 more tasks to pass #11").
- **Top Posters** rank by a **composite score**: tasks completed (escrow released) + runner rating of the
  poster + pay-on-time speed (how fast they give the code at handover) + dispute-free rate. **Total spent
  is never ranked or shown publicly**: it stays a profile stat (rewards fake tasks, exposes spending).
- **Top Runners** rank by tasks completed, then rating, then on-time rate.
- Scores are worked out **on the backend**; the app only displays rank, completed count, rating, badges.

**Levels** (from completed tasks; thresholds in `src/constants/levels.ts`, starting guesses):
- Posters: Newcomer (0) → Regular (5) → Valued (15) → Campus Legend (40).
- Runners: Rookie (0) → Runner (5) → Pro (20) → Legend (50).
- Profile shows the level with a progress bar ("3 more completed tasks to reach Valued").

**Badges** (awarded by the backend, never removed once earned; list in `src/constants/badges.ts`):
- **Pioneer (posters):** the **first 15 posters whose first task is completed** (escrow released). Counting
  completed tasks, not sign-ups, stops throwaway accounts grabbing spots.
- **Pioneer (runners):** the **first 15 runners to pass verification**.
- **Top Poster / Top Runner:** in the top 10 of last week's board.
- Profile shows every badge for the current mode: earned in colour, the rest greyed with how to earn it.
- The backend must record verification order and first-completed-task order so Pioneer can be awarded
  exactly once and never lost. Live from launch day (cold-start incentive).

**Profile** shows the user's **photo** (tap it → Take a photo / Choose from gallery; the same button sits top left on home) and name, then (poster mode) real stats: Tasks posted (paid only), Completed, **Total spent** (only
money released from escrow), then level, badges and the settings list (see §7 "Profile & settings"; the leaderboard switch now lives
in Privacy & safety).

**Safeguards (backend):** (1) count only escrow-released tasks; (2) cap how often the same two people
can count toward each other's rank; (3) week / month / year resets; (4) display names only ("Seun A."), with the
opt-out above; (5) never show amounts spent publicly.

**Later (after launch, once there's activity):** a **By department / hostel** board (group rivalry), home
streak chip + rank chip + top-3 teaser, "Poster/Runner of the Week" share cards, hall of fame,
early access to new categories (e.g. Tech and repairs for top runners), "Runner of the Semester" CV
certificate, instant payout / higher limits for trusted runners.

**Considered and rejected (don't build):** "applications shown first" / "applications come faster" (there
are no applications: first to accept wins); inviting specific runners to a task (clashes with
first-to-accept; maybe later as "notify my favourite runner first"); top runners seeing tasks 10 min
early (delays every task and discourages new runners at launch; revisit with many runners); "featured
task" slots (meaningless while the feed is small); fee-free credits (costs real money, thin margins §5).

## 10. Admin (web)

`frontend/apps/admin` is a web dashboard, **not built yet**. `admin` is a role in the database
and is **never** a mode users can switch into. Planned sections in priority order: Overview,
Runner verification queue, Disputes, Payments, Users, Tasks, Settings, Audit log.

For launch, use the Supabase dashboard for most of this and build only the **runner verification
queue** and **disputes** screens. Admin actions (approve, refund, release, ban) must run server-side
with permission checks and write to an audit log. Enable 2FA for admin logins.

## 11. Repository layout

**Needs Node.js 22.13 or newer** (SDK 58). **Running the app:** from the repo root, `pnpm start` (QR code for Expo Go) or `pnpm web` (browser); these
run the mobile app from its own folder. Plain `expo start` / `npx expo start` from the repo root shows a blank
page, because Expo then treats the root (which has no app) as the project.

```
errand-app/
  CLAUDE.md                 # rules for working on the code (read automatically by Claude Code)
  PROJECT_OVERVIEW.md       # this file
  docs/architecture/schema.md
  frontend/
    apps/
      mobile/               # Expo + React Native (main app)
      web/                  # not built yet
      admin/                # not built yet
    packages/
      types/                # @errand/types   shared types (Task, Profile, RunnerProfile, Transaction).
                            # Task has optional `subcategory` and `extra_fields` (category answers);
                            # backend teammate must mirror these in the tasks table.
      constants/            # @errand/constants
      api/                  # @errand/api      (empty, fill as endpoints exist)
      ui/                   # @errand/ui       (empty)
      utils/                # @errand/utils    (empty)
```

Package manager is **pnpm** (Turborepo + workspaces). Do not use npm or yarn, and delete any
stray `package-lock.json` or `yarn.lock`. Install from the repo root, then run Expo from `frontend/apps/mobile`.
No `backend/` folder exists in the repo yet; Supabase is planned.

### Mobile app structure (`frontend/apps/mobile`)

```
index.ts                    # entry point: registers App (don't edit)
App.tsx                     # app-wide providers: SafeArea → Auth → Settings → Mode → Notifications → Tasks → Chat → Feedback → RootNavigator
src/
  context/
    AuthContext.tsx         # isSignedIn, user, signIn, signUp, signOut (MOCK, saved on device)
    ModeContext.tsx         # activeMode, roles, switchMode, hasRunnerAccess (saved on device)
    TasksContext.tsx        # the poster's tasks + addTask (LOCAL until @errand/api)
    ChatContext.tsx         # chat messages, send, unread counts (LOCAL until @errand/api)
    SettingsContext.tsx     # notification choices, default meeting spot, vibration (saved on device)
    FeedbackContext.tsx     # ratings of runners + problem reports (saved on device until @errand/api)
    NotificationsContext.tsx # the inbox: notify(kind, taskId), unread count, mark all read (saved on device)
    RunnerJobsContext.tsx   # runner side: feed, my jobs, accept / update / start / code / drop (dev: your own tasks)
  storage/
    storage.ts              # AsyncStorage wrapper + every storage key
  hooks/
    useGreeting.ts          # "Good morning/afternoon/evening", stays current while the app is open
    useLeaderboard.ts       # one board: entries from the backend (empty until then) + my real row
    useProfilePhotoPicker.ts # pick a profile photo with busy + error state (sign-up step and Profile)
    usePersistentList.ts    # a list saved on the device (reviews, reports, notifications)
    useCountdown.ts         # "Resend in 0:42"
    useRunnerWaitlist.ts    # joined the runner waitlist? + join (saved on device)
  navigation/
    RootNavigator.tsx       # ONLY place that picks auth vs poster vs runner
    AuthStack.tsx  PosterStack.tsx  RunnerStack.tsx
    screenOptions.ts        # shared headers + tab bar: pushed screens get the back arrow; starting/tab screens don't
    tabIcon.tsx             # filled/outline tab bar icons
    ProfileStack.tsx        # Profile tab: Profile + every settings screen (both modes)
    openTask.ts             # tapping a task: unpaid → Checkout, otherwise → TaskDetail
  screens/
    auth/    OnboardingScreen, RoleSelectScreen, SignupScreen, LoginScreen, VerifyEmailScreen,
             ForgotPasswordScreen, ResetPasswordScreen, AddPhotoScreen (built), RunnerSignupScreen (placeholder)
    poster/  PosterHomeScreen, ChooseSubcategoryScreen, PostTaskScreen (built),
             MyTasksScreen (Active/Completed), CheckoutScreen (payment mocked), TaskDetailScreen,
             RateRunnerScreen, ReportProblemScreen, RunnerProfileScreen, NotificationsInboxScreen,
             RaisePriceScreen (built)
    runner/  RunnerHomeScreen (Find tasks + earnings), RunnerTaskPreviewScreen, RunnerJobScreen,
             HandoverCodeEntryScreen, MyJobsScreen, EarningsScreen (built)
    shared/  ProfileScreen (built: stats, level, badges, settings list, mode switch, delete account), ChatListScreen, ChatThreadScreen (built),
             RanksScreen (built: Top Posters / Top Runners, real data only)
             settings/ EditProfile, ChangePassword, PaymentHistory, Receipt, Notifications, PrivacySafety,
                       Preferences, HelpSupport, About, DeleteAccount (each *Screen.tsx)
  components/  (one component per file)
    PressableScale          # the app's one tap effect: spring + haptic tick. Use for anything tappable
    LoadingScreen           # full-screen spinner while the saved session loads
    Icon                    # every icon goes through here (Ionicons)
    RotatingText            # fading/rising example lines on the home card
    AuthLayout, BackButton, FormField, PrimaryButton, TextLink, ChoiceCard, CategoryCard,
    TaskCard, PlaceholderScreen
    QuestionField           # one category question; picks the input below by type
    ChipRow, NumberStepper, CheckboxRow, FileUploadPlaceholder   # the question inputs
    StatusTimeline, HandoverCode, RunnerCard, TaskAnswers         # Task detail sections
    RateRunnerCard, StarRating, ReviewItem, PhotoStrip, DoneMessage, CodeInput   # rating, reports, email code
    BottomActionBar         # pinned actions at the bottom of a screen
    SegmentedTabs           # Active / Completed switch
    DevTaskSimulator        # DEV ONLY: plays the runner's side on Task detail
    ChatListRow, MessageBubble, MessageComposer, ChatSafetyBanner   # chat pieces (quick replies reuse ChipRow)
    CheckoutSummary, PaymentStatus   # checkout pieces (PaymentStatus: checking / waiting for transfer / paid)
    DevPaystackSheet        # DEV ONLY: mock Paystack page (succeed / fail / close), built on ActionSheet
    ActionSheet             # bottom sheet with a few choices (photo options, mock Paystack)
    Avatar                  # round profile photo, or the initial when there's none; used everywhere a person shows
    ProfilePhotoButton      # your plain photo + change-photo sheet (home top left and Profile)
    SettingsPage, SettingsSection, SettingsRow, ToggleRow   # settings building blocks
    PaymentHistoryRow, FaqItem   # payment history line, tap-to-open question
    Badge, BadgeShelf, LevelProgress, LeaderboardRow, StatTile   # ranks + profile pieces
    HandoverCodeButton      # compact tap-to-reveal code, pinned in chat while in progress
    HeaderIconButton        # round home-header button with unread badge (bell, chat)
    NotificationRow         # one inbox line
    BoostTaskCard           # "Not accepted yet?": Raise price / Give it more time (Task detail, live tasks)
    RunnerTaskCard          # a task for runners: "You earn ₦X", where, when (feed, My jobs, Earnings)
    EarningsCard            # all-time + this-week earnings in the runner home header
    AcceptRulesSheet        # the rules, shown on a runner's first accept
    BringNote               # "Bring: detergent" on runner screens
  constants/
    categories.ts           # the only category list (+ subcategories, icons)
    categoryQuestions.ts    # the question sets per category/subcategory
    sharedQuestions.ts      # where / when / accept window / extra info / buy anything? / duration
    questionTypes.ts        # Question, Answers, QuestionSet types
    priceSuggestions.ts     # per-category minimums (enforced) + hints, card tags, laundry per-item math
    taskExamples.ts         # example requests rotating on the home card
    notificationTypes.ts    # the 6 notification kinds users can turn on/off
    supportInfo.ts          # support contact, Terms / Privacy links, invite link (null = Coming soon), FAQ
    safetyTips.ts           # Privacy & safety tips
    reviewTags.ts           # rating tags (good / bad sets), 7-day rating window
    reportReasons.ts        # report reasons, what-you-want options, 3 photos, 48h after done
    badges.ts               # every badge: label, how to earn, icon, side (15 Pioneer spots)
    levels.ts               # poster and runner level ladders
    runnerRules.ts          # 2 tasks at once, 5 free minutes, 3 drops, 5 code tries, fee estimate, the rules text
    progressUpdates.ts      # runner one-tap updates (On my way, Printing now…) per category
  utils/
    getFirstName.ts         # "seun adeyemi" → "Seun"
    formatDisplayName.ts    # "seun adeyemi" → "Seun A." (the only name shown on boards)
    getLevel.ts             # level title + progress from completed tasks
    taskStats.ts            # completed (week / month / year / all), tasks posted, total spent; period starts
    pickProfilePhoto.ts     # camera / gallery → square crop → 400px JPEG (~30–80 KB)
    paymentStatus.ts        # what happened to a task's money (held / paid out / refunded / under review)
    profileValidation.ts    # profile details rules shared by Sign-up and Edit profile
    inviteFriends.ts        # share-sheet invite
    linkHandler.ts          # open a link, or nothing ("Coming soon") when it's not set
    feedbackRules.ts        # when a task can be rated, and whether a report is a dispute or a review
    pickPhoto.ts            # any photo: camera / gallery → shrink + compress (profile + report photos)
    openPaystackCheckout.ts # opens Paystack's page in the in-app browser + the return link (ready for the backend)
    taskFormValidation.ts   # missing-answer and price rules for the post-task form
    formatTime.ts           # "3:40 PM" / "12:30 AM tomorrow" (+ clockTime)
    formatDate.ts           # "22 Oct 2026, 3:40 PM" for payments and receipts
    formatRating.ts         # "4.8", or "New" when a runner has no ratings yet
    notificationText.ts     # icon, title, line and where it opens, per notification kind
    extendOptions.ts        # "Give it more time" choices: fit the deadline, end later than now
    runnerPayout.ts         # "You earn": backend payout, else price − 5% (min ₦50)
    runnerTimeline.ts       # runner steps: Accepted → On my way → Started → Done
    runnerEarnings.ts       # all-time / this-week earnings from completed jobs
    whatToBring.ts          # detergent / notebook and pen the runner supplies
    taskTitle.ts            # builds task titles like "Print & bind · 20 pages"
    haptics.ts              # light tap feedback (no-op on web)
    taskTimeline.ts         # which timeline step is done/current/stopped for a task
    taskGroups.ts           # Active vs Completed tasks
    devSimulateTask.ts      # DEV ONLY: fake runner accept → start (code) → handover
    chatRules.ts            # when a chat can send vs is read-only
    devRunnerReplies.ts     # DEV ONLY: canned runner chat replies
    animation.ts            # native-driver switch (off on web)
  theme/       colors.ts, typography.ts (+ iconSizes)
```

## 12. Conventions (follow these)

- Predictable paths: `screens/<side>/<Name>Screen.tsx`. Register new screens in the matching stack file.
- **Only `RootNavigator` and `ModeContext` branch on user mode.** No other file should check role.
- Import shared types from `@errand/types`; never redefine `Task`, `Profile`, etc. locally.
- Colors and type sizes come from `src/theme`.
- **One unit per file, named after what it is** (CLAUDE.md Rule 1): components in `components/`, hooks in
  `hooks/`, plain helper functions in `utils/`, config and lists in `constants/`. Tiny private helpers
  used by only one file may stay in that file.
- Anything tappable uses `PressableScale`; every icon goes through `Icon`.
- Placeholder screens use `<PlaceholderScreen />` with a TODO comment; replace the contents, keep the wiring.
- Mock data is clearly marked with a TODO pointing at the `@errand/api` call that replaces it.
- Write code any developer can understand from the folder structure and names alone. Keep it simple.

## 13. Current status

**Built:** Expo SDK 58 setup (React Native 0.88, React 19.3; upgraded from 54 on 2026-11-26 because Expo Go on both
stores is now 58; runs in Expo Go and on web), navigation (auth/poster/runner stacks),
poster tabs (Home, Tasks, Ranks, Profile), theme (no hardcoded colors or sizes), poster home,
post-task form with price hints and ₦500 validation, central category list (`categories.ts`) with
subsections and the "Coming soon" Tech card, mode context and Profile mode switch, `Profile` /
`RunnerProfile` types, auth flow (onboarding, role select, poster sign-up, log in, forgot/reset
password) on mock auth, Profile log out, category questions for all 10 sets (subcategory picker,
question screen with validation, price hint, success state; posting is mocked), icons everywhere,
tab bar icons, press effects + haptics, live greeting with the user's first name, rotating examples
on the home card, device storage (session, posted tasks and mode survive reloads), real Tasks tab list, pay-before-live flow (Checkout → Paystack in-app browser, mocked in dev, checking / transfer-pending states, accept deadline, auto take-down of expired tasks), Task detail
(timeline, runner card, handover code, answers, pinned actions, cancel/release), Active/Completed tabs, and a
dev-only runner simulator, chat list + chat thread (local messages, quick replies, safety banner, read-only
when done, real unread badge, dev "runner replies"). Ranks tab (Top Posters / Top Runners, week / month / year / all time,
real data only), Profile with real stats, level, badges and leaderboard opt-out. Required profile photo (sign-up step + change on
Profile), shown everywhere a person appears. Profile settings: edit profile, change password,
payment history, notifications, privacy & safety, preferences, invite, help & support, about, delete account. Email verification (sign-up + email changes), Rate your runner, Report a problem
(dispute / review), Runner profile. Notifications inbox (bell on home), "Not accepted yet?" (raise price /
more time), payment receipts. No sample people or numbers anywhere. **Runner app:** waitlist sign-up, Find tasks
(earnings card, filters, 2-task limit), task preview + first-accept rules, job (progress updates, start, drop),
handover code entry, My jobs, Earnings; runner view of chat. Dev builds play both sides with your own tasks.

**Designed but not coded:** leaderboard, profile with levels/streaks/badges, admin screens.

**Not started:** all backend work, API wiring, payments, file upload, notifications, web app, admin app.

**Cleanup pending:** the old `Customer Screens/` folder and `styles/globalStyles.ts` are replaced and
unused; delete them.

## 14. Open questions

- CAC/trademark availability for the name Taskly.
- **Before app store launch:** Terms of Service and Privacy policy (links), a support WhatsApp number and/or
  email, and the store invite link. Set them in `src/constants/supportInfo.ts`.
- Fee model: percentage vs flat vs 5% with ₦50 minimum.
- **Fee level:** at 5% (covering Paystack), tasks of ₦2,500–₦3,150 lose money and one campus doesn't cover
  running costs (§5 "Unit economics"). Options: (a) raise to **7%**; (b) keep 5% and add Paystack's ₦100 to
  the poster's total on tasks ≥ ₦2,500; (c) a **Taskly wallet**: posters top up once and pay tasks from
  balance, refunds go back to the wallet (no Paystack fee lost), runners withdraw in batches. (c) helps
  any fee level and is the biggest structural saving.
- Release rules: exact no-reply window (~15 min?), and does a runner who's released often lose trust?
- Two runners tap Accept at the same moment: the backend picks the winner; the loser sees "Taken by
  someone else" and the feed refreshes.
- Refunds: to the card (Paystack fee lost) or to a Taskly wallet balance?
- Real category minimums (now enforced, so a too-high guess blocks real tasks). The live survey form does not ask about prices (only whether a ₦500
  minimum is acceptable), so use median prices from the first 30 to 50 real tasks or a quick WhatsApp poll.
- When to open Tech and repairs (how many verified repair-capable runners is enough).
- Notification channel for runners (web push, in-app, WhatsApp fallback for urgent tasks).
- Whether the leaderboard ships at launch or after real tasks exist.
- **Student verification: settled for launch (2026-10-22):** no automatic matric check. Runners are invite-only
  (Seun vets them in person); later, strangers from the waitlist are checked by a person (matric + student ID
  photo + selfie). The notes below stay for if Yaba Tech ever agrees to share records.
- ~~Student verification (proposed):~~ the user enters a matric number and the app checks it
  against the school's records; a match grants access, no match is rejected. Two blockers before building:
  (1) we need the school's permission or an agreed data source (an API, or a list of matric numbers). Do not
  scrape the school portal and never ask students for portal passwords. (2) A matric number is not a secret
  and is guessable, so on its own it proves the number exists, not that the user owns it. Add a second check,
  at least for runners (for example, the bank account name from the payout account must match the name on the school record).
  Collect only what is needed (matric, name, department, level) and follow the Nigeria Data Protection Act 2023
  (consent, privacy notice, secure storage, deletion on request).

## 15. Validation

A Google Form survey for Yaba Tech students is out. It tests which categories students would pay
for, whether a ₦500 minimum fee is acceptable, whether students would run tasks for money (the key supply number), and
what builds trust. Use its results to update categories and gauge runner supply.

## 16. Backend handoff (what the frontend sends and expects)

> **For the backend teammate.** Kept current with every frontend change. `@errand/types` is the contract:
> if anything here doesn't match what you're building, tell Seun before building around it.
> Every place the app is waiting on you is marked `// TODO: ... @errand/api` in the code.

### Start here

The frontend MVP is on `main`: the poster and runner apps are built and run on mock data saved on the
device until the backend exists.

- **This section (§16):** every API call the app needs (inputs, outputs, which screen uses it), the rules the
  backend must enforce, and what live updates and push notifications the app expects.
- **`frontend/packages/types/src/index.ts`:** the shared data shapes (Task, Profile, Message, …). This is the
  contract: agree with Seun before changing it.
- **`// TODO: … @errand/api` comments:** each marks a mock that one of your calls replaces.
- **Run the app:** `pnpm install`, then `pnpm web` (browser) or `pnpm start` (Expo Go, SDK 58). Needs Node 22.13+.
- **Before building:** answer the open questions at the end of this section, and agree the API call names with
  Seun so neither side builds against names the other changes.

### Data the app uses (`frontend/packages/types/src/index.ts`)

- **Task**: `id, creator_id, runner_id?, title, description, category, subcategory?, price, status,
  otp?, runner?, accept_by?, location_start?, location_end?, extra_fields?, created_at, updated_at`.
  - `runner` (**new**, `TaskRunner`: `id, first_name, rating, completed_count`): who accepted, returned by
    `tasks.get`; not a column. **`rating` is `number | null`**: send `null` for a runner with no reviews yet
    (the app shows "New"); never a made-up default.
  - `subcategory` and `extra_fields` were **added by the frontend** (category questions). The `tasks`
    table in `docs/architecture/schema.md` needs both columns (`subcategory text`, `extra_fields jsonb`).
  - `status`: `pending-payment | posted | accepted | in-progress | completed | closed | disputed`.
    **`pending-payment` is new** (created, not paid, invisible to runners). `closed` includes "nobody
    accepted in time, refunded".
  - `paid_at` (**new**, ISO time): when the payment was confirmed (payment history).
  - `accept_by` (**new**, ISO time): set when payment succeeds = paid time + the poster's accept window.
    Past it with no accept → backend closes the task and refunds.
  - `category` ids: `printing, laundry, academic, household, other` (`tech` exists but is "Coming soon"
    and must be **rejected** if posted).
  - `subcategory` ids: academic → `notes, assignment, tutoring, academicOther`; household →
    `cleaning, water, householdOther`. Other categories send none.
  - `title` is **built by the frontend** from the answers (e.g. "Print & bind · 20 pages").
  - `description` = the free-text answers (`description`, `content`, `extraInfo`) joined with blank lines.
  - `price`: whole naira, **≥ the category minimum** (see rules below).
- **Profile** (used today): `full_name`, `phone`, `roles`, `active_mode`.
- **Profile details (new):** `Profile.email` + `Profile.email_verified` (any email, verified by code), `Profile.hostel`
  (sign-up and Edit profile), and `Profile.school_id` = **matric number, runners only** (collected at runner
  verification, checked by a person). Notification choices
  (`runnerAccepted, taskStarted, newMessage, taskDone, refunds, tipsAndNews`, all on by default) should be
  saved on the profile too, and **checked before every push**.
- **Profile photos (new):** `Profile.avatar_url` (already in the type) is **required** for posters and
  runners. `TaskRunner.avatar_url` and `LeaderboardEntry.avatar_url` were added so photos show on the
  runner card, chats and boards. The app sends a square 400×400 JPEG (~30–80 KB).
- **Profile** additions (**new**): `badges?: BadgeId[]` (`pioneer_poster | pioneer_runner | top_poster |
  top_runner`, awarded by the backend, never removed) and `show_on_leaderboards?: boolean` (opt-out).
- **LeaderboardEntry** (**new**): `user_id, rank, display_name` ("Seun A."), `completed_count, rating, score,
  badges`. **LeaderboardResponse**: `{ entries, me }` where `me` is the signed-in user's row even if
  outside `entries` (null if opted out or not a runner on the runner board).
- **Task, runner side (new, 2026-10-26):** `payout` (what the runner takes home; send it on `runner.feed` /
  `runner.myJobs` only, never to posters), `accepted_at` (drop rules count from it), `poster` (`TaskPoster`:
  `id, first_name, avatar_url?`, sent to the runner once they accept), `updates` (`TaskUpdate[]`: `id, task_id,
  kind, created_at`, the `task_updates` rows, oldest first; kinds listed in `src/constants/progressUpdates.ts`).
- **RunnerWaitlistEntry** (**new**): `user_id?` (signed-in posters → priority), `full_name, email, phone,
  department_level, categories[], created_at`.
- **AppNotification** (**new**): `id, kind, task_id, created_at`, `kind` one of `task-live | runner-accepted |
  task-started | task-done | task-refunded | new-message`. The app writes the wording itself
  (`notificationText.ts`), so the backend only stores the event. Read state: the app keeps one "last opened
  inbox" time, so a `notifications_read_at` per user is enough.
- **Message** (**new**): `id, task_id, sender_id, content, created_at`. One chat per task, so the app
  only needs "messages for this task". `schema.md` has a separate `chats` table + `messages.chat_id`;
  `messages.task_id` alone would be simpler. Backend's call.

### `extra_fields`: the answers, per question set

Only questions currently shown are sent. Choice answers are the option text exactly as listed in §6.
**Number answers are sent as strings** today (e.g. `"20"`). File questions send nothing yet (no storage).
Every set also sends `location` (free text), `deadline` (`Within 3 hours | Today | Tomorrow | This week`),
`acceptWindow` (`30 minutes | 1 hour | 3 hours | 6 hours | 12 hours | 24 hours | 48 hours | 72 hours`;
max 72 h, and only
the options that fit `deadline` are offered) and optional `extraInfo`.

| Set | Keys (type) |
|---|---|
| `printing` | `service`, `pages` (num), `copies` (num), `colour`, `paperSize`, `document` (file, later) |
| `laundry` | `service`, `items` (num), `itemTypes` (string[]), `heavyItems` |
| `notes` | `courseCode`, `content`, `format`, `pages` (num, ≥ 4), `materials` (true if the poster provides the notebook and pen; only when handwritten; not true → +₦500 to the minimum), `source` (file, later) |
| `assignment` | `courseCode`, `content`, `format`, `length` (num pages, ≥ 4), `materials` (as notes), `workFile` (file, later) |
| `tutoring` | `subject`, `topic`, `hours` (num), `mode`, `level`; `location` only if `mode` = In person |
| `academicOther` | `courseCode`, `description`, `needsPurchase`, `duration` |
| `cleaning` | `areas` (string[]), `rooms` (num), `supplies` (true), `dirtLevel` |
| `water` | `containers` (num), `containerSize`, `source`, `floor` (num, 0 = ground), `containersProvided` (true) |
| `householdOther` | `description`, `needsPurchase`, `duration`, `supplies` (true) |
| `other` | `description`, `needsPurchase`, `duration`, `photo` (file, later) |

Source of truth for these: `src/constants/categoryQuestions.ts` and `sharedQuestions.ts`.

### Live updates the app expects

- **Realtime subscriptions** (Supabase `postgres_changes`), each limited by RLS to the signed-in user:
  - `tasks` where `creator_id = me` (poster) → timeline, Task detail, home, Tasks tab.
  - `messages` for tasks I'm part of → chat, chat list, unread badge.
  - `task_updates` for my tasks (planned) → progress notes.
- **Push notifications** (Expo push tokens saved per user; FCM): runner accepted · runner started · new
  message · progress update · task done · taken down + refunded. Tapping one opens that task / chat.
- **Progress updates (planned):** table `task_updates` (`id, task_id, kind, created_at`); `kind` from a
  fixed list (§5 "Live tracking"); only the accepted runner can add them; call `tasks.postUpdate(taskId,
  kind)`.
- Runner feed stays on polling (`runner.feed` every 15–30 s).

### Rules the backend must enforce (the app only reflects them)

- `price` ≥ the minimum: printing ₦500; laundry ₦500 × `items`; notes / assignment pages × (₦250 handwritten,
  ₦150 typed) with pages ≥ 4, + ₦500 when handwritten and `materials` isn't true; tutoring ₦1,500 × `hours`; other academic help ₦1,500; household ₦1,500;
  other ₦500 (never below ₦500). The app blocks lower prices; the backend must too.
- `needsPurchase` must never be `Yes` (launch rule: runners never spend their own money).
- `category` must be a launch category; reject `tech`.
- **Payment before live:** a task is only visible to runners after Paystack confirms payment (webhook).
  Never trust the app's word that it paid. No Paystack secret keys ever go in the app.
- **Chat access:** only the poster and the runner who accepted can read or send messages for a task
  (RLS). Sending is allowed only while the task is `accepted`, `in-progress` or `disputed`.
- **Email codes (free):** Supabase Auth email OTP. Its built-in sender is for testing only and heavily
  limited, so connect a free SMTP service (e.g. Resend or Brevo free plans). Rate-limit code requests.
  SMS (runners) later via Supabase's Twilio/MessageBird/Vonage/Textlocal or a Send SMS hook (e.g. Termii).
- **Runners + waitlist (no invite codes):** Seun signs up the first 15 in person; add each by hand in the Supabase
  dashboard (`roles` += runner, a `RunnerProfile` with matric, categories, verified) and create their **Paystack
  transfer recipient** from the bank details he collects. A `runner_waitlist` table holds `RunnerWaitlistEntry`
  rows; signed-in posters first when spots open. No admin screen needed yet.
- **Runner rules:** `runner.feed` returns only `posted` tasks in the runner's categories. `tasks.accept` fails
  with "taken" if someone was first and with "limit" when the runner already has **2** `accepted`/`in-progress`
  tasks. `tasks.drop` only while `accepted`: back to `posted` (runner, code and updates cleared); counts against
  the runner if more than **5 minutes** after `accepted_at`; at **3** counted drops flag the account for review.
  `tasks.postUpdate` only by the accepted runner while active. **5 wrong codes** on `tasks.complete` →
  `disputed`.
- **Reviews (new type `Review`):** one per task, only by its poster, only when `completed`, within 7 days,
  final once sent. The runner's `rating` is the average of their reviews.
- **Reports / disputes (new type `Report`):** a report on an `accepted` / `in-progress` task is a **dispute**: set
  `disputed`, pause payout and auto-release, reply in the task chat within 24 h. A report on a `completed` task
  (within 48 h of completion) is a trust & safety review only (money already released). One per task.
- **Avatars:** Supabase Storage bucket `avatars`, one file per user (`avatars/{userId}.jpg`). RLS: a user can
  only upload / replace their own; anyone signed in can read. Reject non-images and files over ~1 MB.
  Delete the file when the account is deleted (NDPA). Treat a missing photo as "not set up" (the app
  blocks use until there is one; runner verification requires it too).
- **Leaderboards:** scores computed server-side. Posters: tasks completed (escrow released) + runner
  rating of the poster + pay-on-time speed + dispute-free rate. Runners: completed, then rating, then
  on-time rate. Boards reset: week on Monday 00:00, month on the 1st, year on 1 January (Africa/Lagos);
  all time never resets. Apply the §9 safeguards (escrow-released
  only, cap repeat pairs, display names only, honour `show_on_leaderboards`, never expose spend).
- **Badges:** Pioneer poster = first 15 posters by time of their first completed task; Pioneer runner =
  first 15 by verification time; record both orders permanently. Top Poster / Top Runner = top 10 of the
  previous week's board.
- **Accept is atomic:** only the first accept wins; a second accept gets "already taken".
- **Handover code:** created at accept, stored hashed; returned **only to the poster** and only when the
  task is `in-progress`; never to the runner. 5 wrong entries lock it → `disputed`.
- **Retention:** never delete task or payment records; delete uploaded files 30 days after completion;
  chat retention to be set by the backend.
- `acceptWindow` max 72 hours, and it must fit `deadline`: "Within 3 hours" → max 1 hour,
  "Today" → max 6 hours, "Tomorrow" → max 24 hours, "This week" → max 72 hours. (The app only offers fitting
  options; the backend should still reject a mismatch.)
- Taskly's 5% (min ₦50) comes out of the runner's payout on release; the poster pays exactly `price`.
- **Raise price:** only while `posted`, only upward. Charge the difference as a separate Paystack payment and
  change `price` only after its webhook confirms. If the task stopped being `posted` before the top-up landed
  (accepted, expired, cancelled), refund the top-up.
- **Give it more time:** only while `posted`; new `accept_by` = now + a window from the list that fits
  `deadline` (table below) and ends later than the current `accept_by`. Reject anything else.
- Password at least 6 characters; phone at least 10 characters (the app checks the same; it does not
  yet check the format, so validate Nigerian numbers server-side).
- Plus everything in §2 and §5: escrow, OTP release, permissions, RLS.

### API calls the app will make

| Call (suggested name) | Input | Returns | Used by | Replaces today |
|---|---|---|---|---|
| `auth.signUp` | `fullName, email, phone, hostel, password` | session + Profile (email unverified); **emails a 6-digit code** | Sign up | mock in `AuthContext` |
| `auth.verifyEmail` / `auth.resendEmailCode` | `code` / — | verified / "wrong code"; resend allowed after 60 s | Verify email | dev accepts any 6 digits; release has no fake pass |
| `reviews.create` / `reviews.list` | `taskId, stars, tags, comment?` / `runnerId` | Review / Review[] | Rate runner, Runner profile | `FeedbackContext` (device) |
| `reports.create` | `taskId, reason, details, photos[], wants?` | Report (dispute sets the task `disputed`) | Report a problem | `FeedbackContext` + `TasksContext.openDispute` |
| `runners.get` | `runnerId` | TaskRunner + `badges, on_time_rate, member_since, categories` | Runner profile | the task's `runner` |
| `auth.signIn` | `identifier` (email **or** phone), `password` | session + Profile | Log in | mock (name unknown → "Hi there") |
| `auth.signOut` | — | — | Profile → Log out | mock |
| `auth.requestPasswordReset` | `email` | emails a reset code | Forgot password | navigates straight on |
| `auth.resetPassword` | `code` (4–6 digits), `newPassword` | ok / error | Reset password | navigates straight on |
| `profile.get` | — | Profile (`roles`, `active_mode`, `full_name`) | Auth + Mode | `MOCK_ROLES = ['poster']` |
| `profile.setActiveMode` | `mode` | ok | Profile mode switch | saved on device only |
| `tasks.listMine` | — | Task[] newest first | Home "Active tasks", Tasks tab | `TasksContext` (device) |
| `tasks.create` | `title, description, category, subcategory?, price, extra_fields` | Task (`pending-payment`) | Post task | `TasksContext.addTask` |
| `payments.initialize` | `taskId`, `returnUrl` (from `paymentReturnUrl()`; amount comes from the task on the backend, never from the app) | Paystack checkout URL (all channels: card, bank_transfer, ussd), with `callback_url` = the app link the app sends (`taskly://payment-complete`, or Expo Go's `exp://…` in dev) | Checkout | dev: `DevPaystackSheet` + `TasksContext.payForTask` |
| `payments.status` | `taskId` | `paid` (task now `posted` with `accept_by`) / `pending` (e.g. bank transfer not landed yet) / `failed` / `abandoned` | Checkout (polled while "Checking…"); push when a pending transfer lands | same mock |
| `tasks.cancel` | `taskId` | Task (`closed`); refunded if it was paid. Allowed while `pending-payment` or `posted` | Task detail | `TasksContext.cancelTask` |
| `tasks.get` | `taskId` | Task + `runner` (`TaskRunner`: `id, first_name, rating, completed_count`) + `otp` (poster only, `in-progress` only) | Task detail | local store |
| `tasks.start` (runner) | `taskId` | Task (`in-progress`); poster now gets the code | Job → Start task | `RunnerJobsContext.startTask` |
| `tasks.complete` (runner) | `taskId, code` | Task (`completed`) + payout, or wrong code + tries left, or locked (`disputed`) | Enter handover code | `RunnerJobsContext.enterCode` |
| `tasks.accept` | `taskId` | Task (`accepted`, with `poster`) or `taken` / `limit` | Task preview | `RunnerJobsContext.acceptTask` |
| `tasks.drop` | `taskId` | Task (`posted`) + whether it counted | Job → Drop | `RunnerJobsContext.dropTask` |
| `tasks.postUpdate` | `taskId, kind` | TaskUpdate (poster sees it live) | Job quick updates, I'm on my way | `RunnerJobsContext.postUpdate` |
| `runner.earnings` | — | all-time, this week, per-task payout + status, masked payout account | Earnings, home card | `utils/runnerEarnings.ts` from local jobs |
| `runners.joinWaitlist` | `RunnerWaitlistEntry` (user id from the session) | ok | Runner sign-up | `useRunnerWaitlist` (device) |
| `tasks.releaseRunner` | `taskId` | Task (back to `posted`, runner and code cleared) | Task detail | `TasksContext.releaseRunner` |
| `chats.list` | — | the user's task chats with last message + unread count | Chat list, home badge | `ChatContext` (device) |
| `chats.messages` | `taskId` | Message[] oldest first (+ Realtime/polling for new ones) | Chat thread | `ChatContext` |
| `chats.send` | `taskId, content` | Message. Reject if the task is completed/closed (read-only) | Chat thread | `ChatContext.sendMessage` |
| `chats.markRead` | `taskId` | ok (unread counts reset) | Opening a chat | `ChatContext.markRead` |
| `files.upload` | file | private URL, visible **only** to the runner who accepts | Printing / notes / assignment / other uploads | "coming soon" box |
| `events.comingSoonTap` | `categoryId` | ok | Tech "Coming soon" card | does nothing |
| `runner.feed` (polled 15–30 s), `runner.myJobs` | — / — | live Task[] in my categories (+ `payout`) / my jobs (+ `payout`, `poster`, `updates`) | Find tasks / My jobs | `RunnerJobsContext` (dev: your own tasks) |
| `runner.verify` (later, for waitlist runners) | matric, department/level, ID photo + selfie, bank account | RunnerProfile | not built (the first 15 are added by hand) | — |
| `leaderboard.get` | `board` (`posters` | `runners`), `period` (`week` | `month` | `year` | `all`) | `LeaderboardResponse` { `entries`, `me` } | Ranks tab | `useLeaderboard` (entries empty; `me` from local tasks) |
| `profile.update` | `full_name, phone, school_id, hostel, show_on_leaderboards, avatar_url`, notification choices | Profile | Edit profile, Privacy, Notifications, photo | saved on the device |
| `auth.changePassword` | `current, next` | ok, or "wrong current password" | Change password | mock accepts anything |
| `account.delete` | — | ok. Refuse while a paid task is active; delete profile, photo, chats; keep payment records anonymised as the law requires | Delete account | clears the device and signs out |
| `notifications.list` / `notifications.markRead` | — / — | AppNotification[] newest first / ok (sets read time) | Notifications inbox, home bell | `NotificationsContext` (device) |
| `tasks.raisePrice` | `taskId, newPrice` | Paystack checkout URL for the difference (like `payments.initialize`); `price` changes on the webhook | Raise price | `TasksContext.raisePrice` + `DevPaystackSheet` |
| `tasks.extendAcceptWindow` | `taskId, minutes` | Task (new `accept_by`) | Task detail → Give it more time | `TasksContext.extendAcceptWindow` |
| `payments.receipt` | `taskId` | amount, status, paid_at, Paystack reference, method (card / transfer / USSD), refunded_at? | Receipt | built from the task; reference = task id |
| `avatars.upload` (Storage) | the 400px JPEG | public URL → `profile.update({ avatar_url })` | Add photo step, Profile | photo saved as image data in the device session |

### Mocks and device storage to replace

- `src/context/AuthContext.tsx` (mock sign-in), `src/context/TasksContext.tsx` (tasks on device, ids like
  `local-1729170000000`, `creator_id: 'local-user'`; `payForTask` fakes a successful payment (dev: `DevPaystackSheet` picks the outcome); `closeExpired` fakes the backend's
  take-down + refund every minute; `cancelTask` / `releaseRunner` mock those calls; `simulateNextStep` +
  `DevTaskSimulator` fake the runner in dev builds only), `src/context/ModeContext.tsx` (`MOCK_ROLES`),
  `src/context/ChatContext.tsx` (messages on device; `simulateRunnerReply` is dev-only),
  `src/context/RunnerJobsContext.tsx` (runner side on the same device store; dev feed = your own posted tasks),
  `ModeContext.devGrantRunnerAccess` (dev only: skip the waitlist),
  `src/context/NotificationsContext.tsx` (inbox on device; `TasksContext` / `ChatContext` create the events
  where the backend will),
  `src/constants/localUser.ts` (`LOCAL_USER_ID = 'local-user'` stands in for the signed-in user's id).
- Device storage keys (`src/storage/storage.ts`): `taskly:v1:session`, `taskly:v1:tasks`,
  `taskly:v1:activeMode`, `taskly:v1:chats`, `taskly:v1:settings`, `taskly:v1:reviews`, `taskly:v1:reports`, `taskly:v1:notifications`, `taskly:v1:notificationsReadAt`, `taskly:v1:runnerRulesSeen`, `taskly:v1:runnerDrops`, `taskly:v1:runnerWaitlist`, `taskly:v1:devRunnerAccess` (dev only). AsyncStorage is **not encrypted**: the real session must use
  `expo-secure-store` or the Supabase client's storage.

### Open questions for the backend

1. ~~Sign-up fields not in `Profile`~~ **Answered by the frontend:** `Profile.school_id` and `Profile.hostel`
   (see above). Shout if you'd rather store them differently.
2. **Role model mismatch:** `schema.md` has one `role` (`user | runner | admin`); `@errand/types` has
   `roles[]` with `poster | runner | admin`, `active_mode`, separate poster/runner trust, and a
   `RunnerProfile`. Which one is real?
3. **Numbers in `extra_fields`:** keep as strings, or should the app send real numbers?
4. **`deadline`:** keep the label (`Today`), or should the app convert it to a `due_at` timestamp when posting?
5. **`location`:** today it's free text inside `extra_fields`. Map it to `location_start`, or keep a
   campus-location id once that list exists?
6. **Log in identifier:** support both phone and school email? Reset code by SMS or email, and how many digits?

## 17. Suggestions

- Show the "Coming soon" Tech card tap count in admin, so the decision to open Tech and repairs uses real demand.
- Keep the session after a reload (secure storage) once real auth lands, so students don't log in every time they open the app.
- Replace the free-text "where" answer with a dropdown of named Yaba Tech locations, so runners see consistent places and can filter by area.
- On the post-task form, ask "Leave without posting?" when Back is tapped with answers filled in, so a mis-tap doesn't lose a half-written task.
- Add a "Recently posted" or "Post again" shortcut on home for repeat tasks (weekly laundry, printing), so regulars can repost in one tap.
- Show the user's first name and initials avatar on the Profile screen too, so the name from sign-up appears somewhere they can check and later edit.
- Add a "Clear local data" button in Profile (dev builds only) so testers can reset saved tasks and session without reinstalling.
- Generate a typed `@errand/api` stub file from the §16 call table, so frontend and backend agree on names and shapes before either side builds.
- Taskly wallet: top up once, pay tasks and receive refunds from balance; it cuts Paystack fees on every repeat task and refund (biggest margin win, see §5).
- Show a live countdown ("Taken down in 2h 14m") on unpaid/open task cards, so posters know where things stand.
- Tell runners in the laundry task card that detergent is part of the job ("bring detergent"), so nobody turns up without it.
- Pre-select a sensible accept window when the deadline is picked (e.g. "Within 3 hours" → 30 minutes), so posters can skip that question.
- For tasks live 48–72 hours, nudge the poster after 24 h with no accept ("Raise the price or extend?"), so long-window tasks don't just quietly expire.
- Track how often posters hit the minimum-price error per category; if it's frequent, that minimum is probably too high.
- Show runners a clear "Bring a notebook and pen" tag on handwritten tasks where the poster didn't tick the materials box.
- Let runners confirm "I bought the notebook and pen" with a receipt photo, so the ₦500 materials add-on is visibly spent on materials.
- Cap the on-device task copy to the latest ~50 Past tasks once the backend exists, so the phone cache never grows without limit.
- Auto-flag chat messages that ask for the handover code or payment outside Taskly (e.g. "send the code first", bank details) and show a warning to the poster.
- After the runner enters the code, show both sides a "Task done, payment released" message in the chat, so the handover ends with clear confirmation.
- Ask for notification permission right after a poster's first payment ("Get notified when a runner accepts"), not at sign-up, so more people say yes.
- Remember the poster's last payment method and pre-select it at checkout, so repeat posters pay in one tap.
- When the backend lands, show a one-time "You're a Pioneer!" celebration screen the first time a user's profile comes back with a Pioneer badge.
- Award a "Poster/Runner of the Month" badge to each monthly board's #1, so the new monthly boards come with a reward.
- Show posters a "Is this you?" hint if the photo has no face detected, so blurry or object photos get replaced before runners see them.
- Add the same top-left photo button to the runner home when it's built, so both modes can change their photo from home.
- Since the photo has no visible "edit" hint now, show a one-time tooltip ("Tap your photo to change it") on a poster's first visit to home.
- Show a "Paid by transfer? It can take a few minutes" line on Awaiting payment task cards, so posters don't pay twice while a transfer is landing.
- Add a Paystack test-mode key to a staging backend early, so the real Checkout hand-off can be tried end to end with Paystack's test cards before launch.
- Keep all safety wording (handover code, payment) in one constants file so the same sentence is used everywhere and can't drift.
- Write the Terms of Service and Privacy policy (one page each is enough for launch) and host them, since the app stores reject apps without them.
- Once the first 15 runners are live, track "time to accept" per task in admin; it's the signal for when to open the runner waitlist.
- Push the "Not accepted yet?" card as a notification when half the accept window has passed with no runner, so posters see it without opening the task.
- Add a runner-side "Report a problem" (poster didn't show, wrong code, unsafe) so runners have the same safety net posters do.
- Add a CI check that runs `tsc` and a web export on every push, so a broken build is caught before anyone pulls it.
- Move testers to a development build (EAS) before launch, so a new Expo Go release can never break testing again.
