import { useAuth, AppRole } from '@/hooks/useAuth';
import { UserRole } from '@/data/aeroplan';

interface CurrentUser {
  name: string;
  role: UserRole;
}

export function useCurrentUser(): CurrentUser {
  const { profile, role } = useAuth();
  return {
    name: profile?.full_name || 'User',
    role: (role as UserRole) || 'student',
  };
}
