# ERRAND Project Instructions

Campus-based errand marketplace app.

## Core Mandates
- **Security:** No direct peer-to-peer payments. Use escrow logic. Validate all critical actions on backend. RLS enabled for all tables.
- **Verification:** Task completion requires proof (OTP or upload).
- **Architecture:** Monorepo with Turborepo and pnpm.
- **Stack:**
    - Mobile: React Native (Expo)
    - Web: Next.js
    - Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
    - Payments: Paystack
    - Maps: OpenStreetMap + MapLibre
    - Notifications: FCM

## Directory Structure
- `frontend/apps/mobile`: Expo app
- `frontend/apps/web`: Next.js app
- `frontend/apps/admin`: Admin dashboard
- `frontend/packages/*`: Shared logic and components
- `backend/supabase/*`: Database and Edge Functions

## Development Principles
- Simple, modular, secure, testable.
- Priority: trust system > features > UI polish.
- MVP Focus: auth, task creation/acceptance, escrow, OTP confirmation, basic chat, ratings.
