import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText } from 'lucide-react';

interface Instructor {
  id: string;
  full_name: string;
}

interface EnrollmentModalProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onEnrolled: () => void;
}

export default function EnrollmentModal({ open, onClose, studentId, studentName, onEnrolled }: EnrollmentModalProps) {
  const { toast } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [primaryInstructor, setPrimaryInstructor] = useState('');
  const [secondaryInstructor, setSecondaryInstructor] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'instructor')
      .then(async ({ data }) => {
        if (!data) return;
        const ids = data.map((r: any) => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ids);
        if (profiles) setInstructors(profiles as unknown as Instructor[]);
      });
  }, [open]);

  const handleSubmit = async () => {
    if (!primaryInstructor) {
      toast({ title: 'Select a primary instructor', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        enrollment_status: 'enrolled',
        primary_instructor_id: primaryInstructor,
        secondary_instructor_id: secondaryInstructor || null,
        course_id: course || null,
      } as any)
      .eq('id', studentId);
    setLoading(false);
    if (error) {
      toast({ title: 'Failed to enroll', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `${studentName} enrolled successfully` });
      onEnrolled();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Course</label>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger><SelectValue placeholder="Select course (coming soon)..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="private-141">Part 141 – Private Pilot</SelectItem>
                <SelectItem value="instrument-141">Part 141 – Instrument Rating</SelectItem>
                <SelectItem value="part61">Part 61 Instruction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Primary Instructor</label>
            <Select value={primaryInstructor} onValueChange={setPrimaryInstructor}>
              <SelectTrigger><SelectValue placeholder="Select instructor..." /></SelectTrigger>
              <SelectContent>
                {instructors.map(i => (
                  <SelectItem key={i.id} value={i.id}>{i.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Secondary Instructor (optional)</label>
            <Select value={secondaryInstructor} onValueChange={setSecondaryInstructor}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {instructors.filter(i => i.id !== primaryInstructor).map(i => (
                  <SelectItem key={i.id} value={i.id}>{i.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border border-dashed border-border p-4 text-center">
            <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground font-medium">Add Documents</p>
            <p className="text-[10px] text-muted-foreground">Document uploads coming soon</p>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enroll Student'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
