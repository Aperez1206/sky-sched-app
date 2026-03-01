import { useRef, useEffect, useCallback, useState } from 'react';
import { isToday, format, isSameDay } from 'date-fns';
import { Aircraft, Booking, FLIGHT_TYPES, HOUR_HEIGHT, COL_WIDTH, HOURS, getFlightType } from '@/data/aeroplan';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface TimelineProps {
  aircraft: Aircraft[];
  bookings: Booking[];
  selectedDate: Date;
  onEditStatus: (tail: string) => void;
  onDragCreate?: (tail: string, startDate: Date, endDate: Date) => void;
}

const STATUS_STYLES: Record<string, { bg: string; dot: string; pulse: boolean }> = {
  flying: { bg: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500', pulse: true },
  ground: { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', pulse: false },
  maintenance: { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', pulse: false },
  refueling: { bg: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', pulse: true },
};

interface DragState {
  dragging: boolean;
  colIndex: number;
  startTime: number; // hours as decimal
  currentTime: number;
}

const snapTo15 = (hours: number) => Math.round(hours * 4) / 4;

export default function Timeline({ aircraft, bookings, selectedDate, onEditStatus, onDragCreate }: TimelineProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  // Sync horizontal scroll
  const handleScroll = useCallback(() => {
    if (bodyRef.current && headerRef.current) {
      headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
    }
  }, []);

  // Default scroll to 7 AM
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [selectedDate]);

  const LEFT_GUTTER = 56;

  const getTimeFromY = useCallback((clientY: number): number => {
    if (!bodyRef.current) return 0;
    const rect = bodyRef.current.getBoundingClientRect();
    const scrollTop = bodyRef.current.scrollTop;
    const y = clientY - rect.top + scrollTop;
    return snapTo15(Math.max(0, Math.min(24, y / HOUR_HEIGHT)));
  }, []);

  const getColFromX = useCallback((clientX: number): number => {
    if (!bodyRef.current) return -1;
    const rect = bodyRef.current.getBoundingClientRect();
    const scrollLeft = bodyRef.current.scrollLeft;
    const x = clientX - rect.left + scrollLeft - LEFT_GUTTER;
    if (x < 0) return -1;
    const col = Math.floor(x / COL_WIDTH);
    return col >= 0 && col < aircraft.length ? col : -1;
  }, [aircraft.length]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onDragCreate) return;
    const col = getColFromX(e.clientX);
    if (col < 0) return;
    const time = getTimeFromY(e.clientY);
    setDrag({ dragging: true, colIndex: col, startTime: time, currentTime: time });
  }, [getColFromX, getTimeFromY, onDragCreate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag?.dragging) return;
    const time = getTimeFromY(e.clientY);
    setDrag(prev => prev ? { ...prev, currentTime: time } : null);
  }, [drag?.dragging, getTimeFromY]);

  const handleMouseUp = useCallback(() => {
    if (!drag?.dragging || !onDragCreate) { setDrag(null); return; }
    const ac = aircraft[drag.colIndex];
    if (!ac) { setDrag(null); return; }

    let t1 = drag.startTime;
    let t2 = drag.currentTime;
    if (t1 > t2) [t1, t2] = [t2, t1];
    // Minimum 1 hour
    if (t2 - t1 < 0.25) t2 = Math.min(24, t1 + 1);

    const startDate = new Date(selectedDate);
    startDate.setHours(Math.floor(t1), (t1 % 1) * 60, 0, 0);
    const endDate = new Date(selectedDate);
    endDate.setHours(Math.floor(t2), (t2 % 1) * 60, 0, 0);

    setDrag(null);
    onDragCreate(ac.tailNumber, startDate, endDate);
  }, [drag, onDragCreate, aircraft, selectedDate]);

  const handleMouseLeave = useCallback(() => {
    setDrag(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrag(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const today = isToday(selectedDate);
  const now = new Date();
  const nowOffset = today ? (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT : -1;

  const dayBookings = bookings.filter(b => isSameDay(b.startDate, selectedDate));

  // Drag preview rect
  const dragPreview = drag?.dragging ? (() => {
    const t1 = Math.min(drag.startTime, drag.currentTime);
    const t2 = Math.max(drag.startTime, drag.currentTime);
    const top = t1 * HOUR_HEIGHT;
    const height = Math.max((t2 - t1) * HOUR_HEIGHT, HOUR_HEIGHT * 0.25);
    const left = LEFT_GUTTER + drag.colIndex * COL_WIDTH + 4;
    return { top, height, left, width: COL_WIDTH - 8 };
  })() : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Sticky column headers */}
      <div ref={headerRef} className="flex overflow-hidden border-b border-border flex-shrink-0" style={{ paddingLeft: LEFT_GUTTER }}>
        {aircraft.map(ac => {
          const st = STATUS_STYLES[ac.status];
          return (
            <div key={ac.tailNumber} className="flex-shrink-0 border-r border-border px-2 py-2.5 flex flex-col items-center gap-1" style={{ width: COL_WIDTH }}>
              <span className="text-xs font-bold text-foreground">{ac.tailNumber}</span>
              <span className="text-[10px] text-muted-foreground">{ac.model}</span>
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.bg}`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${st.dot} ${st.pulse ? 'pulse-dot' : ''}`} />
                {ac.status === 'ground' ? ac.lastAirport : ac.status.charAt(0).toUpperCase() + ac.status.slice(1)}
              </div>
              <Button variant="ghost" size="sm" className="h-5 text-[10px] text-muted-foreground px-1.5 hover:text-foreground" onClick={() => onEditStatus(ac.tailNumber)}>
                Edit Status
              </Button>
            </div>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div
        ref={bodyRef}
        className="flex-1 overflow-auto"
        style={{ cursor: onDragCreate ? 'crosshair' : undefined }}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex" style={{ minWidth: LEFT_GUTTER + aircraft.length * COL_WIDTH }}>
          {/* Hour gutter - sticky left */}
          <div
            className="sticky left-0 z-20 bg-card flex-shrink-0"
            style={{ width: LEFT_GUTTER }}
          >
            <div className="relative" style={{ height: 24 * HOUR_HEIGHT }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute text-[10px] font-medium text-muted-foreground flex items-start justify-end pr-2"
                  style={{ top: h * HOUR_HEIGHT, width: LEFT_GUTTER, height: HOUR_HEIGHT }}
                >
                  {format(new Date(2000, 0, 1, h), 'h a')}
                </div>
              ))}
            </div>
          </div>

          {/* Grid area */}
          <div className="relative flex-shrink-0" style={{ height: 24 * HOUR_HEIGHT, width: aircraft.length * COL_WIDTH }}>
            {/* Grid lines + operating hours tint */}
            {HOURS.map(h => (
              <div
                key={`grid-${h}`}
                className={`absolute border-t border-border/50 ${h >= 7 && h < 19 ? 'bg-sky-50/40' : ''}`}
                style={{ top: h * HOUR_HEIGHT, left: 0, right: 0, height: HOUR_HEIGHT }}
              />
            ))}

            {/* Column dividers + maintenance hatch */}
            {aircraft.map((ac, i) => (
              <div
                key={`col-${ac.tailNumber}`}
                className={`absolute top-0 bottom-0 border-r border-border/30 ${ac.status === 'maintenance' ? 'hatch-pattern' : ''}`}
                style={{ left: i * COL_WIDTH, width: COL_WIDTH }}
              />
            ))}

            {/* NOW line */}
            {today && nowOffset > 0 && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: nowOffset }}>
                <div className="h-[2px] bg-red-500 relative">
                  <span className="absolute -top-2.5 left-1 text-[9px] font-bold text-red-500 bg-card px-1 rounded">NOW</span>
                </div>
              </div>
            )}

            {/* Drag preview rectangle */}
            {dragPreview && (
              <div
                className="absolute rounded-lg z-30 pointer-events-none border-2 border-dashed"
                style={{
                  top: dragPreview.top,
                  left: dragPreview.left - LEFT_GUTTER,
                  width: dragPreview.width,
                  height: dragPreview.height,
                  backgroundColor: FLIGHT_TYPES[0].color + '20',
                  borderColor: FLIGHT_TYPES[0].color + '60',
                }}
              >
                <div className="text-[10px] font-semibold px-2 py-1" style={{ color: FLIGHT_TYPES[0].color }}>
                  New Booking
                </div>
              </div>
            )}

            {/* Booking tiles */}
            {dayBookings.map(booking => {
              const acIndex = aircraft.findIndex(a => a.tailNumber === booking.aircraftTail);
              if (acIndex === -1) return null;
              const ft = getFlightType(booking.flightTypeId);
              const startH = booking.startDate.getHours() + booking.startDate.getMinutes() / 60;
              const endH = booking.endDate.getHours() + booking.endDate.getMinutes() / 60;
              const top = startH * HOUR_HEIGHT;
              const height = (endH - startH) * HOUR_HEIGHT;
              const left = acIndex * COL_WIDTH + 4;
              const isPending = booking.status === 'pending';

              return (
                <HoverCard key={booking.id} openDelay={100} closeDelay={50}>
                  <HoverCardTrigger asChild>
                    <div
                      className="absolute rounded-lg px-2 py-1 cursor-pointer transition-shadow hover:shadow-md overflow-hidden z-10"
                      style={{
                        top, left, width: COL_WIDTH - 8, height: Math.max(height, 24),
                        backgroundColor: ft.color + '18',
                        border: `2px ${isPending ? 'dashed' : 'solid'} ${ft.color}`,
                        opacity: isPending ? 0.7 : 1,
                      }}
                      onMouseDown={e => e.stopPropagation()}
                    >
                      <div className="text-[10px] font-bold truncate" style={{ color: ft.color }}>{ft.label}</div>
                      <div className="text-[9px] text-foreground/70 truncate">{booking.studentName}</div>
                      <div className="text-[9px] text-muted-foreground truncate">{format(booking.startDate, 'h:mm a')} – {format(booking.endDate, 'h:mm a')}</div>
                      {isPending && <div className="text-[9px] font-semibold mt-0.5" style={{ color: ft.color }}>Pending</div>}
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" className="w-72 p-0 overflow-hidden">
                    <div className="h-1.5" style={{ backgroundColor: ft.color }} />
                    <div className="p-3 space-y-2">
                      <div className="font-bold text-sm" style={{ color: ft.color }}>{ft.label}</div>
                      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                        <span className="text-muted-foreground">Student</span><span className="font-medium">{booking.studentName}</span>
                        <span className="text-muted-foreground">Instructor</span><span className="font-medium">{booking.instructorName}</span>
                        <span className="text-muted-foreground">Aircraft</span><span className="font-medium">{booking.aircraftTail}</span>
                        <span className="text-muted-foreground">Route</span><span className="font-medium">{booking.route || '—'}</span>
                        <span className="text-muted-foreground">Time</span><span className="font-medium">{format(booking.startDate, 'h:mm a')} – {format(booking.endDate, 'h:mm a')}</span>
                        <span className="text-muted-foreground">Area</span><span className="font-medium">{booking.flightArea === 'xc' ? 'Cross Country' : 'Local'}</span>
                        <span className="text-muted-foreground">Status</span>
                        <span className={`font-semibold ${booking.status === 'pending' ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {booking.status === 'pending' ? 'Pending Authorization' : 'Confirmed'}
                        </span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
