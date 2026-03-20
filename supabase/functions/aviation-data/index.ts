import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AIRPORT_COORDS: Record<string, { lat: number; lon: number }> = {
  KOPF: { lat: 25.907, lon: -80.278 },
  X14: { lat: 26.742, lon: -81.438 },
  KPHK: { lat: 26.785, lon: -80.693 },
  KIMM: { lat: 26.433, lon: -81.401 },
  "2IS": { lat: 26.742, lon: -81.050 },
  KAPF: { lat: 26.152, lon: -81.775 },
};

function findNearestAirport(lat: number, lon: number): string | null {
  const MAX_DIST = 5 / 60;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const [icao, coord] of Object.entries(AIRPORT_COORDS)) {
    const d = Math.sqrt((lat - coord.lat) ** 2 + (lon - coord.lon) ** 2);
    if (d < bestDist) {
      bestDist = d;
      best = icao;
    }
  }
  return bestDist <= MAX_DIST ? best : null;
}

const RUNWAY_DATA: Record<string, Array<{ id: string; heading: number }>> = {
  KOPF: [
    { id: "09L", heading: 92 },
    { id: "27R", heading: 272 },
    { id: "09R", heading: 92 },
    { id: "27L", heading: 272 },
    { id: "12", heading: 122 },
    { id: "30", heading: 302 },
  ],
  X14: [
    { id: "01", heading: 13 },
    { id: "19", heading: 193 },
  ],
  KPHK: [
    { id: "09", heading: 90 },
    { id: "27", heading: 270 },
    { id: "14", heading: 140 },
    { id: "32", heading: 320 },
  ],
  KIMM: [
    { id: "09", heading: 90 },
    { id: "27", heading: 270 },
    { id: "18", heading: 180 },
    { id: "36", heading: 360 },
  ],
  "2IS": [
    { id: "13", heading: 130 },
    { id: "31", heading: 310 },
  ],
  KAPF: [
    { id: "05", heading: 50 },
    { id: "23", heading: 230 },
    { id: "14", heading: 140 },
    { id: "32", heading: 320 },
  ],
};

const NEAREST_METAR: Record<string, string> = {
  X14: "KAPF",
  "2IS": "KAPF",
  KIMM: "KAPF",
  KPHK: "KPBI",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "fleet-status") {
      const hexcodes = url.searchParams.get("hexcodes")?.split(",").filter(Boolean) || [];
      if (hexcodes.length === 0) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = await Promise.all(
        hexcodes.map(async (hex) => {
          try {
            const res = await fetch(`https://api.airplanes.live/v2/hex/${hex}`);
            const data = await res.json();
            const ac = data.ac?.[0];
            if (!ac) {
              return { hex, flying: false, nearestAirport: null };
            }
            const altBaro = ac.alt_baro;
            const flying = altBaro !== "ground" && altBaro !== 0 && typeof altBaro === "number" && altBaro > 0;
            let nearestAirport: string | null = null;
            if (!flying && typeof ac.lat === "number" && typeof ac.lon === "number") {
              nearestAirport = findNearestAirport(ac.lat, ac.lon);
            }
            return { hex, flying, nearestAirport, lat: ac.lat ?? null, lon: ac.lon ?? null };
          } catch (e) {
            console.error(`[fleet-status] Error fetching ${hex}:`, e.message);
            return { hex, flying: false, nearestAirport: null };
          }
        })
      );

      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const icao = url.searchParams.get("icao")?.toUpperCase();

    if (!icao) {
      return new Response(JSON.stringify({ error: "Missing icao parameter" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "metar") {
      const metarIcao = NEAREST_METAR[icao] || icao;
      const metarUrl = `https://aviationweather.gov/api/data/metar?ids=${metarIcao}&format=json`;

      let res: Response | null = null;
      let lastErr = "";
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          res = await fetch(metarUrl);
          break;
        } catch (e) {
          lastErr = e.message || String(e);
          console.warn(`[metar] Attempt ${attempt + 1} failed: ${lastErr}`);
          if (attempt < 2) await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        }
      }
      if (!res) {
        return new Response(JSON.stringify({ error: lastErr }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const text = await res.text();
      if (!res.ok) {
        console.error("[metar] API error:", res.status, text.substring(0, 200));
        return new Response(JSON.stringify({ error: `Weather API returned ${res.status}` }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!text || text.trim() === "") {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (text.trim().startsWith("<!") || text.trim().startsWith("<html")) {
        console.error("[metar] Got HTML instead of JSON:", text.substring(0, 200));
        return new Response(JSON.stringify({ error: "Weather API returned HTML instead of JSON" }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const data = JSON.parse(text);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (_e) {
        console.error("[metar] JSON parse failed:", text.substring(0, 200));
        return new Response(JSON.stringify({ error: "Invalid JSON from weather API" }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "runways") {
      const runways = RUNWAY_DATA[icao] || [];
      return new Response(JSON.stringify({ icao, runways }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
