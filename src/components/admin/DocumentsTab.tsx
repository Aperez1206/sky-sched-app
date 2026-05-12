import { useRef, useState } from 'react';
import { useSchoolDocuments, useDocumentTypes, useComplianceMatrix } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, FileText, Plus, AlertTriangle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { differenceInDays, format } from 'date-fns';

const CATEGORIES = ['handbook', 'sop', 'form', 'policy', 'other'];

export default function DocumentsTab() {
  return (
    <Tabs defaultValue="library" className="mt-4">
      <TabsList className="bg-white">
        <TabsTrigger value="library">School Library</TabsTrigger>
        <TabsTrigger value="compliance">Compliance Tracker</TabsTrigger>
      </TabsList>
      <TabsContent value="library"><SchoolLibrary /></TabsContent>
      <TabsContent value="compliance"><ComplianceTracker /></TabsContent>
    </Tabs>
  );
}

function expiryStatus(expires_at: string | null) {
  if (!expires_at) return { label: 'No expiry', cls: 'bg-slate-100 text-slate-700' };
  const days = differenceInDays(new Date(expires_at), new Date());
  if (days < 0) return { label: 'Expired', cls: 'bg-rose-100 text-rose-700' };
  if (days < 30) return { label: `${days}d left`, cls: 'bg-amber-100 text-amber-700' };
  return { label: 'Valid', cls: 'bg-emerald-100 text-emerald-700' };
}

function SchoolLibrary() {
  const { data: docs, isLoading } = useSchoolDocuments();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState('other');
  const [expiresAt, setExpiresAt] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from('school-documents').upload(path, file);
    if (upErr) { toast.error('Upload failed'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('school_documents').insert({
      name: file.name,
      file_path: path,
      category,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      uploaded_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Document uploaded.');
    qc.invalidateQueries({ queryKey: ['school-documents'] });
    if (fileRef.current) fileRef.current.value = '';
    setExpiresAt('');
  };

  const handleDownload = async (path: string) => {
    const { data, error } = await supabase.storage.from('school-documents').createSignedUrl(path, 300);
    if (error || !data) return toast.error('Failed');
    window.open(data.signedUrl, '_blank');
  };

  const handleDelete = async (id: string, path: string) => {
    await supabase.storage.from('school-documents').remove([path]);
    await supabase.from('school_documents').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['school-documents'] });
    toast.success('Deleted.');
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Upload to library</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Expiration (optional)</Label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          <div>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
            <Button onClick={() => fileRef.current?.click()} className="gap-1 w-full"><Upload className="h-4 w-4" /> Choose file</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <p className="p-6 text-sm text-muted-foreground">Loading…</p> :
           !docs?.length ? <p className="p-6 text-sm text-muted-foreground">No documents in library.</p> :
            <div className="divide-y">
              {docs.map((d) => {
                const st = expiryStatus(d.expires_at);
                return (
                  <div key={d.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{d.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.category} · {d.expires_at ? `Expires ${format(new Date(d.expires_at), 'PP')}` : 'No expiry'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={st.cls} variant="outline">{st.label}</Badge>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDownload(d.file_path)}><Download className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(d.id, d.file_path)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}

function ComplianceTracker() {
  const { data, isLoading } = useComplianceMatrix();
  const { data: types } = useDocumentTypes();
  const qc = useQueryClient();
  const [openType, setOpenType] = useState(false);

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Required document types</CardTitle>
          <Dialog open={openType} onOpenChange={setOpenType}>
            <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><Plus className="h-3.5 w-3.5" /> New type</Button></DialogTrigger>
            <DocTypeDialog onClose={() => { setOpenType(false); qc.invalidateQueries({ queryKey: ['document-types'] }); qc.invalidateQueries({ queryKey: ['compliance-matrix'] }); }} />
          </Dialog>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {!types?.length ? <p className="text-sm text-muted-foreground">No document types defined.</p> :
            types.map((t) => <Badge key={t.id} variant="outline">{t.name}{t.default_validity_days ? ` · ${t.default_validity_days}d` : ''}</Badge>)
          }
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Member compliance</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {isLoading || !data ? <p className="p-6 text-sm text-muted-foreground">Loading…</p> :
           !data.types.length ? <p className="p-6 text-sm text-muted-foreground">Define required document types above to start tracking compliance.</p> :
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Member</th>
                  {data.types.map((t) => <th key={t.id} className="text-left p-3">{t.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.profiles.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3">
                      <p className="font-medium">{p.full_name || p.email}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </td>
                    {data.types.map((t) => {
                      const doc = data.docs.find((d) => d.user_id === p.id && d.document_type_id === t.id);
                      if (!doc) return <td key={t.id} className="p-3"><span className="inline-flex items-center gap-1 text-rose-600 text-xs"><X className="h-3 w-3" /> Missing</span></td>;
                      const st = expiryStatus(doc.expires_at);
                      return <td key={t.id} className="p-3"><span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${st.cls}`}><Check className="h-3 w-3" />{st.label}</span></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /> Expiring soon</CardTitle></CardHeader>
        <CardContent>
          {!data?.docs.length ? <p className="text-sm text-muted-foreground">No documents tracked.</p> :
            <ul className="space-y-1 text-sm">
              {data.docs
                .filter((d) => d.expires_at && differenceInDays(new Date(d.expires_at), new Date()) < 60)
                .map((d) => {
                  const profile = data.profiles.find((p) => p.id === d.user_id);
                  return (
                    <li key={d.id} className="flex items-center justify-between border rounded p-2">
                      <span>{profile?.full_name || profile?.email || d.user_id} · {d.name}</span>
                      <Badge className={expiryStatus(d.expires_at).cls} variant="outline">{expiryStatus(d.expires_at).label}</Badge>
                    </li>
                  );
                })}
            </ul>
          }
        </CardContent>
      </Card>
    </div>
  );
}

function DocTypeDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', description: '', default_validity_days: '', required: true });
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New document type</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Name</Label><Input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Medical Certificate" /></div>
        <div><Label>Description</Label><Input value={form.description} maxLength={200} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><Label>Default validity (days)</Label><Input type="number" value={form.default_validity_days} onChange={(e) => setForm({ ...form, default_validity_days: e.target.value })} /></div>
        <Button onClick={async () => {
          if (!form.name.trim()) { toast.error('Name required'); return; }
          const { error } = await supabase.from('document_types').insert({
            name: form.name,
            description: form.description || null,
            default_validity_days: form.default_validity_days ? Number(form.default_validity_days) : null,
            required: true,
          });
          if (error) { toast.error(error.message); return; }
          toast.success('Document type added.');
          onClose();
        }}>Create</Button>
      </div>
    </DialogContent>
  );
}
