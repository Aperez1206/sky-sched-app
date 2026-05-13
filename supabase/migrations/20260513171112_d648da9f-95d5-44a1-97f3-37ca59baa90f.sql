
CREATE TABLE public.aircraft_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_tail text NOT NULL,
  inspection_type text NOT NULL,
  last_completed_date date,
  last_completed_hobbs numeric,
  due_date date,
  due_hobbs numeric,
  interval_hours numeric,
  interval_months integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_aircraft_inspections_tail ON public.aircraft_inspections(aircraft_tail);

ALTER TABLE public.aircraft_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read inspections" ON public.aircraft_inspections
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "manage inspections" ON public.aircraft_inspections
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'));

CREATE TRIGGER trg_acft_insp_upd
  BEFORE UPDATE ON public.aircraft_inspections
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed: Annual + 100hr for the fleet, derived from current aircraft_maintenance state
INSERT INTO public.aircraft_inspections (aircraft_tail, inspection_type, last_completed_date, last_completed_hobbs, due_date, due_hobbs, interval_hours, interval_months)
SELECT aircraft_tail, 'Annual',
       (next_inspection_date - 365)::date,
       GREATEST(current_hobbs - 80, 0),
       next_inspection_date,
       next_inspection_hobbs,
       NULL, 12
FROM public.aircraft_maintenance;

INSERT INTO public.aircraft_inspections (aircraft_tail, inspection_type, last_completed_date, last_completed_hobbs, due_date, due_hobbs, interval_hours)
SELECT aircraft_tail, '100 Hour',
       (current_date - 30),
       GREATEST(current_hobbs - 50, 0),
       NULL,
       GREATEST(current_hobbs + 50, 0),
       100
FROM public.aircraft_maintenance;

INSERT INTO public.aircraft_inspections (aircraft_tail, inspection_type, last_completed_date, due_date, interval_months)
SELECT aircraft_tail, 'ELT Battery', current_date - 200, current_date + 165, 12
FROM public.aircraft_maintenance;

INSERT INTO public.aircraft_inspections (aircraft_tail, inspection_type, last_completed_date, due_date, interval_months)
SELECT aircraft_tail, 'Pitot-Static / Transponder', current_date - 400, current_date + 330, 24
FROM public.aircraft_maintenance;
