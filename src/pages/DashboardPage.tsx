import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PersonDashboard } from './PersonDetailPage';

export default function DashboardPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-full text-muted-foreground">Loading…</div>;
  if (!user) return <div className="flex items-center justify-center h-full text-muted-foreground">Please sign in to view your dashboard.</div>;

  return <PersonDashboard personId={user.id} showBackButton={false} isOwnDashboard />;
}
