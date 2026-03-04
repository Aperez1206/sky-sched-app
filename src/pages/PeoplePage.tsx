import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface ProfileWithRole {
  id: string;
  full_name: string;
  email: string;
  enrollment_status: string | null;
  role: string | null;
}

const roleBadge = (role: string | null) => {
  const variants: Record<string, string> = {
    admin: 'bg-rose-100 text-rose-700 border-rose-200',
    dispatch: 'bg-amber-100 text-amber-700 border-amber-200',
    instructor: 'bg-sky-100 text-sky-700 border-sky-200',
    student: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return (
    <Badge variant="outline" className={variants[role || ''] || ''}>
      {role || 'none'}
    </Badge>
  );
};

const enrollmentBadge = (status: string | null) => {
  const variants: Record<string, string> = {
    enrolled: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    graduated: 'bg-sky-100 text-sky-700 border-sky-200',
    unenrolled: 'bg-muted text-muted-foreground',
  };
  return (
    <Badge variant="outline" className={variants[status || ''] || ''}>
      {status || 'unenrolled'}
    </Badge>
  );
};

export default function PeoplePage() {
  const navigate = useNavigate();

  const { data: people = [], isLoading } = useQuery({
    queryKey: ['people-with-roles'],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, enrollment_status');
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rErr) throw rErr;

      const roleMap = new Map(roles.map(r => [r.user_id, r.role]));

      return (profiles || []).map(p => ({
        ...p,
        role: roleMap.get(p.id) || null,
      })) as ProfileWithRole[];
    },
  });

  const staff = people.filter(p => p.role === 'admin' || p.role === 'dispatch');
  const instructors = people.filter(p => p.role === 'instructor');
  const students = people.filter(p => p.role === 'student');

  const handleRowClick = (id: string) => navigate(`/people/${id}`);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center gap-3 bg-card px-5 py-3 shadow-sm" style={{ borderRadius: '0 0 14px 14px' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-foreground">People</h1>
          <p className="text-xs text-muted-foreground">
            {staff.length} Staff · {instructors.length} Instructors · {students.length} Students
          </p>
        </div>
      </header>

      <div className="flex-1 mx-3 mt-2 mb-1">
        <div className="bg-card rounded-xl shadow-sm p-4 h-full overflow-auto">
          <Tabs defaultValue="staff">
            <TabsList className="mb-4">
              <TabsTrigger value="staff">Staff ({staff.length})</TabsTrigger>
              <TabsTrigger value="instructors">Instructors ({instructors.length})</TabsTrigger>
              <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="staff">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No staff members yet</TableCell></TableRow>
                  )}
                  {staff.map((s) => (
                    <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(s.id)}>
                      <TableCell className="font-medium">{s.full_name}</TableCell>
                      <TableCell>{roleBadge(s.role)}</TableCell>
                      <TableCell className="text-muted-foreground">{s.email}</TableCell>
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
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instructors.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No instructors yet</TableCell></TableRow>
                  )}
                  {instructors.map((inst) => (
                    <TableRow key={inst.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(inst.id)}>
                      <TableCell className="font-medium">{inst.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{inst.email}</TableCell>
                      <TableCell>{roleBadge(inst.role)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="students">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrollment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No students yet</TableCell></TableRow>
                  )}
                  {students.map((st) => (
                    <TableRow key={st.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(st.id)}>
                      <TableCell className="font-medium">{st.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{st.email}</TableCell>
                      <TableCell>{enrollmentBadge(st.enrollment_status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
