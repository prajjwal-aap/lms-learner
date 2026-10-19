# Occult Gurukul — Learner Panel

Next.js 16 (App Router) + Tailwind v4 + React Query + Zustand. Runs entirely on mock data for now.

```bash
npm install
npm run dev        # http://localhost:3000
```

**Demo login:** any 10-digit mobile + any email → Send OTP → enter **123456**.
(Set in `src/features/auth/api/auth.mock.ts` → `DEMO_OTP`.) Sign out from the avatar menu.

## Flow

`/login` (or `/reset-password`) → `/onboarding/profile` → `/onboarding/goal` → `/onboarding/topics` → `/community`
Learner tabs: `/community`, `/live-sessions`, `/courses` → `/courses/[courseId]`, `/store`, `/masterclasses`.
`src/proxy.ts` redirects to `/login?next=…` when there is no session cookie.

## Structure

```
src/
  app/(auth) (onboarding) (learner)   thin route files: metadata + one Screen component
  features/<name>/                    auth, onboarding, community, live-sessions, courses, store, masterclasses
    api/<name>.api.ts                 async functions — swap mock bodies for apiClient calls
    api/<name>.mock.ts                typed mock data
    api/<name>.queries.ts             React Query hooks
    components/  hooks/  types.ts  index.ts (public API)
  components/layout                   LearnerHeader, AuthShell, OnboardingShell, WhatsAppFab
  config/                             routes, nav
  lib/                                apiClient, mockApi, queryClient, utils
  app/globals.css                     design tokens (@theme) from the "Mystic Academy Lumina" design system
```

ESLint enforces the boundaries: import features only via `@/features/<name>`, and `components/`, `lib/`, `config/` never import features.

## Connecting the real API

Set `NEXT_PUBLIC_API_URL`, then replace each `*.api.ts` function body with the `apiClient` call noted in its comment. Hooks and components stay unchanged. For auth, let the server set an httpOnly session cookie and remove the client-side `session.start` in `features/auth/session.ts`.
