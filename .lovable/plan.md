

## Fix: Restore Contained Scrollable Timeline

The problem is that after moving the Header into `AppLayout`, the layout no longer constrains the content area's height, so the Timeline expands to its full 24-hour height instead of being a fixed scrollable window.

### Root Cause

In `AppLayout.tsx`, the outer wrapper uses `min-h-screen` and the content column doesn't enforce a fixed height with overflow containment. The `<Outlet />` (Index page) renders with `h-full` but there's no height constraint from the parent, so `h-full` resolves to auto and the timeline expands fully.

### Fix

**`src/components/AppLayout.tsx`** — Change the layout to use `h-screen` and ensure the content area fills remaining space with `overflow-hidden`:

- Outer div: `min-h-screen` → `h-screen overflow-hidden`
- Content column (the one containing Header + Outlet): ensure it uses `flex-1 min-h-0 overflow-hidden` so the Outlet is constrained

```
<div className="h-screen flex w-full overflow-hidden">
  <AppSidebar />
  <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
    <Header ... />
    <div className="flex-1 min-h-0 overflow-hidden">
      <Outlet />
    </div>
  </div>
</div>
```

This single change restores the fixed viewport behavior where the outer page is static and only the timeline scrolls internally, defaulting to 7 AM on load.

### Files to modify

| File | Change |
|------|--------|
| `src/components/AppLayout.tsx` | Fix height constraints: `h-screen overflow-hidden`, wrap `<Outlet />` in a `flex-1 min-h-0 overflow-hidden` container |

