

## Persistent Global Header, Dispatch Toolbar, and Tooltip Fix

### 1. Move AeroPlan Header to AppLayout (shared across all pages)

Extract the `Header` component from `Index.tsx` into `AppLayout.tsx` so it renders above `<Outlet />` on every page. The Header needs state for pending count, booking modal, and pending modal -- these will be lifted to `AppLayout` or managed via context. For now, pass `onBookFlight` that navigates to `/` and triggers the booking modal (via a URL search param like `?book=1`).

**AppLayout.tsx** changes:
- Import and render `Header` above `<Outlet />`
- Add state for `pendingCount` (derived from bookings -- for now keep it simple, pass 0 on non-schedule pages or lift bookings state)
- `onBookFlight`: use `useNavigate('/?book=1')` to navigate to schedule and open modal
- `onOpenPending`: use `useNavigate('/?pending=1')`

**Index.tsx** changes:
- Remove `<Header />` from the page (it's now in layout)
- Read `?book=1` and `?pending=1` search params to auto-open modals on mount
- Remove `h-screen` in favor of `h-full` since layout now handles outer structure

### 2. Keep page sub-headers on People, Aircraft, Billing

These pages already have their own lightweight headers with icon + title. Keep them as-is but they no longer need the sidebar toggle button (that's in the global header now).

### 3. Refactor Dispatch page

**Remove** the dispatch `Header` component's full header. Replace it with a **thin toolbar row** that contains only:
- Airport selector dropdown
- OPS mode toggle (09/27)
- Refresh countdown timer
- Refresh button
- Settings button

This toolbar sits directly above the GO/NO-GO grid inside `DispatchPage.tsx`, styled as a compact bar (`py-1.5`, `bg-card`, `rounded-xl`, matching the card style).

**DispatchPage.tsx** changes:
- Remove `<Header />` import
- Add inline toolbar or a new `DispatchToolbar` component with the controls
- Remove the `dispatch/Header.tsx` usage (can repurpose the file as `DispatchToolbar.tsx`)

### 4. Fix sidebar tooltip z-index

The tooltip already has `z-[100]` but the sidebar itself uses `z-10`. The issue is likely that the main content area's cards/panels create a new stacking context. Fix by ensuring the sidebar's fixed container uses a higher z-index.

**sidebar.tsx** line 195: Change `z-10` to `z-50` on the sidebar's fixed `div` so it and its tooltips layer above content.

### Files to modify

| File | Change |
|------|--------|
| `src/components/AppLayout.tsx` | Add shared `Header`, lift booking/pending navigation |
| `src/components/aeroplan/Header.tsx` | Make it work standalone in layout (remove sidebar toggle if needed, or keep it) |
| `src/pages/Index.tsx` | Remove `<Header />`, read URL params for auto-open modals, use `h-full` |
| `src/pages/PeoplePage.tsx` | Change `h-screen` to `h-full` |
| `src/pages/AircraftPage.tsx` | Change `h-screen` to `h-full` |
| `src/pages/BillingPage.tsx` | Change `h-screen` to `h-full` |
| `src/components/dispatch/Header.tsx` | Rename/refactor to `DispatchToolbar` -- compact row with airport, OPS, refresh, settings only |
| `src/pages/DispatchPage.tsx` | Replace `<Header>` with `<DispatchToolbar>`, remove title/branding |
| `src/components/ui/sidebar.tsx` | Bump fixed sidebar `z-10` to `z-50` |

