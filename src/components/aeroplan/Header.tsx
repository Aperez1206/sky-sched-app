import { useState, useEffect } from 'react';
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  pendingCount: number;
  onBookFlight: () => void;
  onOpenPending: () => void;
}

export default function Header({ selectedDate, onDateChange, pendingCount, onBookFlight, onOpenPending }: HeaderProps) {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dayLabel = isToday(selectedDate) ? 'Today' : isYesterday(selectedDate) ? 'Yesterday' : isTomorrow(selectedDate) ? 'Tomorrow' : null;

  return (
    <header className="flex items-center justify-between bg-card px-5 py-3 shadow-sm" style={{ borderRadius: '0 0 14px 14px' }}>
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Plane className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-foreground">AeroPlan</h1>
          <p className="text-xs text-muted-foreground">Opa-locka Executive · KOPF</p>
        </div>
      </div>

      {/* Center: Date nav */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDateChange(subDays(selectedDate, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center min-w-[220px]">
          {dayLabel && <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{dayLabel}</span>}
          <div className="text-lg font-bold text-foreground leading-tight">{format(selectedDate, 'EEEE, MMMM d')}</div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDateChange(addDays(selectedDate, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        {!isToday(selectedDate) && (
          <Button variant="outline" size="sm" className="ml-2 text-xs h-7" onClick={() => onDateChange(new Date())}>
            Today
          </Button>
        )}
      </div>

      {/* Right: Clock, user, pending, book */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono tabular-nums">{format(clock, 'HH:mm:ss')}</span>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">AP</div>
          <div>
            <div className="text-xs font-semibold text-foreground leading-tight">Adrian Perez</div>
            <div className="text-[10px] text-muted-foreground">Admin</div>
          </div>
        </div>

        {pendingCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-semibold"
            onClick={onOpenPending}
          >
            {pendingCount} Pending
          </Button>
        )}

        <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={onBookFlight}>
          <Plus className="h-3.5 w-3.5" />
          Book Flight
        </Button>
      </div>
    </header>
  );
}
