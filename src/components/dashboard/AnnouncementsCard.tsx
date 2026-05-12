import { useAnnouncements } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Pin } from 'lucide-react';
import { format } from 'date-fns';

export default function AnnouncementsCard({ role }: { role?: string | null }) {
  const { data } = useAnnouncements();
  const now = new Date();
  const visible = (data || []).filter((a) =>
    (a.audience === 'all' || a.audience === role) &&
    (!a.expires_at || new Date(a.expires_at) > now)
  ).slice(0, 5);

  if (!visible.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Megaphone className="h-4 w-4" /> Announcements</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {visible.map((a) => (
          <div key={a.id} className="border-l-2 border-blue-400 pl-3">
            <div className="flex items-center gap-2">
              {a.pinned && <Pin className="h-3 w-3 text-amber-600" />}
              <p className="font-medium text-sm">{a.title}</p>
              <Badge variant="outline" className="text-xs">{a.audience}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{a.body}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(a.created_at!), 'PP')}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
