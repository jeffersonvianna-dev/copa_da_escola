# Copa da Escola

Painel web da Copa da Escola com frontend em React + Vite e banco versionado via Supabase CLI.

## Stack

- React 19
- TypeScript
- Vite
- Supabase
- React Query

## Estrutura

- `src/`: app React
- `public/`: imagens e arquivos estáticos
- `supabase/`: config, migrations e seed do banco
- `data/`: CSV legado usado para carga inicial dos resultados
- `scripts/`: utilitários de migração/importação
- `legacy/static-dashboard/`: versão antiga em HTML puro preservada como referência

## Setup

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env` a partir de `.env.example`.

3. Rode o projeto:

```bash
npm run dev
```

## Variáveis de ambiente

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Banco Supabase

Este repositório já inclui a estrutura `supabase/` para versionar o banco no GitHub.

### Projeto novo

- Project ref: `aingjvjyqhijogpyikii`
- URL: `https://aingjvjyqhijogpyikii.supabase.co`

### Próximos comandos

Depois de autenticar o Supabase CLI:

```bash
npx supabase@latest link --project-ref aingjvjyqhijogpyikii
npx supabase@latest db push
```

### Importar os dados legados

O CSV legado está em `data/copa-da-escola.csv`.

Depois de obter a `service_role key` do projeto novo:

```bash
python scripts/migrate.py --url https://aingjvjyqhijogpyikii.supabase.co --key SUA_SERVICE_ROLE_KEY --schema 2026_copa_da_escola --table resultados_turmas
```

## Observações

- O frontend novo usa RPCs do Supabase para montar o dashboard.
- As functions e a tabela inicial estão descritas nas migrations dentro de `supabase/migrations/`.
- O `anon key` do projeto novo ainda precisa ser configurado no `.env`.
