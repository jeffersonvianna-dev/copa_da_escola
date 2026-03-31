

export default function Header() {
  const today = new Intl.DateTimeFormat('pt-BR').format(new Date());

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <img src="/assets/logo-copa-da-escola.png" alt="Copa da Escola" className="header-logo" />
          <div className="header-title">
            <h1>Copa da Escola</h1>
            <p>Painel para URE</p>
          </div>
        </div>
        <div className="header-stamp">
          Atualizado em <strong>{today}</strong>
        </div>
      </div>
    </header>
  );
}
