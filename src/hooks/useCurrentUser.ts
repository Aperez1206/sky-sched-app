import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

export function useCurrentUser(): { user: CurrentUser | null; loading: boolean } {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || cancelled) {
        setLoading(false);
        return;
      }

      const uid = session.user.id;

      const [profileRes, roleRes] = await Promise.all([
        supabase.from('profiles').select('full_name, email').eq('id', uid).single(),
        supabase.from('user_roles').select('role').eq('user_id', uid).single(),
      ]);

      if (!cancelled) {
        setUser({
          id: uid,
          name: profileRes.data?.full_name || session.user.email || '',
          email: profileRes.data?.email || session.user.email || '',
          role: roleRes.data?.role || null,
        });
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setLoading(false);
      } else {
        load();
      }
    });

    load();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
