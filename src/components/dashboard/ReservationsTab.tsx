import { useUpcomingReservations } from '@/hooks/useAccountData';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ReservationsTabProps {
  userId: string;
}

export default function ReservationsTab({ userId }: ReservationsTabProps) {
  const { data: reservations, isLoading } = useUpcomingReservations(userId);

  if (isLoading) return <p className="text-sm text-muted-foreground p-4">Loading…</p>;
  if (!reservations?.length) return <p className="text-sm text-muted-foreground p-4">No upcoming reservations.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Aircraft</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="text-xs">{format(new Date(r.scheduled_start), 'MMM d, yyyy')}</TableCell>
            <TableCell className="text-xs">
              {format(new Date(r.scheduled_start), 'h:mm a')} – {format(new Date(r.scheduled_end), 'h:mm a')}
            </TableCell>
            <TableCell className="font-medium text-xs">{r.aircraft_tail || '—'}</TableCell>
            <TableCell className="text-xs capitalize">{r.flight_type_id || '—'}</TableCell>
            <TableCell>
              <Badge variant={r.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                {r.status || 'pending'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
