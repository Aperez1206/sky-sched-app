

## Hobbs/Tach Time Tracker & Person Detail View

This is a multi-part feature covering database schema, check-out/check-in workflow, and a person detail page with session logs.

### Database Changes

**New table: `flight_sessions`** — logs each completed flight with times and instruction data.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| reservation_id | uuid FK → flight_reservations | nullable (manual sessions) |
| aircraft_tail | text | not null |
| student_id | uuid FK → profiles | nullable |
| instructor_id | uuid FK → profiles | nullable |
| checked_out_by | uuid FK → profiles | dispatcher who checked out |
| checked_out_at | timestamptz | when keys given |
| checked_in_at | timestamptz | nullable, set on check-in |
| hobbs_in | numeric | auto-filled from prior session's hobbs_out for same aircraft |
| hobbs_out | numeric | nullable, entered on check-in |
| tach_in | numeric | auto-filled from prior session's tach_out for same aircraft |
| tach_out | numeric | nullable, entered on check-in |
| flight_instruction | numeric | nullable, pre-filled with hobbs difference when instructor present |
| ground_instruction | numeric | nullable, optional |
| status | text | 'checked_out' or 'completed' |

**RLS policies:**
- Authenticated can read all sessions
- Admin/dispatch can insert and update
- Students/instructors can read their own sessions

**DB function: `get_last_times(aircraft_tail text)`** — returns the most recent hobbs_out and tach_out for a given aircraft, used to auto-fill hobbs_in and tach_in on check-out.

Also update `flight_reservations` to add a `checkout_status` column (text, default null) with values: null (not checked out), 'checked_out', 'checked_in'.

### UI: Check-Out / Check-In on Reservations

**Where it appears:** On the schedule Timeline, booking hover cards and/or a booking detail view will show "Check Out" and "Check In" buttons for admin/dispatch users.

**Check-Out flow (modal):**
- Dispatcher confirms aircraft, student, instructor, and reservation details
- Confirms weather minimums and W&B are within limits (checkbox acknowledgment)
- Creates a `flight_sessions` row with status='checked_out', auto-fills hobbs_in/tach_in from the last session for that aircraft
- Updates the reservation's `checkout_status` to 'checked_out'

**Check-In flow (modal):**
- Dispatcher enters hobbs_out and tach_out
- Hobbs Time and Tach Time are computed live (out minus in)
- If instructor is present: Flight Instruction field pre-filled with hobbs difference, Ground Instruction field (optional)
- On confirm: updates the session row with times, sets status='completed', updates reservation checkout_status to 'checked_in'

### UI: Person Detail Page

**Routing:** Add `/people/:personId` route. Clicking a row in the People table navigates to this detail page.

**Layout:** Sub-header with person name/role, then three tabs:
- **Sessions** — Table of flight_sessions for that person (as student or instructor). Columns: Date, Aircraft, Hobbs In/Out, Tach In/Out, Flight Time, Tach Time, and either "Dual Received" (student view) or "Dual Given" (instructor view) showing the flight_instruction value. Ground instruction shown if present.
- **Courses** — Placeholder for future course tracking
- **Documents** — Placeholder for future document management

### Files to create/modify

| File | Change |
|------|--------|
| Migration SQL | Create `flight_sessions` table, add `checkout_status` to `flight_reservations`, create `get_last_times` function, RLS policies |
| `src/components/aeroplan/CheckOutModal.tsx` | New — check-out confirmation modal |
| `src/components/aeroplan/CheckInModal.tsx` | New — check-in modal with hobbs/tach entry and instruction fields |
| `src/components/aeroplan/Timeline.tsx` | Add Check Out / Check In buttons to booking hover cards (admin/dispatch only) |
| `src/pages/PeoplePage.tsx` | Make table rows clickable, navigate to person detail |
| `src/pages/PersonDetailPage.tsx` | New — detail view with Sessions/Courses/Documents tabs |
| `src/App.tsx` | Add `/people/:personId` route |
| `src/hooks/useFlightSessions.ts` | New — queries flight_sessions for a person |

### Technical Notes

- Hobbs/Tach values stored as `numeric` to support decimal hours (e.g., 1234.5)
- Flight time = hobbs_out - hobbs_in; Tach time = tach_out - tach_in
- The "last times" function queries: `SELECT hobbs_out, tach_out FROM flight_sessions WHERE aircraft_tail = $1 AND status = 'completed' ORDER BY checked_in_at DESC LIMIT 1`
- Person identification in the People page will use profiles table IDs for navigation

