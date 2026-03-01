

# AeroPlan — Flight School Scheduling App for KOPF

A single-page flight school scheduling prototype for Opa-locka Executive Airport with live weather, a 24-hour visual timeline, booking flow, and authorization system.

---

## 1. Header Bar
- **Left:** AeroPlan logo with airport identifier (Opa-locka Executive · KOPF)
- **Center:** Day navigator with large date display, ‹/› arrows, smart labels (Today/Yesterday/Tomorrow), and a "Today" shortcut button
- **Right:** Live clock (HH:MM:SS), user card (Adrian Perez — Admin), orange pending badge (visible when pending bookings exist), and a "+ Book Flight" button

## 2. METAR Weather Ribbon
- Fetches live METAR data from aviationweather.gov for KOPF
- Displays flight category badge (VFR/MVFR/IFR/LIFR with color coding), winds, visibility, temp/dewpoint, altimeter, and raw METAR string
- Auto-refreshes every 5 minutes with manual refresh button and last-updated timestamp

## 3. Schedule Timeline Panel
- **Sticky column headers** for 9 aircraft (tail number, model, status badge, Edit Status button)
- **Vertical 24-hour timeline** at 72px/hour, scrollable within the viewport (no outer page scroll)
- Default scroll position at 7:00 AM; faint blue tint for 7AM–7PM operating hours
- Red "NOW" line for current time on today's date
- Subtle hour gridlines with sticky hour labels on the left
- Maintenance aircraft columns get a diagonal hatch overlay
- Status badges: Flying/Refueling get pulsing dots; Ground shows airport code

## 4. Booking Tiles on Timeline
- Rounded colored tiles matching flight type (5 types with distinct colors)
- Solid border = confirmed; dashed border = pending authorization
- Hover tooltip with full booking details (student, instructor, route, flight type, times)

## 5. Booking Flow (2-Step Modal)
- **Step 1 — Form:** Flight type (visual button grid), start/end date+time pickers (15-min increments, default +2hr duration), student/renter dropdown, aircraft dropdown (maintenance planes disabled), instructor dropdown, Local/XC toggle, route text input
- **Step 2 — Confirmation:** Summary card with colored header bar, all details displayed, "Confirm Booking ✓" and Back buttons

## 6. Aircraft Status Management
- Edit Status modal per aircraft to change between Flying, Ground (with airport code), Maintenance, Refueling
- Status changes immediately reflected in column headers and timeline overlays

## 7. Authorization System
- Admin/instructor bookings auto-confirmed; student bookings are pending
- Pending badge in header opens a modal listing all pending reservations
- Each pending item shows full details with Authorize (green) and Deny (red) buttons
- Authorizing converts dashed tile to solid; denying removes it

## 8. Legend Footer
- Color swatches for all 5 flight types plus a dashed "Pending Authorization" swatch
- "Scroll ↕↔ for full 24h" hint on the right

## 9. Sample Data
- ~10 pre-populated bookings across various aircraft, instructors, flight types, and time slots
- 2 pending student reservations to demonstrate the auth flow on load

## Design System
- Plus Jakarta Sans font throughout
- Light mode with slate-100 background, white cards, subtle shadows, 14–18px border radius
- Fixed viewport layout — only the timeline scrolls
- Synced horizontal scroll between column headers and timeline body

