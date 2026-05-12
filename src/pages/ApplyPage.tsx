import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plane, Check } from 'lucide-react';

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', course_interest: '', notes: '' });
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    setLoading(true);
    const { data: app, error } = await supabase.from('applications').insert(form).select().single();
    if (error || !app) {
      setLoading(false);
      toast.error('Failed to submit application.');
      return;
    }
    if (files && files.length) {
      for (const file of Array.from(files)) {
        const path = `${app.id}/${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage.from('application-documents').upload(path, file);
        if (!upErr) {
          await supabase.from('application_documents').insert({ application_id: app.id, name: file.name, file_path: path });
        }
      }
    }
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold">Application received</h2>
            <p className="text-sm text-muted-foreground">We'll review your application and reach out by email shortly.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="h-5 w-5 text-slate-600" />
          <h1 className="text-2xl font-semibold">Flight School Application</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tell us about yourself</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full name *</Label>
                <Input id="full_name" value={form.full_name} maxLength={120} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} maxLength={255} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} maxLength={40} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="course">Course of interest</Label>
                <Input id="course" placeholder="e.g. Private Pilot Part 141" value={form.course_interest} maxLength={120} onChange={(e) => setForm({ ...form, course_interest: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="notes">Anything else?</Label>
                <Textarea id="notes" value={form.notes} maxLength={2000} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} />
              </div>
              <div>
                <Label htmlFor="files">Supporting documents (optional)</Label>
                <Input id="files" type="file" multiple onChange={(e) => setFiles(e.target.files)} />
                <p className="text-xs text-muted-foreground mt-1">ID, transcripts, medical certificate, etc.</p>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Submitting…' : 'Submit application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
