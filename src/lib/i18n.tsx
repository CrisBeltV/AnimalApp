import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import en from './i18n/en.json';
import zh from './i18n/zh.json';
import { useStore } from './store';
import type { Lang } from './types';

// La app se escribe en español. En inglés o chino, cada texto se busca en el diccionario:
// primero igual, y si no, con un patrón ("Iniciar {0} con {1}") cuyas partes también se traducen.

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
  { id: 'zh', label: '中文' },
];

type Dict = { exact: Map<string, string>; patterns: { re: RegExp; to: string }[]; cache: Map<string, string> };

function build(raw: Record<string, string>): Dict {
  const exact = new Map<string, string>();
  const patterns: { re: RegExp; to: string; weight: number }[] = [];
  for (const [from, to] of Object.entries(raw)) {
    if (!/\{\d+\}/.test(from)) {
      // Una sola letra (iniciales, días L M X…) no se traduce sola: depende de dónde va.
      if (from.length > 1) exact.set(from, to);
      continue;
    }
    const literal = from.replace(/\{\d+\}/g, '');
    if ((literal.match(/[A-Za-zÁÉÍÓÚáéíóúñÑ¿¡]/g) ?? []).length < 2) continue;
    const order: number[] = [];
    const source = from
      .split(/(\{\d+\})/)
      .map((part) => {
        const m = part.match(/^\{(\d+)\}$/);
        if (!m) return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        order.push(Number(m[1]));
        return '(.+?)';
      })
      .join('');
    // Los grupos quedan en el orden en que aparecen; se guardan con su número.
    let to2 = to;
    order.forEach((n, i) => (to2 = to2.split(`{${n}}`).join(`{#${i}}`)));
    patterns.push({ re: new RegExp(`^${source}$`, 's'), to: to2, weight: literal.length });
  }
  patterns.sort((a, b) => b.weight - a.weight);
  return { exact, patterns, cache: new Map() };
}

const DICTS: Partial<Record<Lang, Dict>> = { en: build(en as Record<string, string>), zh: build(zh as Record<string, string>) };

export function tr(text: string, lang: Lang, depth = 0): string {
  const dict = DICTS[lang];
  if (!dict || !text) return text;
  const key = text.trim();
  if (!key) return text;
  const hit = dict.cache.get(key);
  const done = (out: string) => {
    dict.cache.set(key, out);
    return text.replace(key, out);
  };
  if (hit !== undefined) return text.replace(key, hit);
  const exact = dict.exact.get(key);
  if (exact !== undefined) return done(exact);
  if (depth < 3) {
    for (const p of dict.patterns) {
      const m = p.re.exec(key);
      if (!m) continue;
      return done(p.to.replace(/\{#(\d+)\}/g, (_, i) => tr(m[Number(i) + 1], lang, depth + 1)));
    }
  }
  return done(key);
}

// Traduce lo que va dentro de un <Text>: un texto, o varios trozos seguidos ("3", " ", "visitas").
export function trChildren(children: ReactNode, lang: Lang): ReactNode {
  if (lang === 'es') return children;
  if (typeof children === 'string') return tr(children, lang);
  if (!Array.isArray(children)) return children;
  const plain = children.every((c) => c === null || c === undefined || typeof c === 'boolean' || typeof c === 'string' || typeof c === 'number');
  if (plain) {
    const joined = children.filter((c) => typeof c === 'string' || typeof c === 'number').join('');
    const whole = tr(joined, lang);
    if (whole !== joined) return whole;
  }
  return children.map((c) => (typeof c === 'string' ? tr(c, lang) : c));
}

// Letras de los días de la semana, de lunes a domingo.
const WEEK_LETTERS: Record<Lang, string[]> = {
  es: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  zh: ['一', '二', '三', '四', '五', '六', '日'],
};

const LangContext = createContext<Lang>('es');

export const useWeek = () => WEEK_LETTERS[useContext(LangContext)];

export const useLang = () => useContext(LangContext);

export function LangProvider({ children }: { children: ReactNode }) {
  const { data } = useStore();
  return <LangContext.Provider value={data.language ?? 'es'}>{children}</LangContext.Provider>;
}
