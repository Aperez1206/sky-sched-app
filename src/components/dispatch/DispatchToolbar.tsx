import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AIRPORTS, type OpsMode } from "@/lib/dispatch/airports";
import { Settings, RefreshCw } from "lucide-react";

interface DispatchToolbarProps {
  selectedAirport: string;
  onAirportChange: (icao: string) => void;
  opsMode: OpsMode;
  onOpsModeChange: (mode: OpsMode) => void;
  onSettingsOpen: () => void;
  onRefresh: () => void;
  secondsUntilRefresh: number;
  loading: boolean;
}

export function DispatchToolbar({
  selectedAirport,
  onAirportChange,
  opsMode,
  onOpsModeChange,
  onSettingsOpen,
  onRefresh,
  secondsUntilRefresh,
  loading,
}: DispatchToolbarProps) {
  const minutes = Math.floor(secondsUntilRefresh / 60);
  const seconds = secondsUntilRefresh % 60;

  return (
    <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-1.5 shadow-sm">
      <Select value={selectedAirport} onValueChange={onAirportChange}>
        <SelectTrigger className="w-[180px] h-7 bg-secondary font-mono text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AIRPORTS.map((a) => (
            <SelectItem key={a.icao} value={a.icao} className="font-mono text-xs">
              {a.icao} — {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedAirport === "KOPF" && (
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => onOpsModeChange("09")}
            className={`px-2.5 py-1 text-xs font-bold transition-colors ${
              opsMode === "09"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            09 OPS
          </button>
          <button
            onClick={() => onOpsModeChange("27")}
            className={`px-2.5 py-1 text-xs font-bold transition-colors ${
              opsMode === "27"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            27 OPS
          </button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSettingsOpen}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
