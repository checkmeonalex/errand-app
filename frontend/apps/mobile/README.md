# Mobile app structure

## Folders

- `src/screens/poster/` — everything a task poster sees
- `src/screens/runner/` — everything a task runner sees
- `src/screens/shared/` — screens both sides use (chat, profile)
- `src/screens/auth/` — onboarding, role selection
- `src/navigation/` — one file per stack. `RootNavigator.tsx` is the
  ONLY place that decides auth vs poster vs runner — nothing else
  should branch on user role.
- `src/components/` — reusable UI used by more than one screen
  (`TaskCard`, `CategoryCard`). If a piece of UI is only used in one
  screen, keep it inline in that screen file instead of creating a
  component for it.
- `src/theme/` — `colors.ts` and `typography.ts`. Never hardcode a
  hex value or font size in a screen — import from here.

## Shared packages (`@errand/*`)

Types, constants, and API calls that both the mobile app and the web
app need live in `frontend/packages/`, not duplicated here:

- `@errand/types` — `Task`, `Profile`, `Transaction`, etc.
- `@errand/constants` — status enums, role enums
- `@errand/api` — API calls (fill in as backend endpoints exist)
- `@errand/utils` — helper functions

If you need a type or constant, check these packages before defining
a new one locally.

## Placeholder screens

Any screen still showing `<PlaceholderScreen />` hasn't been built
yet. Replace the placeholder import with real content — the
navigation wiring around it won't need to change.

## Adding a new screen

1. Create the file in the right folder (`poster/`, `runner/`,
   `shared/`, or `auth/`).
2. Register it in the matching stack file under `src/navigation/`.
3. If it needs a type that doesn't exist yet, add it to
   `@errand/types`, not locally.
