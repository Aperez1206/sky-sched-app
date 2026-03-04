import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ open, onOpenChange, onSuccess }: AddMemberModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('student');
  const [courseId, setCourseId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('id, name');
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const res = await supabase.functions.invoke('invite-member', {
      body: {
        email,
        full_name: fullName,
        role,
        course_id: role === 'student' && courseId ? courseId : null,
      },
    });

    setLoading(false);

    if (res.error || res.data?.error) {
      toast({
        title: 'Invite failed',
        description: res.data?.error || res.error?.message || 'Unknown error',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Invite sent', description: `${fullName} has been invited as ${role}.` });
      setFullName('');
      setEmail('');
      setRole('student');
      setCourseId('');
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>Send an invite email. The user will set their password via a magic link.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Full Name</Label>
            <Input id="invite-name" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="dispatch">Dispatch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {role === 'student' && courses.length > 0 && (
            <div className="space-y-1.5">
              <Label>Course (optional)</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue placeholder="No course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send Invite'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
