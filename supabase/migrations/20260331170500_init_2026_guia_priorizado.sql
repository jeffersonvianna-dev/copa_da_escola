create schema if not exists "2026_guia_priorizado";

grant usage on schema "2026_guia_priorizado" to anon, authenticated, service_role;
alter default privileges in schema "2026_guia_priorizado" grant all on tables to service_role;
alter default privileges in schema "2026_guia_priorizado" grant select on tables to anon, authenticated;

create table if not exists "2026_guia_priorizado"."curriculo_paulista" (
  "id" integer not null,
  "id_habilidade" text not null,
  "componente" text,
  "serie" text,
  "segmento" text,
  "texto" text,
  primary key ("id", "id_habilidade")
);

create table if not exists "2026_guia_priorizado"."matriz_descritores_af" (
  "id" integer primary key,
  "serie" text,
  "componente" text,
  "ae" text,
  "bimestre" text,
  "grupo" text,
  "descritor" text
);

create table if not exists "2026_guia_priorizado"."ae_detalhes_af" (
  "id" bigint primary key,
  "segmento" text,
  "serie" text,
  "componente" text,
  "bimestre" text,
  "ae" text,
  "titulo" text,
  "hab_priorizada" text,
  "hab_relacionadas" text,
  "conhecimentos_previos" text
);

create table if not exists "2026_guia_priorizado"."ae_detalhes_em" (
  "id" bigint primary key,
  "segmento" text,
  "serie" text,
  "componente" text,
  "bimestre" text,
  "ae" text,
  "titulo" text,
  "hab_priorizada" text,
  "hab_relacionadas" text,
  "conhecimentos_previos" text
);

create table if not exists "2026_guia_priorizado"."escopo_em" (
  "id" integer primary key,
  "componente" text,
  "serie" text,
  "bimestre" text,
  "aula" text,
  "titulo" text,
  "conteudo" text,
  "objetivos" text,
  "habilidades" text,
  "aprendizagem_essencial" text,
  "unidade_tematica" text,
  "objeto" text,
  "descritivo" text,
  "referencias" text
);

create table if not exists "2026_guia_priorizado"."escopo_af" (
  "id" integer primary key,
  "componente" text,
  "ano" text,
  "bimestre" text,
  "aula" text,
  "titulo" text,
  "conteudo" text,
  "objetivos" text,
  "habilidades" text,
  "aprendizagem_essencial" text,
  "unidade_tematica" text,
  "objeto" text,
  "descritivo" text,
  "referencias" text
);

create table if not exists "2026_guia_priorizado"."matriz_descritores_em" (
  "id" integer primary key,
  "serie" text,
  "componente" text,
  "ae" text,
  "bimestre" text,
  "grupo" text,
  "descritor" text
);

grant all privileges on all tables in schema "2026_guia_priorizado" to service_role;
grant select on all tables in schema "2026_guia_priorizado" to anon, authenticated;
