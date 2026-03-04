import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBalance(userId: string | undefined) {
  return useQuery({
    queryKey: ['balance', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_transactions')
        .select('amount')
        .eq('user_id', userId!);
      if (error) throw error;
      return (data ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
    },
  });
}

export function useTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: ['transactions', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_transactions')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

export function useCourseEnrollments(userId: string | undefined) {
  return useQuery({
    queryKey: ['enrollments', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*, courses(*)')
        .eq('user_id', userId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useUserDocuments(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-documents', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpcomingReservations(userId: string | undefined) {
  return useQuery({
    queryKey: ['upcoming-reservations', userId],
    enabled: !!userId,
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('flight_reservations')
        .select('*')
        .or(`student_id.eq.${userId},instructor_id.eq.${userId},booked_by.eq.${userId}`)
        .gte('scheduled_start', now)
        .order('scheduled_start', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
