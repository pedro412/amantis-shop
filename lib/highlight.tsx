import type { ReactNode } from 'react';

/**
 * Wrap each occurrence of any query word (≥2 chars) inside `text` with a
 * `<mark>` tinted in primary-soft. Used in search result rows.
 */
export function highlightMatches(text: string, query: string): ReactNode {
  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .map(escapeRegex);
  if (words.length === 0) return text;

  const re = new RegExp(`(${words.join('|')})`, 'gi');
  const parts = text.split(re);

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <mark
          key={i}
          className="rounded-sm bg-primary-soft px-0.5 text-primary"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
