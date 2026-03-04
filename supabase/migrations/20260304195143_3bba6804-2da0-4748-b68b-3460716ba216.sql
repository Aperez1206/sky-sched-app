
-- 1. courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. course_enrollments table
CREATE TABLE public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'enrolled',
  enrolled_at timestamptz DEFAULT now(),
  graduated_at timestamptz,
  UNIQUE (user_id, course_id)
);
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read enrollments" ON public.course_enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage enrollments" ON public.course_enrollments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. account_transactions table
CREATE TABLE public.account_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  description text NOT NULL,
  reference_type text,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own transactions" ON public.account_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin/dispatch can read all transactions" ON public.account_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatch'));
CREATE POLICY "Admin/dispatch can insert transactions" ON public.account_transactions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatch'));

-- 4. user_documents table
CREATE TABLE public.user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own documents" ON public.user_documents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all documents" ON public.user_documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. Storage bucket for user documents
INSERT INTO storage.buckets (id, name, public) VALUES ('user-documents', 'user-documents', false);
CREATE POLICY "Users can read own doc files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins can upload doc files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'user-documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read all doc files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'user-documents' AND public.has_role(auth.uid(), 'admin'));

-- 6. Add course_id to flight_sessions
ALTER TABLE public.flight_sessions ADD COLUMN course_id uuid REFERENCES public.courses(id);
