import { useState, useMemo } from "react";
import { Header } from "@/components/dispatch/Header";
import { GoNoGoColumn } from "@/components/dispatch/GoNoGoColumn";
import { WindPanel } from "@/components/dispatch/WindPanel";
import { WeatherPanel } from "@/components/dispatch/WeatherPanel";
import { FleetTrackerPanel } from "@/components/dispatch/FleetTrackerPanel";
import { FleetStatusRibbon } from "@/components/dispatch/FleetStatusRibbon";
import { SettingsModal } from "@/components/dispatch/SettingsModal";
import { useDispatchMetar } from "@/hooks/use-dispatch-metar";
import { useRunways } from "@/hooks/use-runways";
import { useFleetStatus } from "@/hooks/use-fleet-status";
import { getSavedAirport, saveAirport, getSavedOpsMode, saveOpsMode, KOPF_OPS_RUNWAYS, type OpsMode } from "@/lib/dispatch/airports";
import { getMinimums, saveMinimums, type WeatherMinimum, PILOT_LEVELS } from "@/lib/dispatch/weather-minimums";
import { getFleetTailNumbers, saveFleetTailNumbers } from "@/lib/dispatch/fleet";
import { calculateWindComponents, type WindComponent } from "@/lib/dispatch/wind-calculations";

const DispatchPage = () => {
  const [airport, setAirport] = useState(getSavedAirport);
  const [opsMode, setOpsMode] = useState<OpsMode>(getSavedOpsMode);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [minimums, setMinimums] = useState<WeatherMinimum[]>(getMinimums);
  const [tailNumbers, setTailNumbers] = useState<string[]>(getFleetTailNumbers);

  const { metar, loading: metarLoading, error: metarError, secondsUntilRefresh, refresh } = useDispatchMetar(airport);
  const { runways, loading: runwaysLoading } = useRunways(airport);
  const { statuses } = useFleetStatus(tailNumbers);

  const handleAirportChange = (icao: string) => {
    setAirport(icao);
    saveAirport(icao);
  };

  const handleOpsModeChange = (mode: OpsMode) => {
    setOpsMode(mode);
    saveOpsMode(mode);
  };

  const handleSaveMinimums = (mins: WeatherMinimum[]) => {
    setMinimums(mins);
    saveMinimums(mins);
  };

  const handleSaveFleet = (tails: string[]) => {
    setTailNumbers(tails);
    saveFleetTailNumbers(tails);
  };

  const windComponents: WindComponent[] = useMemo(() => {
    let activeRunways = runways;
    if (airport === "KOPF") {
      const allowed = KOPF_OPS_RUNWAYS[opsMode];
      activeRunways = runways.filter((r) => allowed.includes(r.id));
    }
    if (!metar || metar.windDirection === null || metar.windSpeed === null) {
      return activeRunways.map((r) => ({
        runwayId: r.id,
        runwayHeading: r.heading,
        headwind: 0,
        crosswind: 0,
        favorable: true,
      }));
    }
    return activeRunways.map((r) => {
      const calc = calculateWindComponents(r.heading, metar.windDirection!, metar.windSpeed!, metar.windGust ?? undefined);
      return {
        runwayId: r.id,
        runwayHeading: r.heading,
        ...calc,
        favorable: calc.headwind > 0 && calc.crosswind <= 15,
      };
    });
  }, [runways, metar, airport, opsMode]);

  return (
    <div className="flex flex-col h-full bg-background">
      <Header
        selectedAirport={airport}
        onAirportChange={handleAirportChange}
        opsMode={opsMode}
        onOpsModeChange={handleOpsModeChange}
        onSettingsOpen={() => setSettingsOpen(true)}
        onRefresh={refresh}
        secondsUntilRefresh={secondsUntilRefresh}
        loading={metarLoading}
      />

      <main className="flex-1 overflow-hidden flex flex-col gap-3 p-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 overflow-auto max-h-[40%]">
          {PILOT_LEVELS.map((level) => (
            <GoNoGoColumn
              key={level}
              level={level}
              metar={metar}
              minimums={minimums.filter((m) => m.pilotLevel === level)}
              windComponents={windComponents}
            />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0 overflow-hidden">
          <div className="overflow-auto">
            <WeatherPanel metar={metar} loading={metarLoading} error={metarError} />
          </div>
          <div className="overflow-auto">
            <WindPanel airport={airport} runways={runways} metar={metar} opsMode={opsMode} loading={runwaysLoading} />
          </div>
          <div className="min-h-0">
            <FleetTrackerPanel tailNumbers={tailNumbers} statuses={statuses} />
          </div>
        </div>
      </main>

      <FleetStatusRibbon tailNumbers={tailNumbers} statuses={statuses} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        minimums={minimums}
        onSave={handleSaveMinimums}
        tailNumbers={tailNumbers}
        onSaveFleet={handleSaveFleet}
      />
    </div>
  );
};

export default DispatchPage;
