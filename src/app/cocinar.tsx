import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { finish } from '../components/form';
import { Juego } from '../components/Juego';
import { Button, T } from '../components/ui';
import { cocinaHtml, type GameMessage } from '../lib/cocinaJuego';
import { serveDish } from '../lib/foods';
import { allIngredients } from '../lib/ingredients';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

// Cocina a mano: el juego para preparar un plato paso a paso (lavar, cortar, cocinar, escurrir y medir).
// Las estaciones salen de los ingredientes del plato. Al terminar, se puede servir y queda en Comidas de hoy.
export default function Cocinar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, addEntry } = useStore();
  const pet = data.pet!;
  const dish = (data.dishes ?? []).find((d) => d.id === id);

  const html = useMemo(() => {
    if (!dish) return '';
    const list = allIngredients(data.entries, data.myIngredients);
    const items = dish.items.flatMap((it) => {
      const x = list.find((y) => y.id === it.id);
      return x && it.g > 0 ? [{ id: x.id, name: x.name, icon: x.icon, cat: x.cat, g: it.g }] : [];
    });
    return cocinaHtml({ name: dish.name, pet: pet.name, items });
    // el juego se arma una sola vez por plato
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dish?.id]);

  const onMessage = (m: GameMessage) => {
    if (m.type === 'close') finish();
    if (m.type === 'serve' && dish) {
      const entry = serveDish(dish, data.entries, data.myIngredients);
      entry.fields.juego = `Cocina a mano · rango ${m.rank} · ${m.score} pts`;
      addEntry(entry);
      setTimeout(finish, 700);
    }
  };

  if (!dish) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 20, gap: 12, justifyContent: 'center' }}>
        <T.Display style={{ fontSize: 22, textAlign: 'center' }}>No encontramos este plato</T.Display>
        <Button label="Volver" kind="solid" onPress={() => (router.canGoBack() ? router.back() : router.replace('/cocina'))} />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#F3F5F8' }}>
      <View style={{ flex: 1 }}>
        <Juego html={html} onMessage={onMessage} />
      </View>
    </SafeAreaView>
  );
}
