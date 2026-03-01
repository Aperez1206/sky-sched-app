import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { STAFF, INSTRUCTOR_RECORDS, STUDENT_RECORDS } from '@/data/people';
import { Users } from 'lucide-react';

const statusBadge = (status: string) => {
  const variants: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-muted text-muted-foreground',
    'on-leave': 'bg-amber-100 text-amber-700 border-amber-200',
    'on-hold': 'bg-amber-100 text-amber-700 border-amber-200',
    graduated: 'bg-sky-100 text-sky-700 border-sky-200',
  };
  return (
    <Badge variant="outline" className={variants[status] || ''}>
      {status.replace('-', ' ')}
    </Badge>
  );
};

export default function PeoplePage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 bg-card px-5 py-3 shadow-sm" style={{ borderRadius: '0 0 14px 14px' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-foreground">People</h1>
          <p className="text-xs text-muted-foreground">Staff, Instructors & Students</p>
        </div>
      </header>

      <div className="flex-1 mx-3 mt-2 mb-1">
        <div className="bg-card rounded-xl shadow-sm p-4 h-full overflow-auto">
          <Tabs defaultValue="staff">
            <TabsList className="mb-4">
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="instructors">Instructors</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>

            <TabsContent value="staff">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STAFF.map((s) => (
                    <TableRow key={s.email}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.role}</TableCell>
                      <TableCell className="text-muted-foreground">{s.email}</TableCell>
                      <TableCell>{statusBadge(s.status)}</TableCell>
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
                    <TableHead>Certifications</TableHead>
                    <TableHead>Students Assigned</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INSTRUCTOR_RECORDS.map((inst) => (
                    <TableRow key={inst.name}>
                      <TableCell className="font-medium">{inst.name}</TableCell>
                      <TableCell>{inst.certs}</TableCell>
                      <TableCell>{inst.studentsAssigned}</TableCell>
                      <TableCell>{statusBadge(inst.status)}</TableCell>
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
                    <TableHead>Enrolled Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STUDENT_RECORDS.map((st) => (
                    <TableRow key={st.name}>
                      <TableCell className="font-medium">{st.name}</TableCell>
                      <TableCell>{st.enrolledCourse}</TableCell>
                      <TableCell>{st.assignedInstructor}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${st.progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{st.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{statusBadge(st.status)}</TableCell>
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
