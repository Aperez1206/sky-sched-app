import { useEffect, useState } from 'react';
import { useSchoolSettings } from '@/hooks/useAdminData';
import { useCourses } from '@/hooks/useAccountData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function SettingsTab() {
  const { data: school } = useSchoolSettings();
  const { data: courses } = useCourses();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>({});

  useEffect(() => { if (school) setForm(school); }, [school]);

  const save = async () => {
    if (!school?.id) { toast.error('No school record found.'); return; }
    const { error } = await supabase.from('schools').update({
      name: form.name,
      address: form.address,
      phone: form.phone,
      brand_color: form.brand_color,
      default_course_id: form.default_course_id || null,
      default_instructor_rate: form.default_instructor_rate ? Number(form.default_instructor_rate) : null,
      default_ground_rate: form.default_ground_rate ? Number(form.default_ground_rate) : null,
    }).eq('id', school.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Settings saved.');
    qc.invalidateQueries({ queryKey: ['school-settings'] });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <Card>
        <CardHeader><CardTitle className="text-base">School information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Name</Label><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Address</Label><Input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Brand color</Label><Input type="color" value={form.brand_color || '#3b82f6'} onChange={(e) => setForm({ ...form, brand_color: e.target.value })} className="h-10 w-24" /></div>
          <p className="text-xs text-muted-foreground">Logo upload and live theming will be wired in a future iteration.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Defaults</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Default course for new admissions</Label>
            <Select value={form.default_course_id || ''} onValueChange={(v) => setForm({ ...form, default_course_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
              <SelectContent>{courses?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Instructor rate ($/hr)</Label><Input type="number" value={form.default_instructor_rate || ''} onChange={(e) => setForm({ ...form, default_instructor_rate: e.target.value })} /></div>
            <div><Label>Ground rate ($/hr)</Label><Input type="number" value={form.default_ground_rate || ''} onChange={(e) => setForm({ ...form, default_ground_rate: e.target.value })} /></div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex justify-end">
        <Button onClick={save}>Save settings</Button>
      </div>
    </div>
  );
}
