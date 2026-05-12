import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from './useCurrentUser';

export function useAdminGuard() {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();
  const allowed = user?.role === 'admin' || user?.role === 'dispatch';

  useEffect(() => {
    if (!loading && !allowed) navigate('/dashboard', { replace: true });
  }, [loading, allowed, navigate]);

  return { allowed, loading, user };
}
