import { useState, useEffect, useRef, useCallback } from "react";
import { computeIcaoHex } from "@/lib/dispatch/icao-hex";

export interface AircraftStatus {
  flying: boolean;
  nearestAirport: string | null;
  lat: number | null;
  lon: number | null;
}

const POLL_INTERVAL = 30_000;

export function useFleetStatus(tailNumbers: string[]) {
  const [statuses, setStatuses] = useState<Record<string, AircraftStatus>>({});
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchStatuses = useCallback(async () => {
    const hexMap: Record<string, string> = {};
    for (const tail of tailNumbers) {
      const hex = computeIcaoHex(tail);
      if (hex) hexMap[tail] = hex;
    }
    const hexCodes = Object.values(hexMap);
    if (hexCodes.length === 0) return;

    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aviation-data?action=fleet-status&hexcodes=${hexCodes.join(",")}`;
      const res = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });

      if (!res.ok) {
        console.error("[fleet-status] Error:", res.status);
        return;
      }

      const results: Array<{
        hex: string;
        flying: boolean;
        nearestAirport: string | null;
        lat: number | null;
        lon: number | null;
      }> = await res.json();

      const newStatuses: Record<string, AircraftStatus> = {};
      for (const [tail, hex] of Object.entries(hexMap)) {
        const match = results.find((r) => r.hex === hex);
        if (match) {
          newStatuses[tail] = {
            flying: match.flying,
            nearestAirport: match.nearestAirport,
            lat: match.lat,
            lon: match.lon,
          };
        } else {
          newStatuses[tail] = { flying: false, nearestAirport: null, lat: null, lon: null };
        }
      }
      setStatuses(newStatuses);
    } catch (err) {
      console.error("[fleet-status] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [tailNumbers]);

  useEffect(() => {
    fetchStatuses();
    intervalRef.current = setInterval(fetchStatuses, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchStatuses]);

  return { statuses, loading };
}
