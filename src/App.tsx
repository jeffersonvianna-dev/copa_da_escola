import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import DataTable from './components/DataTable';
import { COLUMNS, type ActiveView } from './components/tableColumns';
import { fetchDashboardFilters, fetchSeducView, fetchUreView, fetchEscolaView, type AggRow } from './lib/api';
import { serieLabel } from './lib/helpers';

type SortConfig = { key: string; direction: 'asc' | 'desc' };

export default function App() {
  const [fase, setFase] = useState<string>('1');
  const [rodada, setRodada] = useState<string>('1');
  const [activeView, setActiveView] = useState<ActiveView>('seduc');
  const [search, setSearch] = useState('');
  const [selectedRegional, setSelectedRegional] = useState('');
  const [selectedEscola, setSelectedEscola] = useState('');
  const [seriesFilter, setSeriesFilter] = useState<string[]>([]);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'pontuacao',
    direction: 'desc'
  });

  const seriesFilterNum = useMemo(() => seriesFilter.map(Number), [seriesFilter]);

  // Fetch unique filter values (instant lookup)
  const { data: rawFilters = [], isLoading: isLoadingFilters } = useQuery({
    queryKey: ['filters', fase, rodada],
    queryFn: () => fetchDashboardFilters(fase, rodada),
  });

  const availableSeries = useMemo(() => {
    const order = ['6', '7', '8', '9', '1', '2', '3'];
    const avail = new Set(rawFilters.map(r => String(r.serie)).filter(Boolean));
    return order.filter(v => avail.has(v));
  }, [rawFilters]);

  // Calculate Regionals and Schools available for dropdowns
  const regionals = useMemo(() => {
    return Array.from(new Set(rawFilters.map(r => r.regional).filter(Boolean))).sort() as string[];
  }, [rawFilters]);

  const resolvedRegional = useMemo(() => {
    if (regionals.length === 0) {
      return '';
    }

    return regionals.includes(selectedRegional) ? selectedRegional : regionals[0];
  }, [regionals, selectedRegional]);

  const escolas = useMemo(() => {
    return Array.from(new Set(rawFilters.filter(r => r.regional === resolvedRegional).map(r => r.escola).filter(Boolean))).sort() as string[];
  }, [rawFilters, resolvedRegional]);

  const resolvedEscola = useMemo(() => {
    if (escolas.length === 0) {
      return '';
    }

    return escolas.includes(selectedEscola) ? selectedEscola : escolas[0];
  }, [escolas, selectedEscola]);

  // Fetch only the exact aggregated view data needed for the current table tab
  const { data: rawViewData = [], isLoading: isLoadingData } = useQuery({
    queryKey: ['viewData', activeView, fase, rodada, activeView !== 'seduc' ? resolvedRegional : '', activeView === 'escola' ? resolvedEscola : '', seriesFilterNum],
    queryFn: () => {
       if (activeView === 'seduc') return fetchSeducView(fase, rodada, seriesFilterNum);
       // Only fetch if dependencies exist
       if (activeView === 'ure' && resolvedRegional) return fetchUreView(fase, rodada, resolvedRegional, seriesFilterNum);
       if (activeView === 'escola' && resolvedRegional && resolvedEscola) return fetchEscolaView(fase, rodada, resolvedRegional, resolvedEscola, seriesFilterNum);
       return Promise.resolve([]);
    },
    enabled: true 
  });

  const isLoading = isLoadingFilters || isLoadingData;

  const visibleData = useMemo(() => {
    let rows: AggRow[] = [...rawViewData];
    
    // Search logic (local, inside the active tab)
    if (search) {
      const term = search.toLowerCase();
      const nameKey: keyof AggRow = activeView === 'ure' ? 'escola' : activeView === 'escola' ? 'turma' : 'regional';
      rows = rows.filter(r => String(r[nameKey] ?? '').toLowerCase().includes(term));
    }

    // Sort logic
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
  }, [rawViewData, search, sortConfig, activeView]);

  // Weighted Totals specifically for current context (state vs regional vs school)
  const { e: totalEscolas, t: totalTurmas, p: avgP, f: avgF, tf: avgTF, a: avgA } = useMemo(() => {
    if (!rawViewData || rawViewData.length === 0) return { e: 0, t: 0, p: 0, f: 0, tf: 0, a: 0 };
     
    if (activeView === 'escola') {
       const t = rawViewData.length;
       return {
          e: 1, 
          t,
          p: rawViewData.reduce((s, r) => s + Number(r.pontuacao), 0) / t,
          f: rawViewData.reduce((s, r) => s + Number(r.frequencia), 0) / t,
          tf: rawViewData.reduce((s, r) => s + Number(r.tarefas), 0) / t,
          a: rawViewData.reduce((s, r) => s + Number(r.acertos), 0) / t,
       }
    }
    
    const sumTurmas = rawViewData.reduce((s, r) => s + (Number(r.totalTurmas) || 0), 0);
    const sumEscolas = activeView === 'seduc' 
        ? rawViewData.reduce((s, r) => s + (Number(r.totalEscolas) || 0), 0)
        : rawViewData.length; // In URE view, each row is 1 escola
        
    const t = sumTurmas || 1; // avoid divide by zero
    return {
        e: sumEscolas,
        t: sumTurmas,
        p: rawViewData.reduce((s, r) => s + (Number(r.pontuacao) * (Number(r.totalTurmas) || 1)), 0) / t,
        f: rawViewData.reduce((s, r) => s + (Number(r.frequencia) * (Number(r.totalTurmas) || 1)), 0) / t,
        tf: rawViewData.reduce((s, r) => s + (Number(r.tarefas) * (Number(r.totalTurmas) || 1)), 0) / t,
        a: rawViewData.reduce((s, r) => s + (Number(r.acertos) * (Number(r.totalTurmas) || 1)), 0) / t,
    }
  }, [rawViewData, activeView]);

  const handleSort = (key: string) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'desc' });
    }
  };

  const handleSeriesToggle = (val: string) => {
    if (seriesFilter.includes(val)) {
      setSeriesFilter(seriesFilter.filter(v => v !== val));
    } else {
      setSeriesFilter([...seriesFilter, val]);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSeriesFilter([]);
    setSeriesOpen(false);
  };

  const summaryCardsProps = [
    { label: 'Total de escolas', value: totalEscolas, meta: 'Escolas únicas', isInt: true },
    { label: 'Total de turmas', value: totalTurmas, meta: 'Turmas únicas', isInt: true },
    { label: 'Pontuação', value: avgP, meta: 'Média pontos totais' },
    { label: 'Frequência', value: avgF, meta: 'Média pontos frequência' },
    { label: 'Tarefas', value: avgTF, meta: 'Média pontos tarefas' },
    { label: 'Acertos', value: avgA, meta: 'Média pontos acertos' },
  ];

  return (
    <div>
      <Header />
      <main className="page">
        {/* Filters */}
        <div className="filter-bar">
          <div className="field">
            <label htmlFor="filter-fase">Fase</label>
            <select id="filter-fase" value={fase} onChange={e => setFase(e.target.value)}>
              <option value="1">1 - Classificatória</option>
              <option value="2">2 - Grupos</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter-rodada">Rodada</label>
            <select id="filter-rodada" value={rodada} onChange={e => setRodada(e.target.value)}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div className="field field-multi">
            <label>Série</label>
            <button className="multi-trigger" onClick={() => setSeriesOpen(!seriesOpen)}>
              {seriesFilter.length === 0 || seriesFilter.length === availableSeries.length ? 'Todos' : seriesFilter.length === 1 ? serieLabel(seriesFilter[0]) : `Seleções múltiplas (${seriesFilter.length})`}
            </button>
            {seriesOpen && (
              <div className="multi-panel open">
                <div className="multi-actions">
                  <button onClick={() => setSeriesFilter([...availableSeries])}>Marcar todas</button>
                  <button onClick={() => setSeriesFilter([])}>Limpar</button>
                </div>
                <div className="multi-options">
                  {availableSeries.map(v => (
                    <label className="multi-option" key={v}>
                      <input type="checkbox" checked={seriesFilter.includes(v)} onChange={() => handleSeriesToggle(v)} />
                      <span>{serieLabel(v)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="btn-clear" onClick={clearFilters} title="Limpar filtros">&#8635;</button>
          
          <div className="field search-field">
            <label htmlFor="search">Busca</label>
            <input id="search" type="search" placeholder="Filtrar nesta lista..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Summary */}
        <SummaryCards title={activeView === 'seduc' ? 'SEDUC' : activeView === 'ure' ? 'URE' : 'Escola'} cards={summaryCardsProps} isLoading={isLoading} />

        {/* Table Section */}
        <div className="table-section">
          <div className="table-top">
            <div className="tabs">
              <button className={`tab-button ${activeView === 'seduc' ? 'active' : ''}`} onClick={() => setActiveView('seduc')}>SEDUC</button>
              <button className={`tab-button ${activeView === 'ure' ? 'active' : ''}`} onClick={() => setActiveView('ure')}>URE</button>
              <button className={`tab-button ${activeView === 'escola' ? 'active' : ''}`} onClick={() => setActiveView('escola')}>Escola</button>
            </div>
            <div className="table-filters" style={{display: activeView !== 'seduc' ? 'flex' : 'none'}}>
              {(activeView === 'ure' || activeView === 'escola') && (
                <div className="field field-inline">
                  <label>Regional</label>
                  <select value={resolvedRegional} onChange={e => setSelectedRegional(e.target.value)}>
                    {regionals.map(r => <option key={r as string} value={r as string}>{r as React.ReactNode}</option>)}
                  </select>
                </div>
              )}
              {activeView === 'escola' && (
                <div className="field field-inline">
                  <label>Escola</label>
                  <select value={resolvedEscola} onChange={e => setSelectedEscola(e.target.value)}>
                    {escolas.map(e => <option key={e as string} value={e as string}>{e as React.ReactNode}</option>)}
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
