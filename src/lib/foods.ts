import { CATS, INGREDIENTS } from './ingredients';
import type { Ingredient } from './ingredients';
import type { Dish, Entry } from './types';

// Valores por cada 100 g, tal como se sirve.
export type Nutrition = { kcal: number; proteina: number; grasa: number; fibra: number };

export type Food = Nutrition & { id: string; name: string; group: string; source: string };

// Base de alimentos con valores típicos aproximados. Cada empaque es distinto:
// para el concentrado de tu mascota usa la tabla de su bolsa (ficha del alimento).
const TYPICAL = 'Valor típico aproximado';

export const FOODS: Food[] = [
  { id: 'seco-perro', name: 'Concentrado seco para perro adulto', group: 'Concentrados', kcal: 360, proteina: 25, grasa: 14, fibra: 3.5, source: TYPICAL },
  { id: 'seco-cachorro', name: 'Concentrado seco para cachorro', group: 'Concentrados', kcal: 380, proteina: 28, grasa: 17, fibra: 3, source: TYPICAL },
  { id: 'seco-gato', name: 'Concentrado seco para gato adulto', group: 'Concentrados', kcal: 380, proteina: 32, grasa: 15, fibra: 3, source: TYPICAL },
  { id: 'humedo-perro', name: 'Comida húmeda (lata) para perro', group: 'Húmedos', kcal: 95, proteina: 8, grasa: 5, fibra: 0.8, source: TYPICAL },
  { id: 'humedo-gato', name: 'Comida húmeda (sobre o lata) para gato', group: 'Húmedos', kcal: 90, proteina: 10, grasa: 5, fibra: 0.5, source: TYPICAL },
  { id: 'snack', name: 'Galletas o snacks para mascota', group: 'Premios', kcal: 350, proteina: 15, grasa: 8, fibra: 3, source: TYPICAL },
];

const num = (t?: string) => {
  const n = Number((t ?? '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

// Los alimentos registrados por el dueño (fichas con foto) también entran a la base,
// con los datos de la tabla nutricional de su empaque.
export function userFoods(entries: Entry[]): Food[] {
  const seen = new Set<string>();
  const list: Food[] = [];
  for (const e of entries) {
    if (e.kind !== 'alimento' || !e.fields?.nombre) continue;
    const key = e.fields.nombre.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const f = e.fields;
    list.push({
      id: `mio:${e.id}`,
      name: f.nombre,
      group: 'Tus alimentos',
      kcal: num(f.kcalKg) / 10,
      proteina: num(f.proteina),
      grasa: num(f.grasa),
      fibra: num(f.fibra),
      source: num(f.kcalKg) ? 'Tabla de su empaque' : 'Sin tabla nutricional: complétala en la ficha del alimento',
    });
  }
  return list;
}

// Ingredientes caseros (con sus valores) como alimentos de la base.
const HOMEMADE = 'Valor típico aproximado (tablas USDA de alimentos cocidos)';

export function allFoods(entries: Entry[], mine: Ingredient[] = []): Food[] {
  return [
    ...userFoods(entries),
    ...FOODS,
    ...[...INGREDIENTS, ...mine].map((i) => ({ id: i.id, name: i.name, group: CATS.find((c) => c.id === i.cat)!.label, kcal: i.kcal, proteina: i.proteina, grasa: i.grasa, fibra: i.fibra, source: HOMEMADE })),
  ];
}

export function forGrams(food: Nutrition, grams: number): Nutrition {
  const k = grams / 100;
  const r = (n: number) => Math.round(n * k * 10) / 10;
  return { kcal: Math.round(food.kcal * k), proteina: r(food.proteina), grasa: r(food.grasa), fibra: r(food.fibra) };
}

// Energía diaria estimada: 70 × peso^0,75 por un factor de actividad (adulto típico).
// Es una guía general; el veterinario define la dieta de cada mascota.
export function dailyKcal(kg: number, species: 'perro' | 'gato') {
  return Math.round(70 * Math.pow(kg, 0.75) * (species === 'gato' ? 1.2 : 1.6));
}

// Lo que comió en un día, sumando cada comida registrada con gramos.
export function dayNutrition(entries: Entry[], dayStart: number): Nutrition & { meals: number } {
  const meals = entries.filter((e) => e.kind === 'comida' && e.at >= dayStart && e.at < dayStart + 86400000);
  const sum = (k: keyof Nutrition) => Math.round(meals.reduce((s, e) => s + num(e.fields?.[k]), 0) * 10) / 10;
  return { kcal: Math.round(sum('kcal')), proteina: sum('proteina'), grasa: sum('grasa'), fibra: sum('fibra'), meals: meals.length };
}

// Servir un plato: arma la comida del día con los gramos de cada ingrediente y lo que aporta.
export function serveDish(dish: Dish, entries: Entry[], mine: Ingredient[] = []) {
  const foods = allFoods(entries, mine);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const menu = dish.items.flatMap((it) => {
    const food = foods.find((x) => x.id === it.id);
    return food && it.g > 0 ? [{ id: it.id, name: food.name, g: it.g, ...forGrams(food, it.g) }] : [];
  });
  const sum = (k: keyof Nutrition) => menu.reduce((n, m) => n + m[k], 0);
  const fields: Record<string, string> = {
    menu: JSON.stringify(menu),
    alimentoNombre: menu.map((m) => m.name).join(' + '),
    gramos: String(r1(menu.reduce((n, m) => n + m.g, 0))),
    kcal: String(Math.round(sum('kcal'))),
    proteina: String(r1(sum('proteina'))),
    grasa: String(r1(sum('grasa'))),
    fibra: String(r1(sum('fibra'))),
    plato: dish.name,
  };
  return { kind: 'comida' as const, fields, note: menu.map((m) => `${m.g} g de ${m.name}`).join(' + ') };
}
