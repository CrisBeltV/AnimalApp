import { supabase } from './supabase';
import type { AppData, Report } from './types';

// Copia de los datos del dueño en la nube: una fila por cuenta con todo su registro.
export async function pullData(userId: string): Promise<AppData | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('app_data').select('data').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return (data?.data as AppData | undefined) ?? null;
}

export async function pushData(userId: string, appData: AppData): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('app_data')
    .upsert({ user_id: userId, data: appData, updated_at: new Date().toISOString() });
  if (error) throw error;
}

type ReportRow = {
  id: string;
  user_id: string;
  kind: Report['kind'];
  pet_name: string;
  species: Report['species'];
  description: string;
  place: string;
  note: string | null;
  with_me: boolean | null;
  created_at: string;
};

function fromRow(row: ReportRow, userId: string): Report {
  return {
    id: `c-${row.id}`,
    cloudId: row.id,
    kind: row.kind,
    at: new Date(row.created_at).getTime(),
    petName: row.pet_name,
    species: row.species,
    description: row.description,
    place: row.place,
    note: row.note ?? undefined,
    withMe: row.with_me ?? undefined,
    mine: row.user_id === userId,
  };
}

// Reportes abiertos de la comunidad en los últimos 30 días.
// Más adelante se filtrarán por distancia (2 km) con la ubicación.
export async function fetchReports(userId: string): Promise<Report[]> {
  if (!supabase) return [];
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('reports')
    .select('id, user_id, kind, pet_name, species, description, place, note, with_me, created_at')
    .eq('closed', false)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data as ReportRow[]).map((row) => fromRow(row, userId));
}

export async function publishReport(r: Omit<Report, 'id'>): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('reports')
    .insert({
      kind: r.kind,
      pet_name: r.petName,
      species: r.species,
      description: r.description,
      place: r.place,
      note: r.note ?? null,
      with_me: r.withMe ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}
