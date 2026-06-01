# CatalystOS

A chemistry-themed Research RPG productivity environment built for personal daily use by Alen Saji.

## Run & Operate

- `pnpm --filter @workspace/study-os run dev` — run CatalystOS (preview path `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifact: `study-os`)
- State & persistence: Zustand with `persist` middleware → `localStorage` key `catalyst-os-storage`
- UI: shadcn/ui components + custom oklch chemistry dark theme
- Fonts: Space Grotesk (body) + JetBrains Mono (mono/stats)
- Animations: Framer Motion + canvas ParticleBackground

## Where things live

- `artifacts/study-os/src/lib/study-store.ts` — entire Zustand store (1300 lines): all state, types, actions, persistence
- `artifacts/study-os/src/components/study-os/` — all feature components (Dashboard, PomodoroTimer, Navigation, etc.)
- `artifacts/study-os/src/index.css` — full chemistry dark theme (oklch vars, neon glows, animations)
- `artifacts/study-os/index.html` — title, meta tags, Google Fonts

## Architecture decisions

- Purely client-side: no API server, no database — all data in `localStorage` via zustand/persist
- Single monolithic store (`study-store.ts`) — intentional, preserves cohesion and avoids prop drilling
- Creator profile (`creatorProfile`) is part of the zustand store and persists with everything else
- Particle background runs on a canvas at `z-0` — reduced to ~55 particles max for readability

## Product

CatalystOS is a gamified study OS: Pomodoro focus timer, subject manager, daily/weekly quests, notes with flashcards, XP/level progression, skill tree, achievements, analytics, and a chemistry tools panel — all wrapped in a chemistry lab dark theme with neon aesthetics.

## User preferences

- Preserve architecture — no feature expansion, no unnecessary rewrites
- Prioritize maintainability and daily usability over complexity
- Creator identity: Alen Saji / Lead Researcher / ALN-001

## Gotchas

- Changing the zustand persist `name` key clears stored data — current key is `catalyst-os-storage`
- ParticleBackground bond rendering requires a `!p1 || !p2` guard — bonds can hold stale indices after HMR/resize
- Profile image is stored as a base64 data URL in the zustand store — large images will bloat localStorage

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
