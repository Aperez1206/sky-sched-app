import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type WeatherMinimum, DEFAULT_MINIMUMS, PILOT_LEVELS } from "@/lib/dispatch/weather-minimums";
import { DEFAULT_TAIL_NUMBERS } from "@/lib/dispatch/fleet";
import { RotateCcw, Plus, X } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  minimums: WeatherMinimum[];
  onSave: (minimums: WeatherMinimum[]) => void;
  tailNumbers: string[];
  onSaveFleet: (tails: string[]) => void;
}

export function SettingsModal({ open, onClose, minimums, onSave, tailNumbers, onSaveFleet }: SettingsModalProps) {
  const [local, setLocal] = useState<WeatherMinimum[]>([]);
  const [localTails, setLocalTails] = useState<string[]>([]);
  const [newTail, setNewTail] = useState("");

  useEffect(() => {
    setLocal(minimums.map((m) => ({ ...m })));
    setLocalTails([...tailNumbers]);
  }, [minimums, tailNumbers, open]);

  const update = (index: number, field: keyof WeatherMinimum, value: string) => {
    setLocal((prev) => {
      const copy = [...prev];
      (copy[index] as any)[field] = Number(value) || 0;
      return copy;
    });
  };

  const addTail = () => {
    const trimmed = newTail.trim().toUpperCase();
    if (trimmed && !localTails.includes(trimmed)) {
      setLocalTails((prev) => [...prev, trimmed]);
      setNewTail("");
    }
  };

  const removeTail = (tail: string) => {
    setLocalTails((prev) => prev.filter((t) => t !== tail));
  };

  const handleSave = () => {
    onSave(local);
    onSaveFleet(localTails);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="minimums">
          <TabsList>
            <TabsTrigger value="minimums">Weather Minimums</TabsTrigger>
            <TabsTrigger value="fleet">Fleet</TabsTrigger>
          </TabsList>

          <TabsContent value="minimums">
            {PILOT_LEVELS.map((level) => (
              <div key={level} className="mb-4">
                <h3 className="text-sm font-bold mb-2 text-primary">{level}</h3>
                <div className="space-y-2">
                  {local.map((m, i) => {
                    if (m.pilotLevel !== level) return null;
                    return (
                      <div key={i} className="grid grid-cols-5 gap-2 items-center text-xs">
                        <span className="col-span-1 font-medium truncate">{m.operation}</span>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Vis (SM)</Label>
                          <Input type="number" className="h-7 text-xs" value={m.visibility} onChange={(e) => update(i, "visibility", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Ceil (ft)</Label>
                          <Input type="number" className="h-7 text-xs" value={m.ceiling} onChange={(e) => update(i, "ceiling", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Wind (kts)</Label>
                          <Input type="number" className="h-7 text-xs" value={m.maxWind} onChange={(e) => update(i, "maxWind", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">X-Wind (kts)</Label>
                          <Input type="number" className="h-7 text-xs" value={m.maxCrosswind} onChange={(e) => update(i, "maxCrosswind", e.target.value)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setLocal([...DEFAULT_MINIMUMS])}>
              <RotateCcw className="h-3 w-3 mr-1" /> Reset Defaults
            </Button>
          </TabsContent>

          <TabsContent value="fleet">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Manage tracked aircraft tail numbers.</p>
              <div className="flex flex-wrap gap-2">
                {localTails.map((tail) => (
                  <div key={tail} className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-mono">
                    {tail}
                    <button onClick={() => removeTail(tail)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="N12345"
                  value={newTail}
                  onChange={(e) => setNewTail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTail()}
                  className="h-8 text-xs w-32"
                />
                <Button size="sm" variant="outline" onClick={addTail} className="h-8">
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLocalTails([...DEFAULT_TAIL_NUMBERS])}>
                <RotateCcw className="h-3 w-3 mr-1" /> Reset Defaults
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
