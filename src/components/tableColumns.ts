export type ActiveView = 'seduc' | 'ure' | 'escola';

export interface ColumnDef {
  key: string;
  label: string;
  sortable: boolean;
  cls: string;
}

export const COLUMNS: Record<ActiveView, ColumnDef[]> = {
  seduc: [
    { key: 'rank', label: '#', sortable: false, cls: 'td-rank' },
    { key: 'regional', label: 'Regional', sortable: true, cls: 'td-name' },
    { key: 'totalEscolas', label: 'Escolas', sortable: true, cls: 'td-num' },
    { key: 'totalTurmas', label: 'Turmas', sortable: true, cls: 'td-num' },
    { key: 'pontuacao', label: 'Pontuacao', sortable: true, cls: 'td-num' },
    { key: 'frequencia', label: 'Frequencia', sortable: true, cls: 'td-num' },
    { key: 'tarefas', label: 'Tarefas', sortable: true, cls: 'td-num' },
    { key: 'acertos', label: 'Acertos', sortable: true, cls: 'td-num' },
  ],
  ure: [
    { key: 'rank', label: '#', sortable: false, cls: 'td-rank' },
    { key: 'escola', label: 'Escola', sortable: true, cls: 'td-name' },
    { key: 'totalTurmas', label: 'Turmas', sortable: true, cls: 'td-num' },
    { key: 'pontuacao', label: 'Pontuacao', sortable: true, cls: 'td-num' },
    { key: 'frequencia', label: 'Frequencia', sortable: true, cls: 'td-num' },
    { key: 'tarefas', label: 'Tarefas', sortable: true, cls: 'td-num' },
    { key: 'acertos', label: 'Acertos', sortable: true, cls: 'td-num' },
  ],
  escola: [
    { key: 'rank', label: '#', sortable: false, cls: 'td-rank' },
    { key: 'turma', label: 'Turma', sortable: true, cls: 'td-name' },
    { key: 'pontuacao', label: 'Pontuacao', sortable: true, cls: 'td-num' },
    { key: 'frequencia', label: 'Frequencia', sortable: true, cls: 'td-num' },
    { key: 'tarefas', label: 'Tarefas', sortable: true, cls: 'td-num' },
    { key: 'acertos', label: 'Acertos', sortable: true, cls: 'td-num' },
  ],
};
