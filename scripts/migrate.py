"""
Migracao: copa-da-escola.csv -> Supabase.

Suporta dois fluxos:
1. REST API do Supabase
2. Geracao de SQL para aplicar com `supabase db query`
"""

import argparse
import csv
import json
import os
import sys

BATCH_SIZE = 500
DEFAULT_TABLE = "resultados_turmas"
DEFAULT_SCHEMA = "2026_copa_da_escola"

COLUMNS = [
    "cd_escola",
    "cd_turma",
    "ds_turma",
    "fase",
    "rodada",
    "pct_frequencia",
    "pontos_frequencia",
    "pct_realizacao",
    "pontos_tarefas",
    "pct_acerto",
    "pontos_acertos",
    "nr_serie",
    "pontos_total",
    "colocacao_escola",
    "nr_classe",
    "nm_escola",
    "nm_diretoria",
    "cd_diretoria",
]


def to_int(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def to_float(value):
    try:
        return float(str(value).replace(",", "."))
    except (ValueError, TypeError):
        return None


def parse_row(row):
    return {
        "cd_escola": to_int(row.get("cd_escola") or row.get("CD_ESCOLA")),
        "cd_turma": to_int(row.get("cd_turma")),
        "ds_turma": (row.get("ds_turma") or "").strip() or None,
        "fase": to_int(row.get("Fase")),
        "rodada": to_int(row.get("Rodada")),
        "pct_frequencia": to_float(row.get("percentual_frequencia")),
        "pontos_frequencia": to_int(row.get("PontosFrequencia")),
        "pct_realizacao": to_float(row.get("percentual_realizacao")),
        "pontos_tarefas": to_int(row.get("PontosTarefas")),
        "pct_acerto": to_float(row.get("percentual_medio_acerto")),
        "pontos_acertos": to_int(row.get("PontosAcertos")),
        "nr_serie": to_int(row.get("nr_serie")),
        "pontos_total": to_int(row.get("PontosTotal")),
        "colocacao_escola": to_int(row.get("Colocacao_Escola")),
        "nr_classe": to_int(row.get("NR_CLASSE")),
        "nm_escola": (row.get("NM_COMPLETO_ESCOLA") or "").strip() or None,
        "nm_diretoria": (row.get("NM_DIRETORIA") or "").strip() or None,
        "cd_diretoria": to_int(row.get("CD_DIRETORIA")),
    }


def load_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        for row in reader:
            rows.append(parse_row(row))
    return rows


def sql_literal(value):
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def write_sql_file(path, schema, table, rows):
    qualified_table = f'"{schema}"."{table}"'
    quoted_columns = ", ".join(f'"{column}"' for column in COLUMNS)

    with open(path, "w", encoding="utf-8") as file:
        file.write("begin;\n")
        file.write(f"truncate table {qualified_table} restart identity;\n")

        for index in range(0, len(rows), BATCH_SIZE):
            batch = rows[index : index + BATCH_SIZE]
            values_sql = []

            for row in batch:
                values = ", ".join(sql_literal(row.get(column)) for column in COLUMNS)
                values_sql.append(f"({values})")

            file.write(f"insert into {qualified_table} ({quoted_columns}) values\n")
            file.write(",\n".join(values_sql))
            file.write(";\n")

        file.write("commit;\n")


def upload_batch(session, url, key, schema, table, batch, batch_num, total):
    endpoint = f"{url}/rest/v1/{table}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Content-Profile": schema,
        "Prefer": "return=minimal",
    }
    response = session.post(endpoint, headers=headers, data=json.dumps(batch))
    if response.status_code not in (200, 201, 204):
        print(f"  ERRO batch {batch_num}: {response.status_code} - {response.text[:200]}")
        return False
    print(f"  Batch {batch_num} OK ({len(batch)} linhas) [{batch_num * BATCH_SIZE}/{total}]")
    return True


def truncate(session, url, key, schema, table):
    endpoint = f"{url}/rest/v1/{table}?id=gte.0"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Profile": schema,
        "Prefer": "return=minimal",
    }
    response = session.delete(endpoint, headers=headers)
    if response.status_code not in (200, 204):
        print(f"Aviso ao truncar: {response.status_code} - {response.text[:200]}")


def main():
    parser = argparse.ArgumentParser(description="Migra CSV para Supabase")
    parser.add_argument("--url", required=True, help="URL do projeto Supabase")
    parser.add_argument("--key", required=True, help="Service Role Key do Supabase")
    parser.add_argument("--schema", default=DEFAULT_SCHEMA, help="Schema de destino")
    parser.add_argument("--table", default=DEFAULT_TABLE, help="Tabela de destino")
    parser.add_argument(
        "--csv",
        default=os.path.join(os.path.dirname(__file__), "..", "data", "copa-da-escola.csv"),
        help="Caminho do CSV",
    )
    parser.add_argument("--no-truncate", action="store_true", help="Nao truncar antes de inserir")
    parser.add_argument(
        "--sql-out",
        help="Se informado, gera um arquivo SQL com a carga dos dados em vez de usar a API REST",
    )
    args = parser.parse_args()

    print(f"Lendo CSV: {args.csv}")
    rows = load_csv(args.csv)
    print(f"Total de linhas: {len(rows)}")

    if args.sql_out:
        write_sql_file(args.sql_out, args.schema, args.table, rows)
        print(f"Arquivo SQL gerado em: {args.sql_out}")
        return

    import requests

    session = requests.Session()

    if not args.no_truncate:
        print("Truncando tabela...")
        truncate(session, args.url, args.key, args.schema, args.table)

    batches = [rows[i : i + BATCH_SIZE] for i in range(0, len(rows), BATCH_SIZE)]
    print(f"Inserindo {len(batches)} batches de ate {BATCH_SIZE} linhas...")

    errors = 0
    for index, batch in enumerate(batches, 1):
        ok = upload_batch(session, args.url, args.key, args.schema, args.table, batch, index, len(rows))
        if not ok:
            errors += 1

    print(f"\nConcluido! {len(batches) - errors}/{len(batches)} batches OK.")
    if errors:
        print(f"ATENCAO: {errors} batches com erro.")
        sys.exit(1)


if __name__ == "__main__":
    main()
