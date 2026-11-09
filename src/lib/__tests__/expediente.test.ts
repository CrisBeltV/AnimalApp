import { activeTreatments, entryDetail, entryTitle, expedienteEntries, lastVaccine, previewRows, profileLines } from '../expediente';
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

describe('previewRows', () => {
  it('muestra la fecha y solo lo que se llenó, con su nombre', () => {
    const rows = previewRows(
      entry({ kind: 'medicamento', at: new Date(2026, 5, 1, 12).getTime(), fields: { nombre: 'Amoxicilina', dosis: '1 tableta', inicio: '01/06/2026' } }),
    );
    expect(rows).toEqual([
      { label: 'Fecha', value: '01/06/2026' },
      { label: 'Cantidad o dosis', value: '1 tableta' },
      { label: 'Fecha de inicio', value: '01/06/2026' },
    ]);
  });

  it('en una cita lista veterinaria, doctor y próxima cita', () => {
    const rows = previewRows(entry({ kind: 'veterinario', at: 1, fields: { veterinaria: 'Patitas', proxima: '15/12/2026', vetId: 'v1', tipo: 'control' } }));
    expect(rows.map((r) => r.label)).toEqual(['Fecha', 'Veterinaria', 'Próxima cita']);
  });
});

describe('previewRows de los demás registros', () => {
  it('novedad: lo que se notó, dónde y la nota', () => {
    const rows = previewRows(entry({ kind: 'novedad', at: 1, signs: ['cojera', 'vomito'], fields: { nota: 'Desde ayer' } }));
    expect(rows.slice(1)).toEqual([
      { label: 'Lo que notaste', value: 'Cojera, Vómito' },
      { label: 'Otra cosa que notaste', value: 'Desde ayer' },
    ]);
  });

  it('paseo: duración, tipo y parque', () => {
    const rows = previewRows(entry({ kind: 'paseo', at: 1, minutes: 30, fields: { tipo: 'juego', parqueId: 'p1' } }), { parks: [{ id: 'p1', name: 'Villa Luz' }] });
    expect(rows.slice(1)).toEqual([
      { label: 'Duración', value: '30 min' },
      { label: 'Tipo', value: 'Juego' },
      { label: 'Parque', value: 'Villa Luz' },
    ]);
  });

  it('higiene y ánimo', () => {
    expect(previewRows(entry({ kind: 'higiene', at: 1, fields: { tipos: 'bano,otro', otro: 'Dientes', proxima: '01/12/2026' } })).slice(1)).toEqual([
      { label: 'Cuidados', value: 'Baño, Dientes' },
      { label: 'Próxima vez', value: '01/12/2026' },
    ]);
    expect(previewRows(entry({ kind: 'animo', at: 1, fields: { estado: 'feliz' } })).slice(1)[0].value).toContain('Feliz');
  });

  it('lo que no tiene datos sueltos muestra su nota', () => {
    expect(previewRows(entry({ kind: 'comida', at: 1, note: '150 g de concentrado' })).slice(1)).toEqual([{ label: 'Menú', value: '150 g de concentrado' }]);
    expect(previewRows(entry({ kind: 'nota', at: 1, note: 'Día tranquilo' })).slice(1)).toEqual([{ label: 'Nota', value: 'Día tranquilo' }]);
  });
});
