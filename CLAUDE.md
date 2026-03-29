# Copa da Escola — Painel URE

Painel de acompanhamento da Copa da Escola, programa de competição entre turmas e escolas da SEDUC SP.

## Sobre o projeto

Dashboard web (HTML único, sem build) publicado via GitHub Pages.
Repo: `jeffersonvianna-dev/copa_da_escola`
URL pública: https://jeffersonvianna-dev.github.io/copa_da_escola/

## Estrutura de arquivos

```
copa_da_escola/
  index.html          ← aplicação completa (HTML + CSS + JS inline)
  assets/
    logo-copa-da-escola.png
    logo-copa-da-escola_2.png
  data/
    copa-da-escola.csv  ← base original (não usada em produção — dados estão no Supabase)
```

## Fonte de dados

**Supabase** — projeto Cactus Tech (`uhbsnrnnnhntkibtsyre`)
Schema: `2026_copa_da_escola`
Tabela principal: `resultados_turmas`

O frontend usa a **Anon Key pública** para leitura via REST API.
Filtra por `fase` e `rodada` diretamente no Supabase (não carrega tudo de uma vez).

## Colunas da tabela `resultados_turmas`

| Coluna | Tipo | Descrição |
|---|---|---|
| cd_escola | integer | Código da escola |
| cd_turma | bigint | Código da turma |
| ds_turma | text | Descrição da turma |
| fase | smallint | Fase da Copa (1, 2, 3…) |
| rodada | smallint | Rodada dentro da fase |
| pct_frequencia | numeric | % de frequência |
| pontos_frequencia | smallint | Pontos de frequência (0-3) |
| pct_realizacao | numeric | % de realização de tarefas |
| pontos_tarefas | smallint | Pontos de tarefas (0-3) |
| pct_acerto | numeric | % médio de acerto |
| pontos_acertos | smallint | Pontos de acertos (0-3) |
| nr_serie | smallint | Série/ano (6-9 = EF, 1-3 = EM) |
| pontos_total | smallint | Total de pontos (0-9) |
| colocacao_escola | integer | Colocação da escola na fase/rodada |
| nr_classe | integer | Número da turma |
| nm_escola | text | Nome completo da escola |
| nm_diretoria | text | Nome da diretoria regional (URE) |
| cd_diretoria | integer | Código da diretoria |

## Vistas do painel

- **SEDUC**: ranking de todas as regionais (UREs)
- **URE**: ranking de escolas dentro de uma regional selecionada
- **Escola**: ranking de turmas dentro de uma escola selecionada

## Filtros disponíveis

- Fase (select único)
- Rodada (select único)
- Série (multiselect: 6º, 7º, 8º, 9º ano / 1ª, 2ª, 3ª série EM)

## Design System

Usa o **Design System da Cactus Tech** (tema claro/institucional):
- Cores via tokens CSS (`--blue`, `--blue-pale`, `--orange`, etc.)
- Fonte: `'Segoe UI', system-ui, sans-serif`
- Espaçamentos e componentes alinhados com o Guia Priorizado 2026

### Alinhamento do header (PADRÃO)

```css
.header { background: var(--blue); box-shadow: var(--shadow); position: sticky; top: 0; z-index: 10; }
.header-inner { max-width: 1200px; margin: 0 auto; padding: 16px 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px; }
```
```html
<header class="header">
  <div class="header-inner">
    <!-- logo, título, stamp -->
  </div>
</header>
```
A faixa azul é full-width; `.header-inner` contém o conteúdo no mesmo max-width do corpo (1200px).

## Atualização de dados

Para atualizar os dados no Supabase:
1. Substituir `data/copa-da-escola.csv` com a nova base
2. Rodar `scripts/migrate.py` com as credenciais do Supabase
3. O script trunca a tabela e reinsere tudo

## Histórico de origens

Projeto iniciado como mockup via ChatGPT (mar/2026), refatorado por Claude Code para:
- Alimentação via Supabase (em vez de CSV local)
- Design System institucional da Cactus
