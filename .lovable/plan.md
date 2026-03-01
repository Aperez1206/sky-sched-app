

# Drag-to-Create Booking on Timeline

## Overview
Add click-and-drag interaction on empty timeline cells to create a reservation. Clicking or dragging vertically within an aircraft column creates a time selection preview, then opens the BookingModal pre-filled with the selected aircraft, date, start time, and end time.

## How It Works

1. **Mouse down** on empty timeline area: record the aircraft column (by x-position) and start time (by y-position, snapped to 15-min increments)
2. **Mouse move** (while held): render a semi-transparent preview rectangle that grows/shrinks as the user drags up or down within the same column
3. **Mouse up**: finalize the selection. If the drag was minimal (just a click), default to a 1-hour block. Open the BookingModal pre-filled with the aircraft tail, start time, and end time
4. **Escape / mouse leave**: cancel the drag

## Changes

### 1. Timeline.tsx — Add drag state and handlers
- Add `useState` for drag state: `{ dragging, colIndex, startY, currentY }` 
- Add `onMouseDown` on the grid area (not on booking tiles — use `stopPropagation` on tiles)
- Convert mouse Y position to time (accounting for scroll offset), snap to 15-min increments
- On `mousemove`, update the preview rectangle
- On `mouseup`, calculate aircraft tail + start/end times, call a new `onDragCreate` callback
- Render a translucent blue preview rectangle during drag

### 2. Timeline.tsx — Update props interface
- Add `onDragCreate: (tail: string, startDate: Date, endDate: Date) => void` prop

### 3. BookingModal.tsx — Accept pre-filled values
- Add optional `initialData` prop: `{ aircraftTail, startDate, endDate }`
- When provided, pre-populate the aircraft, start/end date+time fields on mount
- Reset when modal closes

### 4. Index.tsx — Wire up drag-to-create
- Add `handleDragCreate` callback that sets initial data and opens the BookingModal
- Pass `onDragCreate` to Timeline and `initialData` to BookingModal

## Technical Details
- Time snapping: `Math.round((mouseY / HOUR_HEIGHT) * 4) / 4` gives 15-min increments
- Column detection: `Math.floor((mouseX - LEFT_GUTTER) / COL_WIDTH)` gives aircraft index
- Prevent drag on existing booking tiles via `e.stopPropagation()` on tile `onMouseDown`
- Minimum block size: 1 hour (if user just clicks without dragging)
- Preview rectangle uses the first flight type color at 20% opacity as a neutral selection indicator
- The `cursor: crosshair` style is applied to empty grid areas to hint at drag capability

