

## Add Sidebar Navigation with Pages

### Layout
- Wrap the app in `SidebarProvider` with a collapsible sidebar (collapsed by default using `defaultOpen={false}`)
- Sidebar trigger button sits in the Header, top-left next to the AeroPlan logo
- Sidebar uses `collapsible="icon"` so it shrinks to icons when collapsed

### Sidebar Items
| Route | Icon | Page |
|-------|------|------|
| `/` | CalendarDays | Schedule (current page) |
| `/people` | Users | People |
| `/aircraft` | Plane | Aircraft |
| `/billing` | CreditCard | Billing |

Active route highlighted via `NavLink`.

### New Pages

**People Page (`/people`)**
- Three sub-tabs: Staff, Instructors, Students
- **Staff tab**: Table with demo staff (dispatchers, admin assistants, etc.) showing name, role, email, status
- **Instructors tab**: Uses existing `INSTRUCTORS` data, shows name, certs, students assigned, status
- **Students tab**: Table with ~8 demo students showing name, enrolled course, assigned instructor, progress, status
- Demo data generated in `src/data/people.ts`

**Aircraft Page (`/aircraft`)**
- Table view of all aircraft from existing `AIRCRAFT` data showing tail number, model, status, last airport
- Reuses existing data, simple table layout

**Billing Page (`/billing`)**
- "Under Construction" placeholder with a construction icon and message

### Files to Create/Modify
- `src/App.tsx` — wrap in `SidebarProvider`, add routes
- `src/components/AppSidebar.tsx` — sidebar component
- `src/components/aeroplan/Header.tsx` — add `SidebarTrigger` next to logo
- `src/pages/Index.tsx` — no major changes, just works within new layout
- `src/pages/PeoplePage.tsx` — new, with Staff/Instructors/Students tabs
- `src/pages/AircraftPage.tsx` — new, table of aircraft
- `src/pages/BillingPage.tsx` — new, under construction placeholder
- `src/data/people.ts` — demo students, staff with course enrollments
- `src/components/AppLayout.tsx` — layout wrapper with sidebar + header pattern

