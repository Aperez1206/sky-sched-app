import { useState } from 'react';
import { format, addHours, setMinutes, setHours } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Aircraft, Booking, FLIGHT_TYPES, INSTRUCTORS, STUDENTS, getFlightType } from '@/data/aeroplan';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  aircraft: Aircraft[];
  onConfirm: (booking: Omit<Booking, 'id'>) => void;
}

const MINUTES = ['00', '15', '30', '45'];
const HOURS_LIST = Array.from({ length: 24 }, (_, i) => i);

export default function BookingModal({ open, onClose, aircraft, onConfirm }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [flightTypeId, setFlightTypeId] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startHour, setStartHour] = useState('8');
  const [startMin, setStartMin] = useState('00');
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [endHour, setEndHour] = useState('10');
  const [endMin, setEndMin] = useState('00');
  const [student, setStudent] = useState('');
  const [aircraftTail, setAircraftTail] = useState('');
  const [instructor, setInstructor] = useState('');
  const [flightArea, setFlightArea] = useState<'local' | 'xc'>('local');
  const [route, setRoute] = useState('');

  const reset = () => {
    setStep(1);
    setFlightTypeId('');
    setStartHour('8');
    setStartMin('00');
    setEndHour('10');
    setEndMin('00');
    setStudent('');
    setAircraftTail('');
    setInstructor('');
    setFlightArea('local');
    setRoute('');
  };

  const handleClose = () => { reset(); onClose(); };

  const buildDates = () => {
    const s = setMinutes(setHours(new Date(startDate), parseInt(startHour)), parseInt(startMin));
    const e = setMinutes(setHours(new Date(endDate), parseInt(endHour)), parseInt(endMin));
    return { s, e };
  };

  const handleConfirm = () => {
    const { s, e } = buildDates();
    onConfirm({
      flightTypeId,
      aircraftTail,
      instructorName: instructor || 'No instructor',
      studentName: student,
      startDate: s,
      endDate: e,
      flightArea,
      route,
      status: 'confirmed',
      bookedBy: 'admin',
    });
    handleClose();
  };

  const canProceed = flightTypeId && student && aircraftTail;
  const ft = flightTypeId ? getFlightType(flightTypeId) : null;

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step === 1 ? 'Book a Flight' : 'Confirm Booking'}</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Flight type grid */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Flight Type</label>
              <div className="grid grid-cols-2 gap-2">
                {FLIGHT_TYPES.map(ft => (
                  <button
                    key={ft.id}
                    className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold text-left transition-all ${flightTypeId === ft.id ? 'shadow-md scale-[1.02]' : 'border-border hover:border-muted-foreground/30'}`}
                    style={{
                      borderColor: flightTypeId === ft.id ? ft.color : undefined,
                      backgroundColor: flightTypeId === ft.id ? ft.color + '15' : undefined,
                      color: flightTypeId === ft.id ? ft.color : undefined,
                    }}
                    onClick={() => setFlightTypeId(ft.id)}
                  >
                    <span className="inline-block h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: ft.color }} />
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date/time row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Start</label>
                <div className="flex gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs flex-1">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(startDate, 'MMM d')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={d => d && setStartDate(d)} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <Select value={startHour} onValueChange={setStartHour}>
                    <SelectTrigger className="h-8 w-14 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{HOURS_LIST.map(h => <SelectItem key={h} value={String(h)}>{String(h).padStart(2, '0')}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={startMin} onValueChange={setStartMin}>
                    <SelectTrigger className="h-8 w-14 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{MINUTES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">End</label>
                <div className="flex gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs flex-1">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(endDate, 'MMM d')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={d => d && setEndDate(d)} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <Select value={endHour} onValueChange={setEndHour}>
                    <SelectTrigger className="h-8 w-14 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{HOURS_LIST.map(h => <SelectItem key={h} value={String(h)}>{String(h).padStart(2, '0')}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={endMin} onValueChange={setEndMin}>
                    <SelectTrigger className="h-8 w-14 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{MINUTES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Student */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Student / Renter</label>
              <Select value={student} onValueChange={setStudent}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground">Students</div>
                  {STUDENTS.filter(s => s.type === 'student').map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                  <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground mt-1">Renters</div>
                  {STUDENTS.filter(s => s.type === 'renter').map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Aircraft */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Aircraft</label>
              <Select value={aircraftTail} onValueChange={setAircraftTail}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select aircraft..." /></SelectTrigger>
                <SelectContent>
                  {aircraft.map(ac => (
                    <SelectItem key={ac.tailNumber} value={ac.tailNumber} disabled={ac.status === 'maintenance'}>
                      {ac.tailNumber} — {ac.model} {ac.status === 'maintenance' ? '(Maintenance)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Instructor */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Instructor</label>
              <Select value={instructor} onValueChange={setInstructor}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="No instructor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="No instructor">No instructor</SelectItem>
                  {INSTRUCTORS.map(inst => (
                    <SelectItem key={inst.name} value={inst.name}>{inst.name} — {inst.certs}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Flight area */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Flight Area</label>
              <div className="flex gap-2">
                <Button variant={flightArea === 'local' ? 'default' : 'outline'} size="sm" className="h-8 text-xs flex-1" onClick={() => setFlightArea('local')}>Local</Button>
                <Button variant={flightArea === 'xc' ? 'default' : 'outline'} size="sm" className="h-8 text-xs flex-1" onClick={() => setFlightArea('xc')}>Cross Country</Button>
              </div>
            </div>

            {/* Route */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Route / Area</label>
              <Input className="h-9 text-xs" placeholder={flightArea === 'local' ? 'e.g. KOPF — Practice Area — KOPF' : 'e.g. KOPF — KFLL — KPBI — KOPF'} value={route} onChange={e => setRoute(e.target.value)} />
            </div>

            <Button className="w-full h-9 text-xs font-semibold" disabled={!canProceed} onClick={() => setStep(2)}>
              Review Booking →
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary card */}
            <div className="rounded-xl overflow-hidden border border-border">
              <div className="h-2" style={{ backgroundColor: ft?.color }} />
              <div className="p-4 space-y-2 text-xs">
                <div className="font-bold text-sm" style={{ color: ft?.color }}>{ft?.label}</div>
                <div className="grid grid-cols-2 gap-y-1.5 text-foreground">
                  <span className="text-muted-foreground">Student</span><span className="font-medium">{student}</span>
                  <span className="text-muted-foreground">Aircraft</span><span className="font-medium">{aircraftTail}</span>
                  <span className="text-muted-foreground">Instructor</span><span className="font-medium">{instructor || 'No instructor'}</span>
                  <span className="text-muted-foreground">Start</span><span className="font-medium">{format(buildDates().s, 'MMM d, h:mm a')}</span>
                  <span className="text-muted-foreground">End</span><span className="font-medium">{format(buildDates().e, 'MMM d, h:mm a')}</span>
                  <span className="text-muted-foreground">Area</span><span className="font-medium">{flightArea === 'xc' ? 'Cross Country' : 'Local'}</span>
                  <span className="text-muted-foreground">Route</span><span className="font-medium">{route || '—'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => setStep(1)}>
                <ArrowLeft className="h-3 w-3 mr-1" /> Back
              </Button>
              <Button className="flex-1 h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirm}>
                <Check className="h-3 w-3 mr-1" /> Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
