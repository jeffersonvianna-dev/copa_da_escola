# Copa da Escola

Painel web da Copa da Escola com frontend em React + Vite e dados no Supabase.

## Status atual

- Repositorio oficial: `jeffersonvianna-dev/copa_da_escola`
- GitHub: [https://github.com/jeffersonvianna-dev/copa_da_escola](https://github.com/jeffersonvianna-dev/copa_da_escola)
- Producao: [https://copadaescola.vercel.app](https://copadaescola.vercel.app)
- Projeto publicado no Vercel
- Build e lint passando localmente
- Versao HTML antiga preservada em `legacy/static-dashboard/`

## Arquitetura

### Frontend

- React 19
- TypeScript
- Vite
- React Query
- Supabase JS

### Backend de dados

Nao existe backend Node dedicado neste momento.
O app consome o Supabase diretamente pelo frontend usando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

### Banco principal

- Supabase novo: `aingjvjyqhijogpyikii`
- URL: `https://aingjvjyqhijogpyikii.supabase.co`

Schemas principais no projeto novo:

- `2026_copa_da_escola`
- `2026_guia_priorizado`

## Links e origens

### Projeto atual

- Repo: [https://github.com/jeffersonvianna-dev/copa_da_escola](https://github.com/jeffersonvianna-dev/copa_da_escola)
- App em producao: [https://copadaescola.vercel.app](https://copadaescola.vercel.app)

### Origem historica

- Projeto antigo da Copa: repo HTML/Python neste mesmo repositorio, hoje preservado em `legacy/static-dashboard/`
- Projeto Supabase antigo da Copa: `uhbsnrnnnhntkibtsyre`
- Schema antigo de apoio migrado: `guia_priorizado`

## Estrutura do repositorio

```text
copa_da_escola/
  public/                      assets publicos do app
  src/                         aplicacao React
    components/                componentes de interface
    lib/                       integracao com Supabase e helpers
  supabase/
    config.toml                config versionada do projeto
    migrations/                migrations SQL versionadas
  scripts/                     scripts de importacao e migracao
  data/                        CSV legado usado na fase inicial da migracao
  legacy/static-dashboard/     dashboard antigo em HTML puro
  README.md                    contexto principal do projeto
  CLAUDE.md                    apontador para este README
```

## Dados e migrations

### Copa

Tabela principal:

- schema: `2026_copa_da_escola`
- tabela: `resultados_turmas`

Carga atual:

- `152078` linhas no projeto novo

Migration principal:

- `supabase/migrations/20260331124500_init_copa_da_escola.sql`

### Guia priorizado

Schema migrado:

- `2026_guia_priorizado`

Tabelas migradas:

- `curriculo_paulista`
- `matriz_descritores_af`
- `ae_detalhes_af`
- `ae_detalhes_em`
- `escopo_em`
- `escopo_af`
- `matriz_descritores_em`

Migration principal:

- `supabase/migrations/20260331170500_init_2026_guia_priorizado.sql`

### Migrations complementares ja aplicadas

- `20260331173000_add_available_phase_rounds.sql`
- `20260331174500_fix_dashboard_filters_regionals.sql`
- `20260331185500_split_dashboard_filter_rpcs.sql`

## RPCs usadas pelo app

### Momentos disponiveis

- `get_available_phase_rounds`

Usada para descobrir quais fases e rodadas existem de verdade na base.

### Filtros pequenos e performaticos

- `get_dashboard_series`
- `get_dashboard_regionals`
- `get_dashboard_escolas`

Essas funcoes existem para evitar carregar milhares de linhas apenas para montar filtros.

### Tabelas agregadas

- `get_seduc_table`
- `get_ure_table`
- `get_escola_table`

Essas funcoes alimentam as tres abas do dashboard.

## Comportamento atual da interface

- O app abre por padrao na maior `Fase` disponivel
- A `Rodada` respeita apenas as opcoes existentes na base para a fase selecionada
- O campo `Atualizado em` esta mockado como `30 de marco de 2026`
- O filtro de serie e multiselect
- Os filtros de `Regional` e `Escola` usam dropdown pesquisavel
- A aba `URE` lista escolas da regional selecionada
- A aba `Escola` lista turmas da escola selecionada

## Setup local

### Requisitos

- Node.js
- npm
- Supabase CLI via `npx`

### Instalar dependencias

```bash
npm install
```

### Variaveis de ambiente

Crie `.env` a partir de `.env.example`.

Exemplo:

```env
VITE_SUPABASE_URL=https://aingjvjyqhijogpyikii.supabase.co
VITE_SUPABASE_ANON_KEY=cole_aqui_o_anon_key
```

### Rodar localmente

```bash
npm run dev
```

### Validar qualidade

```bash
npm run lint
npm run build
```

## Fluxo com Supabase CLI

### Login

No PowerShell do Windows, prefira:

```powershell
npx.cmd supabase@latest login
```

Se o `npx` falhar por policy do PowerShell, use `npx.cmd` em vez de `npx`.

### Link do projeto

```powershell
npx.cmd supabase@latest link --project-ref aingjvjyqhijogpyikii
```

### Aplicar migrations

```powershell
npx.cmd supabase db push
```

## Scripts uteis

### Importar CSV legado para uma tabela

```bash
python scripts/migrate.py --url https://aingjvjyqhijogpyikii.supabase.co --key SUA_SERVICE_ROLE_KEY --schema 2026_copa_da_escola --table resultados_turmas
```

### Copiar uma tabela via REST entre projetos

```bash
python scripts/copy_rest_table.py
```

### Copiar um schema mapeado via REST

```bash
python scripts/copy_rest_schema.py
```

## Deploy

### Vercel

O projeto atual esta publicado no Vercel.

Variaveis configuradas em producao:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Deploy manual:

```bash
npx.cmd vercel deploy --prod --yes
```

### GitHub

Push principal:

```bash
git push origin main
```

## Seguranca e observacoes

- O app atual fala direto com o Supabase pelo frontend
- Isso significa que os dados acessados pelo app precisam estar disponiveis para a `anon key`
- Se a exigencia passar a ser "base so minha", sera necessario mover a leitura para backend/Vercel Functions e reduzir exposicao no Supabase
- Chaves `service_role` compartilhadas fora de um ambiente seguro devem ser rotacionadas

## Historico resumido da migracao

1. O dashboard antigo em HTML/CSS/JS foi preservado em `legacy/static-dashboard/`
2. O repositorio principal passou a usar o app React
3. O schema `2026_copa_da_escola` foi recriado e carregado no projeto novo
4. A carga da Copa foi corrigida de `75989` para `152078` linhas
5. O schema `2026_guia_priorizado` foi criado e povoado no projeto novo
6. O app foi publicado no Vercel
7. Os filtros foram ajustados para refletir a base real e evitar gargalos

## Pendencias e proximos passos sugeridos

- Revisar textos da interface para padronizar acentos e microcopy
- Decidir se o projeto vai continuar em frontend + Supabase ou se vai ganhar backend proprio
- Endurecer a seguranca caso os dados precisem deixar de ser publicos para o frontend
- Se necessario, conectar automaticamente o repo ao Vercel pelo painel para deploy a cada push
