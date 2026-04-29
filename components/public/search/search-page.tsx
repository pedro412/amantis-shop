'use client';

import { Search, SearchX, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import {
  clearRecentSearches,
  getRecentSearches,
  pushRecentSearch,
} from '@/lib/recent-searches';
import { searchProductsAction } from '@/server/actions/search';
import type { SearchHit } from '@/server/queries/search';

import { SearchResultRow } from './search-result-row';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  // Sequence id to ignore stale responses when the user types fast.
  const seqRef = useRef(0);

  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searched, setSearched] = useState(false); // true once at least one query has resolved
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [recents, setRecents] = useState<string[]>([]);

  // Hydrate recents and focus the input on mount.
  useEffect(() => {
    setRecents(getRecentSearches());
    inputRef.current?.focus();
  }, []);

  // Debounced fetch.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setHits([]);
      setSearched(false);
      setPending(false);
      setError(undefined);
      return;
    }

    setPending(true);
    setError(undefined);
    const mySeq = ++seqRef.current;
    const t = setTimeout(async () => {
      const result = await searchProductsAction(trimmed);
      // Drop stale responses if a newer query has been issued since.
      if (mySeq !== seqRef.current) return;
      if ('error' in result) {
        setError(result.error);
        setHits([]);
      } else {
        setHits(result.hits);
        setError(undefined);
      }
      setSearched(true);
      setPending(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const onClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const onCancel = () => {
    router.back();
  };

  const onSubmitTerm = (term: string) => {
    setRecents(pushRecentSearch(term));
  };

  const onPickRecent = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const onClearRecents = () => {
    clearRecentSearches();
    setRecents([]);
  };

  const trimmedQuery = query.trim();
  const showRecents = trimmedQuery.length < MIN_QUERY_LENGTH && recents.length > 0;
  const showNoResults =
    trimmedQuery.length >= MIN_QUERY_LENGTH && searched && !pending && hits.length === 0;
  const showHits = trimmedQuery.length >= MIN_QUERY_LENGTH && hits.length > 0;
  const showHint =
    trimmedQuery.length === 0 && recents.length === 0;

  return (
    <div className="px-4 pt-3">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
            strokeWidth={1.75}
          />
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Buscar productos…"
            aria-label="Buscar productos"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && trimmedQuery.length >= MIN_QUERY_LENGTH) {
                onSubmitTerm(trimmedQuery);
              }
            }}
            className={cn(
              'h-11 w-full rounded-full border border-border bg-bg pl-10 pr-10',
              'font-sans text-[16px] text-fg placeholder:text-fg-subtle',
              'transition-colors focus:border-primary focus:outline-none',
            )}
          />
          {query && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={onClear}
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-fg-subtle hover:bg-surface-alt hover:text-fg-muted"
            >
              <X aria-hidden className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="font-sans text-[13px] font-medium text-primary hover:underline underline-offset-2"
        >
          Cancelar
        </button>
      </div>

      {/* Results / states */}
      <div className="mt-5">
        {error && (
          <p role="alert" className="px-2 font-sans text-[13px] text-destructive">
            {error}
          </p>
        )}

        {showHint && (
          <Hint>
            Empieza a escribir para encontrar productos por nombre, descripción o
            etiqueta.
          </Hint>
        )}

        {showRecents && (
          <section aria-labelledby="recents-heading">
            <div className="flex items-center justify-between px-2">
              <h2
                id="recents-heading"
                className="font-sans text-[12px] font-medium uppercase tracking-[0.06em] text-fg-muted"
              >
                Búsquedas recientes
              </h2>
              <button
                type="button"
                onClick={onClearRecents}
                className="font-sans text-[12px] font-medium text-fg-muted hover:text-fg"
              >
                Borrar
              </button>
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5 px-2">
              {recents.map((term) => (
                <li key={term}>
                  <button
                    type="button"
                    onClick={() => onPickRecent(term)}
                    className={cn(
                      'inline-flex h-9 items-center rounded-full border border-border bg-bg px-3.5',
                      'font-sans text-[13px] font-medium text-fg-muted',
                      'transition-colors hover:border-border-strong hover:text-fg',
                    )}
                  >
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {showNoResults && (
          <NoResults query={trimmedQuery} />
        )}

        {showHits && (
          <ul className="-mx-2 flex flex-col gap-0.5">
            {hits.map((hit) => (
              <li key={hit.id}>
                <SearchResultRow
                  hit={hit}
                  query={trimmedQuery}
                  onOpen={() => onSubmitTerm(trimmedQuery)}
                />
              </li>
            ))}
          </ul>
        )}

        {pending && trimmedQuery.length >= MIN_QUERY_LENGTH && hits.length === 0 && !searched && (
          <p className="px-2 font-sans text-[12px] text-fg-muted">Buscando…</p>
        )}
      </div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 font-sans text-[13px] leading-relaxed text-fg-muted">
      {children}
    </p>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <span
        aria-hidden
        className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-fg-muted"
      >
        <SearchX className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <h2 className="font-serif text-h3 font-medium text-fg">Sin resultados</h2>
      <p className="mt-1.5 max-w-xs font-sans text-[13px] leading-relaxed text-fg-muted">
        No encontramos productos para “{query}”. Prueba con otra palabra o explora por
        categoría desde el inicio.
      </p>
    </div>
  );
}
