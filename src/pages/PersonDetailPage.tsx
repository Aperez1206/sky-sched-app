import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFlightSessionsForPerson } from '@/hooks/useFlightSessions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, FileText, GraduationCap, Plane } from 'lucide-react';
import { format } from 'date-fns';

export default function PersonDetailPage() {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile', personId],
    enabled: !!personId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', personId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: role } = useQuery({
    queryKey: ['user-role', personId],
    enabled: !!personId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', personId!)
        .single();
      if (error) return null;
      return data?.role;
    },
  });

  const { data: sessions, isLoading: sessionsLoading } = useFlightSessionsForPerson(personId);

  const isInstructor = role === 'instructor';

  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      <header className="flex items-center gap-3 bg-card px-5 py-3 shadow-sm" style={{ borderRadius: '0 0 14px 14px' }}>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/people')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-foreground">{profile?.full_name || 'Loading…'}</h1>
          <p className="text-xs text-muted-foreground capitalize">{role || '—'} · {profile?.email}</p>
        </div>
      </header>

      <div className="flex-1 mx-3 mt-2 mb-1">
        <div className="bg-card rounded-xl shadow-sm p-4 h-full overflow-auto">
          <Tabs defaultValue="sessions">
            <TabsList className="mb-4">
              <TabsTrigger value="sessions" className="gap-1">
                <Plane className="h-3.5 w-3.5" /> Sessions
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-1">
                <GraduationCap className="h-3.5 w-3.5" /> Courses
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-1">
                <FileText className="h-3.5 w-3.5" /> Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sessions">
              {sessionsLoading ? (
                <p className="text-sm text-muted-foreground p-4">Loading sessions…</p>
              ) : !sessions?.length ? (
                <p className="text-sm text-muted-foreground p-4">No flight sessions recorded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Aircraft</TableHead>
                      <TableHead>Hobbs In</TableHead>
                      <TableHead>Hobbs Out</TableHead>
                      <TableHead>Flight Time</TableHead>
                      <TableHead>Tach In</TableHead>
                      <TableHead>Tach Out</TableHead>
                      <TableHead>Tach Time</TableHead>
                      <TableHead>{isInstructor ? 'Dual Given' : 'Dual Received'}</TableHead>
                      <TableHead>Ground</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map(s => {
                      const hobbsIn = s.hobbs_in != null ? Number(s.hobbs_in) : null;
                      const hobbsOut = s.hobbs_out != null ? Number(s.hobbs_out) : null;
                      const tachIn = s.tach_in != null ? Number(s.tach_in) : null;
                      const tachOut = s.tach_out != null ? Number(s.tach_out) : null;
                      const flightTime = hobbsIn != null && hobbsOut != null ? (hobbsOut - hobbsIn).toFixed(1) : '—';
                      const tachTime = tachIn != null && tachOut != null ? (tachOut - tachIn).toFixed(1) : '—';

                      return (
                        <TableRow key={s.id}>
                          <TableCell className="text-xs">{s.checked_in_at ? format(new Date(s.checked_in_at), 'MMM d, yyyy') : '—'}</TableCell>
                          <TableCell className="font-medium text-xs">{s.aircraft_tail}</TableCell>
                          <TableCell className="font-mono text-xs">{hobbsIn?.toFixed(1) ?? '—'}</TableCell>
                          <TableCell className="font-mono text-xs">{hobbsOut?.toFixed(1) ?? '—'}</TableCell>
                          <TableCell className="font-mono font-bold text-xs">{flightTime}</TableCell>
                          <TableCell className="font-mono text-xs">{tachIn?.toFixed(1) ?? '—'}</TableCell>
                          <TableCell className="font-mono text-xs">{tachOut?.toFixed(1) ?? '—'}</TableCell>
                          <TableCell className="font-mono font-bold text-xs">{tachTime}</TableCell>
                          <TableCell className="font-mono text-xs">{s.flight_instruction != null ? Number(s.flight_instruction).toFixed(1) : '—'}</TableCell>
                          <TableCell className="font-mono text-xs">{s.ground_instruction != null ? Number(s.ground_instruction).toFixed(1) : '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="courses">
              <p className="text-sm text-muted-foreground p-4">Course tracking coming soon.</p>
            </TabsContent>

            <TabsContent value="documents">
              <p className="text-sm text-muted-foreground p-4">Document management coming soon.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
