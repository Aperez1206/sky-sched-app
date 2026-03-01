import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Aircraft } from '@/data/aeroplan';

interface StatusModalProps {
  open: boolean;
  onClose: () => void;
  aircraft: Aircraft | null;
  onSave: (tail: string, status: Aircraft['status'], airport: string) => void;
}

const STATUSES: { value: Aircraft['status']; label: string }[] = [
  { value: 'flying', label: 'Flying' },
  { value: 'ground', label: 'Ground' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'refueling', label: 'Refueling' },
];

export default function StatusModal({ open, onClose, aircraft, onSave }: StatusModalProps) {
  const [status, setStatus] = useState<Aircraft['status']>(aircraft?.status || 'ground');
  const [airport, setAirport] = useState(aircraft?.lastAirport || 'KOPF');

  const handleSave = () => {
    if (aircraft) onSave(aircraft.tailNumber, status, airport);
    onClose();
  };

  if (!aircraft) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-sm">Edit Status — {aircraft.tailNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map(s => (
              <button
                key={s.value}
                className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all ${status === s.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
                onClick={() => setStatus(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
          {status === 'ground' && (
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Airport Code</label>
              <Input className="h-8 text-xs uppercase" value={airport} onChange={e => setAirport(e.target.value.toUpperCase())} maxLength={4} />
            </div>
          )}
          <Button className="w-full h-8 text-xs font-semibold" onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
