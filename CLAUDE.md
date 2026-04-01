# Copa da Escola — Contexto para Claude

## Stack
- **Frontend:** React 19.2.4 + Vite 8.0.1 + TypeScript 5.9.3 + TanStack React Query 5.95.2
- **Deploy:** Vercel (push para `main` → deploy automático)
- **URL:** https://copadaescola.vercel.app/
- **Supabase:** Cactus Tech | ID: `aingjvjyqhijogpyikii` | Schema: `2026_copa_da_escola`

## Decisão arquitetural
Frontend conecta **diretamente ao Supabase** via anon key + RLS SELECT público.  
Dados são públicos (resultados educacionais), sem informações sensíveis.  
**Não adicionar backend layer** sem necessidade explícita.

## Variáveis de ambiente
```
VITE_SUPABASE_URL      ← configurada no Vercel
VITE_SUPABASE_ANON_KEY ← configurada no Vercel
```
Nunca commitar valores reais. A `VITE_SUPABASE_ANON_KEY` é segura aqui pois:
- RLS SELECT público está ativo
- Nenhum dado sensível está exposto
- Apenas RPCs de leitura são usadas

## Estrutura de arquivos
```
src/
  lib/
    supabase.ts     ← cliente Supabase (createClient com anon key)
    api.ts          ← wrappers das RPC functions
    helpers.ts      ← utilitários
  components/
    DataTable.tsx   ← tabela de dados com ordenação
    FilterSelect.tsx← select com busca
    Header.tsx      ← cabeçalho da aplicação
    SummaryCards.tsx← cards de métricas resumidas
    tableColumns.ts ← definições de colunas
  App.tsx           ← estado principal, queries, filtros
  main.tsx
```

## RPCs disponíveis (schema `2026_copa_da_escola`)
| Função | Descrição |
|---------|----------|
| `get_available_phase_rounds()` | Fases e rodadas disponíveis |
| `get_dashboard_series()` | Séries disponíveis |
| `get_dashboard_regionals()` | Regionais disponíveis |
| `get_dashboard_escolas()` | Escolas disponíveis |
| `get_seduc_table(fase, rodada, serie)` | Visão SEDUC |
| `get_ure_table(fase, rodada, serie, regional)` | Visão URE/Regional |
| `get_escola_table(fase, rodada, serie, regional, escola)` | Visão por escola |

## Dados
- Tabela principal: `2026_copa_da_escola.resultados_turmas` (152.078 rows)
- 3 níveis de visão: **SEDUC → URE → Escola**

## Design System
Projeto usa CSS plano. Para novas telas, referenciar tokens de:
`@jeffersonvianna-dev/design-system` (GitHub Packages)

## supabase/ (pasta local)
- `config.toml` — configuração do Supabase CLI (dev local)
- `migrations/` — 5 migrations SQL
- `seed.sql` — dados de seed

## scripts/ e data/
- Scripts Python de migração de dados (arquivo histórico)
- `legacy/static-dashboard/` — versão HTML antiga (arquivado)
