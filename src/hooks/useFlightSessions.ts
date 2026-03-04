import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FlightSession {
  id: string;
  reservation_id: string | null;
  aircraft_tail: string;
  student_id: string | null;
  instructor_id: string | null;
  checked_out_by: string;
  checked_out_at: string;
  checked_in_at: string | null;
  hobbs_in: number | null;
  hobbs_out: number | null;
  tach_in: number | null;
  tach_out: number | null;
  flight_instruction: number | null;
  ground_instruction: number | null;
  status: string;
}

export function useFlightSessionsForPerson(personId: string | undefined) {
  return useQuery({
    queryKey: ['flight-sessions', personId],
    enabled: !!personId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flight_sessions')
        .select('*')
        .or(`student_id.eq.${personId},instructor_id.eq.${personId}`)
        .eq('status', 'completed')
        .order('checked_in_at', { ascending: false });
      if (error) throw error;
      return data as FlightSession[];
    },
  });
}

export async function getLastTimes(aircraftTail: string): Promise<{ hobbs_out: number; tach_out: number } | null> {
  const { data, error } = await supabase.rpc('get_last_times', { _aircraft_tail: aircraftTail });
  if (error || !data || data.length === 0) return null;
  return { hobbs_out: Number(data[0].hobbs_out), tach_out: Number(data[0].tach_out) };
}

const isValidUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export async function createCheckOut(params: {
  reservation_id: string;
  aircraft_tail: string;
  student_id: string | null;
  instructor_id: string | null;
  checked_out_by: string;
  hobbs_in: number | null;
  tach_in: number | null;
}) {
  const resId = isValidUuid(params.reservation_id) ? params.reservation_id : null;
  const { data, error } = await supabase
    .from('flight_sessions')
    .insert({
      reservation_id: resId,
      aircraft_tail: params.aircraft_tail,
      student_id: params.student_id,
      instructor_id: params.instructor_id,
      checked_out_by: params.checked_out_by,
      hobbs_in: params.hobbs_in,
      tach_in: params.tach_in,
      status: 'checked_out',
    })
    .select()
    .single();
  if (error) throw error;

  if (resId) {
    await supabase
      .from('flight_reservations')
      .update({ checkout_status: 'checked_out' })
      .eq('id', resId);
  }

  return data;
}

export async function completeCheckIn(params: {
  session_id: string;
  reservation_id: string;
  hobbs_out: number;
  tach_out: number;
  flight_instruction: number | null;
  ground_instruction: number | null;
}) {
  const { error } = await supabase
    .from('flight_sessions')
    .update({
      hobbs_out: params.hobbs_out,
      tach_out: params.tach_out,
      flight_instruction: params.flight_instruction,
      ground_instruction: params.ground_instruction,
      checked_in_at: new Date().toISOString(),
      status: 'completed',
    })
    .eq('id', params.session_id);
  if (error) throw error;

  if (isValidUuid(params.reservation_id)) {
    await supabase
      .from('flight_reservations')
      .update({ checkout_status: 'checked_in' })
      .eq('id', params.reservation_id);
  }
}
