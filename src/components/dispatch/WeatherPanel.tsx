import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParsedMetar } from "@/lib/dispatch/metar-parser";
import { Cloud, Thermometer, Wind, Eye, Gauge, Mountain } from "lucide-react";

interface WeatherPanelProps {
  metar: ParsedMetar | null;
  loading: boolean;
  error: string | null;
}

function FlightCatBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    VFR: "bg-status-go text-primary-foreground",
    MVFR: "bg-status-caution text-primary-foreground",
    IFR: "bg-status-nogo text-destructive-foreground",
    LIFR: "bg-[hsl(300,70%,40%)] text-destructive-foreground",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-sm font-bold ${colors[cat] || "bg-muted text-muted-foreground"}`}>
      {cat}
    </span>
  );
}

export function WeatherPanel({ metar, loading, error }: WeatherPanelProps) {
  if (loading && !metar) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle className="text-lg">Weather Details</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-base">Loading METAR…</p></CardContent>
      </Card>
    );
  }

  if (error && !metar) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle className="text-lg">Weather Details</CardTitle></CardHeader>
        <CardContent><p className="text-destructive text-base">{error}</p></CardContent>
      </Card>
    );
  }

  if (!metar) return null;

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Weather Details</CardTitle>
          <FlightCatBadge cat={metar.flightCategory} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded bg-secondary p-3">
          <p className="font-mono text-sm leading-relaxed text-foreground break-all">{metar.raw}</p>
        </div>

        <div className="text-sm text-muted-foreground">
          Observed: {metar.observationTime}
        </div>

        <div className="grid grid-cols-2 gap-3 text-base">
          <InfoRow icon={<Wind className="h-5 w-5" />} label="Wind" value={
            metar.windDirection !== null
              ? `${metar.windDirection}° @ ${metar.windSpeed} kts${metar.windGust ? ` G${metar.windGust}` : ""}`
              : "Calm"
          } />
          <InfoRow icon={<Eye className="h-5 w-5" />} label="Visibility" value={`${metar.visibility} SM`} />
          <InfoRow icon={<Thermometer className="h-5 w-5" />} label="Temp" value={metar.temperature !== null ? `${metar.temperature}°C` : "—"} />
          <InfoRow icon={<Thermometer className="h-5 w-5" />} label="Dewpoint" value={metar.dewpoint !== null ? `${metar.dewpoint}°C` : "—"} />
          <InfoRow icon={<Gauge className="h-5 w-5" />} label="Altimeter" value={metar.altimeter !== null ? `${metar.altimeter} inHg` : "—"} />
          <InfoRow icon={<Mountain className="h-5 w-5" />} label="Density Alt" value={metar.densityAltitude !== null ? `${metar.densityAltitude} ft` : "—"} />
        </div>

        {metar.cloudLayers.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Cloud className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Clouds</span>
            </div>
            <div className="space-y-1">
              {metar.cloudLayers.map((l, i) => (
                <div key={i} className="flex justify-between text-base font-mono">
                  <span className="text-muted-foreground">{l.cover}</span>
                  <span>{l.altitude.toLocaleString()} ft</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {metar.ceiling !== null && (
          <div className="rounded bg-secondary px-3 py-2 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Ceiling</span>
            <span className="text-lg font-bold font-mono">{metar.ceiling.toLocaleString()} ft</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-mono text-base">{value}</div>
      </div>
    </div>
  );
}
