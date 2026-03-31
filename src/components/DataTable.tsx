import type { ReactNode } from 'react';
import type { AggRow } from '../lib/api';
import type { ColumnDef } from './tableColumns';

function fmtScore(v: number) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(v: number) {
  return new Intl.NumberFormat('pt-BR').format(v);
}

function TableRow({ row, cols, rank }: { row: AggRow; cols: ColumnDef[]; rank: number }) {
  return (
    <tr>
      {cols.map((col) => {
        if (col.key === 'rank') {
          return (
            <td key={col.key} className={col.cls}>
              {rank <= 3 ? (
                <span className={`rank-medal rank-${rank}`}>{rank}</span>
              ) : (
                <span className="rank-n">{rank}</span>
              )}
            </td>
          );
        }

        const rawValue = row[col.key];
        let displayValue: ReactNode = rawValue ?? '';

        if (typeof rawValue === 'number' && col.key !== 'totalEscolas' && col.key !== 'totalTurmas') {
          displayValue = col.key === 'pontuacao'
            ? <span className="score-badge">{fmtScore(rawValue)}</span>
            : fmtScore(rawValue);
        } else if (typeof rawValue === 'number') {
          displayValue = fmtInt(rawValue);
        }

        return (
          <td key={col.key} className={col.cls}>
            {displayValue}
          </td>
        );
      })}
    </tr>
  );
}

interface DataTableProps {
  columns: ColumnDef[];
  data: AggRow[];
  isLoading: boolean;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
}

export default function DataTable({ columns, data, isLoading, sortConfig, onSort }: DataTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${column.cls} ${sortConfig.key === column.key ? 'active-sort' : ''}`}
                data-sortable={column.sortable ? 'true' : 'false'}
                onClick={() => column.sortable && onSort(column.key)}
              >
                {column.label} {column.sortable && sortConfig.key === column.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="loading-wrap">
                  <div className="spinner"></div><br />Conectando ao Supabase...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="notice">Nenhum dado encontrado para os filtros atuais.</div>
              </td>
            </tr>
          ) : (
            data.map((row, index) => <TableRow key={index} row={row} cols={columns} rank={index + 1} />)
          )}
        </tbody>
      </table>
    </div>
  );
}
