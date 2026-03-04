
-- Create member_invites table
CREATE TABLE public.member_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  role public.app_role NOT NULL,
  course_id uuid REFERENCES public.courses(id),
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.member_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invites"
  ON public.member_invites FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user trigger to check invites
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _invite RECORD;
  _role public.app_role;
BEGIN
  -- Check for a pending invite
  SELECT * INTO _invite FROM public.member_invites
    WHERE email = NEW.email AND status = 'pending'
    LIMIT 1;

  IF _invite IS NOT NULL THEN
    _role := _invite.role;

    -- Mark invite as accepted
    UPDATE public.member_invites SET status = 'accepted' WHERE id = _invite.id;
  ELSE
    _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student');
  END IF;

  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(_invite.full_name, NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  -- Auto-enroll in course if invite specified one
  IF _invite IS NOT NULL AND _invite.course_id IS NOT NULL THEN
    INSERT INTO public.course_enrollments (user_id, course_id, status)
    VALUES (NEW.id, _invite.course_id, 'enrolled');
  END IF;

  RETURN NEW;
END;
$$;
