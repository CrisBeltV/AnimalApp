import type { Ingredient, Minerals } from './ingredients';
import type { Dish, Species } from './types';

export type DishNutrition = { grams: number; kcal: number; proteina: number; grasa: number; carbos: number; fibra: number } & Minerals;

const ZERO: DishNutrition = { grams: 0, kcal: 0, proteina: 0, grasa: 0, carbos: 0, fibra: 0, calcio: 0, fosforo: 0, hierro: 0, zinc: 0, sodio: 0, potasio: 0 };
const KEYS = Object.keys(ZERO) as (keyof DishNutrition)[];

// Suma lo que aporta cada ingrediente según sus gramos.
export function dishNutrition(items: { id: string; g: number }[], list: Ingredient[]) {
  const total = { ...ZERO };
  let completeKcal = 0;
  for (const it of items) {
    const ing = list.find((x) => x.id === it.id);
    if (!ing || !(it.g > 0)) continue;
    const k = it.g / 100;
    total.grams += it.g;
    for (const key of KEYS) if (key !== 'grams') total[key] += (ing[key] as number) * k;
    if (ing.complete) completeKcal += ing.kcal * k;
  }
  return { ...total, completeShare: total.kcal ? completeKcal / total.kcal : 0 };
}

// Mínimos por cada 1.000 kcal para un adulto (guía AAFCO): proteína y grasa en gramos, minerales en mg.
const NEEDS: Record<Species, { proteina: number; grasa: number; calcio: number; fosforo: number; hierro: number; zinc: number }> = {
  perro: { proteina: 45, grasa: 13.8, calcio: 1250, fosforo: 1000, hierro: 10, zinc: 20 },
  gato: { proteina: 65, grasa: 22.5, calcio: 1500, fosforo: 1250, hierro: 20, zinc: 18.8 },
};

export type Check = { id: string; label: string; ok: boolean; tip: string };

// Equilibrio del plato: cada punto cumplido suma una huella (de 0 a 5).
export function dishBalance(n: ReturnType<typeof dishNutrition>, species: Species, petName: string) {
  if (n.kcal <= 0) return { stars: 0, checks: [] as Check[], title: 'Plato vacío' };
  const need = NEEDS[species];
  const per = (v: number) => (v / n.kcal) * 1000;
  const complete = n.completeShare >= 0.5;
  const ratio = n.fosforo > 0 ? n.calcio / n.fosforo : 0;
  const checks: Check[] = [
    {
      id: 'proteina',
      label: 'Proteína suficiente',
      ok: per(n.proteina) >= need.proteina,
      tip: `Añade pollo, pescado, huevo o carne: ${petName} necesita al menos ${need.proteina} g de proteína por cada 1.000 kcal.`,
    },
    {
      id: 'grasa',
      label: 'Grasa buena',
      ok: per(n.grasa) >= need.grasa && per(n.grasa) <= need.grasa * 4,
      tip: per(n.grasa) < need.grasa ? 'Le falta grasa: unas gotas de aceite de pescado o de oliva ayudan.' : 'Tiene demasiada grasa: usa carnes más magras o menos aceite.',
    },
    {
      id: 'minerales',
      label: 'Hierro y zinc',
      ok: complete || (per(n.hierro) >= need.hierro && per(n.zinc) >= need.zinc),
      tip: 'Le faltan hierro y zinc: el hígado, la carne de res y el huevo los aportan.',
    },
    {
      id: 'calcio',
      label: 'Calcio y fósforo en equilibrio',
      ok: complete || (per(n.calcio) >= need.calcio && ratio >= 1 && ratio <= 2),
      tip: 'Los platos caseros casi siempre necesitan calcio extra. Pregúntale a tu veterinario por un suplemento.',
    },
    {
      id: 'variedad',
      label: 'Variedad',
      ok: complete || n.carbos + n.fibra > 0,
      tip: 'Suma una verdura o un cereal para darle fibra y energía.',
    },
  ];
  const stars = checks.filter((c) => c.ok).length;
  const title = stars === 5 ? '¡Plato balanceado!' : stars >= 3 ? 'Va muy bien' : stars >= 1 ? 'Le falta equilibrio' : 'Plato desequilibrado';
  return { stars, checks, title };
}

export const WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// Día de la semana con lunes = 0.
export const weekday = (t: number) => (new Date(t).getDay() + 6) % 7;

export function planText(d: Dish) {
  const days = d.days ?? [];
  if (days.length === 7) return 'Alimento diario';
  if (days.length === 0) return 'Cuando lo elijas';
  return `Recurrente: ${days
    .slice()
    .sort()
    .map((i) => WEEK[i])
    .join(' ')}`;
}

// El plato que toca hoy: el diario, o uno recurrente de este día.
export function todaysDish(dishes: Dish[] | undefined, now: number) {
  const day = weekday(now);
  const list = dishes ?? [];
  return list.find((d) => (d.days ?? []).length > 0 && (d.days ?? []).length < 7 && d.days!.includes(day)) ?? list.find((d) => (d.days ?? []).length === 7);
}
