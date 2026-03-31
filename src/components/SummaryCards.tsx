

function fmtInt(v: number) {
  return new Intl.NumberFormat('pt-BR').format(v);
}
function fmtScore(v: number) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface SummaryProps {
  cards: {
    label: string;
    value: number;
    meta: string;
    isInt?: boolean;
  }[];
  title: string;
  isLoading: boolean;
}

export default function SummaryCards({ cards, title, isLoading }: SummaryProps) {
  return (
    <>
      <p className="section-label">{title}</p>
      <div className="cards">
        {isLoading ? (
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="loading-wrap">
              <div className="spinner"></div><br />Carregando...
            </div>
          </div>
        ) : (
          cards.map((c, i) => (
            <div className="card" key={i}>
              <div className="card-label">{c.label}</div>
              <div className="card-value">{c.isInt ? fmtInt(c.value) : fmtScore(c.value)}</div>
              <div className="card-meta">{c.meta}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
