import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountButton } from '../../components/AccountButton';
import { CONDITIONS } from '../../components/BodyGuide';
import { MealTimes, WalkReminder } from '../../components/DailyTimes';
import { Icon } from '../../components/Icon';
import type { IconName } from '../../components/Icon';
import { PetDrawing } from '../../components/PetDrawing';
import { Bar, Button, Card, EntryRow, T, soon, when } from '../../components/ui';
import {
  DAY_MS,
  GROOMING,
  groomingTypes,
  MOODS,
  NEW_PARK_XP,
  PARK_BADGES,
  foodStatus,
  isIssue,
  lowMoodDays,
  parkBadge,
  parkMinutes,
  activityWord,
  computeStats,
  lastWeight,
  levelInfo,
  missionGoal,
  mood,
  startOfDay,
  streak,
  todayEntries,
  totalXp,
  waterGoal,
  weekMinutes,
} from '../../lib/game';
import { kg } from '../../lib/format';
import { dailyKcal, dayNutrition } from '../../lib/foods';
import { formatDate } from '../../lib/health';
import { newEntry, openEntry } from '../../lib/routes';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../lib/theme';
import type { AppData, EntryKind } from '../../lib/types';
import { useNow } from '../../lib/useNow';

type Filter = 'todo' | 'actividad' | 'comida' | 'cuerpo' | 'salud' | 'animo';

const FILTERS: { id: Filter; label: string; icon: IconName }[] = [
  { id: 'todo', label: 'Todo', icon: 'todo' },
  { id: 'actividad', label: 'Actividad', icon: 'actividad' },
  { id: 'comida', label: 'Comida y agua', icon: 'comida' },
  { id: 'cuerpo', label: 'Cuerpo', icon: 'cuerpo' },
  { id: 'salud', label: 'Salud', icon: 'salud' },
  { id: 'animo', label: 'Ánimo', icon: 'animo' },
];

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const dayIndex = (t: number) => (new Date(t).getDay() + 6) % 7;

const add = (kind: EntryKind) => newEntry(kind);

// Mi mascota con los 6 íconos de arriba que filtran por tema (como Samsung Health).
export default function MiMascota() {
  const { data } = useStore();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const [filter, setFilter] = useState<Filter>('todo');

  const views: Record<Filter, React.ReactNode> = {
    todo: <Todo data={data} now={now} onFilter={setFilter} />,
    actividad: <Actividad data={data} now={now} />,
    comida: <Comida data={data} now={now} />,
    cuerpo: <Cuerpo data={data} />,
    salud: <Salud data={data} now={now} />,
    animo: <Animo data={data} now={now} onFilter={setFilter} />,
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[s.page, { paddingTop: insets.top + 12 }]}>
      <View style={s.header}>
        <T.Display>Mi mascota</T.Display>
        <AccountButton />
      </View>

      <View accessibilityRole="tablist" style={s.filters}>
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <Pressable
              key={f.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(f.id)}
              style={[s.filter, active && { backgroundColor: colors.blue }]}
            >
              <Icon name={f.icon} size={22} color={active ? colors.text : colors.textMuted} />
              <Text style={[s.filterText, { color: active ? colors.text : colors.textMuted, fontWeight: active ? '800' : '700' }]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {views[filter]}
    </ScrollView>
  );
}

function Intro({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ gap: 4 }}>
      <T.Display style={{ fontSize: 24 }}>{title}</T.Display>
      <T.Body style={{ color: colors.textMuted }}>{text}</T.Body>
    </View>
  );
}

function Big({ value, unit, color = colors.text }: { value: string; unit?: string; color?: string }) {
  return (
    <Text style={{ fontFamily: fonts.display, fontWeight: '700', fontSize: 30, color }}>
      {value}
      {unit ? <Text style={{ fontSize: 16 }}> {unit}</Text> : null}
    </Text>
  );
}

function Todo({ data, now, onFilter }: { data: AppData; now: number; onFilter: (f: Filter) => void }) {
  const pet = data.pet!;
  const stats = computeStats(data, now);
  const m = mood(stats);
  const lvl = levelInfo(totalXp(data));
  const days = streak(data.entries, now);
  const goal = missionGoal(pet.species);
  const minutes = weekMinutes(data.entries, now)[dayIndex(now)];
  const meals = todayEntries(data.entries, now, 'comida').length;
  const weight = lastWeight(data.entries);
  const vaccine = data.entries.find((e) => e.kind === 'vacuna');
  const moodText = m === 'feliz' ? 'está feliz' : m === 'normal' ? 'está en calma' : 'te extraña';

  return (
    <>
      <View style={s.hero}>
        <View style={s.heroGround} />
        <View style={{ position: 'absolute', right: 18, bottom: 12 }}>
          <PetDrawing species={pet.species} mood={m} size={124} />
        </View>
        <View style={{ gap: 4, maxWidth: '62%' }}>
          <T.Display style={{ fontSize: 24 }}>
            {pet.name} {moodText}
          </T.Display>
          <T.Bold>
            Nivel {lvl.level} · {days > 0 ? `racha de ${days} ${days === 1 ? 'día' : 'días'}` : 'sin racha aún'}
          </T.Bold>
          <Pressable
            onPress={() => soon('Ver en 3D', `Aquí verás a ${pet.name} en 3D, hecho con sus fotos. Es la siguiente gran etapa del proyecto.`)}
            style={s.heroBtn}
          >
            <T.Black style={{ fontSize: 14 }}>Ver en 3D</T.Black>
          </Pressable>
        </View>
      </View>

      <View style={s.grid}>
        <Pressable onPress={() => onFilter('actividad')} style={[s.tile, { backgroundColor: colors.accent }]}>
          <T.Bold style={{ color: '#FFFFFF' }}>Actividad</T.Bold>
          <View>
            <Big value={`${Math.round(minutes)}`} unit={`/ ${goal} min`} color="#FFFFFF" />
            <T.Body style={{ color: '#FFFFFF', fontSize: 13 }}>de {activityWord(pet.species).toLowerCase()} hoy</T.Body>
          </View>
        </Pressable>
        <Pressable onPress={() => onFilter('comida')} style={[s.tile, { backgroundColor: colors.card }]}>
          <T.Bold>Comida y agua</T.Bold>
          <View style={{ gap: 6 }}>
            <T.Display style={{ fontSize: 22 }}>
              {meals} {meals === 1 ? 'comida' : 'comidas'} hoy
            </T.Display>
            <View style={s.chip}>
              <T.Black style={{ fontSize: 13 }}>+ Agua</T.Black>
            </View>
          </View>
        </Pressable>
        <Pressable onPress={() => onFilter('cuerpo')} style={[s.tile, { backgroundColor: colors.lilacSoft, minHeight: 108 }]}>
          <T.Bold>Cuerpo</T.Bold>
          <View>
            <T.Display style={{ fontSize: 26 }}>{weight ? `${kg(weight)} kg` : 'Sin peso'}</T.Display>
            <T.Bold style={{ fontSize: 13, color: colors.lilacText }}>{weight ? 'Último peso anotado' : 'Toca para registrarlo'}</T.Bold>
          </View>
        </Pressable>
        <Pressable onPress={() => onFilter('salud')} style={[s.tile, { backgroundColor: colors.card, minHeight: 108 }]}>
          <T.Bold>Salud</T.Bold>
          <View style={{ gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[s.dot, { backgroundColor: vaccine ? colors.found : colors.lost }]} />
              <T.Black style={{ fontSize: 15 }}>{vaccine ? 'Vacuna anotada' : 'Sin vacunas'}</T.Black>
            </View>
            <T.Muted style={{ fontSize: 13 }}>{vaccine ? when(vaccine.at) : 'Anótalas para recordarlas'}</T.Muted>
          </View>
        </Pressable>
        <Pressable onPress={() => onFilter('animo')} style={[s.tile, { backgroundColor: colors.card, minHeight: 92 }]}>
          <T.Bold>Ánimo</T.Bold>
          <T.Display style={{ fontSize: 22 }}>{stats.felicidad}% feliz</T.Display>
        </Pressable>
        <Pressable onPress={() => router.push('/logros')} style={[s.tile, { backgroundColor: colors.blue, minHeight: 92 }]}>
          <T.Bold>Nivel {lvl.level}</T.Bold>
          <View style={{ gap: 6 }}>
            <Bar value={lvl.progress * 100} color={colors.lilacStrong} track="#FFFFFF" />
            <T.Muted style={{ fontSize: 13 }}>{lvl.totalXp} XP · ver logros</T.Muted>
          </View>
        </Pressable>
      </View>
      <Timeline data={data} now={now} />
    </>
  );
}

function WeekBars({ values, goal, now }: { values: number[]; goal: number; now: number }) {
  const max = Math.max(goal, ...values, 1);
  const todayIdx = dayIndex(now);
  return (
    <View style={{ gap: 6 }}>
      <View style={s.bars}>
        <View style={[s.goalLine, { bottom: (goal / max) * 100 }]} />
        {values.map((v, i) => (
          <View key={i} style={s.barCol}>
            <View
              style={{
                height: Math.max(4, (v / max) * 100),
                width: '70%',
                borderRadius: 8,
                backgroundColor: i === todayIdx ? colors.accent : v >= goal ? colors.blueOutline : colors.grey,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {DAYS.map((d, i) => (
          <T.Black key={d} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: i === todayIdx ? colors.accent : colors.textMuted }}>
            {d}
          </T.Black>
        ))}
      </View>
    </View>
  );
}

function Actividad({ data, now }: { data: AppData; now: number }) {
  const pet = data.pet!;
  const word = activityWord(pet.species);
  const goal = missionGoal(pet.species);
  const week = weekMinutes(data.entries, now);
  const today = week[dayIndex(now)];
  const todayWalks = todayEntries(data.entries, now, 'paseo');
  const recent = data.entries.filter((e) => e.kind === 'paseo').slice(0, 3);
  const days = streak(data.entries, now, 'paseo');
  const parks = data.parks
    .map((p) => ({ ...p, minutes: Math.round(parkMinutes(data.entries, p.id)) }))
    .sort((a, b) => b.minutes - a.minutes);

  return (
    <>
      <Intro
        title="Actividad"
        text={
          pet.species === 'gato'
            ? `${pet.name} necesita ratos de juego todos los días. Cada sesión suma XP y le sube el ánimo.`
            : `${pet.name} necesita de 40 a 60 minutos de paseo al día. Cada salida suma XP y le sube el ánimo.`
        }
      />
      <Card style={{ gap: 6 }}>
        <T.Muted>Hoy</T.Muted>
        <Big value={`${Math.round(today)}`} unit={`de ${goal} min`} />
        <T.Bold>
          {todayWalks.length} {todayWalks.length === 1 ? 'actividad' : 'actividades'}
        </T.Bold>
      </Card>
      <Card style={{ gap: 10 }}>
        <View style={s.rowBetween}>
          <T.Black>Minutos esta semana</T.Black>
          <T.Muted>Meta {goal} al día</T.Muted>
        </View>
        <WeekBars values={week} goal={goal} now={now} />
      </Card>
      <Card style={{ gap: 6 }}>
        <T.Black>Últimas actividades</T.Black>
        {recent.length === 0 ? (
          <T.Muted>Todavía no hay registros.</T.Muted>
        ) : (
          recent.map((e) => <EntryRow key={e.id} entry={e} species={pet.species} />)
        )}
      </Card>
      <Card style={{ gap: 8 }}>
        <View style={s.rowBetween}>
          <T.Black>Conquista de parques</T.Black>
          <T.Muted style={{ fontSize: 13 }}>Bronce 60 · Plata 180 · Oro 600 min</T.Muted>
        </View>
        {parks.length === 0 ? (
          <T.Muted style={{ fontSize: 13 }}>Al registrar un paseo, elige el parque. Cada parque nuevo da +{NEW_PARK_XP} XP.</T.Muted>
        ) : (
          parks.slice(0, 5).map((p) => {
            const badge = parkBadge(p.minutes);
            const nextBadge = [...PARK_BADGES].reverse().find((b) => b.min > p.minutes);
            return (
              <Pressable key={p.id} onPress={() => router.push({ pathname: '/parque', params: { id: p.id } })} style={{ gap: 4 }}>
                <View style={s.rowBetween}>
                  <T.Black style={{ flex: 1 }}>
                    {badge?.icon ?? '🌳'} {p.name}
                  </T.Black>
                  <T.Muted style={{ fontSize: 13 }}>{p.minutes} min</T.Muted>
                </View>
                <Bar value={nextBadge ? (p.minutes / nextBadge.min) * 100 : 100} color={colors.found} />
              </Pressable>
            );
          })
        )}
        <Button label="Ver todos los parques" onPress={() => router.push('/parques')} />
      </Card>
      <Card style={[s.rowBetween, { backgroundColor: colors.lilacSoft }]}>
        <View style={{ flex: 1, gap: 6 }}>
          <T.Black>Logro cerca: 7 días {pet.species === 'gato' ? 'jugando' : 'paseando'}</T.Black>
          <Bar value={(Math.min(days, 7) / 7) * 100} color={colors.lilacStrong} track="#FFFFFF" />
        </View>
        <T.Display style={{ fontSize: 22, marginLeft: 12 }}>{Math.min(days, 7)}/7</T.Display>
      </Card>
      <Card style={{ gap: 8 }}>
        <T.Black>Recordarme {pet.species === 'gato' ? 'jugar' : 'pasear'} cada día a las</T.Black>
        <WalkReminder />
      </Card>
      <Button label={`Registrar ${word.toLowerCase()}`} onPress={() => add('paseo')} />
    </>
  );
}

function Comida({ data, now }: { data: AppData; now: number }) {
  const { addEntry } = useStore();
  const pet = data.pet!;
  const meals = todayEntries(data.entries, now, 'comida');
  const water = todayEntries(data.entries, now, 'agua').reduce((sum, e) => sum + (e.ml ?? 0), 0);
  const goal = waterGoal(data);
  const days = streak(data.entries, now, 'comida');
  const food = foodStatus(data.entries, now);
  const store = data.providers.find((p) => p.id === food?.food.fields?.tiendaId);
  const lowFood = food?.left !== null && food?.left !== undefined && food.left <= 7;
  const expiring = food?.expires ? food.expires - now <= 30 * DAY_MS : false;

  return (
    <>
      <Intro title="Comida y agua" text={`Anota cada comida y el agua del día. Comer a sus horas mantiene la racha y la energía de ${pet.name}.`} />
      {food ? (
        <Card style={[{ gap: 8 }, (lowFood || expiring) && { borderWidth: 2, borderColor: colors.lost }]}>
          <View style={s.rowBetween}>
            <T.Muted>Alimento actual</T.Muted>
            <Pressable onPress={() => openEntry(food.food)}>
              <T.Black style={{ fontSize: 13, color: colors.accent }}>Ver o editar</T.Black>
            </Pressable>
          </View>
          <T.Display style={{ fontSize: 20 }}>{food.food.fields?.nombre}</T.Display>
          <T.Muted style={{ fontSize: 13 }}>
            {[food.food.fields?.porcion && `${food.food.fields.porcion} g × ${food.food.fields.comidasDia || 1} al día`, store?.name && `Se compra en ${store.name}`]
              .filter(Boolean)
              .join(' · ')}
          </T.Muted>
          {food.left !== null && (
            <>
              <Bar value={Math.min(100, (food.left / 30) * 100)} color={lowFood ? colors.lost : colors.found} />
              <T.Bold style={{ color: lowFood ? colors.lostText : colors.body }}>
                {food.left === 0 ? 'Ya se debió acabar' : `Quedan unos ${food.left} ${food.left === 1 ? 'día' : 'días'}`}
                {lowFood ? ' · compra el siguiente' : ''}
              </T.Bold>
            </>
          )}
          {food.expires && (
            <T.Bold style={{ color: expiring ? colors.lostText : colors.textMuted, fontSize: 14 }}>
              {food.expires < now ? 'Vencido' : 'Vence'} el {formatDate(food.expires)}
            </T.Bold>
          )}
        </Card>
      ) : (
        <Card style={{ gap: 6 }}>
          <T.Black>¿Qué come {pet.name}?</T.Black>
          <T.Muted style={{ fontSize: 13 }}>Toma foto de la bolsa o la lata. La app te avisará cuando se esté acabando o vaya a vencer.</T.Muted>
        </Card>
      )}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button label={food ? 'Bolsa nueva' : 'Su alimento'} style={{ flex: 1 }} onPress={() => add('alimento')} />
        <Button label="Registrar comida" kind="solid" style={{ flex: 1 }} onPress={() => add('comida')} />
      </View>
      <Balance data={data} now={now} />
      <Card style={{ gap: 8 }}>
        <View style={s.rowBetween}>
          <T.Black>Comidas de hoy</T.Black>
          <T.Display style={{ fontSize: 20 }}>{meals.length}</T.Display>
        </View>
        {meals.length === 0 ? (
          <T.Muted>Aún no anotas comidas hoy.</T.Muted>
        ) : (
          meals.map((e) => <EntryRow key={e.id} entry={e} species={pet.species} />)
        )}
      </Card>
      <Card style={{ gap: 8 }}>
        <T.Black>Horarios de comida</T.Black>
        <MealTimes />
      </Card>
      <Card style={{ gap: 10 }}>
        <View style={s.rowBetween}>
          <T.Black>Agua</T.Black>
          <Big value={`${water}`} unit={`de ${goal} ml`} />
        </View>
        <Bar value={(water / goal) * 100} color="#4F9BE0" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="+ 100 ml" style={{ flex: 1 }} onPress={() => addEntry({ kind: 'agua', ml: 100 })} />
          <Button label="+ 250 ml" style={{ flex: 1 }} onPress={() => addEntry({ kind: 'agua', ml: 250 })} />
        </View>
      </Card>
      <Card style={[s.rowBetween, { backgroundColor: colors.lilacSoft }]}>
        <T.Black>Racha de comidas</T.Black>
        <T.Display style={{ fontSize: 20 }}>
          {days} {days === 1 ? 'día' : 'días'}
        </T.Display>
      </Card>
    </>
  );
}

// Balance nutricional del día con las comidas que tienen gramos.
function Balance({ data, now }: { data: AppData; now: number }) {
  const pet = data.pet!;
  const day = dayNutrition(data.entries, startOfDay(now));
  const weight = lastWeight(data.entries);
  const need = weight ? dailyKcal(weight, pet.species) : null;
  const rows: [string, number, string][] = [
    ['Proteína', day.proteina, colors.accent],
    ['Grasa', day.grasa, colors.lilacStrong],
    ['Fibra', day.fibra, colors.found],
  ];
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <Card style={{ gap: 8 }}>
      <View style={s.rowBetween}>
        <T.Black>Balance de hoy</T.Black>
        <T.Muted style={{ fontSize: 13 }}>
          {day.meals} {day.meals === 1 ? 'comida' : 'comidas'} con gramos
        </T.Muted>
      </View>
      <Big value={`${day.kcal}`} unit={need ? `de ~${need} kcal` : 'kcal'} />
      {need ? (
        <Bar value={(day.kcal / need) * 100} color={day.kcal > need * 1.1 ? colors.lost : colors.found} />
      ) : (
        <T.Muted style={{ fontSize: 13 }}>Registra el peso de {pet.name} para calcular cuánta energía necesita al día.</T.Muted>
      )}
      {rows.map(([label, value, color]) => (
        <View key={label} style={{ gap: 2 }}>
          <View style={s.rowBetween}>
            <T.Bold style={{ fontSize: 14 }}>{label}</T.Bold>
            <T.Muted style={{ fontSize: 13 }}>{value} g</T.Muted>
          </View>
          <Bar value={(value / max) * 100} color={color} />
        </View>
      ))}
      <T.Muted style={{ fontSize: 12 }}>
        Es un cálculo aproximado con la tabla de cada alimento. La dieta exacta la define tu veterinario.
      </T.Muted>
    </Card>
  );
}

function Cuerpo({ data }: { data: AppData }) {
  const pet = data.pet!;
  const weights = data.entries.filter((e) => e.kind === 'peso').slice(0, 8).reverse();
  const last = weights[weights.length - 1];
  const max = Math.max(...weights.map((w) => w.kg ?? 0), 1);
  const age = pet.birthDate ? Math.floor((Date.now() - new Date(pet.birthDate).getTime()) / (365.25 * DAY_MS)) : null;
  const condition = CONDITIONS.find((c) => c.id === data.entries.find((e) => e.kind === 'peso' && e.fields?.condicion)?.fields?.condicion);
  const photo = data.entries.find((e) => e.kind === 'foto');
  const grooming = GROOMING.map((g) => ({ ...g, last: data.entries.find((e) => e.kind === 'higiene' && groomingTypes(e).includes(g.id)) }));

  return (
    <>
      <Intro title="Cuerpo" text={`Peso, tamaño y figura. Una foto por semana ayudará a ver cómo cambia ${pet.name} y a ajustar su modelo 3D.`} />
      <Card style={{ gap: 10 }}>
        <T.Muted>Peso</T.Muted>
        {last ? (
          <>
            <Pressable onPress={() => openEntry(last)}>
              <Big value={kg(last.kg!)} unit={`kg · ${when(last.at)}`} />
            </Pressable>
            <View style={[s.bars, { height: 90 }]}>
              {weights.map((w) => (
                <View key={w.id} style={s.barCol}>
                  <View style={{ height: Math.max(6, ((w.kg ?? 0) / max) * 80), width: '60%', borderRadius: 8, backgroundColor: colors.lilac }} />
                </View>
              ))}
            </View>
            <T.Muted style={{ fontSize: 13 }}>
              {[last.fields?.alto && `Altura ${last.fields.alto} cm`, last.fields?.largo && `Largo ${last.fields.largo} cm`].filter(Boolean).join(' · ') ||
                `Últimos ${weights.length} ${weights.length === 1 ? 'registro' : 'registros'} de peso`}
            </T.Muted>
          </>
        ) : (
          <T.Body>Todavía no hay peso anotado.</T.Body>
        )}
      </Card>
      <View style={s.grid}>
        <Card style={{ flexBasis: '45%', flexGrow: 1, gap: 4 }}>
          <T.Muted>Condición</T.Muted>
          <T.Display style={{ fontSize: 22 }}>{condition?.label ?? 'Sin dato'}</T.Display>
          <T.Muted style={{ fontSize: 13 }}>
            {age === null ? pet.breed || (pet.species === 'gato' ? 'Gato' : 'Perro') : age < 1 ? (pet.species === 'gato' ? 'Gatito' : 'Cachorro') : `${age} ${age === 1 ? 'año' : 'años'}`}
          </T.Muted>
        </Card>
        <Pressable onPress={() => (photo ? openEntry(photo) : add('foto'))} style={[s.tile, { backgroundColor: colors.lilacSoft, minHeight: 0, overflow: 'hidden' }]}>
          {photo?.photos?.[0] ? (
            <Image source={{ uri: photo.photos[0] }} style={{ width: '100%', height: 70, borderRadius: 12 }} resizeMode="cover" />
          ) : (
            <Icon name="camara" size={26} color={colors.lilacText} />
          )}
          <T.Black>{photo ? `Foto ${when(photo.at)}` : 'Foto de esta semana'}</T.Black>
        </Pressable>
      </View>
      {photo && <Button label="Tomar la foto de esta semana" kind="secondary" onPress={() => add('foto')} />}
      <Card style={{ gap: 8 }}>
        <T.Black>Higiene</T.Black>
        {grooming.map((g) => (
          <Pressable key={g.id} onPress={() => (g.last ? openEntry(g.last) : add('higiene'))} style={s.rowBetween}>
            <T.Bold>
              {g.icon} {g.label}
            </T.Bold>
            <T.Muted style={{ fontSize: 13 }}>
              {g.last ? `${when(g.last.at)}${g.last.fields?.proxima ? ` · próxima ${g.last.fields.proxima}` : ''}` : 'Sin registro'}
            </T.Muted>
          </Pressable>
        ))}
        <Button label="Registrar higiene" onPress={() => add('higiene')} />
      </Card>
      <Button label="Registrar peso y medidas" kind="solid" onPress={() => add('peso')} />
    </>
  );
}

function HealthSection({
  icon,
  title,
  empty,
  kinds,
  addKind,
  data,
  alert,
}: {
  icon: IconName;
  title: string;
  empty: string;
  kinds: EntryKind[];
  addKind: EntryKind;
  data: AppData;
  alert?: boolean;
}) {
  const list = data.entries.filter((e) => kinds.includes(e.kind)).slice(0, 3);
  return (
    <Card style={[{ gap: 6 }, alert && { borderWidth: 2, borderColor: colors.lost }]}>
      <Pressable accessibilityLabel={`Añadir: ${title}`} onPress={() => add(addKind)} style={s.healthHead}>
        <View style={[s.healthIcon, { backgroundColor: alert ? colors.lostSoft : colors.blue }]}>
          <Icon name={icon} size={20} color={alert ? colors.lostText : colors.accent} />
        </View>
        <T.Black style={{ flex: 1 }}>{title}</T.Black>
        <View style={s.addChip}>
          <Icon name="mas" size={16} color={colors.accent} />
          <T.Black style={{ fontSize: 13, color: colors.accent }}>Añadir</T.Black>
        </View>
      </Pressable>
      {list.length === 0 ? (
        <T.Muted style={{ fontSize: 13 }}>{empty}</T.Muted>
      ) : (
        list.map((e) => <EntryRow key={e.id} entry={e} species={data.pet!.species} />)
      )}
    </Card>
  );
}

function Salud({ data, now }: { data: AppData; now: number }) {
  const { removeReminder } = useStore();
  const upcoming = data.reminders.filter((r) => r.everyHours || r.at > now);
  const issues = data.entries.filter((e) => isIssue(e) && e.at >= startOfDay(now) - 6 * DAY_MS);

  return (
    <>
      <Intro title="Salud" text="Vacunas, medicinas, citas y novedades. Toca un registro para editarlo. La app guarda los datos; el diagnóstico siempre es del veterinario." />
      {upcoming.length > 0 && (
        <Card style={{ gap: 8, backgroundColor: colors.lilacSoft }}>
          <T.Black>Próximos recordatorios</T.Black>
          {upcoming.slice(0, 6).map((r) => (
            <View key={r.id} style={s.reminder}>
              <Icon name="reloj" size={18} color={colors.lilacText} />
              <View style={{ flex: 1 }}>
                <T.Bold style={{ fontSize: 14 }}>{r.title}</T.Bold>
                <T.Muted style={{ fontSize: 12 }}>{r.everyHours ? `Cada ${r.everyHours} horas` : formatDate(r.at)}</T.Muted>
              </View>
              <Pressable accessibilityLabel={`Quitar recordatorio ${r.title}`} onPress={() => removeReminder(r.id)} style={s.remove}>
                <T.Black style={{ fontSize: 13, color: colors.lilacText }}>Quitar</T.Black>
              </Pressable>
            </View>
          ))}
        </Card>
      )}
      <HealthSection icon="vacuna" title="Vacunas" empty="Sin vacunas anotadas. Toma foto del carnet o escribe los datos." kinds={['vacuna']} addKind="vacuna" data={data} alert={!data.entries.some((e) => e.kind === 'vacuna')} />
      <HealthSection icon="medicamento" title="Medicamentos" empty="Desparasitantes, pastillas, gotas. Toma foto de la caja." kinds={['medicamento']} addKind="medicamento" data={data} />
      <HealthSection icon="cita" title="Veterinario" empty="Anota cada cita y guarda tu veterinaria de confianza." kinds={['veterinario']} addKind="veterinario" data={data} />
      <HealthSection
        icon="sintoma"
        title="Novedades o comportamiento inusual"
        empty="Deposiciones, vómito, babeo, cojera, lesiones y más."
        kinds={['novedad', 'deposicion', 'enfermedad', 'lesion']}
        addKind="novedad"
        data={data}
        alert={issues.length > 0}
      />
    </>
  );
}

function Animo({ data, now, onFilter }: { data: AppData; now: number; onFilter: (f: Filter) => void }) {
  const pet = data.pet!;
  const stats = computeStats(data, now);
  const days = streak(data.entries, now);
  const monday = startOfDay(now) - dayIndex(now) * DAY_MS;
  const careDays = DAYS.map(
    (_, i) => data.entries.filter((e) => e.at >= monday + i * DAY_MS && e.at < monday + (i + 1) * DAY_MS).length,
  );
  const notes = data.entries.filter((e) => e.kind === 'nota').slice(0, 5);
  const todayMood = todayEntries(data.entries, now, 'animo')[0];
  const moodInfo = MOODS.find((m) => m.id === todayMood?.fields?.estado);
  const lowDays = lowMoodDays(data.entries, now);
  const moods = data.entries.filter((e) => e.kind === 'animo').slice(0, 5);

  return (
    <>
      <Intro title="Ánimo" text="Felicidad y amor suben con paseos, juego y cuidados anotados. Si pasan días sin registrar, bajan poco a poco." />
      {lowDays >= 3 && (
        <Card style={{ gap: 8, backgroundColor: colors.lostSoft }}>
          <T.Black style={{ color: colors.lostText }}>{pet.name} ha estado decaído {lowDays} de los últimos 5 días</T.Black>
          <T.Body>Revisa en Salud si hay novedades, como falta de apetito o vómito, y considera consultar al veterinario.</T.Body>
          <Button label="Ir a Salud" kind="lost" onPress={() => onFilter('salud')} />
        </Card>
      )}
      <Pressable onPress={() => (todayMood ? openEntry(todayMood) : add('animo'))} style={s.moodCard}>
        <T.Bold>¿Cómo está hoy?</T.Bold>
        <T.Display style={{ fontSize: 24 }}>{moodInfo ? `${moodInfo.icon} ${moodInfo.label}` : 'Toca para elegir'}</T.Display>
        {todayMood?.fields?.nota ? <T.Muted style={{ fontSize: 13 }}>{todayMood.fields.nota}</T.Muted> : null}
      </Pressable>
      {moods.length > 1 && (
        <Card style={{ gap: 4 }}>
          <T.Black>Últimos días</T.Black>
          {moods.map((e) => (
            <EntryRow key={e.id} entry={e} species={pet.species} />
          ))}
        </Card>
      )}
      <View style={s.grid}>
        <Card style={{ flexBasis: '45%', flexGrow: 1, gap: 6 }}>
          <T.Muted>Felicidad</T.Muted>
          <Big value={`${stats.felicidad} %`} />
          <Bar value={stats.felicidad} color={colors.accent} />
        </Card>
        <Card style={{ flexBasis: '45%', flexGrow: 1, gap: 6 }}>
          <T.Muted>Amor</T.Muted>
          <Big value={`${stats.amor} %`} />
          <Bar value={stats.amor} color={colors.lilacStrong} />
        </Card>
      </View>
      <Card style={{ gap: 10 }}>
        <View style={s.rowBetween}>
          <T.Black>Esta semana</T.Black>
          <T.Muted>
            Racha de cuidado: {days} {days === 1 ? 'día' : 'días'}
          </T.Muted>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {careDays.map((n, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: '100%',
                  aspectRatio: 1,
                  borderRadius: 10,
                  backgroundColor: n === 0 ? colors.grey : n < 3 ? colors.blueOutline : colors.accent,
                }}
              />
              <T.Black style={{ fontSize: 12, color: colors.textMuted }}>{DAYS[i]}</T.Black>
            </View>
          ))}
        </View>
        <T.Muted style={{ fontSize: 13 }}>Más oscuro = más cuidados anotados ese día</T.Muted>
      </Card>
      <Card style={{ gap: 8 }}>
        <T.Black>Diario de {pet.name}</T.Black>
        {notes.length === 0 ? (
          <T.Muted>Escribe cómo estuvo su día.</T.Muted>
        ) : (
          notes.map((e) => (
            <View key={e.id} style={{ gap: 2 }}>
              <T.Muted style={{ fontSize: 12 }}>{when(e.at)}</T.Muted>
              <T.Body>{e.note}</T.Body>
            </View>
          ))
        )}
      </Card>
      <Button label="Escribir en el diario" kind="solid" onPress={() => add('nota')} />
    </>
  );
}

const RANGES = [
  { id: 'hoy', label: 'Hoy', days: 1 },
  { id: '7', label: '7 días', days: 7 },
  { id: '30', label: '30 días', days: 30 },
  { id: 'todo', label: 'Todo', days: 0 },
];

// Todo lo anotado como línea de tiempo, agrupado por día. Toca un registro para editarlo.
function Timeline({ data, now }: { data: AppData; now: number }) {
  const [range, setRange] = useState('7');
  const days = RANGES.find((r) => r.id === range)!.days;
  const since = days ? startOfDay(now) - (days - 1) * DAY_MS : 0;
  const list = data.entries.filter((e) => e.at >= since).slice(0, 60);
  const groups: { day: number; items: typeof list }[] = [];
  for (const e of list) {
    const d = startOfDay(e.at);
    const g = groups[groups.length - 1];
    if (g && g.day === d) g.items.push(e);
    else groups.push({ day: d, items: [e] });
  }
  const dayLabel = (d: number) =>
    d === startOfDay(now)
      ? 'Hoy'
      : d === startOfDay(now) - DAY_MS
        ? 'Ayer'
        : new Date(d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Card style={{ gap: 8 }}>
      <T.Black>Línea de tiempo</T.Black>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {RANGES.map((r) => (
          <Pressable
            key={r.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: r.id === range }}
            onPress={() => setRange(r.id)}
            style={[s.range, r.id === range && { backgroundColor: colors.blue, borderColor: colors.accent }]}
          >
            <T.Black style={{ fontSize: 13 }}>{r.label}</T.Black>
          </Pressable>
        ))}
      </View>
      {groups.length === 0 ? (
        <T.Muted>No hay registros en estas fechas.</T.Muted>
      ) : (
        groups.map((g) => (
          <View key={g.day}>
            <T.Eyebrow style={{ marginTop: 8 }}>{dayLabel(g.day).toUpperCase()}</T.Eyebrow>
            {g.items.map((e) => (
              <EntryRow key={e.id} entry={e} species={data.pet!.species} />
            ))}
          </View>
        ))
      )}
      <T.Muted style={{ fontSize: 12 }}>Toca un registro para editarlo.</T.Muted>
    </Card>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 140, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filters: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: 22, padding: 6 },
  filter: { flex: 1, minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 4 },
  filterText: { fontSize: 11, fontFamily: fonts.bodyBlack, textAlign: 'center', lineHeight: 12 },
  hero: { height: 168, borderRadius: 26, backgroundColor: colors.blueTint, overflow: 'hidden', padding: 18 },
  heroGround: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    backgroundColor: '#9CCB8A',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
  },
  heroBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexBasis: '45%', flexGrow: 1, borderRadius: 22, padding: 14, minHeight: 120, justifyContent: 'space-between', gap: 8 },
  chip: {
    alignSelf: 'flex-start',
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.blue,
    borderWidth: 1.5,
    borderColor: colors.blueOutline,
    justifyContent: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  bars: { height: 110, flexDirection: 'row', alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    opacity: 0.5,
  },
  moodCard: { backgroundColor: colors.blue, borderRadius: 22, padding: 14, gap: 6 },
  range: {
    flex: 1,
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: colors.blue,
  },
  reminder: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  remove: { paddingHorizontal: 10, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  healthIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
