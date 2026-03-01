

# Plan: Make AeroPlan Functional and Clean

## Changes Required

### 1. Remove demo/sample data
- Clear `SAMPLE_BOOKINGS` array in `src/data/aeroplan.ts` so the schedule starts empty
- Keep the aircraft fleet, instructors, students, and flight types as reference data (these are real)

### 2. Remove all emojis
- **MetarRibbon.tsx** (line 31-34): Replace `💨`, `👁`, `🌡`, `⏱` with lucide icons (Wind, Eye, Thermometer, Gauge)
- **StatusModal.tsx** (line 15-18): Replace `✈`, `🛬`, `🔧`, `⛽` with text-only labels ("Flying", "Ground", "Maintenance", "Refueling")
- **Timeline.tsx** (line 122): Replace `⏳` text with "Pending" only

### 3. Fix METAR data fetching
The aviationweather.gov API is failing due to CORS restrictions from the preview domain. Fix by:
- Adding a CORS proxy approach using `allorigins.win` or similar public proxy as a fallback
- Keeping the direct fetch as primary attempt, falling back to proxy if it fails

### 4. Replace tooltip with hover detail card
- In `Timeline.tsx`, replace the small `Tooltip` on booking tiles with a `HoverCard` component that shows a richer detail window with all flight information (flight type, student, instructor, aircraft, route, times, area, status) in a nicely formatted card

### 5. Test end-to-end
After implementation, use browser tools to:
- Verify empty schedule loads correctly
- Create a new booking via the Book Flight modal
- Confirm it appears on the timeline
- Test the hover detail card on the booking tile
- Check METAR ribbon displays data or graceful fallback
- Verify no emojis remain anywhere

