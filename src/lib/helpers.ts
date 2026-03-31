export const SERIE_LABELS: Record<string, string> = {
  '6': '6Âº ano',
  '7': '7Âº ano',
  '8': '8Âº ano',
  '9': '9Âº ano',
  '1': '1Âª sÃ©rie',
  '2': '2Âª sÃ©rie',
  '3': '3Âª sÃ©rie',
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
