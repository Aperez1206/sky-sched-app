import { useState, useEffect } from "react";

interface Runway {
  id: string;
  heading: number;
}

export function useRunways(icao: string) {
  const [runways, setRunways] = useState<Runway[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!icao) return;
    setLoading(true);
    fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aviation-data?action=runways&icao=${icao}`,
      { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
    )
      .then((r) => r.json())
      .then((data) => setRunways(data.runways || []))
      .catch(() => setRunways([]))
      .finally(() => setLoading(false));
  }, [icao]);

  return { runways, loading };
}
