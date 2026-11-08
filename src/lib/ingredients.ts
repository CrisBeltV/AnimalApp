import { FOODS, userFoods } from './foods';
import { MORE_INGREDIENTS } from './ingredients-more';
import type { Entry } from './types';

// Ingredientes para preparar platos caseros. Valores por cada 100 g, cocidos y sin sal,
// tomados como valores típicos aproximados de las tablas USDA de alimentos.
// Minerales en miligramos (mg).
export type Minerals = { calcio: number; fosforo: number; hierro: number; zinc: number; sodio: number; potasio: number };

export type Ingredient = {
  id: string;
  name: string;
  icon: string;
  cat: CatId;
  kcal: number;
  proteina: number;
  grasa: number;
  carbos: number;
  fibra: number;
  step?: number; // gramos que suma cada toque (aceites de 5 en 5)
  complete?: boolean; // alimento completo (concentrado): ya trae vitaminas y minerales
  noCat?: boolean; // mejor no darlo a gatos
  more?: boolean; // de la lista ampliada (botón + en Preparar plato)
} & Minerals;

export type CatId = 'proteinas' | 'cereales' | 'verduras' | 'frutas' | 'extras' | 'concentrados';

export const CATS: { id: CatId; label: string; icon: string }[] = [
  { id: 'proteinas', label: 'Proteínas', icon: '🍗' },
  { id: 'cereales', label: 'Cereales y tubérculos', icon: '🍚' },
  { id: 'verduras', label: 'Verduras', icon: '🥕' },
  { id: 'frutas', label: 'Frutas', icon: '🍎' },
  { id: 'extras', label: 'Extras', icon: '🫒' },
  { id: 'concentrados', label: 'Concentrados', icon: '🥫' },
];

const I = (
  id: string,
  name: string,
  icon: string,
  cat: CatId,
  [kcal, proteina, grasa, carbos, fibra]: number[],
  [calcio, fosforo, hierro, zinc, sodio, potasio]: number[],
  extra: Partial<Ingredient> = {},
): Ingredient => ({ id, name, icon, cat, kcal, proteina, grasa, carbos, fibra, calcio, fosforo, hierro, zinc, sodio, potasio, ...extra });

export const INGREDIENTS: Ingredient[] = [
  I('pollo', 'Pollo sin piel ni huesos', '🍗', 'proteinas', [165, 31, 3.6, 0, 0], [15, 228, 1, 1, 74, 256]),
  I('pavo', 'Pechuga de pavo', '🦃', 'proteinas', [147, 30, 2, 0, 0], [10, 230, 0.7, 1.6, 60, 290]),
  I('res', 'Carne de res magra', '🥩', 'proteinas', [217, 26, 12, 0, 0], [18, 200, 2.6, 6.3, 72, 318]),
  I('cerdo', 'Lomo de cerdo', '🥓', 'proteinas', [206, 27, 10, 0, 0], [19, 246, 0.9, 2.4, 55, 380]),
  I('higado', 'Hígado de res', '🫀', 'proteinas', [191, 29, 5.3, 5.1, 0], [6, 497, 6.5, 5.3, 79, 351]),
  I('bofe', 'Bofe de res', '🫁', 'proteinas', [120, 20, 3.7, 0, 0], [11, 178, 4.8, 1.6, 100, 200]),
  I('pescado', 'Pescado blanco sin espinas', '🐟', 'proteinas', [128, 26, 2.7, 0, 0], [14, 204, 0.7, 0.4, 56, 380]),
  I('salmon', 'Salmón sin espinas', '🍣', 'proteinas', [206, 22, 12, 0, 0], [15, 252, 0.3, 0.4, 61, 384]),
  I('huevo', 'Huevo cocido', '🥚', 'proteinas', [155, 13, 11, 1.1, 0], [50, 172, 1.2, 1.1, 124, 126]),
  I('arroz', 'Arroz blanco', '🍚', 'cereales', [130, 2.7, 0.3, 28, 0.4], [10, 43, 0.2, 0.5, 1, 35]),
  I('arroz-integral', 'Arroz integral', '🍙', 'cereales', [123, 2.7, 1, 25.6, 1.6], [3, 103, 0.6, 0.7, 4, 86]),
  I('avena', 'Avena cocida en agua', '🥣', 'cereales', [71, 2.5, 1.5, 12, 1.7], [9, 77, 0.9, 1, 4, 70]),
  I('papa', 'Papa sin cáscara', '🥔', 'cereales', [86, 1.7, 0.1, 20, 1.8], [8, 40, 0.3, 0.3, 5, 328]),
  I('batata', 'Batata', '🍠', 'cereales', [76, 1.4, 0.1, 17.7, 2.5], [27, 32, 0.7, 0.2, 27, 230]),
  I('pasta', 'Pasta', '🍝', 'cereales', [158, 5.8, 0.9, 31, 1.8], [7, 58, 0.5, 0.5, 1, 44]),
  I('quinua', 'Quinua', '🌾', 'cereales', [120, 4.4, 1.9, 21.3, 2.8], [17, 152, 1.5, 1.1, 7, 172]),
  I('zanahoria', 'Zanahoria', '🥕', 'verduras', [35, 0.8, 0.2, 8.2, 3], [30, 30, 0.3, 0.2, 58, 235]),
  I('ahuyama', 'Ahuyama', '🎃', 'verduras', [20, 0.7, 0.1, 4.9, 1.1], [15, 30, 0.6, 0.2, 1, 230]),
  I('habichuela', 'Habichuela', '🫛', 'verduras', [35, 1.9, 0.3, 7.9, 3.2], [44, 29, 0.7, 0.3, 1, 146]),
  I('brocoli', 'Brócoli', '🥦', 'verduras', [35, 2.4, 0.4, 7.2, 3.3], [40, 67, 0.7, 0.5, 41, 293], { noCat: true }),
  I('espinaca', 'Espinaca', '🥬', 'verduras', [23, 3, 0.3, 3.8, 2.4], [136, 56, 3.6, 0.8, 70, 466], { noCat: true }),
  I('arveja', 'Arveja', '🟢', 'verduras', [84, 5.4, 0.2, 15.6, 5.5], [27, 117, 1.5, 1.2, 3, 271]),
  I('zucchini-verde', 'Zucchini verde', '🥒', 'verduras', [17, 1.2, 0.3, 3.1, 1], [16, 38, 0.4, 0.3, 8, 261]),
  I('zucchini-amarillo', 'Zucchini amarillo', '🟡', 'verduras', [16, 1.2, 0.2, 3.4, 1.1], [15, 38, 0.4, 0.3, 2, 262]),
  I('pepino', 'Pepino crudo', '🥒', 'verduras', [15, 0.7, 0.1, 3.6, 0.5], [16, 24, 0.3, 0.2, 2, 147]),
  I('manzana', 'Manzana sin semillas', '🍎', 'frutas', [52, 0.3, 0.2, 13.8, 2.4], [6, 11, 0.1, 0, 1, 107]),
  I('banano', 'Banano', '🍌', 'frutas', [89, 1.1, 0.3, 22.8, 2.6], [5, 22, 0.3, 0.2, 1, 358]),
  I('arandanos', 'Arándanos', '🫐', 'frutas', [57, 0.7, 0.3, 14.5, 2.4], [6, 12, 0.3, 0.2, 1, 77]),
  I('sandia', 'Sandía sin semillas', '🍉', 'frutas', [30, 0.6, 0.2, 7.6, 0.4], [7, 11, 0.2, 0.1, 1, 112]),
  I('pera', 'Pera sin semillas', '🍐', 'frutas', [57, 0.4, 0.1, 15, 3.1], [9, 12, 0.2, 0.1, 1, 116]),
  I('aceite-oliva', 'Aceite de oliva', '🫒', 'extras', [884, 0, 100, 0, 0], [1, 0, 0.6, 0, 2, 1], { step: 5 }),
  I('aceite-pescado', 'Aceite de pescado', '💧', 'extras', [902, 0, 100, 0, 0], [0, 0, 0, 0, 0, 0], { step: 5 }),
  I('yogur', 'Yogur natural sin azúcar', '🥛', 'extras', [61, 3.5, 3.3, 4.7, 0], [121, 95, 0.1, 0.6, 46, 155]),
  I('queso', 'Queso campesino', '🧀', 'extras', [98, 11, 4.3, 3.4, 0], [83, 159, 0.1, 0.4, 364, 104]),
  ...MORE_INGREDIENTS,
];

// Lo que nunca va en el plato: tóxico para perros y gatos.
export const FORBIDDEN = [
  { icon: '🧅', name: 'Cebolla', why: 'Daña los glóbulos rojos, aun cocida o en polvo.' },
  { icon: '🧄', name: 'Ajo', why: 'Igual que la cebolla: produce anemia.' },
  { icon: '🍇', name: 'Uvas y pasas', why: 'Pueden causar falla de los riñones en perros.' },
  { icon: '🍫', name: 'Chocolate', why: 'La teobromina es tóxica para el corazón y los nervios.' },
  { icon: '🥑', name: 'Aguacate', why: 'La persina y la semilla son peligrosas.' },
  { icon: '🍬', name: 'Dulces con xilitol', why: 'Baja el azúcar en sangre de golpe y daña el hígado.' },
  { icon: '☕', name: 'Café y té', why: 'La cafeína acelera el corazón.' },
  { icon: '🦴', name: 'Huesos cocidos', why: 'Se astillan y pueden perforar el intestino.' },
  { icon: '🌰', name: 'Nueces de macadamia', why: 'Causan debilidad y temblores en perros.' },
];

const NO_MINERALS = { calcio: 0, fosforo: 0, hierro: 0, zinc: 0, sodio: 0, potasio: 0 };

// Concentrados y húmedos de la base, y los alimentos registrados con foto: son alimentos completos.
export function allIngredients(entries: Entry[], mine: Ingredient[] = []): Ingredient[] {
  const own = new Set(INGREDIENTS.map((i) => i.id));
  const ready = [...userFoods(entries), ...FOODS.filter((f) => !own.has(f.id))].map(
    (f): Ingredient => ({
      id: f.id,
      name: f.name,
      icon: f.group === 'Premios' ? '🦴' : '🥫',
      cat: 'concentrados',
      kcal: f.kcal,
      proteina: f.proteina,
      grasa: f.grasa,
      carbos: 0,
      fibra: f.fibra,
      complete: f.group !== 'Premios',
      ...NO_MINERALS,
    }),
  );
  return [...INGREDIENTS, ...mine, ...ready];
}
