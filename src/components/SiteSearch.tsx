import { useState, useId, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CornerDownLeft } from "lucide-react";
import { searchSite, type SearchEntry } from "@/data/searchIndex";

interface SiteSearchProps {
  /** Rendered above the field. */
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Client-side site search.
 *
 * Implemented as a combobox per the WAI-ARIA pattern: the input owns
 * `aria-expanded`/`aria-controls`/`aria-activedescendant`, results are a
 * `listbox` of `option`s, and Up/Down/Enter/Escape all work without a pointer.
 * Result count is announced through a live region so screen-reader users learn
 * that typing produced matches — the visual list alone is silent to them.
 */
export default function SiteSearch({
  label = "Search the site",
  placeholder = "Try “9mm”, “export”, “FSSAI”…",
  autoFocus = false,
  className = "",
}: SiteSearchProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const navigate = useNavigate();
  const inputId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchSite(query), [query]);
  const open = results.length > 0;

  const go = (entry: SearchEntry) => {
    setQuery("");
    setActive(-1);
    navigate(entry.path);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active >= 0 ? active : 0]);
    } else if (e.key === "Escape") {
      setQuery("");
      setActive(-1);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={inputId} className="block text-2xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-2">
        {label}
      </label>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          autoComplete="off"
          // Off by default. Auto-focusing moves the screen reader's cursor
          // past the page heading, so a visitor who has just landed on a 404
          // would never hear what went wrong — only callers that have a
          // genuine reason opt in.
          autoFocus={autoFocus}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
          }}
          onKeyDown={onKeyDown}
          className="w-full rounded-full border border-border bg-background/80 py-3 pl-11 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>

      {/* Announced to assistive tech; the visual list is presentational. */}
      <p aria-live="polite" className="sr-only">
        {query.trim().length < 2
          ? ""
          : `${results.length} ${results.length === 1 ? "result" : "results"} for ${query}`}
      </p>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="mt-3 overflow-hidden rounded-2xl border border-border bg-card text-left"
        >
          {results.map((entry, i) => (
            <li key={entry.path} role="none" className="border-b border-border/60 last:border-b-0">
              <button
                type="button"
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(entry)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-quick focus-ring ${
                  i === active ? "bg-muted" : "bg-transparent"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-body text-sm font-medium text-foreground">{entry.title}</span>
                  <span className="mt-0.5 block font-body text-2xs leading-relaxed text-muted-foreground line-clamp-2">
                    {entry.description}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-body text-2xs text-muted-foreground">
                  {entry.section}
                </span>
                {i === active && (
                  <CornerDownLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {query.trim().length >= 2 && results.length === 0 && (
        <p className="mt-3 rounded-2xl border border-border bg-card px-4 py-3 text-left font-body text-sm text-muted-foreground">
          Nothing matched “{query.trim()}”. Try a cut size, a buyer type, or{" "}
          <a href="/contact" className="text-accent underline-offset-2 hover:underline focus-ring rounded-sm">
            ask us directly
          </a>
          .
        </p>
      )}
    </div>
  );
}
