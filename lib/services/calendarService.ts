import { supabase } from '../supabase';

export async function fetchMonthlyAlarms(
  userId: string,
  year: number,
  month: number
) {
  if (!supabase) return [];
  const start = new Date(year, month - 1, 1).toISOString();
  const end = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('note')
    .select('noteNo, title, alarmDatetime')
    .eq('userId', userId)
    .is('delDatetime', null)
    .gte('alarmDatetime', start)
    .lte('alarmDatetime', end)
    .order('alarmDatetime');

  if (error) throw error;
  return data ?? [];
}

export async function updateAlarm(
  noteNo: number,
  alarmDatetime: string | null,
  userId: string
) {
  if (!supabase) return;
  const { error } = await supabase
    .from('note')
    .update({ alarmDatetime })
    .eq('noteNo', noteNo)
    .eq('userId', userId);
  if (error) throw error;
}
