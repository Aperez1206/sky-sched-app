import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Booking } from '@/data/aeroplan';
import { completeCheckIn, FlightSession } from '@/hooks/useFlightSessions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onComplete: () => void;
}

export default function CheckInModal({ open, onClose, booking, onComplete }: Props) {
  const [session, setSession] = useState<FlightSession | null>(null);
  const [hobbsOut, setHobbsOut] = useState('');
  const [tachOut, setTachOut] = useState('');
  const [flightInstruction, setFlightInstruction] = useState('');
  const [groundInstruction, setGroundInstruction] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && booking) {
      setHobbsOut('');
      setTachOut('');
      setFlightInstruction('');
      setGroundInstruction('');
      // Fetch the active session for this reservation
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(booking.id);
      let query = supabase
        .from('flight_sessions')
        .select('*')
        .eq('status', 'checked_out');
      
      if (isUuid) {
        query = query.eq('reservation_id', booking.id);
      } else {
        // For local bookings without UUID, find by aircraft tail and status
        query = query.eq('aircraft_tail', booking.aircraftTail).is('reservation_id', null);
      }
      
      query.order('checked_out_at', { ascending: false }).limit(1).single()
        .then(({ data }) => {
          if (data) setSession(data as FlightSession);
        });
    }
  }, [open, booking]);

  const hobbsIn = session?.hobbs_in ? Number(session.hobbs_in) : null;
  const tachIn = session?.tach_in ? Number(session.tach_in) : null;
  const hobbsOutNum = hobbsOut ? parseFloat(hobbsOut) : null;
  const tachOutNum = tachOut ? parseFloat(tachOut) : null;

  const flightTime = useMemo(() => {
    if (hobbsIn != null && hobbsOutNum != null && hobbsOutNum > hobbsIn) {
      return parseFloat((hobbsOutNum - hobbsIn).toFixed(1));
    }
    return null;
  }, [hobbsIn, hobbsOutNum]);

  const tachTime = useMemo(() => {
    if (tachIn != null && tachOutNum != null && tachOutNum > tachIn) {
      return parseFloat((tachOutNum - tachIn).toFixed(1));
    }
    return null;
  }, [tachIn, tachOutNum]);

  const hasInstructor = !!booking?.instructorName;

  // Pre-fill flight instruction with flight time
  useEffect(() => {
    if (hasInstructor && flightTime != null) {
      setFlightInstruction(flightTime.toString());
    }
  }, [flightTime, hasInstructor]);

  const handleCheckIn = async () => {
    if (!session || !booking || hobbsOutNum == null || tachOutNum == null) return;
    setLoading(true);
    try {
      await completeCheckIn({
        session_id: session.id,
        reservation_id: booking.id,
        hobbs_out: hobbsOutNum,
        tach_out: tachOutNum,
        flight_instruction: hasInstructor && flightInstruction ? parseFloat(flightInstruction) : null,
        ground_instruction: groundInstruction ? parseFloat(groundInstruction) : null,
      });
      toast.success('Flight checked in successfully');
      onComplete();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check In Flight — {booking.aircraftTail}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Student</span>
            <span className="font-medium">{booking.studentName || '—'}</span>
            <span className="text-muted-foreground">Instructor</span>
            <span className="font-medium">{booking.instructorName || '—'}</span>
          </div>

          <div className="border-t pt-3 grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Hobbs In</Label>
              <div className="font-mono text-sm font-medium mt-1">{hobbsIn?.toFixed(1) ?? 'N/A'}</div>
            </div>
            <div>
              <Label htmlFor="hobbs-out" className="text-xs text-muted-foreground">Hobbs Out</Label>
              <Input
                id="hobbs-out"
                type="number"
                step="0.1"
                value={hobbsOut}
                onChange={e => setHobbsOut(e.target.value)}
                placeholder="e.g. 1234.5"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tach In</Label>
              <div className="font-mono text-sm font-medium mt-1">{tachIn?.toFixed(1) ?? 'N/A'}</div>
            </div>
            <div>
              <Label htmlFor="tach-out" className="text-xs text-muted-foreground">Tach Out</Label>
              <Input
                id="tach-out"
                type="number"
                step="0.1"
                value={tachOut}
                onChange={e => setTachOut(e.target.value)}
                placeholder="e.g. 1234.5"
                className="mt-1 font-mono"
              />
            </div>
          </div>

          {/* Computed times */}
          <div className="border-t pt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Hobbs Time (Flight Time)</span>
              <div className="font-mono font-bold text-lg text-primary">
                {flightTime != null ? `${flightTime} hrs` : '—'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Tach Time</span>
              <div className="font-mono font-bold text-lg text-primary">
                {tachTime != null ? `${tachTime} hrs` : '—'}
              </div>
            </div>
          </div>

          {/* Instruction fields */}
          {hasInstructor && (
            <div className="border-t pt-3 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flight-inst" className="text-xs text-muted-foreground">Flight Instruction (hrs)</Label>
                <Input
                  id="flight-inst"
                  type="number"
                  step="0.1"
                  value={flightInstruction}
                  onChange={e => setFlightInstruction(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label htmlFor="ground-inst" className="text-xs text-muted-foreground">Ground Instruction (hrs)</Label>
                <Input
                  id="ground-inst"
                  type="number"
                  step="0.1"
                  value={groundInstruction}
                  onChange={e => setGroundInstruction(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCheckIn} disabled={!hobbsOut || !tachOut || loading}>
            {loading ? 'Checking in…' : 'Check In'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
