import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EnrollmentModal from '@/components/people/EnrollmentModal';
import { Navigate } from 'react-router-dom';

interface ProfileWithRole {
  id: string;
  full_name: string;
  email: string;
  enrollment_status: string;
  primary_instructor_id: string | null;
  secondary_instructor_id: string | null;
  course_id: string | null;
  role: AppRole;
}

const statusBadge = (status: string) => {
  const variants: Record<string, string> = {
    enrolled: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    unenrolled: 'bg-amber-100 text-amber-700 border-amber-200',
    graduated: 'bg-sky-100 text-sky-700 border-sky-200',
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return (
    <Badge variant="outline" className={variants[status] || ''}>
      {status}
    </Badge>
  );
};

export default function PeoplePage() {
  const { role: currentRole } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<ProfileWithRole[]>([]);
  const [instructors, setInstructors] = useState<ProfileWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollStudent, setEnrollStudent] = useState<{ id: string; name: string } | null>(null);

  const isAdmin = currentRole === 'admin';

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    const { data: roles } = await supabase.from('user_roles').select('user_id, role');
    if (!roles) { setLoading(false); return; }

    const studentIds = roles.filter((r: any) => r.role === 'student').map((r: any) => r.user_id);
    const instructorIds = roles.filter((r: any) => r.role === 'instructor').map((r: any) => r.user_id);

    const [studentsRes, instructorsRes] = await Promise.all([
      studentIds.length > 0
        ? supabase.from('profiles').select('*').in('id', studentIds)
        : Promise.resolve({ data: [] }),
      instructorIds.length > 0
        ? supabase.from('profiles').select('*').in('id', instructorIds)
        : Promise.resolve({ data: [] }),
    ]);

    setStudents((studentsRes.data || []).map((p: any) => ({ ...p, role: 'student' as AppRole })));
    setInstructors((instructorsRes.data || []).map((p: any) => ({ ...p, role: 'instructor' as AppRole })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchPeople(); }, [fetchPeople]);

  // Gate: only admin + dispatch
  if (currentRole && currentRole !== 'admin' && currentRole !== 'dispatch') {
    return <Navigate to="/" replace />;
  }

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole } as any)
      .eq('user_id', userId);
    if (error) {
      toast({ title: 'Failed to update role', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Role updated' });
      fetchPeople();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 bg-card px-5 py-3 shadow-sm" style={{ borderRadius: '0 0 14px 14px' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-foreground">People</h1>
          <p className="text-xs text-muted-foreground">Students & Instructors</p>
        </div>
      </header>

      <div className="flex-1 mx-3 mt-2 mb-1">
        <div className="bg-card rounded-xl shadow-sm p-4 h-full overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="students">
              <TabsList className="mb-4">
                <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
                <TabsTrigger value="instructors">Instructors ({instructors.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="students">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Course</TableHead>
                      {isAdmin && <TableHead>Role</TableHead>}
                      {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow><TableCell colSpan={isAdmin ? 6 : 4} className="text-center text-muted-foreground py-8">No students registered yet</TableCell></TableRow>
                    ) : students.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.email}</TableCell>
                        <TableCell>{statusBadge(s.enrollment_status)}</TableCell>
                        <TableCell className="text-muted-foreground">{s.course_id || '—'}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Select value={s.role} onValueChange={(v) => handleRoleChange(s.id, v as AppRole)}>
                              <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="dispatch">Dispatch</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                        {isAdmin && (
                          <TableCell>
                            {s.enrollment_status === 'unenrolled' && (
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setEnrollStudent({ id: s.id, name: s.full_name })}>
                                <UserPlus className="h-3 w-3" /> Enroll
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="instructors">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      {isAdmin && <TableHead>Role</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instructors.length === 0 ? (
                      <TableRow><TableCell colSpan={isAdmin ? 3 : 2} className="text-center text-muted-foreground py-8">No instructors registered yet</TableCell></TableRow>
                    ) : instructors.map(i => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{i.email}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Select value={i.role} onValueChange={(v) => handleRoleChange(i.id, v as AppRole)}>
                              <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="dispatch">Dispatch</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {enrollStudent && (
        <EnrollmentModal
          open={!!enrollStudent}
          onClose={() => setEnrollStudent(null)}
          studentId={enrollStudent.id}
          studentName={enrollStudent.name}
          onEnrolled={fetchPeople}
        />
      )}
    </div>
  );
}
