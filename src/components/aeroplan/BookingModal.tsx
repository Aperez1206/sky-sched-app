import { useState } from 'react';
import { format, setMinutes, setHours } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ArrowLeft, Wrench, Plane } from 'lucide-react';
import { Aircraft, Booking, FLIGHT_TYPES, INSTRUCTORS, STUDENTS, getFlightType, UserRole } from '@/data/aeroplan';

export interface BookingInitialData {
  aircraftTail: string;
  startDate: Date;
  endDate: Date;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  aircraft: Aircraft[];
  onConfirm: (booking: Omit<Booking, 'id'>) => void;
  initialData?: BookingInitialData | null;
  userRole?: UserRole;
}

const MINUTES = ['00', '15', '30', '45'];
const HOURS_LIST = Array.from({ length: 24 }, (_, i) => i);

export default function BookingModal({ open, onClose, aircraft, onConfirm, initialData, userRole = 'student' }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'flight' | 'maintenance'>('flight');
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
  const [notes, setNotes] = useState('');
  const [didApplyInitial, setDidApplyInitial] = useState(false);

  const isAdmin = userRole === 'admin';
  const isMaintenance = mode === 'maintenance';
  const flightTypes = FLIGHT_TYPES.filter(ft => ft.id !== 'maintenance');

  if (open && initialData && !didApplyInitial) {
    setAircraftTail(initialData.aircraftTail);
    setStartDate(initialData.startDate);
    setStartHour(String(initialData.startDate.getHours()));
    setStartMin(String(initialData.startDate.getMinutes()).padStart(2, '0'));
    setEndDate(initialData.endDate);
    setEndHour(String(initialData.endDate.getHours()));
    setEndMin(String(initialData.endDate.getMinutes()).padStart(2, '0'));
    setDidApplyInitial(true);
  }

  const reset = () => {
    setStep(1);
    setMode('flight');
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
    setNotes('');
    setDidApplyInitial(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const buildDates = () => {
    const s = setMinutes(setHours(new Date(startDate), parseInt(startHour)), parseInt(startMin));
    const e = setMinutes(setHours(new Date(endDate), parseInt(endHour)), parseInt(endMin));
    return { s, e };
  };

  const handleConfirm = () => {
    const { s, e } = buildDates();
    if (isMaintenance) {
      onConfirm({
        type: 'maintenance',
        flightTypeId: 'maintenance',
        aircraftTail,
        instructorName: '',
        studentName: '',
        startDate: s,
        endDate: e,
        flightArea: 'local',
        route: '',
        status: 'confirmed',
        bookedBy: 'admin',
        notes,
      });
    } else {
      onConfirm({
        type: 'flight',
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
    }
    handleClose();
  };

  const canProceed = isMaintenance ? !!aircraftTail : (flightTypeId && student && aircraftTail);
  const ft = isMaintenance ? getFlightType('maintenance') : (flightTypeId ? getFlightType(flightTypeId) : null);

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? (isMaintenance ? 'Schedule Maintenance' : 'Book a Flight')
              : (isMaintenance ? 'Confirm Maintenance' : 'Confirm Booking')}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Mode toggle - admin only */}
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant={!isMaintenance ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1.5"
                  onClick={() => setMode('flight')}
                >
                  <Plane className="h-3.5 w-3.5" /> Flight Booking
                </Button>
                <Button
                  variant={isMaintenance ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1.5"
                  onClick={() => setMode('maintenance')}
                >
                  <Wrench className="h-3.5 w-3.5" /> Maintenance
                </Button>
              </div>
            )}

            {/* Flight type grid - only for flights */}
            {!isMaintenance && (
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Flight Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {flightTypes.map(ft => (
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
            )}

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

            {/* Aircraft */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Aircraft</label>
              <Select value={aircraftTail} onValueChange={setAircraftTail}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select aircraft..." /></SelectTrigger>
                <SelectContent>
                  {aircraft.map(ac => (
                    <SelectItem key={ac.tailNumber} value={ac.tailNumber}>
                      {ac.tailNumber} — {ac.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Flight-only fields */}
            {!isMaintenance && (
              <>
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
              </>
            )}

            {/* Maintenance notes */}
            {isMaintenance && (
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Notes / Reason (optional)</label>
                <Textarea className="text-xs min-h-[60px]" placeholder="e.g. 100-hour inspection, oil change..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            )}

            <Button className="w-full h-9 text-xs font-semibold" disabled={!canProceed} onClick={() => setStep(2)}>
              {isMaintenance ? 'Review Maintenance →' : 'Review Booking →'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-border">
              <div className="h-2" style={{ backgroundColor: ft?.color }} />
              <div className="p-4 space-y-2 text-xs">
                <div className="font-bold text-sm" style={{ color: ft?.color }}>{ft?.label}</div>
                <div className="grid grid-cols-2 gap-y-1.5 text-foreground">
                  <span className="text-muted-foreground">Aircraft</span><span className="font-medium">{aircraftTail}</span>
                  <span className="text-muted-foreground">Start</span><span className="font-medium">{format(buildDates().s, 'MMM d, h:mm a')}</span>
                  <span className="text-muted-foreground">End</span><span className="font-medium">{format(buildDates().e, 'MMM d, h:mm a')}</span>
                  {!isMaintenance && (
                    <>
                      <span className="text-muted-foreground">Student</span><span className="font-medium">{student}</span>
                      <span className="text-muted-foreground">Instructor</span><span className="font-medium">{instructor || 'No instructor'}</span>
                      <span className="text-muted-foreground">Area</span><span className="font-medium">{flightArea === 'xc' ? 'Cross Country' : 'Local'}</span>
                      <span className="text-muted-foreground">Route</span><span className="font-medium">{route || '—'}</span>
                    </>
                  )}
                  {isMaintenance && notes && (
                    <>
                      <span className="text-muted-foreground">Notes</span><span className="font-medium">{notes}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => setStep(1)}>
                <ArrowLeft className="h-3 w-3 mr-1" /> Back
              </Button>
              <Button className="flex-1 h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirm}>
                <Check className="h-3 w-3 mr-1" /> {isMaintenance ? 'Confirm Maintenance' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
