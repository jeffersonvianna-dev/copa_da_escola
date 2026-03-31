create or replace function public.get_dashboard_filters(
  p_fase integer,
  p_rodada integer
)
returns table (
  regional text,
  escola text,
  serie integer
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct
    coalesce(nullif(trim(t.nm_diretoria), ''), 'Nao informado') as regional,
    coalesce(nullif(trim(t.nm_escola), ''), 'Nao informado') as escola,
    t.nr_serie as serie
  from "2026_copa_da_escola"."resultados_turmas" t
  where t.fase = p_fase
    and t.rodada = p_rodada
  order by 1, 2, 3 nulls last;
$$;

grant execute on function public.get_dashboard_filters(integer, integer) to anon, authenticated, service_role;
