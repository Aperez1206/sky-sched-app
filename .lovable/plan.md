

## Maintenance as Time-Bound Reservations + Role Foundation

### What changes

**1. New "maintenance" flight type in data model**

Add a `maintenance` entry to `FLIGHT_TYPES` with a distinct color (amber/orange). Add a `type` field to the `Booking` interface: `'flight' | 'maintenance'`. Maintenance bookings only need `aircraftTail`, `startDate`, `endDate`, and an optional `notes` field -- no student, instructor, flight area, or route required.

**2. Remove full-column maintenance hatching from Timeline**

The current `hatch-pattern` CSS applied to aircraft columns when `status === 'maintenance'` will be removed. Maintenance will show as a normal time-block tile on the timeline, styled with the maintenance color. The aircraft status ("Maintenance" badge in header) can remain for quick reference but no longer blocks the whole column visually.

**3. Update BookingModal to support maintenance mode**

- Add a toggle/option at the top: "Flight Booking" vs "Maintenance" (admin-only in the future).
- When "Maintenance" is selected, hide student, instructor, flight area, and route fields. Show only aircraft picker, date/time range, and an optional notes/reason field.
- The confirmation step adapts to show the simplified maintenance summary.

**4. Role system foundation**

- Add a `UserRole` type: `'admin' | 'instructor' | 'student' | 'dispatch'`.
- Create a simple `useCurrentUser` hook that returns `{ name: 'Chief Administrator', role: 'admin' }` for now (hardcoded, no auth yet).
- Gate the "Maintenance" booking type behind `role === 'admin'`.
- The `bookedBy` field on `Booking` already exists; maintenance bookings will be set to `'admin'`.

**5. Legend update**

Add the maintenance color swatch to the Legend component.

### Files to modify

- `src/data/aeroplan.ts` -- add `type` to `Booking`, add maintenance flight type, add `UserRole`
- `src/components/aeroplan/BookingModal.tsx` -- add maintenance mode toggle, conditional field visibility
- `src/components/aeroplan/Timeline.tsx` -- remove hatch-pattern logic, render maintenance tiles properly
- `src/components/aeroplan/Legend.tsx` -- add maintenance to legend
- `src/hooks/useCurrentUser.ts` -- new file, returns hardcoded admin user
- `src/pages/Index.tsx` -- wire useCurrentUser, pass role to BookingModal

### Technical details

The `Booking` interface gets a new optional `type` field defaulting to `'flight'`. Maintenance bookings set `type: 'maintenance'`, `flightTypeId: 'maintenance'`, `studentName: ''`, `instructorName: ''`. The timeline tile for maintenance shows "Maintenance" label + optional notes instead of student/instructor info. The hatch-pattern class on the column div is removed entirely -- maintenance is communicated through individual time-block reservations, not column-wide styling.

