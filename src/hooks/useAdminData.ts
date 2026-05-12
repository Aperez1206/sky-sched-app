import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Applications
export function useApplications(status?: string) {
  return useQuery({
    queryKey: ['applications', status],
    queryFn: async () => {
      let q = supabase.from('applications').select('*').order('created_at', { ascending: false });
      if (status && status !== 'all') q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useApplicationDocuments(appId: string | undefined) {
  return useQuery({
    queryKey: ['application-documents', appId],
    enabled: !!appId,
    queryFn: async () => {
      const { data, error } = await supabase.from('application_documents').select('*').eq('application_id', appId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: { id: string; status?: string; internal_notes?: string }) => {
      const { error } = await supabase.from('applications').update({ ...rest, reviewed_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
}

// Subscription plans
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscription_plans').select('*').order('created_at');
      if (error) throw error;
      return data;
    },
  });
}

export function useMemberSubscriptions(userId?: string) {
  return useQuery({
    queryKey: ['member-subscriptions', userId],
    queryFn: async () => {
      let q = supabase.from('member_subscriptions').select('*, subscription_plans(*)').order('created_at', { ascending: false });
      if (userId) q = q.eq('user_id', userId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// School documents
export function useSchoolDocuments() {
  return useQuery({
    queryKey: ['school-documents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('school_documents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Document types
export function useDocumentTypes() {
  return useQuery({
    queryKey: ['document-types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('document_types').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });
}

// Compliance matrix: all profiles + their user_documents
export function useComplianceMatrix() {
  return useQuery({
    queryKey: ['compliance-matrix'],
    queryFn: async () => {
      const [profilesRes, docsRes, typesRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email'),
        supabase.from('user_documents').select('id, user_id, name, document_type_id, expires_at'),
        supabase.from('document_types').select('*').eq('required', true),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      if (docsRes.error) throw docsRes.error;
      if (typesRes.error) throw typesRes.error;
      return {
        profiles: profilesRes.data || [],
        docs: docsRes.data || [],
        types: typesRes.data || [],
      };
    },
  });
}

// Announcements
export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Audit log
export function useAuditLog() {
  return useQuery({
    queryKey: ['audit-log'],
    queryFn: async () => {
      const { data, error } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });
}

// School settings
export function useSchoolSettings() {
  return useQuery({
    queryKey: ['school-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schools').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
