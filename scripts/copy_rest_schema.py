import argparse
import json
import sys
from urllib.parse import quote

import requests


TABLES = {
    "curriculo_paulista": ["id", "id_habilidade", "componente", "serie", "segmento", "texto"],
    "matriz_descritores_af": ["id", "serie", "componente", "ae", "bimestre", "grupo", "descritor"],
    "ae_detalhes_af": ["id", "segmento", "serie", "componente", "bimestre", "ae", "titulo", "hab_priorizada", "hab_relacionadas", "conhecimentos_previos"],
    "ae_detalhes_em": ["id", "segmento", "serie", "componente", "bimestre", "ae", "titulo", "hab_priorizada", "hab_relacionadas", "conhecimentos_previos"],
    "escopo_em": ["id", "componente", "serie", "bimestre", "aula", "titulo", "conteudo", "objetivos", "habilidades", "aprendizagem_essencial", "unidade_tematica", "objeto", "descritivo", "referencias"],
    "escopo_af": ["id", "componente", "ano", "bimestre", "aula", "titulo", "conteudo", "objetivos", "habilidades", "aprendizagem_essencial", "unidade_tematica", "objeto", "descritivo", "referencias"],
    "matriz_descritores_em": ["id", "serie", "componente", "ae", "bimestre", "grupo", "descritor"],
}


def build_headers(key, profile_header, schema):
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        profile_header: schema,
        "Content-Type": "application/json",
    }


def fetch_rows(base_url, key, schema, table, limit, offset):
    headers = build_headers(key, "Accept-Profile", schema)
    url = f"{base_url}/rest/v1/{quote(table)}?select=*&limit={limit}&offset={offset}"
    response = requests.get(url, headers=headers, timeout=60)
    response.raise_for_status()
    return response.json()


def truncate_table(base_url, key, schema, table):
    headers = build_headers(key, "Content-Profile", schema)
    url = f"{base_url}/rest/v1/{quote(table)}?id=gte.0"
    response = requests.delete(url, headers=headers, timeout=60)
    response.raise_for_status()


def insert_rows(base_url, key, schema, table, rows):
    headers = build_headers(key, "Content-Profile", schema)
    url = f"{base_url}/rest/v1/{quote(table)}"
    response = requests.post(url, headers=headers, data=json.dumps(rows), timeout=60)
    response.raise_for_status()


def main():
    parser = argparse.ArgumentParser(description="Copy REST-accessible tables between Supabase schemas")
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--source-key", required=True)
    parser.add_argument("--source-schema", required=True)
    parser.add_argument("--target-url", required=True)
    parser.add_argument("--target-key", required=True)
    parser.add_argument("--target-schema", required=True)
    parser.add_argument("--batch-size", type=int, default=500)
    args = parser.parse_args()

    for table in TABLES:
        print(f"\nTable: {table}")
        try:
            truncate_table(args.target_url, args.target_key, args.target_schema, table)
        except Exception as exc:
            print(f"  truncate failed: {exc}")
            sys.exit(1)

        offset = 0
        copied = 0

        while True:
            rows = fetch_rows(args.source_url, args.source_key, args.source_schema, table, args.batch_size, offset)
            if not rows:
                break

            payload = [{column: row.get(column) for column in TABLES[table]} for row in rows]
            insert_rows(args.target_url, args.target_key, args.target_schema, table, payload)
            copied += len(payload)
            offset += len(payload)
            print(f"  copied {copied}")

        print(f"  done: {copied}")


if __name__ == "__main__":
    main()
