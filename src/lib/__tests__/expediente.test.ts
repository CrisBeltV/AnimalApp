import { entryDetail, entryTitle, expedienteEntries } from '../expediente';
import type { Entry } from '../types';

function entry(partial: Partial<Entry> & Pick<Entry, 'kind' | 'at'>): Entry {
  return { id: `${partial.kind}-${partial.at}`, xp: 0, ...partial };
}

const file = { id: 'f1', uri: 'file:///a.jpg', type: 'image' as const, name: 'a.jpg' };

describe('expediente', () => {
  const entries = [
    entry({ kind: 'paseo', at: 5 }),
    entry({ kind: 'vacuna', at: 1, fields: { nombre: 'Rabia' } }),
    entry({ kind: 'veterinario', at: 3, fields: { tipo: 'cirugia' }, files: [file] }),
    entry({ kind: 'documento', at: 2, fields: { tipo: 'radiografia' } }),
    entry({ kind: 'medicamento', at: 4, fields: { nombre: 'Amoxicilina' } }),
  ];

  it('solo incluye lo clínico y lo ordena del más nuevo al más viejo', () => {
    expect(expedienteEntries(entries, 'todo').map((e) => e.kind)).toEqual(['medicamento', 'veterinario', 'documento', 'vacuna']);
  });

  it('filtra por tipo', () => {
    expect(expedienteEntries(entries, 'vacuna')).toHaveLength(1);
    expect(expedienteEntries(entries, 'tratamiento')[0].fields?.nombre).toBe('Amoxicilina');
  });

  it('documentos incluye los adjuntos de otros registros', () => {
    expect(expedienteEntries(entries, 'documento').map((e) => e.kind)).toEqual(['veterinario', 'documento']);
  });

  it('titula cada registro', () => {
    expect(entryTitle(entries[2])).toBe('Consulta · Cirugía');
    expect(entryTitle(entries[3])).toBe('Radiografía');
    expect(entryTitle(entries[1])).toBe('Vacuna · Rabia');
  });

  it('resume con lo que haya', () => {
    expect(entryDetail(entry({ kind: 'medicamento', at: 1, fields: { dosis: '1 tableta', cadaHoras: '8', fin: '10/12/2026' } }))).toBe(
      '1 tableta · cada 8 h · hasta 10/12/2026',
    );
    expect(entryDetail(entry({ kind: 'vacuna', at: 1 }))).toBe('');
  });
});
