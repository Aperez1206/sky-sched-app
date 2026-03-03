import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParsedMetar } from "@/lib/dispatch/metar-parser";
import { calculateWindComponents, type WindComponent } from "@/lib/dispatch/wind-calculations";
import { KOPF_OPS_RUNWAYS, type OpsMode } from "@/lib/dispatch/airports";
import { ArrowUp, ArrowDown, ArrowLeftRight } from "lucide-react";

interface Runway {
  id: string;
  heading: number;
}

interface WindPanelProps {
  airport: string;
  runways: Runway[];
  metar: ParsedMetar | null;
  opsMode: OpsMode;
  loading: boolean;
}

export function WindPanel({ airport, runways, metar, opsMode, loading }: WindPanelProps) {
  let displayRunways = runways;
  if (airport === "KOPF") {
    const allowed = KOPF_OPS_RUNWAYS[opsMode];
    displayRunways = runways.filter((r) => allowed.includes(r.id));
  }

  const components: WindComponent[] = displayRunways.map((r) => {
    if (!metar || metar.windDirection === null || metar.windSpeed === null) {
      return { runwayId: r.id, runwayHeading: r.heading, headwind: 0, crosswind: 0, favorable: true };
    }
    const calc = calculateWindComponents(r.heading, metar.windDirection, metar.windSpeed, metar.windGust ?? undefined);
    return {
      runwayId: r.id,
      runwayHeading: r.heading,
      ...calc,
      favorable: calc.headwind > 0 && calc.crosswind <= 15,
    };
  });

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          Runway Wind Components
          {airport === "KOPF" && (
            <span className="ml-2 text-sm text-muted-foreground font-normal">{opsMode} OPS</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading runways…</p>
        ) : displayRunways.length === 0 ? (
          <p className="text-muted-foreground text-sm">No runway data available</p>
        ) : (
          <div className="space-y-1.5">
            {components.map((c) => (
              <div
                key={c.runwayId}
                className={`rounded-lg border p-2 ${
                  c.favorable ? "border-status-go/30 bg-status-go/5" : "border-border bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                   <span className="font-mono font-bold text-base">RWY {c.runwayId}</span>
                   <span className="font-mono text-sm text-muted-foreground">{c.runwayHeading}°</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <WindValue
                    icon={c.headwind >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    label={c.headwind >= 0 ? "Headwind" : "Tailwind"}
                    value={Math.abs(c.headwind)}
                    gust={c.gustHeadwind !== undefined ? Math.abs(c.gustHeadwind) : undefined}
                    warn={c.headwind < 0}
                  />
                  <WindValue
                    icon={<ArrowLeftRight className="h-4 w-4" />}
                    label="Crosswind"
                    value={c.crosswind}
                    gust={c.gustCrosswind}
                    warn={c.crosswind > 15}
                  />
                  <div className="flex flex-col items-center">
                     <span className="text-xs text-muted-foreground mb-1">Status</span>
                     <span className={`text-sm font-bold ${c.favorable ? "text-status-go" : "text-status-caution"}`}>
                      {c.favorable ? "FAVORED" : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WindValue({
  icon,
  label,
  value,
  gust,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  gust?: number;
  warn: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <div className={`flex items-center gap-1 font-mono text-lg font-bold ${warn ? "text-status-nogo" : "text-foreground"}`}>
        {icon}
        {value}
        {gust !== undefined && <span className="text-status-caution">G{gust}</span>}
      </div>
      <span className="text-xs text-muted-foreground">kts</span>
    </div>
  );
}
