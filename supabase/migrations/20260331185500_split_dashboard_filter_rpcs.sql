create or replace function public.get_dashboard_series(
  p_fase integer,
  p_rodada integer
)
returns table (
  serie integer
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct
    t.nr_serie as serie
  from "2026_copa_da_escola"."resultados_turmas" t
  where t.fase = p_fase
    and t.rodada = p_rodada
    and t.nr_serie is not null
  order by 1;
$$;

create or replace function public.get_dashboard_regionals(
  p_fase integer,
  p_rodada integer
)
returns table (
  regional text
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct
    coalesce(nullif(trim(t.nm_diretoria), ''), 'Nao informado') as regional
  from "2026_copa_da_escola"."resultados_turmas" t
  where t.fase = p_fase
    and t.rodada = p_rodada
  order by 1;
$$;

create or replace function public.get_dashboard_escolas(
  p_fase integer,
  p_rodada integer,
  p_regional text
)
returns table (
  escola text
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct
    coalesce(nullif(trim(t.nm_escola), ''), 'Nao informado') as escola
  from "2026_copa_da_escola"."resultados_turmas" t
  where t.fase = p_fase
    and t.rodada = p_rodada
    and coalesce(nullif(trim(t.nm_diretoria), ''), 'Nao informado') = p_regional
  order by 1;
$$;

grant execute on function public.get_dashboard_series(integer, integer) to anon, authenticated, service_role;
grant execute on function public.get_dashboard_regionals(integer, integer) to anon, authenticated, service_role;
grant execute on function public.get_dashboard_escolas(integer, integer, text) to anon, authenticated, service_role;
