

## Integrate SkySafe Dashboard as Dispatch Page with Lovable Cloud

### Overview

Copy all 18 files from the [SkySafe Dashboard](/projects/ff09e0a9-7e81-4371-9e12-c9c5477849ef) project into this one, create a new `/dispatch` route, set up a Supabase backend via Lovable Cloud with the `aviation-data` edge function, and add navigation entry points.

### Step 1: Enable Lovable Cloud (Supabase)

Connect this project to Lovable Cloud to get a Supabase instance. This provides:
- The `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars that the dispatch hooks need
- A place to deploy the `aviation-data` edge function

No database tables are needed -- the SkySafe Dashboard only uses an edge function (no tables).

### Step 2: Deploy the Edge Function

Create `supabase/functions/aviation-data/index.ts` with the exact edge function from SkySafe. This handles three actions:
- `metar` -- proxies METAR JSON from aviationweather.gov
- `runways` -- returns hardcoded runway data per airport
- `fleet-status` -- queries airplanes.live ADS-B API for aircraft positions

Set `verify_jwt = false` in `supabase/config.toml` so the function is publicly callable.

### Step 3: Copy Library & Hook Files (namespaced)

Files to create under `src/lib/dispatch/`:
- `airports.ts`, `fleet.ts`, `icao-hex.ts`, `metar-parser.ts`, `weather-minimums.ts`, `wind-calculations.ts`

Hooks (namespaced to avoid collision with existing `useMetar`):
- `src/hooks/use-dispatch-metar.ts`
- `src/hooks/use-runways.ts`
- `src/hooks/use-fleet-status.ts`

These hooks call the edge function via `import.meta.env.VITE_SUPABASE_URL`.

### Step 4: Copy Dashboard Components

Create `src/components/dispatch/` with 8 components:
- `Header.tsx`, `GoNoGoColumn.tsx`, `GoNoGoPanel.tsx`, `WindPanel.tsx`, `WeatherPanel.tsx`, `FleetTrackerPanel.tsx`, `FleetStatusRibbon.tsx`, `SettingsModal.tsx`

All imports updated to reference `@/lib/dispatch/` instead of `@/lib/`.

### Step 5: Create Dispatch Page

Create `src/pages/DispatchPage.tsx` -- adapted from SkySafe's `Index.tsx`, assembling all dispatch components. It uses a dark theme scoped via a `.dispatch-dark` CSS class wrapper so the dark aviation UI doesn't affect the rest of the app.

### Step 6: Add Route & Navigation

- **`App.tsx`**: Add `<Route path="/dispatch" element={<DispatchPage />} />` inside the `AppLayout` group
- **`AppSidebar.tsx`**: Add a "Dispatch" nav item with `Radio` icon
- **`MetarRibbon.tsx`**: Add a "KOPF Dispatch" button that navigates to `/dispatch`

### Step 7: Styling Updates

- **`tailwind.config.ts`**: Add `status-go`, `status-nogo`, `status-caution` color tokens and `scroll-left` animation
- **`index.css`**: Add `--status-go`, `--status-nogo`, `--status-caution` CSS variables, the `scroll-left` keyframe, and a scoped `.dispatch-dark` class that overrides theme variables for the dark aviation look on the dispatch page only

### Files Summary

| Action | File |
|--------|------|
| Create | `supabase/functions/aviation-data/index.ts` |
| Create | `supabase/config.toml` |
| Create | `src/integrations/supabase/client.ts` |
| Create | 6 files in `src/lib/dispatch/` |
| Create | 3 hooks in `src/hooks/` |
| Create | 8 components in `src/components/dispatch/` |
| Create | `src/pages/DispatchPage.tsx` |
| Modify | `src/App.tsx` -- add route |
| Modify | `src/components/AppSidebar.tsx` -- add nav item |
| Modify | `src/components/aeroplan/MetarRibbon.tsx` -- add dispatch button |
| Modify | `tailwind.config.ts` -- add status colors + scroll animation |
| Modify | `src/index.css` -- add status variables + dispatch dark scope |

