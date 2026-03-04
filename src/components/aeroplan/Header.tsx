import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Clock, Plane, PanelLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  pendingCount: number;
  onBookFlight: () => void;
  onOpenPending: () => void;
}

export default function Header({ pendingCount, onBookFlight, onOpenPending }: HeaderProps) {
  const [clock, setClock] = useState(new Date());
  const { toggleSidebar } = useSidebar();
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <header className="flex items-center justify-between bg-card px-5 py-3 shadow-sm" style={{ borderRadius: '0 0 14px 14px' }}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Plane className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-foreground">AeroPlan</h1>
          <p className="text-xs text-muted-foreground">Opa-locka Executive · KOPF</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono tabular-nums">{format(clock, 'HH:mm:ss')}</span>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground leading-tight">{user?.name || '…'}</div>
            <div className="text-[10px] text-muted-foreground capitalize">{user?.role || '…'}</div>
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

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout} title="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
