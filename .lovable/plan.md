

## Move Date Navigation Into the Tab Bar Row

Merge the date scroller into the same horizontal row as the tabs to save vertical space.

### Layout

```text
|  < Sunday, March 1 >  [Today]  |  Aircraft | Instructors | Rooms | Custom  |
```

- Date nav sits on the left side of the row (arrows + date label + optional "Today" button)
- Tabs sit on the right side, keeping their current equal-width behavior within their container
- The whole row lives in a single `flex` container with `justify-between`

### Changes

**`src/pages/Index.tsx`**
- Remove the separate date nav `div` with `border-b`
- Wrap the date controls and `Tabs` in one `flex items-center` row
- Date nav on the left (~40% width), tabs container on the right (~60% width)
- Tabs keep `flex-1` sizing within their container

This eliminates one full row of vertical space, giving more room to the timeline.

