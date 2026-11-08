import { activeTreatments, entryDetail, entryTitle, expedienteEntries, lastVaccine, profileLines } from '../expediente';
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

  it('con "Otro" muestra lo que escribió el dueño', () => {
    expect(entryTitle(entry({ kind: 'veterinario', at: 1, fields: { tipo: 'otro', tipoOtro: 'Control dental' } }))).toBe('Consulta · Control dental');
    expect(entryTitle(entry({ kind: 'documento', at: 1, fields: { tipo: 'otro', tipoOtro: 'Biopsia' } }))).toBe('Biopsia');
  });

  it('resume con lo que haya', () => {
    expect(entryDetail(entry({ kind: 'medicamento', at: 1, fields: { dosis: '1 tableta', cadaHoras: '8', fin: '10/12/2026' } }))).toBe(
      '1 tableta · cada 8 h · hasta 10/12/2026',
    );
    expect(entryDetail(entry({ kind: 'vacuna', at: 1 }))).toBe('');
  });
});

describe('profileLines', () => {
  const pet = { name: 'Luna', species: 'perro' as const, breed: 'Criollo', createdAt: 0 };

  it('arma el resumen con lo que haya', () => {
    const p = profileLines(pet, { sex: 'hembra', neutered: 'si', microchip: '9810', allergies: 'Pollo' }, 12.44);
    expect(p.basics).toBe('Perro · Criollo · Hembra · Esterilizada · 12,4 kg · Chip 9810');
    expect(p.allergies).toBe('Pollo');
    expect(p.empty).toBe(false);
  });

  it('sin ficha queda vacío', () => {
    expect(profileLines(pet, undefined).empty).toBe(true);
  });
});

describe('prevención y tratamientos en curso', () => {
  const now = new Date(2026, 10, 8, 10).getTime();

  it('titula desparasitantes y antipulgas aparte de las vacunas', () => {
    expect(entryTitle(entry({ kind: 'vacuna', at: 1, fields: { categoria: 'desparasitacion', nombre: 'Drontal' } }))).toBe('Desparasitante · Drontal');
    expect(entryTitle(entry({ kind: 'vacuna', at: 1, fields: { nombre: 'Rabia' } }))).toBe('Vacuna · Rabia');
  });

  it('la última vacuna no cuenta los desparasitantes', () => {
    const list = [
      entry({ kind: 'vacuna', at: 1, fields: { nombre: 'Rabia' } }),
      entry({ kind: 'vacuna', at: 9, fields: { categoria: 'antiparasitario', nombre: 'Nexgard' } }),
    ];
    expect(lastVaccine(list)?.fields?.nombre).toBe('Rabia');
  });

  it('solo hay tratamientos en curso si la fecha de fin no pasó', () => {
    const list = [
      entry({ kind: 'medicamento', at: 2, fields: { nombre: 'A', fin: '20/11/2026' } }),
      entry({ kind: 'medicamento', at: 3, fields: { nombre: 'B', fin: '01/10/2026' } }),
      entry({ kind: 'medicamento', at: 4, fields: { nombre: 'C' } }),
    ];
    expect(activeTreatments(list, now).map((e) => e.fields?.nombre)).toEqual(['A']);
  });
});
