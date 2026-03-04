import { useCourseEnrollments } from '@/hooks/useAccountData';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

interface CoursesTabProps {
  userId: string;
}

export default function CoursesTab({ userId }: CoursesTabProps) {
  const { data: enrollments, isLoading } = useCourseEnrollments(userId);

  if (isLoading) return <p className="text-sm text-muted-foreground p-4">Loading…</p>;
  if (!enrollments?.length) return <p className="text-sm text-muted-foreground p-4">No course enrollments.</p>;

  return (
    <div className="space-y-3">
      {enrollments.map((e: any) => (
        <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{e.courses?.name ?? 'Unknown Course'}</p>
              <p className="text-xs text-muted-foreground">
                Enrolled {e.enrolled_at ? format(new Date(e.enrolled_at), 'MMM d, yyyy') : '—'}
                {e.graduated_at && ` · Graduated ${format(new Date(e.graduated_at), 'MMM d, yyyy')}`}
              </p>
            </div>
          </div>
          <Badge variant={e.status === 'graduated' ? 'default' : 'secondary'}>
            {e.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
