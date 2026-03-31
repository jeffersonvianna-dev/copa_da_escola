import argparse
import json
from urllib.parse import quote

import requests


def headers(key, profile_header, schema):
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        profile_header: schema,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }


def fetch_rows(base_url, key, schema, table, batch_size, offset):
    response = requests.get(
        f"{base_url}/rest/v1/{quote(table)}?select=*&limit={batch_size}&offset={offset}",
        headers=headers(key, "Accept-Profile", schema),
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def truncate_table(base_url, key, schema, table):
    response = requests.delete(
        f"{base_url}/rest/v1/{quote(table)}?id=gte.0",
        headers=headers(key, "Content-Profile", schema),
        timeout=60,
    )
    response.raise_for_status()


def insert_rows(base_url, key, schema, table, rows):
    response = requests.post(
        f"{base_url}/rest/v1/{quote(table)}",
        headers=headers(key, "Content-Profile", schema),
        data=json.dumps(rows),
        timeout=60,
    )
    response.raise_for_status()


def main():
    parser = argparse.ArgumentParser(description="Copy a table between Supabase schemas via REST")
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--source-key", required=True)
    parser.add_argument("--source-schema", required=True)
    parser.add_argument("--target-url", required=True)
    parser.add_argument("--target-key", required=True)
    parser.add_argument("--target-schema", required=True)
    parser.add_argument("--table", required=True)
    parser.add_argument("--batch-size", type=int, default=500)
    parser.add_argument("--exclude-columns", nargs="*", default=[])
    args = parser.parse_args()

    print(f"Truncating target {args.target_schema}.{args.table}")
    truncate_table(args.target_url, args.target_key, args.target_schema, args.table)

    copied = 0
    offset = 0
    while True:
        rows = fetch_rows(args.source_url, args.source_key, args.source_schema, args.table, args.batch_size, offset)
        if not rows:
            break
        payload = []
        for row in rows:
            payload.append({k: v for k, v in row.items() if k not in set(args.exclude_columns)})
        insert_rows(args.target_url, args.target_key, args.target_schema, args.table, payload)
        copied += len(payload)
        offset += len(rows)
        print(f"Copied {copied}")

    print(f"Done: {copied}")


if __name__ == "__main__":
    main()
