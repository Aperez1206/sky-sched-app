import { UserRole } from '@/data/aeroplan';

interface CurrentUser {
  name: string;
  role: UserRole;
}

export function useCurrentUser(): CurrentUser {
  return { name: 'Chief Administrator', role: 'admin' };
}
