
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'dispatch', 'instructor', 'student');

-- Enrollment status enum
CREATE TYPE public.enrollment_status AS ENUM ('unenrolled', 'enrolled', 'graduated');

-- Schools table
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  school_id uuid REFERENCES public.schools(id),
  enrollment_status public.enrollment_status DEFAULT 'unenrolled',
  primary_instructor_id uuid REFERENCES public.profiles(id),
  secondary_instructor_id uuid REFERENCES public.profiles(id),
  course_id text,
  created_at timestamptz DEFAULT now()
);

-- User roles table (separate per security guidelines)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Flight reservations table
CREATE TABLE public.flight_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booked_by uuid REFERENCES public.profiles(id) NOT NULL,
  student_id uuid REFERENCES public.profiles(id),
  instructor_id uuid REFERENCES public.profiles(id),
  aircraft_tail text,
  flight_type_id text,
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  flight_area text DEFAULT 'local',
  route text,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger to auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student'));

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: schools
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Admins can manage schools" ON public.schools FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- RLS: user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS: flight_reservations
ALTER TABLE public.flight_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read reservations" ON public.flight_reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert reservations" ON public.flight_reservations FOR INSERT TO authenticated WITH CHECK (booked_by = auth.uid());
CREATE POLICY "Own or staff can update reservations" ON public.flight_reservations FOR UPDATE TO authenticated USING (
  booked_by = auth.uid() OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'dispatch') OR
  public.has_role(auth.uid(), 'instructor')
);
CREATE POLICY "Admins can delete reservations" ON public.flight_reservations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed default school
INSERT INTO public.schools (name, code) VALUES ('AeroPlan Flight Academy', 'AERO2025');
