import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BackHeader, Bar, Button, Card, T } from '../components/ui';
import { dishBalance, dishNutrition, planText, todaysDish } from '../lib/dishes';
import { foodStatus, todayEntries } from '../lib/game';
import { formatDate } from '../lib/health';
import { serveDish } from '../lib/foods';
import { allIngredients } from '../lib/ingredients';
import { finish } from '../components/form';
import { newEntry, openEntry } from '../lib/routes';
import { useStore } from '../lib/store';
import { useNow } from '../lib/useNow';
import { colors, fonts, radius } from '../lib/theme';
import { Text } from '../components/Text';

const INTRO = 'intro-alimento';

// Preparar plato: los platos de la mascota (hechos con ingredientes), servirlos como comida del día
// y la bolsa o lata con foto.
export default function Cocina() {
  const { data, markSeen, addEntry } = useStore();
  const pet = data.pet!;
  const now = useNow();
  const list = allIngredients(data.entries, data.myIngredients);
  const dishes = data.dishes ?? [];
  const today = todaysDish(dishes, now);
  const food = foodStatus(data.entries, now);
  const firstTime = !(data.seen ?? []).includes(INTRO);
  const served = todayEntries(data.entries, now, 'comida').map((e) => e.fields?.plato);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Preparar plato" subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page}>
        <Card style={{ gap: 10 }}>
          <View style={s.row}>
            <T.Black>Platos de {pet.name}</T.Black>
            <T.Muted style={{ fontSize: 13 }}>{dishes.length}</T.Muted>
          </View>
          {dishes.length === 0 ? (
            <T.Muted style={{ fontSize: 14 }}>Todavía no hay platos. Crea el primero con ingredientes y mira su balance.</T.Muted>
          ) : null}
          {dishes.map((d) => {
            const n = dishNutrition(d.items, list);
            const b = dishBalance(n, pet.species, pet.name);
            const icons = d.items.map((it) => list.find((x) => x.id === it.id)?.icon ?? '🍽️').slice(0, 6);
            return (
              <View key={d.id} style={s.dish}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Plato ${d.name}`} onPress={() => router.push({ pathname: '/plato', params: { id: d.id } })} style={s.dishInfo}>
                  <View style={s.bowl}>
                    <Text style={{ fontSize: 20 }}>{icons.join('')}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T.Black>{d.name}</T.Black>
                    <T.Muted style={{ fontSize: 12 }}>
                      {Math.round(n.grams)} g · {Math.round(n.kcal)} kcal
                    </T.Muted>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 12 }}>{'🐾'.repeat(b.stars)}</Text>
                      <Text style={{ fontSize: 12, opacity: 0.25 }}>{'🐾'.repeat(5 - b.stars)}</Text>
                    </View>
                    <View style={[s.plan, d.id === today?.id && { backgroundColor: colors.accent }]}>
                      <Text style={[s.planText, d.id === today?.id && { color: '#FFFFFF' }]}>{d.id === today?.id ? 'Hoy' : planText(d)}</Text>
                    </View>
                  </View>
                </Pressable>
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Servir ${d.name}`}
                    disabled={d.items.length === 0}
                    onPress={() => (addEntry(serveDish(d, data.entries, data.myIngredients)), finish())}
                    style={s.serve}
                  >
                    <T.Black style={{ fontSize: 14, color: '#FFFFFF' }}>Servir</T.Black>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Cocinar ${d.name} jugando`}
                    disabled={d.items.length === 0}
                    onPress={() => router.push({ pathname: '/cocinar', params: { id: d.id } })}
                    style={s.cook}
                  >
                    <T.Black style={{ fontSize: 13, color: colors.accent }}>🔪 Cocinar</T.Black>
                  </Pressable>
                  {served.includes(d.name) ? <T.Muted style={{ fontSize: 11 }}>✓ Hoy</T.Muted> : null}
                </View>
              </View>
            );
          })}
          {dishes.length > 0 ? <T.Muted style={{ fontSize: 12 }}>🔪 Cocinar: prepara el plato jugando a Cocina a mano y sírvelo al terminar.</T.Muted> : null}
          <Button label="＋ Crear plato nuevo" kind="solid" onPress={() => router.push('/plato')} />
        </Card>

        <Card style={{ gap: 8 }}>
          <T.Black>Bolsa o lata</T.Black>
          {food ? (
            <>
              <Pressable onPress={() => openEntry(food.food)} style={s.row}>
                <T.Bold style={{ flex: 1 }}>{food.food.fields?.nombre}</T.Bold>
                <T.Black style={{ fontSize: 13, color: colors.accent }}>Ver o editar</T.Black>
              </Pressable>
              {food.left !== null ? <Bar value={Math.min(100, (food.left / 30) * 100)} color={food.left <= 7 ? colors.lost : colors.found} /> : null}
              <T.Muted style={{ fontSize: 13 }}>
                {[food.left !== null && `Quedan unos ${food.left} días`, food.expires && `vence el ${formatDate(food.expires)}`].filter(Boolean).join(' · ')}
              </T.Muted>
            </>
          ) : (
            <T.Muted style={{ fontSize: 14 }}>Si come concentrado, toma foto del empaque y la app te avisa cuando se esté acabando.</T.Muted>
          )}
          <Button label={food ? 'Bolsa nueva con foto' : 'Registrar bolsa con foto'} onPress={() => newEntry('alimento')} />
        </Card>
      </ScrollView>

      <Modal visible={firstTime} transparent animationType="fade" onRequestClose={() => markSeen(INTRO)}>
        <View style={s.backdrop}>
          <View style={s.modal}>
            <Text style={{ fontSize: 44, textAlign: 'center' }}>🍲</Text>
            <T.Display style={{ fontSize: 22, textAlign: 'center' }}>¿Qué come {pet.name}?</T.Display>
            <T.Body style={{ textAlign: 'center' }}>
              Prepara sus platos con ingredientes y mira el balance de proteína, grasa y minerales. Si come concentrado, toma foto de la bolsa o la lata y te avisaremos cuando se esté acabando o vaya a vencer.
            </T.Body>
            <Button label="Entendido" kind="solid" onPress={() => markSeen(INTRO)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  dish: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: radius.md, backgroundColor: colors.blue },
  dishInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  serve: { paddingHorizontal: 14, height: 38, borderRadius: 19, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  cook: { paddingHorizontal: 10, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  bowl: { width: 64, height: 48, borderRadius: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  plan: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: '#FFFFFF' },
  planText: { fontSize: 11, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.accent },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,37,64,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: radius.xl, padding: 20, gap: 12 },
});
