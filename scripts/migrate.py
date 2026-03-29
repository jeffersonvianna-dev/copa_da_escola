"""
Migração: copa-da-escola.csv → Supabase (schema 2026_copa_da_escola)

Uso:
  python migrate.py --url https://uhbsnrnnnhntkibtsyre.supabase.co --key SERVICE_ROLE_KEY

Instalar dependências:
  pip install requests
"""

import csv
import json
import argparse
import sys
import os

BATCH_SIZE = 500
TABLE = "resultados_turmas"
SCHEMA = "2026_copa_da_escola"

def to_int(v):
    try:
        return int(v)
    except (ValueError, TypeError):
        return None

def to_float(v):
    try:
        return float(str(v).replace(",", "."))
    except (ValueError, TypeError):
        return None

def parse_row(row):
    """Mapeia uma linha do CSV para o modelo da tabela."""
    # O CSV tem colunas duplicadas: nr_serie (idx 11) e nr_serie repetida (idx 14)
    # cd_escola aparece como cd_escola (idx 0) e CD_ESCOLA (idx 16)
    # Usamos os campos com nome mais claro
    return {
        "cd_escola":         to_int(row.get("cd_escola") or row.get("CD_ESCOLA")),
        "cd_turma":          to_int(row.get("cd_turma")),
        "ds_turma":          (row.get("ds_turma") or "").strip() or None,
        "fase":              to_int(row.get("Fase")),
        "rodada":            to_int(row.get("Rodada")),
        "pct_frequencia":    to_float(row.get("percentual_frequencia")),
        "pontos_frequencia": to_int(row.get("PontosFrequencia")),
        "pct_realizacao":    to_float(row.get("percentual_realizacao")),
        "pontos_tarefas":    to_int(row.get("PontosTarefas")),
        "pct_acerto":        to_float(row.get("percentual_medio_acerto")),
        "pontos_acertos":    to_int(row.get("PontosAcertos")),
        "nr_serie":          to_int(row.get("nr_serie")),
        "pontos_total":      to_int(row.get("PontosTotal")),
        "colocacao_escola":  to_int(row.get("Colocacao_Escola")),
        "nr_classe":         to_int(row.get("NR_CLASSE")),
        "nm_escola":         (row.get("NM_COMPLETO_ESCOLA") or "").strip() or None,
        "nm_diretoria":      (row.get("NM_DIRETORIA") or "").strip() or None,
        "cd_diretoria":      to_int(row.get("CD_DIRETORIA")),
    }

def load_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(parse_row(row))
    return rows

def upload_batch(session, url, key, batch, batch_num, total):
    endpoint = f"{url}/rest/v1/{TABLE}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Content-Profile": SCHEMA,
        "Prefer": "return=minimal",
    }
    resp = session.post(endpoint, headers=headers, data=json.dumps(batch))
    if resp.status_code not in (200, 201, 204):
        print(f"  ERRO batch {batch_num}: {resp.status_code} — {resp.text[:200]}")
        return False
    print(f"  Batch {batch_num} OK ({len(batch)} linhas) [{batch_num * BATCH_SIZE}/{total}]")
    return True

def truncate(session, url, key):
    """Trunca a tabela antes de reinserir."""
    endpoint = f"{url}/rest/v1/{TABLE}?id=gte.0"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Profile": SCHEMA,
        "Prefer": "return=minimal",
    }
    resp = session.delete(endpoint, headers=headers)
    if resp.status_code not in (200, 204):
        print(f"Aviso ao truncar: {resp.status_code} — {resp.text[:200]}")

def main():
    parser = argparse.ArgumentParser(description="Migra CSV para Supabase")
    parser.add_argument("--url", required=True, help="URL do projeto Supabase")
    parser.add_argument("--key", required=True, help="Service Role Key do Supabase")
    parser.add_argument(
        "--csv",
        default=os.path.join(os.path.dirname(__file__), "..", "data", "copa-da-escola.csv"),
        help="Caminho do CSV (padrão: ../data/copa-da-escola.csv)",
    )
    parser.add_argument(
        "--no-truncate", action="store_true", help="Não truncar tabela antes de inserir"
    )
    args = parser.parse_args()

    import requests
    session = requests.Session()

    print(f"Lendo CSV: {args.csv}")
    rows = load_csv(args.csv)
    print(f"Total de linhas: {len(rows)}")

    if not args.no_truncate:
        print("Truncando tabela...")
        truncate(session, args.url, args.key)

    batches = [rows[i : i + BATCH_SIZE] for i in range(0, len(rows), BATCH_SIZE)]
    print(f"Inserindo {len(batches)} batches de até {BATCH_SIZE} linhas...")

    erros = 0
    for i, batch in enumerate(batches, 1):
        ok = upload_batch(session, args.url, args.key, batch, i, len(rows))
        if not ok:
            erros += 1

    print(f"\nConcluído! {len(batches) - erros}/{len(batches)} batches OK.")
    if erros:
        print(f"ATENCAO: {erros} batches com erro.")
        sys.exit(1)

if __name__ == "__main__":
    main()
