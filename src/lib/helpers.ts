export const SERIE_LABELS: Record<string, string> = {
  '6': '6\u00BA ano',
  '7': '7\u00BA ano',
  '8': '8\u00BA ano',
  '9': '9\u00BA ano',
  '1': '1\u00AA s\u00E9rie',
  '2': '2\u00AA s\u00E9rie',
  '3': '3\u00AA s\u00E9rie',
};

type PrimitiveValue = string | number | null | undefined;

export function serieLabel(v: string | number) {
  return SERIE_LABELS[String(v)] || String(v);
}

export function orderedSeries(rows: Array<{ nr_serie: PrimitiveValue }>) {
  const order = ['6', '7', '8', '9', '1', '2', '3'];
  const avail = new Set(rows.map((row) => String(row.nr_serie)).filter(Boolean));
  return order.filter((value) => avail.has(value));
}

export function uniqueVals<T extends Record<string, PrimitiveValue>, K extends keyof T>(rows: T[], field: K, sortNum?: boolean) {
  const vals = Array.from(
    new Set(
      rows
        .map((row) => row[field])
        .filter((value): value is Exclude<T[K], null | undefined> => value !== null && value !== undefined)
    )
  );

  return sortNum
    ? vals.sort((a, b) => Number(a) - Number(b))
    : vals.sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}
