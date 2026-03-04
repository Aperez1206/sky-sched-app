import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, FileText, GraduationCap, Plane, CalendarDays } from 'lucide-react';
import BalanceCard from '@/components/dashboard/BalanceCard';
import TransactionsCard from '@/components/dashboard/TransactionsCard';
import ReservationsTab from '@/components/dashboard/ReservationsTab';
import SessionsTab from '@/components/dashboard/SessionsTab';
import CoursesTab from '@/components/dashboard/CoursesTab';
import DocumentsTab from '@/components/dashboard/DocumentsTab';

interface PersonDashboardProps {
  personId: string;
  showBackButton?: boolean;
  isOwnDashboard?: boolean;
}

export function PersonDashboard({ personId, showBackButton = true, isOwnDashboard = false }: PersonDashboardProps) {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile', personId],
    enabled: !!personId,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', personId).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: role } = useQuery({
    queryKey: ['user-role', personId],
    enabled: !!personId,
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', personId).single();
      if (error) return null;
      return data?.role;
    },
  });

  const { data: currentUserRole } = useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
      return data?.role ?? null;
    },
  });

  const isInstructor = role === 'instructor';
  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      <header className="flex items-center gap-3 bg-card px-5 py-3 shadow-sm" style={{ borderRadius: '0 0 14px 14px' }}>
        {showBackButton && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/people')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-foreground">{profile?.full_name || 'Loading…'}</h1>
          <p className="text-xs text-muted-foreground capitalize">{role || '—'} · {profile?.email}</p>
        </div>
      </header>

      <div className="flex-1 mx-3 mt-2 mb-1 space-y-3 overflow-auto pb-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <BalanceCard userId={personId} isOwnDashboard={isOwnDashboard} />
          <TransactionsCard userId={personId} />
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-xl shadow-sm p-4">
          <Tabs defaultValue="reservations">
            <TabsList className="mb-4">
              <TabsTrigger value="reservations" className="gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Reservations
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-1">
                <Plane className="h-3.5 w-3.5" /> Sessions
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-1">
                <GraduationCap className="h-3.5 w-3.5" /> Courses
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-1">
                <FileText className="h-3.5 w-3.5" /> Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reservations">
              <ReservationsTab userId={personId} />
            </TabsContent>
            <TabsContent value="sessions">
              <SessionsTab userId={personId} isInstructor={isInstructor} />
            </TabsContent>
            <TabsContent value="courses">
              <CoursesTab userId={personId} />
            </TabsContent>
            <TabsContent value="documents">
              <DocumentsTab userId={personId} isAdmin={isAdmin} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function PersonDetailPage() {
  const { personId } = useParams<{ personId: string }>();
  if (!personId) return null;
  return <PersonDashboard personId={personId} showBackButton />;
}
