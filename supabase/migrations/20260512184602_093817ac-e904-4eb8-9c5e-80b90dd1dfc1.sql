
-- ========== APPLICATIONS ==========
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  course_interest text,
  notes text,
  internal_notes text,
  status text NOT NULL DEFAULT 'new',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit application" ON public.applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin/dispatch can read applications" ON public.applications
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch'));
CREATE POLICY "Admin/dispatch can update applications" ON public.applications
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch'));
CREATE POLICY "Admin can delete applications" ON public.applications
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TABLE public.application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can attach application docs" ON public.application_documents
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin/dispatch can read application docs" ON public.application_documents
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch'));
CREATE POLICY "Admin can delete application docs" ON public.application_documents
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ========== SUBSCRIPTIONS ==========
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  interval text NOT NULL DEFAULT 'month',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read plans" ON public.subscription_plans
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage plans" ON public.subscription_plans
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TABLE public.member_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.member_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own subs" ON public.member_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin/dispatch read all subs" ON public.member_subscriptions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch'));
CREATE POLICY "Admin/dispatch manage subs" ON public.member_subscriptions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch'));

-- ========== DOCUMENTS ==========
CREATE TABLE public.school_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  file_path text NOT NULL,
  expires_at timestamptz,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.school_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read school docs" ON public.school_documents
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/dispatch manage school docs" ON public.school_documents
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch'));

CREATE TABLE public.document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  default_validity_days integer,
  required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read doc types" ON public.document_types
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage doc types" ON public.document_types
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

ALTER TABLE public.user_documents
  ADD COLUMN IF NOT EXISTS document_type_id uuid REFERENCES public.document_types(id),
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS issued_at timestamptz;

-- ========== ANNOUNCEMENTS ==========
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  pinned boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read announcements" ON public.announcements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/dispatch manage announcements" ON public.announcements
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch'));

CREATE TABLE public.announcement_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reads" ON public.announcement_reads
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ========== AUDIT LOG ==========
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit log" ON public.audit_log
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _entity_id uuid;
  _action text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _entity_id := OLD.id;
    _action := TG_OP || ':' || TG_TABLE_NAME;
  ELSE
    _entity_id := NEW.id;
    _action := TG_OP || ':' || TG_TABLE_NAME;
  END IF;
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    _action,
    TG_TABLE_NAME,
    _entity_id,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_applications AFTER INSERT OR UPDATE OR DELETE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_announcements AFTER INSERT OR UPDATE OR DELETE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_school_documents AFTER INSERT OR UPDATE OR DELETE ON public.school_documents
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_subscription_plans AFTER INSERT OR UPDATE OR DELETE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_member_subscriptions AFTER INSERT OR UPDATE OR DELETE ON public.member_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- ========== SCHOOL SETTINGS ==========
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS brand_color text,
  ADD COLUMN IF NOT EXISTS default_course_id uuid,
  ADD COLUMN IF NOT EXISTS default_instructor_rate numeric,
  ADD COLUMN IF NOT EXISTS default_ground_rate numeric;

-- ========== STORAGE ==========
INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('school-documents', 'school-documents', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone upload application docs" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'application-documents');
CREATE POLICY "Admin/dispatch read application docs" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'application-documents' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch')));
CREATE POLICY "Admin delete application docs" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'application-documents' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated read school docs storage" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'school-documents');
CREATE POLICY "Admin/dispatch upload school docs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'school-documents' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch')));
CREATE POLICY "Admin/dispatch update school docs" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'school-documents' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch')));
CREATE POLICY "Admin/dispatch delete school docs" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'school-documents' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'dispatch')));
