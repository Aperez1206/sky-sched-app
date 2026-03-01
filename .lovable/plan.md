

# METAR Age Indicator Color Update

Update the METAR age indicator in `MetarRibbon.tsx` to use simpler thresholds:
- **Green**: Less than 1 hour old
- **Amber**: 1 hour or older

Change the color logic from the current 3-tier (10min/30min) to a 2-tier (1 hour) system.

