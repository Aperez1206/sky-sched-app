import { useState, useEffect, useCallback, useRef } from "react";
import { parseMetarJson, type ParsedMetar } from "@/lib/dispatch/metar-parser";

const REFRESH_INTERVAL = 5 * 60 * 1000;

export function useDispatchMetar(icao: string) {
  const [metar, setMetar] = useState<ParsedMetar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(300);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const countdownRef = useRef<ReturnType<typeof setInterval>>();

  const fetchMetar = useCallback(async () => {
    if (!icao) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aviation-data?action=metar&icao=${icao}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      const parsed = parseMetarJson(json);
      if (parsed) {
        setMetar(parsed);
      } else {
        setError("No METAR data available");
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch METAR");
    } finally {
      setLoading(false);
      setSecondsUntilRefresh(300);
    }
  }, [icao]);

  useEffect(() => {
    fetchMetar();
    timerRef.current = setInterval(fetchMetar, REFRESH_INTERVAL);
    countdownRef.current = setInterval(() => {
      setSecondsUntilRefresh((s) => (s > 0 ? s - 1 : 300));
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [fetchMetar]);

  return { metar, loading, error, secondsUntilRefresh, refresh: fetchMetar };
}
