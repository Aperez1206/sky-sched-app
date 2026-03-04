import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCourses } from '@/hooks/useAccountData';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface SessionsTabProps {
  userId: string;
  isInstructor: boolean;
}

export default function SessionsTab({ userId, isInstructor }: SessionsTabProps) {
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const { data: courses } = useCourses();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['flight-sessions', userId, courseFilter],
    enabled: !!userId,
    queryFn: async () => {
      let q = supabase
        .from('flight_sessions')
        .select('*')
        .or(`student_id.eq.${userId},instructor_id.eq.${userId}`)
        .eq('status', 'completed')
        .order('checked_in_at', { ascending: false });

      if (courseFilter !== 'all') {
        q = q.eq('course_id', courseFilter);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Course:</span>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses?.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground p-4">Loading…</p>
      ) : !sessions?.length ? (
        <p className="text-sm text-muted-foreground p-4">No sessions found.</p>
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
            {sessions.map((s) => {
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
    </div>
  );
}
