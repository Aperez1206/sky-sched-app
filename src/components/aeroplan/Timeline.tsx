import { useRef, useEffect, useCallback } from 'react';
import { isToday, format, isSameDay } from 'date-fns';
import { Aircraft, Booking, FLIGHT_TYPES, HOUR_HEIGHT, COL_WIDTH, HOURS, getFlightType } from '@/data/aeroplan';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TimelineProps {
  aircraft: Aircraft[];
  bookings: Booking[];
  selectedDate: Date;
  onEditStatus: (tail: string) => void;
}

const STATUS_STYLES: Record<string, { bg: string; dot: string; pulse: boolean }> = {
  flying: { bg: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500', pulse: true },
  ground: { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', pulse: false },
  maintenance: { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', pulse: false },
  refueling: { bg: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', pulse: true },
};

export default function Timeline({ aircraft, bookings, selectedDate, onEditStatus }: TimelineProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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
  }, []);

  const today = isToday(selectedDate);
  const now = new Date();
  const nowOffset = today ? (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT : -1;

  const dayBookings = bookings.filter(b => isSameDay(b.startDate, selectedDate));
  const LEFT_GUTTER = 56;

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
      <div ref={bodyRef} className="flex-1 overflow-auto relative" onScroll={handleScroll}>
        <div className="relative" style={{ height: 24 * HOUR_HEIGHT, width: LEFT_GUTTER + aircraft.length * COL_WIDTH }}>
          {/* Hour labels (sticky left) */}
          {HOURS.map(h => (
            <div
              key={h}
              className="absolute left-0 text-[10px] font-medium text-muted-foreground flex items-start justify-end pr-2 z-10"
              style={{ top: h * HOUR_HEIGHT, width: LEFT_GUTTER, height: HOUR_HEIGHT, position: 'sticky' }}
            >
              <span className="sticky left-0 bg-card pr-1">{format(new Date(2000, 0, 1, h), 'h a')}</span>
            </div>
          ))}

          {/* Grid lines + operating hours tint */}
          {HOURS.map(h => (
            <div
              key={`grid-${h}`}
              className={`absolute border-t border-border/50 ${h >= 7 && h < 19 ? 'bg-sky-50/40' : ''}`}
              style={{ top: h * HOUR_HEIGHT, left: LEFT_GUTTER, right: 0, height: HOUR_HEIGHT }}
            />
          ))}

          {/* Column dividers + maintenance hatch */}
          {aircraft.map((ac, i) => (
            <div
              key={`col-${ac.tailNumber}`}
              className={`absolute top-0 bottom-0 border-r border-border/30 ${ac.status === 'maintenance' ? 'hatch-pattern' : ''}`}
              style={{ left: LEFT_GUTTER + i * COL_WIDTH, width: COL_WIDTH }}
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

          {/* Booking tiles */}
          {dayBookings.map(booking => {
            const acIndex = aircraft.findIndex(a => a.tailNumber === booking.aircraftTail);
            if (acIndex === -1) return null;
            const ft = getFlightType(booking.flightTypeId);
            const startH = booking.startDate.getHours() + booking.startDate.getMinutes() / 60;
            const endH = booking.endDate.getHours() + booking.endDate.getMinutes() / 60;
            const top = startH * HOUR_HEIGHT;
            const height = (endH - startH) * HOUR_HEIGHT;
            const left = LEFT_GUTTER + acIndex * COL_WIDTH + 4;
            const isPending = booking.status === 'pending';

            return (
              <Tooltip key={booking.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute rounded-lg px-2 py-1 cursor-pointer transition-shadow hover:shadow-md overflow-hidden z-10"
                    style={{
                      top, left, width: COL_WIDTH - 8, height: Math.max(height, 24),
                      backgroundColor: ft.color + '18',
                      border: `2px ${isPending ? 'dashed' : 'solid'} ${ft.color}`,
                      opacity: isPending ? 0.7 : 1,
                    }}
                  >
                    <div className="text-[10px] font-bold truncate" style={{ color: ft.color }}>{ft.label}</div>
                    <div className="text-[9px] text-foreground/70 truncate">{booking.studentName}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{format(booking.startDate, 'h:mm a')} – {format(booking.endDate, 'h:mm a')}</div>
                    {isPending && <div className="text-[9px] font-semibold mt-0.5" style={{ color: ft.color }}>⏳ Pending</div>}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[240px]">
                  <div className="space-y-1 text-xs">
                    <div className="font-bold" style={{ color: ft.color }}>{ft.label}</div>
                    <div><strong>Student:</strong> {booking.studentName}</div>
                    <div><strong>Instructor:</strong> {booking.instructorName}</div>
                    <div><strong>Aircraft:</strong> {booking.aircraftTail}</div>
                    <div><strong>Route:</strong> {booking.route}</div>
                    <div><strong>Time:</strong> {format(booking.startDate, 'h:mm a')} – {format(booking.endDate, 'h:mm a')}</div>
                    <div><strong>Area:</strong> {booking.flightArea === 'xc' ? 'Cross Country' : 'Local'}</div>
                    <div><strong>Status:</strong> {booking.status}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
