import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Booking } from '@/data/aeroplan';
import { getLastTimes, createCheckOut } from '@/hooks/useFlightSessions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { useAircraftMaintenance, useInspections } from '@/hooks/useMaintenanceData';

interface Props {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onComplete: () => void;
}

export default function CheckOutModal({ open, onClose, booking, onComplete }: Props) {
  const [weatherOk, setWeatherOk] = useState(false);
  const [wbOk, setWbOk] = useState(false);
  const [lastHobbs, setLastHobbs] = useState<number | null>(null);
  const [lastTach, setLastTach] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [ackInspection, setAckInspection] = useState(false);

  const { data: fleet } = useAircraftMaintenance();
  const { data: inspections } = useInspections(booking?.aircraftTail);
  const aircraft = fleet?.find(a => a.aircraft_tail === booking?.aircraftTail);
  const currentHobbs = aircraft?.current_hobbs ?? null;

  const inspectionAlerts = (inspections ?? []).map(insp => {
    const hoursLeft = insp.due_hobbs != null && currentHobbs != null ? insp.due_hobbs - currentHobbs : null;
    const daysLeft = insp.due_date ? Math.ceil((new Date(insp.due_date).getTime() - Date.now()) / 86400000) : null;
    const overdue = (hoursLeft != null && hoursLeft <= 0) || (daysLeft != null && daysLeft < 0);
    const within10h = hoursLeft != null && hoursLeft <= 10 && hoursLeft > 0;
    const within7d = daysLeft != null && daysLeft <= 7 && daysLeft >= 0;
    return { insp, hoursLeft, daysLeft, overdue, within10h, within7d, flagged: overdue || within10h || within7d };
  }).filter(a => a.flagged);

  const hasOverdue = inspectionAlerts.some(a => a.overdue);
  const needsAck = inspectionAlerts.length > 0;

  useEffect(() => {
    if (open && booking) {
      setWeatherOk(false);
      setWbOk(false);
      setAckInspection(false);
      getLastTimes(booking.aircraftTail).then(result => {
        setLastHobbs(result?.hobbs_out ?? null);
        setLastTach(result?.tach_out ?? null);
      });
    }
  }, [open, booking]);

  const handleCheckOut = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await createCheckOut({
        reservation_id: booking.id,
        aircraft_tail: booking.aircraftTail,
        student_id: null, // Will be linked via reservation
        instructor_id: null,
        checked_out_by: user.id,
        hobbs_in: lastHobbs,
        tach_in: lastTach,
      });

      toast.success('Flight checked out successfully');
      onComplete();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check Out Flight</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Aircraft</span>
            <span className="font-medium">{booking.aircraftTail}</span>
            <span className="text-muted-foreground">Student</span>
            <span className="font-medium">{booking.studentName || '—'}</span>
            <span className="text-muted-foreground">Instructor</span>
            <span className="font-medium">{booking.instructorName || '—'}</span>
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{format(booking.startDate, 'h:mm a')} – {format(booking.endDate, 'h:mm a')}</span>
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Hobbs In (from last flight)</span>
              <span className="font-mono font-medium">{lastHobbs?.toFixed(1) ?? 'N/A'}</span>
              <span className="text-muted-foreground">Tach In (from last flight)</span>
              <span className="font-mono font-medium">{lastTach?.toFixed(1) ?? 'N/A'}</span>
            </div>
          </div>

          {inspectionAlerts.length > 0 && (
            <div className={`rounded-xl border p-3 space-y-2 ${hasOverdue ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'}`}>
              <div className={`flex items-center gap-2 font-semibold text-sm ${hasOverdue ? 'text-red-700' : 'text-orange-700'}`}>
                <AlertTriangle className="h-4 w-4" />
                {hasOverdue ? 'Inspection overdue — do not release' : 'Inspection due soon'}
              </div>
              <ul className="text-xs space-y-1 text-slate-700">
                {inspectionAlerts.map(a => (
                  <li key={a.insp.id}>
                    <span className="font-medium">{a.insp.inspection_type}:</span>{' '}
                    {a.hoursLeft != null && <span>{a.hoursLeft.toFixed(1)} hrs left</span>}
                    {a.hoursLeft != null && a.daysLeft != null && ' · '}
                    {a.daysLeft != null && <span>{a.daysLeft} days left</span>}
                    {a.overdue && <span className="ml-1 font-semibold text-red-700">(OVERDUE)</span>}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="ack" checked={ackInspection} onCheckedChange={v => setAckInspection(!!v)} />
                <Label htmlFor="ack" className="text-xs">Dispatch acknowledges inspection status and authorizes release</Label>
              </div>
            </div>
          )}

          <div className="border-t pt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="weather" checked={weatherOk} onCheckedChange={v => setWeatherOk(!!v)} />
              <Label htmlFor="weather" className="text-sm">Weather minimums verified and within limits</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="wb" checked={wbOk} onCheckedChange={v => setWbOk(!!v)} />
              <Label htmlFor="wb" className="text-sm">Weight & balance calculated and within limits</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCheckOut} disabled={!weatherOk || !wbOk || loading || (needsAck && !ackInspection)}>
            {loading ? 'Checking out…' : 'Check Out'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
