import { useState, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plane, LocateFixed } from "lucide-react";
import { computeIcaoHex } from "@/lib/dispatch/icao-hex";
import type { AircraftStatus } from "@/hooks/use-fleet-status";

const BASE_LAT = 25.91;
const BASE_LON = -80.28;
const BASE_ZOOM = 10;

function calcBounds(positions: { lat: number; lon: number }[]) {
  if (positions.length === 0) return { lat: BASE_LAT, lon: BASE_LON, zoom: BASE_ZOOM };
  if (positions.length === 1) return { lat: positions[0].lat, lon: positions[0].lon, zoom: 12 };

  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  for (const p of positions) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;
  const span = Math.max(maxLat - minLat, maxLon - minLon);

  let zoom = BASE_ZOOM;
  if (span > 5) zoom = 5;
  else if (span > 2) zoom = 6;
  else if (span > 1) zoom = 7;
  else if (span > 0.5) zoom = 8;
  else if (span > 0.1) zoom = 9;
  else zoom = 10;

  const latOffset = zoom <= 6 ? 0.05 : zoom <= 8 ? 0.03 : 0.02;
  return { lat: Number((centerLat - latOffset).toFixed(3)), lon: Number(centerLon.toFixed(3)), zoom };
}

function buildUrl(hexFilter: string, lat: number, lon: number, zoom: number, followHex?: string) {
  let url = `https://globe.adsbexchange.com/?lat=${lat}&lon=${lon}&zoom=${zoom}&hideSidebar&hideButtons&icaoFilter=${hexFilter}`;
  if (followHex) {
    url += `&icao=${followHex}`;
  }
  return url;
}

interface FleetTrackerPanelProps {
  tailNumbers: string[];
  statuses?: Record<string, AircraftStatus>;
  onFocusTail?: (tail: string | null) => void;
}

export function FleetTrackerPanel({ tailNumbers, statuses, onFocusTail }: FleetTrackerPanelProps) {
  const [focusTail, setFocusTail] = useState<string>("all");
  const [homeOverride, setHomeOverride] = useState(false);
  const prevUrlRef = useRef<string>("");

  const allHexCodes = tailNumbers
    .map((t) => computeIcaoHex(t))
    .filter((h): h is string => h !== null);

  const iframeSrc = useMemo(() => {
    if (homeOverride) {
      return buildUrl(allHexCodes.join(","), BASE_LAT, BASE_LON, BASE_ZOOM);
    }
    if (focusTail === "all") {
      const flyingPositions: { lat: number; lon: number }[] = [];
      if (statuses) {
        for (const tail of tailNumbers) {
          const s = statuses[tail];
          if (s?.lat != null && s?.lon != null) {
            flyingPositions.push({ lat: s.lat, lon: s.lon });
          }
        }
      }
      const { lat, lon, zoom } = flyingPositions.length > 0
        ? calcBounds(flyingPositions)
        : { lat: BASE_LAT, lon: BASE_LON, zoom: BASE_ZOOM };
      return buildUrl(allHexCodes.join(","), lat, lon, zoom);
    } else {
      const hex = computeIcaoHex(focusTail);
      const s = statuses?.[focusTail];
      const lat = s?.lat ?? BASE_LAT;
      const lon = s?.lon ?? BASE_LON;
      return buildUrl(hex || "", lat - 0.02, lon, 11, hex || undefined);
    }
  }, [focusTail, homeOverride, allHexCodes, statuses, tailNumbers]);

  const effectiveSrc = useMemo(() => {
    if (iframeSrc !== prevUrlRef.current) {
      prevUrlRef.current = iframeSrc;
      return iframeSrc;
    }
    return prevUrlRef.current;
  }, [iframeSrc]);

  const handleFocusChange = useCallback((value: string) => {
    setFocusTail(value);
    setHomeOverride(false);
    prevUrlRef.current = "";
    onFocusTail?.(value === "all" ? null : value);
  }, [onFocusTail]);

  const handleCenter = useCallback(() => {
    setHomeOverride(true);
    prevUrlRef.current = "";
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-2 px-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-1.5">
          <Plane className="h-5 w-5" /> Fleet Tracker
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCenter} title="Center on Fleet">
            <LocateFixed className="h-4 w-4" />
          </Button>
          <Select value={focusTail} onValueChange={handleFocusChange}>
            <SelectTrigger className="w-[150px] h-8 text-sm">
              <SelectValue placeholder="All Aircraft" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              <SelectItem value="all">All Aircraft</SelectItem>
              {tailNumbers.map((tail) => (
                <SelectItem key={tail} value={tail}>
                  {tail}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-0">
        <iframe
          src={effectiveSrc}
          className="h-full w-full border-0"
          title="ADS-B Exchange Fleet Tracker"
          allow="fullscreen"
        />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-card flex items-center justify-end px-3">
          <span className="text-xs text-muted-foreground">Data by ADS-B Exchange</span>
        </div>
      </CardContent>
    </Card>
  );
}
