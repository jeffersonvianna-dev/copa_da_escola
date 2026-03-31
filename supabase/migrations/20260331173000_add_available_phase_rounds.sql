create or replace function public.get_available_phase_rounds()
returns table (
  fase integer,
  rodada integer
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct
    t.fase,
    t.rodada
  from "2026_copa_da_escola"."resultados_turmas" t
  where t.fase is not null
    and t.rodada is not null
  order by t.fase desc, t.rodada desc;
$$;

grant execute on function public.get_available_phase_rounds() to anon, authenticated, service_role;
