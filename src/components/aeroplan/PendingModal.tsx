import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Booking, getFlightType } from '@/data/aeroplan';
import { Check, X } from 'lucide-react';

interface PendingModalProps {
  open: boolean;
  onClose: () => void;
  bookings: Booking[];
  onAuthorize: (id: string) => void;
  onDeny: (id: string) => void;
}

export default function PendingModal({ open, onClose, bookings, onAuthorize, onDeny }: PendingModalProps) {
  const pending = bookings.filter(b => b.status === 'pending');

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pending Authorizations ({pending.length})</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {pending.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No pending reservations</p>}
          {pending.map(b => {
            const ft = getFlightType(b.flightTypeId);
            return (
              <div key={b.id} className="rounded-xl border border-border overflow-hidden">
                <div className="h-1.5" style={{ backgroundColor: ft.color }} />
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: ft.color }}>{ft.label}</span>
                    <span className="text-[10px] text-muted-foreground">{b.aircraftTail}</span>
                  </div>
                  <div className="text-xs text-foreground">
                    <strong>{b.studentName}</strong> with {b.instructorName}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {format(b.startDate, 'MMM d, h:mm a')} – {format(b.endDate, 'h:mm a')} · {b.route}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="h-7 text-xs flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onAuthorize(b.id)}>
                      <Check className="h-3 w-3 mr-1" /> Authorize
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs flex-1" onClick={() => onDeny(b.id)}>
                      <X className="h-3 w-3 mr-1" /> Deny
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
