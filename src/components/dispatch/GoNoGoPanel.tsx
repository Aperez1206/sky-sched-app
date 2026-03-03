import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ParsedMetar } from "@/lib/dispatch/metar-parser";
import type { WeatherMinimum } from "@/lib/dispatch/weather-minimums";
import { PILOT_LEVELS } from "@/lib/dispatch/weather-minimums";
import { getWorstCrosswind, getWorstWind } from "@/lib/dispatch/wind-calculations";
import type { WindComponent } from "@/lib/dispatch/wind-calculations";
import { CheckCircle, XCircle } from "lucide-react";

interface GoNoGoPanelProps {
  metar: ParsedMetar | null;
  minimums: WeatherMinimum[];
  windComponents: WindComponent[];
}

interface GoNoGoResult {
  go: boolean;
  reasons: string[];
}

function evaluate(m: ParsedMetar, min: WeatherMinimum, worstXwind: number, worstWind: number): GoNoGoResult {
  const reasons: string[] = [];
  if (m.visibility !== null && m.visibility < min.visibility) {
    reasons.push(`Vis ${m.visibility} SM < ${min.visibility} SM`);
  }
  if (m.ceiling !== null && m.ceiling < min.ceiling) {
    reasons.push(`Ceiling ${m.ceiling} ft < ${min.ceiling} ft`);
  }
  if (worstWind > min.maxWind) {
    reasons.push(`Wind ${worstWind} kts > ${min.maxWind} kts`);
  }
  if (worstXwind > min.maxCrosswind) {
    reasons.push(`X-Wind ${worstXwind} kts > ${min.maxCrosswind} kts`);
  }
  return { go: reasons.length === 0, reasons };
}

export function GoNoGoPanel({ metar, minimums, windComponents }: GoNoGoPanelProps) {
  const worstXwind = getWorstCrosswind(windComponents);
  const worstWind = metar ? getWorstWind(metar.windSpeed ?? 0, metar.windGust ?? undefined) : 0;

  const grouped = PILOT_LEVELS.map((level) => ({
    level,
    ops: minimums.filter((m) => m.pilotLevel === level),
  }));

  const hasData = metar !== null;

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Weather Minimums</CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-4 pb-4">
        {!hasData ? (
          <p className="text-muted-foreground text-sm px-2">Waiting for METAR data…</p>
        ) : (
          <Accordion type="multiple" defaultValue={PILOT_LEVELS.map(String)}>
            {grouped.map(({ level, ops }) => {
              const allGo = ops.every((op) => evaluate(metar!, op, worstXwind, worstWind).go);
              return (
                <AccordionItem key={level} value={level}>
                  <AccordionTrigger className="text-sm py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${allGo ? "bg-status-go" : "bg-status-nogo"}`} />
                      {level}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1.5">
                      {ops.map((op, i) => {
                        const result = evaluate(metar!, op, worstXwind, worstWind);
                        return (
                          <div
                            key={i}
                            className={`flex items-start gap-2 rounded px-2 py-1.5 text-xs ${
                              result.go ? "bg-status-go/10" : "bg-status-nogo/10"
                            }`}
                          >
                            {result.go ? (
                              <CheckCircle className="h-3.5 w-3.5 text-status-go shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-status-nogo shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <span className="font-medium">{op.operation}</span>
                              {!result.go && (
                                <div className="text-status-nogo mt-0.5">
                                  {result.reasons.join(" · ")}
                                </div>
                              )}
                            </div>
                            <span className={`font-bold ${result.go ? "text-status-go" : "text-status-nogo"}`}>
                              {result.go ? "GO" : "NO GO"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
