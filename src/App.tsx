import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import DataTable from './components/DataTable';
import { COLUMNS, type ActiveView } from './components/tableColumns';
import {
  fetchAvailablePhaseRounds,
  fetchDashboardFilters,
  fetchEscolaView,
  fetchSeducView,
  fetchUreView,
  type AggRow,
} from './lib/api';
import { serieLabel } from './lib/helpers';

type SortConfig = { key: string; direction: 'asc' | 'desc' };

const FASE_LABELS: Record<string, string> = {
  '1': '1 - Classificatoria',
  '2': '2 - Grupos',
};

export default function App() {
  const [fase, setFase] = useState('');
  const [rodada, setRodada] = useState('');
  const [activeView, setActiveView] = useState<ActiveView>('seduc');
  const [search, setSearch] = useState('');
  const [selectedRegional, setSelectedRegional] = useState('');
  const [selectedEscola, setSelectedEscola] = useState('');
  const [seriesFilter, setSeriesFilter] = useState<string[]>([]);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'pontuacao',
    direction: 'desc',
  });

  const seriesFilterNum = useMemo(() => seriesFilter.map(Number), [seriesFilter]);

  const { data: availableMoments = [], isLoading: isLoadingMoments } = useQuery({
    queryKey: ['availablePhaseRounds'],
    queryFn: fetchAvailablePhaseRounds,
  });

  const availableFases = useMemo(() => {
    return Array.from(
      new Set(
        availableMoments
          .map((item) => item.fase)
          .filter((value): value is number => value !== null)
      )
    )
      .sort((a, b) => b - a)
      .map(String);
  }, [availableMoments]);

  const resolvedFase = useMemo(() => {
    if (availableFases.length === 0) {
      return '';
    }

    return availableFases.includes(fase) ? fase : availableFases[0];
  }, [availableFases, fase]);

  const availableRodadas = useMemo(() => {
    if (!resolvedFase) {
      return [];
    }

    return Array.from(
      new Set(
        availableMoments
          .filter((item) => String(item.fase) === resolvedFase)
          .map((item) => item.rodada)
          .filter((value): value is number => value !== null)
      )
    )
      .sort((a, b) => b - a)
      .map(String);
  }, [availableMoments, resolvedFase]);

  const resolvedRodada = useMemo(() => {
    if (availableRodadas.length === 0) {
      return '';
    }

    return availableRodadas.includes(rodada) ? rodada : availableRodadas[0];
  }, [availableRodadas, rodada]);

  const { data: rawFilters = [], isLoading: isLoadingFilters } = useQuery({
    queryKey: ['filters', resolvedFase, resolvedRodada],
    queryFn: () => fetchDashboardFilters(resolvedFase, resolvedRodada),
    enabled: Boolean(resolvedFase && resolvedRodada),
  });

  const availableSeries = useMemo(() => {
    const order = ['6', '7', '8', '9', '1', '2', '3'];
    const available = new Set(rawFilters.map((item) => String(item.serie)).filter(Boolean));
    return order.filter((value) => available.has(value));
  }, [rawFilters]);

  const regionals = useMemo(() => {
    return Array.from(new Set(rawFilters.map((item) => item.regional).filter(Boolean))).sort() as string[];
  }, [rawFilters]);

  const resolvedRegional = useMemo(() => {
    if (regionals.length === 0) {
      return '';
    }

    return regionals.includes(selectedRegional) ? selectedRegional : regionals[0];
  }, [regionals, selectedRegional]);

  const escolas = useMemo(() => {
    return Array.from(
      new Set(
        rawFilters
          .filter((item) => item.regional === resolvedRegional)
          .map((item) => item.escola)
          .filter(Boolean)
      )
    ).sort() as string[];
  }, [rawFilters, resolvedRegional]);

  const resolvedEscola = useMemo(() => {
    if (escolas.length === 0) {
      return '';
    }

    return escolas.includes(selectedEscola) ? selectedEscola : escolas[0];
  }, [escolas, selectedEscola]);

  const { data: rawViewData = [], isLoading: isLoadingData } = useQuery({
    queryKey: [
      'viewData',
      activeView,
      resolvedFase,
      resolvedRodada,
      activeView !== 'seduc' ? resolvedRegional : '',
      activeView === 'escola' ? resolvedEscola : '',
      seriesFilterNum,
    ],
    queryFn: () => {
      if (activeView === 'seduc') {
        return fetchSeducView(resolvedFase, resolvedRodada, seriesFilterNum);
      }

      if (activeView === 'ure' && resolvedRegional) {
        return fetchUreView(resolvedFase, resolvedRodada, resolvedRegional, seriesFilterNum);
      }

      if (activeView === 'escola' && resolvedRegional && resolvedEscola) {
        return fetchEscolaView(resolvedFase, resolvedRodada, resolvedRegional, resolvedEscola, seriesFilterNum);
      }

      return Promise.resolve([]);
    },
    enabled: Boolean(resolvedFase && resolvedRodada),
  });

  const isLoading = isLoadingMoments || isLoadingFilters || isLoadingData;

  const visibleData = useMemo(() => {
    let rows: AggRow[] = [...rawViewData];

    if (search) {
      const term = search.toLowerCase();
      const nameKey: keyof AggRow = activeView === 'ure' ? 'escola' : activeView === 'escola' ? 'turma' : 'regional';
      rows = rows.filter((row) => String(row[nameKey] ?? '').toLowerCase().includes(term));
    }

    if (sortConfig.key !== 'rank') {
      rows.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (typeof valA === 'string' || typeof valB === 'string') {
          const textA = String(valA ?? '');
          const textB = String(valB ?? '');
          return sortConfig.direction === 'asc' ? textA.localeCompare(textB, 'pt-BR') : textB.localeCompare(textA, 'pt-BR');
        }

        const numA = Number(valA ?? 0);
        const numB = Number(valB ?? 0);
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      });
    }

    return rows;
  }, [activeView, rawViewData, search, sortConfig]);

  const { e: totalEscolas, t: totalTurmas, p: avgP, f: avgF, tf: avgTF, a: avgA } = useMemo(() => {
    if (!rawViewData || rawViewData.length === 0) {
      return { e: 0, t: 0, p: 0, f: 0, tf: 0, a: 0 };
    }

    if (activeView === 'escola') {
      const totalTurmasEscola = rawViewData.length;
      return {
        e: 1,
        t: totalTurmasEscola,
        p: rawViewData.reduce((sum, row) => sum + Number(row.pontuacao), 0) / totalTurmasEscola,
        f: rawViewData.reduce((sum, row) => sum + Number(row.frequencia), 0) / totalTurmasEscola,
        tf: rawViewData.reduce((sum, row) => sum + Number(row.tarefas), 0) / totalTurmasEscola,
        a: rawViewData.reduce((sum, row) => sum + Number(row.acertos), 0) / totalTurmasEscola,
      };
    }

    const sumTurmas = rawViewData.reduce((sum, row) => sum + (Number(row.totalTurmas) || 0), 0);
    const sumEscolas = activeView === 'seduc'
      ? rawViewData.reduce((sum, row) => sum + (Number(row.totalEscolas) || 0), 0)
      : rawViewData.length;

    const divisor = sumTurmas || 1;
    return {
      e: sumEscolas,
      t: sumTurmas,
      p: rawViewData.reduce((sum, row) => sum + (Number(row.pontuacao) * (Number(row.totalTurmas) || 1)), 0) / divisor,
      f: rawViewData.reduce((sum, row) => sum + (Number(row.frequencia) * (Number(row.totalTurmas) || 1)), 0) / divisor,
      tf: rawViewData.reduce((sum, row) => sum + (Number(row.tarefas) * (Number(row.totalTurmas) || 1)), 0) / divisor,
      a: rawViewData.reduce((sum, row) => sum + (Number(row.acertos) * (Number(row.totalTurmas) || 1)), 0) / divisor,
    };
  }, [activeView, rawViewData]);

  const handleSort = (key: string) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
      return;
    }

    setSortConfig({ key, direction: 'desc' });
  };

  const handleSeriesToggle = (value: string) => {
    if (seriesFilter.includes(value)) {
      setSeriesFilter(seriesFilter.filter((item) => item !== value));
      return;
    }

    setSeriesFilter([...seriesFilter, value]);
  };

  const summaryCardsProps = [
    { label: 'Total de escolas', value: totalEscolas, meta: 'Escolas unicas', isInt: true },
    { label: 'Total de turmas', value: totalTurmas, meta: 'Turmas unicas', isInt: true },
    { label: 'Pontuacao', value: avgP, meta: 'Media pontos totais' },
    { label: 'Frequencia', value: avgF, meta: 'Media pontos frequencia' },
    { label: 'Tarefas', value: avgTF, meta: 'Media pontos tarefas' },
    { label: 'Acertos', value: avgA, meta: 'Media pontos acertos' },
  ];

  return (
    <div>
      <Header />
      <main className="page">
        <div className="filter-bar">
          <div className="field">
            <label htmlFor="filter-fase">Fase</label>
            <select
              id="filter-fase"
              value={resolvedFase}
              onChange={(event) => {
                setFase(event.target.value);
                setRodada('');
              }}
            >
              {availableFases.map((value) => (
                <option key={value} value={value}>
                  {FASE_LABELS[value] ?? value}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-rodada">Rodada</label>
            <select id="filter-rodada" value={resolvedRodada} onChange={(event) => setRodada(event.target.value)}>
              {availableRodadas.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="field field-multi">
            <label>Serie</label>
            <button className="multi-trigger" onClick={() => setSeriesOpen(!seriesOpen)}>
              {seriesFilter.length === 0 || seriesFilter.length === availableSeries.length
                ? 'Todos'
                : seriesFilter.length === 1
                  ? serieLabel(seriesFilter[0])
                  : `Selecoes multiplas (${seriesFilter.length})`}
            </button>
            {seriesOpen && (
              <div className="multi-panel open">
                <div className="multi-actions">
                  <button onClick={() => setSeriesFilter([...availableSeries])}>Marcar todas</button>
                  <button onClick={() => setSeriesFilter([])}>Limpar</button>
                </div>
                <div className="multi-options">
                  {availableSeries.map((value) => (
                    <label className="multi-option" key={value}>
                      <input
                        type="checkbox"
                        checked={seriesFilter.includes(value)}
                        onChange={() => handleSeriesToggle(value)}
                      />
                      <span>{serieLabel(value)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="field search-field">
            <label htmlFor="search">Busca</label>
            <input
              id="search"
              type="search"
              placeholder="Filtrar nesta lista..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <SummaryCards
          title={activeView === 'seduc' ? 'SEDUC' : activeView === 'ure' ? 'URE' : 'Escola'}
          cards={summaryCardsProps}
          isLoading={isLoading}
        />

        <div className="table-section">
          <div className="table-top">
            <div className="tabs">
              <button className={`tab-button ${activeView === 'seduc' ? 'active' : ''}`} onClick={() => setActiveView('seduc')}>
                SEDUC
              </button>
              <button className={`tab-button ${activeView === 'ure' ? 'active' : ''}`} onClick={() => setActiveView('ure')}>
                URE
              </button>
              <button className={`tab-button ${activeView === 'escola' ? 'active' : ''}`} onClick={() => setActiveView('escola')}>
                Escola
              </button>
            </div>

            <div className="table-filters" style={{ display: activeView !== 'seduc' ? 'flex' : 'none' }}>
              {(activeView === 'ure' || activeView === 'escola') && (
                <div className="field field-inline">
                  <label>Regional</label>
                  <select value={resolvedRegional} onChange={(event) => setSelectedRegional(event.target.value)}>
                    {regionals.map((regional) => (
                      <option key={regional} value={regional}>
                        {regional}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeView === 'escola' && (
                <div className="field field-inline">
                  <label>Escola</label>
                  <select value={resolvedEscola} onChange={(event) => setSelectedEscola(event.target.value)}>
                    {escolas.map((escola) => (
                      <option key={escola} value={escola}>
                        {escola}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <DataTable
            columns={COLUMNS[activeView]}
            data={visibleData}
            isLoading={isLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>
      </main>
    </div>
  );
}
