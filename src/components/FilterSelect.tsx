import { useEffect, useId, useMemo, useRef, useState } from 'react';

interface FilterSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
}

export default function FilterSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  const visibleOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => option.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const selectedLabel = value || placeholder;

  return (
    <div className="field field-inline field-combobox" ref={rootRef}>
      <label>{label}</label>
      <button
        type="button"
        className={`combobox-trigger ${isOpen ? 'open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => {
          setIsOpen((current) => !current);
          if (isOpen) {
            setQuery('');
          }
        }}
      >
        <span>{selectedLabel}</span>
        <span className="combobox-count">{options.length}</span>
      </button>

      {isOpen && (
        <div className="combobox-panel">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="combobox-search"
            autoFocus
          />

          <div className="combobox-meta">
            {visibleOptions.length} de {options.length} opcoes{options.length > 8 ? ' - role para ver mais' : ''}
          </div>

          <div className="combobox-list" id={listboxId} role="listbox" aria-label={label}>
            {visibleOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={`combobox-option ${option === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(option);
                  setQuery('');
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}

            {visibleOptions.length === 0 && (
              <div className="combobox-empty">Nenhuma opcao encontrada.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
