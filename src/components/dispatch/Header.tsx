import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AIRPORTS, type OpsMode } from "@/lib/dispatch/airports";
import { Settings, RefreshCw, Plane } from "lucide-react";

interface HeaderProps {
  selectedAirport: string;
  onAirportChange: (icao: string) => void;
  opsMode: OpsMode;
  onOpsModeChange: (mode: OpsMode) => void;
  onSettingsOpen: () => void;
  onRefresh: () => void;
  secondsUntilRefresh: number;
  loading: boolean;
}

export function Header({
  selectedAirport,
  onAirportChange,
  opsMode,
  onOpsModeChange,
  onSettingsOpen,
  onRefresh,
  secondsUntilRefresh,
  loading,
}: HeaderProps) {
  const minutes = Math.floor(secondsUntilRefresh / 60);
  const seconds = secondsUntilRefresh % 60;

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <Plane className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Flight Dispatcher</h1>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Select value={selectedAirport} onValueChange={onAirportChange}>
          <SelectTrigger className="w-[200px] bg-secondary font-mono text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AIRPORTS.map((a) => (
              <SelectItem key={a.icao} value={a.icao} className="font-mono">
                {a.icao} — {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedAirport === "KOPF" && (
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              onClick={() => onOpsModeChange("09")}
              className={`px-3 py-1.5 text-sm font-bold transition-colors ${
                opsMode === "09"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              09 OPS
            </button>
            <button
              onClick={() => onOpsModeChange("27")}
              className={`px-3 py-1.5 text-sm font-bold transition-colors ${
                opsMode === "27"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              27 OPS
            </button>
          </div>
        )}

        <span className="text-sm text-muted-foreground font-mono tabular-nums min-w-[48px]">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>

        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </Button>

        <Button variant="ghost" size="icon" onClick={onSettingsOpen}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
