import {
  MAX_LEVEL,
  levelInfo,
  missionGoal,
  startOfDay,
  streak,
  walkXp,
  waterGoal,
  xpForLevel,
} from '../game';
import { emptyData } from '../types';
import type { AppData, Entry } from '../types';

// Estas reglas hoy viven en el teléfono; en la Fase 4 pasan a Postgres.
// Los tests son la especificación que el servidor tiene que respetar.

const DAY = 24 * 60 * 60 * 1000;

function entry(partial: Partial<Entry> & Pick<Entry, 'kind' | 'at'>): Entry {
  return { id: `${partial.kind}-${partial.at}`, xp: 0, ...partial };
}

describe('walkXp', () => {
  it('da al menos 5 XP aunque el paseo sea muy corto', () => {
    expect(walkXp(1)).toBe(5);
  });

  it('suma 10 XP por cada meta de minutos alcanzada (15, 30 y 45)', () => {
    expect(walkXp(14)).toBe(14);
    expect(walkXp(15)).toBe(25);
    expect(walkXp(30)).toBe(50);
    expect(walkXp(45)).toBe(75);
  });
});

describe('niveles', () => {
  it('xpForLevel sigue 0, 100, 300, 600... hasta 10.500 en el nivel 15', () => {
    expect([1, 2, 3, 4].map(xpForLevel)).toEqual([0, 100, 300, 600]);
    expect(xpForLevel(MAX_LEVEL)).toBe(10500);
  });

  it('levelInfo calcula el nivel y el progreso hacia el siguiente', () => {
    expect(levelInfo(0)).toMatchObject({ level: 1, progress: 0 });
    expect(levelInfo(99).level).toBe(1);
    expect(levelInfo(100).level).toBe(2);
    expect(levelInfo(200)).toMatchObject({ level: 2, progress: 0.5 });
  });

  it('no pasa del nivel máximo y queda con progreso completo', () => {
    expect(levelInfo(1_000_000)).toMatchObject({ level: MAX_LEVEL, progress: 1 });
  });
});

describe('streak', () => {
  const now = new Date(2026, 9, 20, 15, 0).getTime();
  const today = startOfDay(now);

  it('cuenta los días seguidos que terminan hoy', () => {
    const entries = [0, 1, 2].map((d) => entry({ kind: 'comida', at: today - d * DAY + 1000 }));
    expect(streak(entries, now)).toBe(3);
  });

  it('si hoy aún no hay registro, la racha puede terminar ayer', () => {
    const entries = [1, 2].map((d) => entry({ kind: 'comida', at: today - d * DAY + 1000 }));
    expect(streak(entries, now)).toBe(2);
  });

  it('un día sin registro corta la racha', () => {
    const entries = [0, 2, 3].map((d) => entry({ kind: 'comida', at: today - d * DAY + 1000 }));
    expect(streak(entries, now)).toBe(1);
  });

  it('filtra por tipo de registro', () => {
    const entries = [entry({ kind: 'agua', at: today + 1000 })];
    expect(streak(entries, now, 'comida')).toBe(0);
    expect(streak(entries, now, 'agua')).toBe(1);
  });
});

describe('metas por especie', () => {
  const pet = (species: 'perro' | 'gato', kg?: number): AppData => ({
    ...emptyData,
    pet: { name: 'Rocky', species, breed: 'criollo', createdAt: 0 },
    entries: kg ? [entry({ kind: 'peso', at: 1, kg })] : [],
  });

  it('la misión diaria es 20 minutos para perros y 15 para gatos', () => {
    expect(missionGoal('perro')).toBe(20);
    expect(missionGoal('gato')).toBe(15);
  });

  it('la meta de agua usa el último peso, con mínimo de 150 ml', () => {
    expect(waterGoal(pet('perro', 20))).toBe(1200);
    expect(waterGoal(pet('gato', 1))).toBe(150);
  });

  it('sin peso registrado, la meta de agua depende de la especie', () => {
    expect(waterGoal(pet('perro'))).toBe(800);
    expect(waterGoal(pet('gato'))).toBe(250);
  });
});
