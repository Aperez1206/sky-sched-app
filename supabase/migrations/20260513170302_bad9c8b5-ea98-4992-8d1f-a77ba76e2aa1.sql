
-- Helper updated_at function
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.aircraft_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_tail text NOT NULL UNIQUE,
  current_hobbs numeric, current_tach numeric,
  next_inspection_hobbs numeric, next_inspection_date date,
  airworthy_status text NOT NULL DEFAULT 'airworthy',
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.aircraft_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read aircraft maintenance" ON public.aircraft_maintenance FOR SELECT TO authenticated USING (true);
CREATE POLICY "manage aircraft maintenance" ON public.aircraft_maintenance FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'));

CREATE TABLE public.work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_number text NOT NULL UNIQUE,
  aircraft_tail text NOT NULL,
  title text NOT NULL, description text,
  status text NOT NULL DEFAULT 'open',
  opened_by uuid, assigned_to uuid,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  hobbs_at_open numeric, hobbs_at_close numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read work orders" ON public.work_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "manage work orders" ON public.work_orders FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'));

CREATE TABLE public.work_order_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  part_number text NOT NULL, serial_number text, description text,
  action text NOT NULL CHECK (action IN ('add','remove')),
  meter_hobbs numeric, meter_tach numeric,
  performed_by uuid, performed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.work_order_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read wo parts" ON public.work_order_parts FOR SELECT TO authenticated USING (true);
CREATE POLICY "manage wo parts" ON public.work_order_parts FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'));

CREATE TABLE public.inventory_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number text NOT NULL, description text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 1,
  condition text NOT NULL DEFAULT 'new',
  location text, expires_at date, unit_cost numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read inventory" ON public.inventory_parts FOR SELECT TO authenticated USING (true);
CREATE POLICY "manage inventory" ON public.inventory_parts FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'));

CREATE TABLE public.mechanic_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE SET NULL,
  task_label text,
  clock_in timestamptz NOT NULL DEFAULT now(),
  clock_out timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mechanic_time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read time logs" ON public.mechanic_time_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance'));
CREATE POLICY "insert time logs" ON public.mechanic_time_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'maintenance')));
CREATE POLICY "update time logs" ON public.mechanic_time_logs FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "delete time logs" ON public.mechanic_time_logs FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_acft_mx_upd BEFORE UPDATE ON public.aircraft_maintenance FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_wo_upd BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_inv_upd BEFORE UPDATE ON public.inventory_parts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.aircraft_maintenance (aircraft_tail, current_hobbs, current_tach, next_inspection_hobbs, next_inspection_date, airworthy_status) VALUES
  ('N5223R', 4523.4, 4490.1, 4550.0, current_date + 14, 'airworthy'),
  ('N202332', 3120.7, 3105.3, 3200.0, current_date + 45, 'airworthy'),
  ('N19679', 5890.2, 5870.0, 5900.0, current_date + 3, 'inspection_due'),
  ('N4609Q', 6210.5, 6190.0, 6250.0, current_date - 2, 'aog'),
  ('N20472', 2340.1, 2330.0, 2440.0, current_date + 60, 'airworthy'),
  ('N6854H', 3998.0, 3980.0, 4100.0, current_date + 30, 'maintenance'),
  ('N138MF', 1240.3, 1235.0, 1340.0, current_date + 90, 'airworthy'),
  ('N194ML', 8420.0, 8400.0, 8500.0, current_date + 20, 'airworthy'),
  ('N6026J', 1890.5, 1880.0, 1990.0, current_date + 50, 'airworthy');

INSERT INTO public.inventory_parts (part_number, description, quantity, min_quantity, condition, location, expires_at, unit_cost) VALUES
  ('AA48108-2', 'Oil Filter - Champion', 12, 5, 'new', 'Bin A-12', NULL, 28.50),
  ('REM37BY', 'Spark Plug - Champion', 3, 8, 'new', 'Bin B-04', NULL, 32.00),
  ('15W-50-QT', 'Aeroshell 15W-50 Oil (qt)', 24, 10, 'new', 'Shelf C-1', current_date + 400, 11.75),
  ('SAFETY-WIRE-032', 'Safety Wire .032 (1lb)', 2, 3, 'new', 'Bin D-02', NULL, 18.40),
  ('BAT-G35', 'Concorde RG-35AXC Battery', 1, 2, 'new', 'Shelf E-3', current_date + 25, 489.00),
  ('TIRE-606C66-6', 'Goodyear Flight Custom III Tire', 6, 4, 'new', 'Rack F-1', NULL, 215.00),
  ('BRK-066-10500', 'Cleveland Brake Pad Set', 4, 4, 'serviceable', 'Bin G-08', NULL, 92.00);
