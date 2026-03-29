"""Gera arquivos SQL de INSERT em batches para executar via execute_sql do MCP."""
import csv, os, re

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "copa-da-escola.csv")
OUT_DIR  = os.path.join(os.path.dirname(__file__), "sql_batches")
BATCH    = 1500
SCHEMA   = "2026_copa_da_escola"
TABLE    = "resultados_turmas"

def to_int(v):
    try: return int(v)
    except: return "NULL"

def to_num(v):
    try: return float(str(v).replace(",","."))
    except: return "NULL"

def esc(v):
    if v is None or str(v).strip() == "": return "NULL"
    return "'" + str(v).replace("'","''") + "'"

os.makedirs(OUT_DIR, exist_ok=True)

rows = []
with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        r = row
        vals = (
            to_int(r.get("cd_escola") or r.get("CD_ESCOLA")),
            to_int(r.get("cd_turma")),
            esc((r.get("ds_turma") or "").strip() or None),
            to_int(r.get("Fase")),
            to_int(r.get("Rodada")),
            to_num(r.get("percentual_frequencia")),
            to_int(r.get("PontosFrequencia")),
            to_num(r.get("percentual_realizacao")),
            to_int(r.get("PontosTarefas")),
            to_num(r.get("percentual_medio_acerto")),
            to_int(r.get("PontosAcertos")),
            to_int(r.get("nr_serie")),
            to_int(r.get("PontosTotal")),
            to_int(r.get("Colocacao_Escola")),
            to_int(r.get("NR_CLASSE")),
            esc((r.get("NM_COMPLETO_ESCOLA") or "").strip() or None),
            esc((r.get("NM_DIRETORIA") or "").strip() or None),
            to_int(r.get("CD_DIRETORIA")),
        )
        rows.append(vals)

COLS = "(cd_escola,cd_turma,ds_turma,fase,rodada,pct_frequencia,pontos_frequencia,pct_realizacao,pontos_tarefas,pct_acerto,pontos_acertos,nr_serie,pontos_total,colocacao_escola,nr_classe,nm_escola,nm_diretoria,cd_diretoria)"

batches = [rows[i:i+BATCH] for i in range(0, len(rows), BATCH)]
for idx, batch in enumerate(batches, 1):
    vals_str = ",\n".join(f"({','.join(str(v) for v in row)})" for row in batch)
    sql = f'INSERT INTO "{SCHEMA}".{TABLE} {COLS} VALUES\n{vals_str};'
    with open(os.path.join(OUT_DIR, f"batch_{idx:03d}.sql"), "w", encoding="utf-8") as f:
        f.write(sql)

print(f"Gerados {len(batches)} arquivos em {OUT_DIR}/ ({len(rows)} linhas total)")
