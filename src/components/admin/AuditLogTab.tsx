import { useAuditLog } from '@/hooks/useAdminData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { History } from 'lucide-react';

export default function AuditLogTab() {
  const { data, isLoading } = useAuditLog();
  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        {isLoading ? <p className="p-6 text-sm text-muted-foreground">Loading…</p> :
         !data?.length ? <div className="p-10 text-center text-muted-foreground"><History className="h-8 w-8 mx-auto mb-2" /><p className="text-sm">No activity recorded yet.</p></div> :
          <div className="divide-y text-sm">
            {data.map((e) => (
              <div key={e.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0">{e.action}</Badge>
                  <span className="truncate text-muted-foreground">
                    {e.entity_type} · {e.entity_id?.slice(0, 8)}…
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{format(new Date(e.created_at), 'PPp')}</span>
              </div>
            ))}
          </div>
        }
      </CardContent>
    </Card>
  );
}
