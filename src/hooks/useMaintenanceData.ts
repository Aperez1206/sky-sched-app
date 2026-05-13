import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AircraftMaintenance {
  id: string;
  aircraft_tail: string;
  current_hobbs: number | null;
  current_tach: number | null;
  next_inspection_hobbs: number | null;
  next_inspection_date: string | null;
  airworthy_status: string;
  notes: string | null;
  updated_at: string;
}

export interface WorkOrder {
  id: string;
  wo_number: string;
  aircraft_tail: string;
  title: string;
  description: string | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
  hobbs_at_open: number | null;
  hobbs_at_close: number | null;
  assigned_to: string | null;
}

export interface WorkOrderPart {
  id: string;
  work_order_id: string;
  part_number: string;
  serial_number: string | null;
  description: string | null;
  action: 'add' | 'remove';
  meter_hobbs: number | null;
  meter_tach: number | null;
  performed_at: string;
}

export interface InventoryPart {
  id: string;
  part_number: string;
  description: string;
  quantity: number;
  min_quantity: number;
  condition: string;
  location: string | null;
  expires_at: string | null;
  unit_cost: number | null;
}

export interface TimeLog {
  id: string;
  user_id: string;
  work_order_id: string | null;
  task_label: string | null;
  clock_in: string;
  clock_out: string | null;
  notes: string | null;
}

export function useAircraftMaintenance() {
  return useQuery({
    queryKey: ['aircraft_maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aircraft_maintenance')
        .select('*')
        .order('aircraft_tail');
      if (error) throw error;
      return data as AircraftMaintenance[];
    },
  });
}

export function useWorkOrders() {
  return useQuery({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('opened_at', { ascending: false });
      if (error) throw error;
      return data as WorkOrder[];
    },
  });
}

export function useWorkOrderParts(workOrderId?: string) {
  return useQuery({
    queryKey: ['work_order_parts', workOrderId ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('work_order_parts').select('*').order('performed_at', { ascending: false });
      if (workOrderId) q = q.eq('work_order_id', workOrderId);
      const { data, error } = await q;
      if (error) throw error;
      return data as WorkOrderPart[];
    },
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory_parts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_parts')
        .select('*')
        .order('part_number');
      if (error) throw error;
      return data as InventoryPart[];
    },
  });
}

export function useActiveTimeLog(userId?: string) {
  return useQuery({
    queryKey: ['active_time_log', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mechanic_time_logs')
        .select('*')
        .eq('user_id', userId!)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as TimeLog | null;
    },
  });
}

export function useTimeLogs(userId?: string) {
  return useQuery({
    queryKey: ['time_logs', userId ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('mechanic_time_logs').select('*').order('clock_in', { ascending: false }).limit(50);
      if (userId) q = q.eq('user_id', userId);
      const { data, error } = await q;
      if (error) throw error;
      return data as TimeLog[];
    },
  });
}

export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { user_id: string; task_label: string; work_order_id?: string | null }) => {
      const { data, error } = await supabase.from('mechanic_time_logs').insert({
        user_id: input.user_id,
        task_label: input.task_label,
        work_order_id: input.work_order_id ?? null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['active_time_log'] });
      qc.invalidateQueries({ queryKey: ['time_logs'] });
    },
  });
}

export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mechanic_time_logs')
        .update({ clock_out: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['active_time_log'] });
      qc.invalidateQueries({ queryKey: ['time_logs'] });
    },
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { aircraft_tail: string; title: string; description?: string; hobbs_at_open?: number | null }) => {
      const wo_number = `WO-${Date.now().toString().slice(-6)}`;
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('work_orders').insert({
        ...input,
        wo_number,
        opened_by: u.user?.id ?? null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work_orders'] }),
  });
}

export function useUpdateWorkOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: Record<string, unknown> = { status };
      if (status === 'completed') patch.closed_at = new Date().toISOString();
      const { error } = await supabase.from('work_orders').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work_orders'] }),
  });
}

export function useAddWorkOrderPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<WorkOrderPart, 'id' | 'performed_at'>) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from('work_order_parts').insert({
        ...input,
        performed_by: u.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work_order_parts'] }),
  });
}

export function useUpsertInventoryPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<InventoryPart> & { part_number: string; description: string; quantity: number }) => {
      if (input.id) {
        const { error } = await supabase.from('inventory_parts').update(input).eq('id', input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('inventory_parts').insert(input);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory_parts'] }),
  });
}
