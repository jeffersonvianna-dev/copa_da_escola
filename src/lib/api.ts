import { supabase } from './supabase';

export interface FilterOption {
  regional: string | null;
  escola: string | null;
  serie: number | null;
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

export async function fetchDashboardFilters(fase: string | number, rodada: string | number): Promise<FilterOption[]> {
  const { data, error } = await supabase.rpc('get_dashboard_filters', {
    p_fase: Number(fase),
    p_rodada: Number(rodada)
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
