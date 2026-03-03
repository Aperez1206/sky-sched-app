import { Plane } from "lucide-react";
import type { AircraftStatus } from "@/hooks/use-fleet-status";

interface FleetStatusRibbonProps {
  tailNumbers: string[];
  statuses: Record<string, AircraftStatus>;
  onSelectTail?: (tail: string) => void;
}

function PillList({ tailNumbers, statuses, onSelectTail }: FleetStatusRibbonProps) {
  return (
    <>
      {tailNumbers.map((tail) => {
        const status = statuses[tail];
        const flying = status?.flying ?? false;
        const label = flying
          ? "Flying"
          : status?.nearestAirport
            ? `Ground - ${status.nearestAirport}`
            : "Ground";

        return (
          <button
            key={tail}
            onClick={() => onSelectTail?.(tail)}
            className={`flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 border text-sm font-medium hover:bg-accent transition-colors ${
              flying ? "border-status-go/50" : ""
            }`}
          >
            <span
              className={`h-3 w-3 rounded-full shrink-0 ${
                flying ? "bg-status-go" : "bg-muted-foreground/40"
              }`}
            />
            <Plane className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{tail}</span>
            <span className="text-muted-foreground">–</span>
            <span className={flying ? "text-status-go" : "text-muted-foreground"}>
              {label}
            </span>
          </button>
        );
      })}
    </>
  );
}

export function FleetStatusRibbon({ tailNumbers, statuses, onSelectTail }: FleetStatusRibbonProps) {
  if (tailNumbers.length === 0) {
    return (
      <div className="w-full bg-card border-t flex items-center px-3 py-1.5">
        <span className="text-sm text-muted-foreground">No aircraft tracked</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border-t overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 animate-scroll-left hover:[animation-play-state:paused] w-max">
        <PillList tailNumbers={tailNumbers} statuses={statuses} onSelectTail={onSelectTail} />
        <PillList tailNumbers={tailNumbers} statuses={statuses} onSelectTail={onSelectTail} />
      </div>
    </div>
  );
}
