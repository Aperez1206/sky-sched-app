

## Fix Sidebar Tooltip z-index & Match Dispatch to Light Theme

Two issues to address:

### 1. Sidebar tooltip appearing behind content

The sidebar tooltips use `z-50` but the main content area overlaps them. Fix by adding a higher z-index to the `TooltipContent` component in `src/components/ui/tooltip.tsx` -- change `z-50` to `z-[100]` so tooltips always render on top.

### 2. Restyle Dispatch page to match light theme

Remove the `.dispatch-dark` wrapper class from `DispatchPage.tsx` so the dispatch page uses the same light theme (slate-100 background, white cards, Plus Jakarta Sans) as the rest of the app. The scoped dark CSS variables in `index.css` under `.dispatch-dark` can be kept (harmless) or removed.

**Files to modify:**

| File | Change |
|------|--------|
| `src/components/ui/tooltip.tsx` | Change `z-50` to `z-[100]` on TooltipContent |
| `src/pages/DispatchPage.tsx` | Remove `dispatch-dark` class from root div, change `h-screen` to `h-full` to fit within the layout properly |
| `src/components/dispatch/Header.tsx` | Adjust header styling to match app's light theme (white bg, slate text) |
| `src/components/dispatch/FleetStatusRibbon.tsx` | Ensure ribbon uses light theme card styling |
| `src/index.css` | Optionally remove or keep `.dispatch-dark` block (no functional impact once unused) |

