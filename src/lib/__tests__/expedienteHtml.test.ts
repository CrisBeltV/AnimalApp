import { expedienteHtml } from '../expedienteHtml';
import { emptyData } from '../types';
import type { AppData, Entry } from '../types';

const pdf = { id: 'p1', uri: 'file:///x.pdf', type: 'pdf' as const, name: 'examen.pdf' };
const entry: Entry = {
  id: 'e1',
  kind: 'veterinario',
  at: new Date(2026, 5, 1, 12).getTime(),
  xp: 0,
  fields: { veterinaria: 'Clínica <Patitas>', tipo: 'control' },
  files: [pdf],
};
const data: AppData = {
  ...emptyData,
  ownerName: 'Ana',
  pet: { name: 'Luna', species: 'perro', breed: 'Criollo', createdAt: 0 },
  clinical: { allergies: 'Pollo' },
  entries: [entry],
};

describe('expedienteHtml', () => {
  it('escapa el texto escrito por el usuario', () => {
    const html = expedienteHtml(data, [entry], { images: {}, links: {} });
    expect(html).toContain('Clínica &lt;Patitas&gt;');
    expect(html).not.toContain('<Patitas>');
  });

  it('enlaza los PDF subidos y avisa si no hay enlace', () => {
    const con = expedienteHtml(data, [entry], { images: {}, links: { p1: 'https://x.test/a?b=1&c=2' } });
    expect(con).toContain('href="https://x.test/a?b=1&amp;c=2"');
    expect(expedienteHtml(data, [entry], { images: {}, links: {} })).toContain('archivo guardado en la app');
  });

  it('incluye alergias, dueño y el aviso de que no es diagnóstico', () => {
    const html = expedienteHtml(data, [], { images: {}, links: {} });
    expect(html).toContain('Alergias: Pollo');
    expect(html).toContain('Dueño: Ana');
    expect(html).toContain('no es un diagnóstico');
  });
});
