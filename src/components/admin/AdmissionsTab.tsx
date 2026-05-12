import { useState } from 'react';
import { useApplications, useApplicationDocuments, useUpdateApplication } from '@/hooks/useAdminData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Inbox, ExternalLink, Download } from 'lucide-react';

const STATUSES = ['new', 'under_review', 'accepted', 'rejected', 'invited'];
const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  invited: 'bg-violet-100 text-violet-700',
};

export default function AdmissionsTab() {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: applications, isLoading } = useApplications(filter);

  const applyLink = `${window.location.origin}/apply`;

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Public application link: </span>
            <a className="text-blue-600 hover:underline inline-flex items-center gap-1" href={applyLink} target="_blank" rel="noreferrer">
              {applyLink} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : !applications?.length ? (
            <div className="p-10 text-center text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No applications yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((a) => (
                <button key={a.id} onClick={() => setSelectedId(a.id)} className="w-full text-left p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{a.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.email} · {a.course_interest || 'No course specified'}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={STATUS_COLOR[a.status] || ''} variant="outline">{a.status.replace('_', ' ')}</Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(a.created_at!), 'MMM d')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ApplicationDrawer id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function ApplicationDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data: applications } = useApplications('all');
  const { data: docs } = useApplicationDocuments(id || undefined);
  const update = useUpdateApplication();
  const app = applications?.find((a) => a.id === id);
  const [notes, setNotes] = useState('');

  if (!app) return <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}><SheetContent /></Sheet>;

  const handleStatus = async (status: string) => {
    await update.mutateAsync({ id: app.id, status, internal_notes: notes || app.internal_notes || undefined });
    if (status === 'accepted') {
      // Create an invite (admin/dispatch only — RLS will permit). booked invite uses school admin's id; falls back to applicant if no auth.
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('member_invites').insert({
        email: app.email,
        full_name: app.full_name,
        role: 'student' as const,
        invited_by: user?.id || app.id,
      });
      if (!error) {
        await update.mutateAsync({ id: app.id, status: 'invited' });
        toast.success('Applicant accepted and invite created.');
      } else {
        toast.success('Marked accepted (invite creation skipped — sign in to send invite).');
      }
    } else {
      toast.success(`Status updated to ${status.replace('_', ' ')}.`);
    }
  };

  const downloadDoc = async (path: string) => {
    const { data, error } = await supabase.storage.from('application-documents').createSignedUrl(path, 300);
    if (error || !data) { toast.error('Could not generate download link.'); return; }
    window.open(data.signedUrl, '_blank');
  };

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{app.full_name}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={app.email} />
            <Field label="Phone" value={app.phone || '—'} />
            <Field label="Course" value={app.course_interest || '—'} />
            <Field label="Submitted" value={format(new Date(app.created_at!), 'PP')} />
          </div>
          {app.notes && <Field label="Applicant notes" value={app.notes} />}

          <div>
            <p className="font-medium mb-2">Documents</p>
            {!docs?.length ? (
              <p className="text-xs text-muted-foreground">No documents uploaded.</p>
            ) : (
              <div className="space-y-1">
                {docs.map((d) => (
                  <button key={d.id} onClick={() => downloadDoc(d.file_path)} className="flex items-center justify-between w-full p-2 rounded border hover:bg-slate-50 text-left">
                    <span className="truncate">{d.name}</span>
                    <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="font-medium mb-2">Internal notes</p>
            <Textarea value={notes} placeholder={app.internal_notes || 'Add an internal note…'} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" onClick={() => handleStatus('under_review')}>Mark under review</Button>
            <Button size="sm" onClick={() => handleStatus('accepted')}>Accept &amp; invite</Button>
            <Button size="sm" variant="outline" onClick={() => handleStatus('rejected')}>Reject</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  );
}
