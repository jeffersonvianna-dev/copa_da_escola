import { supabase } from './supabase';

export interface FilterOption {
  regional: string | null;
  escola: string | null;
  serie: number | null;
}

export interface RegionalOption {
  regional: string | null;
}

export interface EscolaOption {
  escola: string | null;
}

export interface SerieOption {
  serie: number | null;
}

export interface PhaseRoundOption {
  fase: number | null;
  rodada: number | null;
}

export interface AggRow {
  [key: string]: string | number | null | undefined;
  regional?: string;
  escola?: string;
  turma?: string;
  totalEscolas?: number;
  totalTurmas?: number;
  pontuacao: number;
  frequencia: number;
  tarefas: number;
  acertos: number;
}

export async function fetchAvailablePhaseRounds(): Promise<PhaseRoundOption[]> {
  const { data, error } = await supabase.rpc('get_available_phase_rounds');
  if (error) throw error;
  return data || [];
}

export async function fetchDashboardSeries(fase: string | number, rodada: string | number): Promise<SerieOption[]> {
  const { data, error } = await supabase.rpc('get_dashboard_series', {
    p_fase: Number(fase),
    p_rodada: Number(rodada),
  });
  if (error) throw error;
  return data || [];
}

export async function fetchDashboardRegionals(fase: string | number, rodada: string | number): Promise<RegionalOption[]> {
  const { data, error } = await supabase.rpc('get_dashboard_regionals', {
    p_fase: Number(fase),
    p_rodada: Number(rodada),
  });
  if (error) throw error;
  return data || [];
}

export async function fetchDashboardEscolas(
  fase: string | number,
  rodada: string | number,
  regional: string
): Promise<EscolaOption[]> {
  if (!regional) return [];
  const { data, error } = await supabase.rpc('get_dashboard_escolas', {
    p_fase: Number(fase),
    p_rodada: Number(rodada),
    p_regional: regional,
  });
  if (error) throw error;
  return data || [];
}

export async function fetchSeducView(fase: string | number, rodada: string | number, series: number[]): Promise<AggRow[]> {
  const { data, error } = await supabase.rpc('get_seduc_table', {
    p_fase: Number(fase),
    p_rodada: Number(rodada),
    p_series: series.length > 0 ? series : null
  });
  if (error) throw error;
  return data || [];
}

export async function fetchUreView(fase: string | number, rodada: string | number, regional: string, series: number[]): Promise<AggRow[]> {
  if (!regional) return [];
  const { data, error } = await supabase.rpc('get_ure_table', {
    p_fase: Number(fase),
    p_rodada: Number(rodada),
    p_regional: regional,
    p_series: series.length > 0 ? series : null
  });
  if (error) throw error;
  return data || [];
}

export async function fetchEscolaView(fase: string | number, rodada: string | number, regional: string, escola: string, series: number[]): Promise<AggRow[]> {
  if (!escola || !regional) return [];
  const { data, error } = await supabase.rpc('get_escola_table', {
    p_fase: Number(fase),
    p_rodada: Number(rodada),
    p_regional: regional,
    p_escola: escola,
    p_series: series.length > 0 ? series : null
  });
  if (error) throw error;
  return data || [];
}
