import { useState } from 'react';
import { useAnnouncements } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pin, Trash2, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AnnouncementsTab() {
  const { data, isLoading } = useAnnouncements();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> New announcement</Button></DialogTrigger>
          <NewAnnouncementDialog onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ['announcements'] }); }} />
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? <p className="p-6 text-sm text-muted-foreground">Loading…</p> :
           !data?.length ? <div className="p-10 text-center text-muted-foreground"><Megaphone className="h-8 w-8 mx-auto mb-2" /><p className="text-sm">No announcements yet.</p></div> :
            <div className="divide-y">
              {data.map((a) => (
                <div key={a.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {a.pinned && <Pin className="h-3.5 w-3.5 text-amber-600" />}
                      <p className="font-medium text-sm">{a.title}</p>
                      <Badge variant="outline" className="text-xs">{a.audience}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">Posted {format(new Date(a.created_at!), 'PP')}{a.expires_at ? ` · expires ${format(new Date(a.expires_at), 'PP')}` : ''}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={async () => {
                    await supabase.from('announcements').delete().eq('id', a.id);
                    qc.invalidateQueries({ queryKey: ['announcements'] });
                    toast.success('Deleted.');
                  }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}

function NewAnnouncementDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', pinned: false, expires_at: '' });
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New announcement</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Title</Label><Input value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Body</Label><Textarea value={form.body} maxLength={2000} rows={4} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Audience</Label>
            <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="instructor">Instructors</SelectItem>
                <SelectItem value="dispatch">Dispatch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Expires (optional)</Label><Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
        </div>
        <div className="flex items-center gap-2"><Switch checked={form.pinned} onCheckedChange={(v) => setForm({ ...form, pinned: v })} /><Label>Pin to top</Label></div>
        <Button onClick={async () => {
          if (!form.title.trim() || !form.body.trim()) { toast.error('Title and body required'); return; }
          const { data: { user } } = await supabase.auth.getUser();
          const { error } = await supabase.from('announcements').insert({
            title: form.title, body: form.body, audience: form.audience, pinned: form.pinned,
            expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
            created_by: user?.id,
          });
          if (error) { toast.error(error.message); return; }
          toast.success('Posted.');
          onClose();
        }}>Post announcement</Button>
      </div>
    </DialogContent>
  );
}
