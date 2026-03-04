
-- Create flight_sessions table
CREATE TABLE public.flight_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.flight_reservations(id) ON DELETE SET NULL,
  aircraft_tail text NOT NULL,
  student_id uuid REFERENCES public.profiles(id),
  instructor_id uuid REFERENCES public.profiles(id),
  checked_out_by uuid REFERENCES public.profiles(id) NOT NULL,
  checked_out_at timestamptz NOT NULL DEFAULT now(),
  checked_in_at timestamptz,
  hobbs_in numeric,
  hobbs_out numeric,
  tach_in numeric,
  tach_out numeric,
  flight_instruction numeric,
  ground_instruction numeric,
  status text NOT NULL DEFAULT 'checked_out',
  created_at timestamptz DEFAULT now()
);

-- Add checkout_status to flight_reservations
ALTER TABLE public.flight_reservations ADD COLUMN checkout_status text;

-- RLS
ALTER TABLE public.flight_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read sessions"
  ON public.flight_sessions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin/dispatch can insert sessions"
  ON public.flight_sessions FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'dispatch'::app_role)
  );

CREATE POLICY "Admin/dispatch can update sessions"
  ON public.flight_sessions FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'dispatch'::app_role)
  );

-- Function to get last times for an aircraft
CREATE OR REPLACE FUNCTION public.get_last_times(_aircraft_tail text)
RETURNS TABLE(hobbs_out numeric, tach_out numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT fs.hobbs_out, fs.tach_out
  FROM public.flight_sessions fs
  WHERE fs.aircraft_tail = _aircraft_tail
    AND fs.status = 'completed'
    AND fs.hobbs_out IS NOT NULL
    AND fs.tach_out IS NOT NULL
  ORDER BY fs.checked_in_at DESC
  LIMIT 1
$$;
