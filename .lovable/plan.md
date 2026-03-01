

# Multi-View Tabs: Aircraft, Instructors, Rooms, and Custom

## Overview
Add a tab bar above the scheduling window with 4 tabs: **Aircraft**, **Instructors**, **Rooms**, and **Custom**. Each tab shows the same 24-hour timeline layout but with different column entities. The Custom tab lets users pick any combination of aircraft, instructors, and rooms to display side by side.

## Data Changes (`src/data/aeroplan.ts`)
- Add a `Room` interface (`{ name: string; label: string }`) and a `ROOMS` constant:
  - `204 - Conference`, `206`, `Google Meet`, `MDAD Office`
- Add a generic `ScheduleColumn` type that unifies aircraft, instructors, and rooms into a common shape (`{ id: string; title: string; subtitle: string; type: 'aircraft' | 'instructor' | 'room' }`) so the Timeline can render any entity type
- Update `Booking` to add optional `roomName` field and make `aircraftTail`/`instructorName` work across views

## Generalize Timeline (`src/components/aeroplan/Timeline.tsx`)
- Replace the `aircraft: Aircraft[]` prop with `columns: ScheduleColumn[]` — a generic array of column definitions
- Column headers render `title` (e.g., tail number, instructor name, or room name) and `subtitle` (model, certs, or room label)
- Aircraft-specific features (status badge, "Edit Status" button) only render when `column.type === 'aircraft'`
- Drag-to-create callback changes from `(tail, start, end)` to `(columnId, columnType, start, end)` so the booking modal knows what was selected
- Booking filtering adapts: match by `aircraftTail` for aircraft columns, `instructorName` for instructor columns, `roomName` for room columns

## Tab Bar (`src/pages/Index.tsx`)
- Add a `Tabs` component (from `@radix-ui/react-tabs`, already installed) above the scheduling card
- 4 tabs: `aircraft` (default), `instructors`, `rooms`, `custom`
- Each tab computes the appropriate `ScheduleColumn[]` array and passes it to the shared `Timeline`
- **Custom tab**: shows a multi-select picker (checkboxes) for aircraft, instructors, and rooms. Selected items are concatenated into one `columns` array, so columns from different types appear side by side in a single scrollable timeline

## Index.tsx Orchestration
- Add `activeTab` state
- Add `customSelection` state (`{ aircraft: string[], instructors: string[], rooms: string[] }`)
- Build `columns` based on active tab
- Pass unified `columns` to `Timeline`
- Update `handleDragCreate` to handle the new column type info

## Custom Tab Picker
- A small horizontal bar of checkboxes grouped by category (Aircraft / Instructors / Rooms)
- Selecting items adds their columns to the timeline view
- "Select All" toggle per category for convenience

