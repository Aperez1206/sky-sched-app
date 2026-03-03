import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParsedMetar } from "@/lib/dispatch/metar-parser";
import type { WeatherMinimum } from "@/lib/dispatch/weather-minimums";
import { getWorstCrosswind, getWorstWind } from "@/lib/dispatch/wind-calculations";
import type { WindComponent } from "@/lib/dispatch/wind-calculations";
import { CheckCircle, XCircle } from "lucide-react";

interface GoNoGoColumnProps {
  level: string;
  metar: ParsedMetar | null;
  minimums: WeatherMinimum[];
  windComponents: WindComponent[];
}

function evaluate(m: ParsedMetar, min: WeatherMinimum, worstXwind: number, worstWind: number) {
  const reasons: string[] = [];
  if (m.visibility !== null && m.visibility < min.visibility) reasons.push(`Vis ${m.visibility}<${min.visibility}`);
  if (m.ceiling !== null && m.ceiling < min.ceiling) reasons.push(`Ceil ${m.ceiling}<${min.ceiling}`);
  if (worstWind > min.maxWind) reasons.push(`Wind ${worstWind}>${min.maxWind}`);
  if (worstXwind > min.maxCrosswind) reasons.push(`XW ${worstXwind}>${min.maxCrosswind}`);
  return { go: reasons.length === 0, reasons };
}

export function GoNoGoColumn({ level, metar, minimums, windComponents }: GoNoGoColumnProps) {
  const worstXwind = getWorstCrosswind(windComponents);
  const worstWind = metar ? getWorstWind(metar.windSpeed ?? 0, metar.windGust ?? undefined) : 0;

  const allGo = metar ? minimums.every((op) => evaluate(metar, op, worstXwind, worstWind).go) : false;

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full shrink-0 ${metar ? (allGo ? "bg-status-go" : "bg-status-nogo") : "bg-muted-foreground/40"}`} />
          {level}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        {!metar ? (
          <p className="text-muted-foreground text-sm">Waiting…</p>
        ) : (
          <div className="space-y-1">
            {minimums.map((op, i) => {
              const result = evaluate(metar, op, worstXwind, worstWind);
              return (
                <div
                  key={i}
                  className={`flex items-start gap-1.5 rounded px-1.5 py-1 text-sm ${
                    result.go ? "bg-status-go/10" : "bg-status-nogo/10"
                  }`}
                >
                  {result.go ? (
                    <CheckCircle className="h-4 w-4 text-status-go shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-status-nogo shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{op.operation}</span>
                    {!result.go && (
                      <div className="text-status-nogo text-xs mt-0.5 truncate">
                        {result.reasons.join(" · ")}
                      </div>
                    )}
                  </div>
                  <span className={`font-bold shrink-0 ${result.go ? "text-status-go" : "text-status-nogo"}`}>
                    {result.go ? "GO" : "NO GO"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
