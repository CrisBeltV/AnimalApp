import { router } from 'expo-router';
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { KINDS, KIND_ORDER, ago, posted, badge, badgeColors, distanceText, initial, kindOf, meters, speciesWord, title } from '../lib/reports';
import type { Kind } from '../lib/reports';
import { useStore } from '../lib/store';
import { colors, fonts, softShadow } from '../lib/theme';
import type { Report } from '../lib/types';
import { PetDrawing } from './PetDrawing';
import { T, soon } from './ui';

// Piezas de la sección Mascotas perdidas: insignia, avatar, foto, tarjeta, filtros y pin.

export function KindBadge({ report, small }: { report: Report; small?: boolean }) {
  const c = badgeColors(report);
  return (
    <View style={[s.badge, { backgroundColor: c.bg }, small && { height: 20, paddingHorizontal: 7 }]}>
      <Text style={[s.badgeText, { color: c.text }, small && { fontSize: 10 }]}>{badge(report)}</Text>
    </View>
  );
}

const AVATAR_TINTS = [colors.blue, colors.lilacSoft, '#FFE9D2', '#DDF2E5', '#FDE3E6'];

export function Avatar({ name, size = 36 }: { name?: string; size?: number }) {
  const tint = AVATAR_TINTS[(name ?? '').length % AVATAR_TINTS.length];
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: tint }]}>
      <Text style={[s.avatarText, { fontSize: size * 0.45 }]}>{initial(name)}</Text>
    </View>
  );
}

// Foto del reporte: la real si la hay; si no (ejemplos), el dibujo de la mascota.
export function ReportPhoto({ report, index = 0, height, size = 120 }: { report: Report; index?: number; height: number; size?: number }) {
  const uri = report.photos?.filter(Boolean)[index];
  const c = KINDS[kindOf(report)];
  const tints = [c.bg, colors.blue, colors.lilacSoft, '#F1E4D6', colors.grey];
  return (
    <View style={[s.photo, { height, backgroundColor: tints[index % tints.length] }]}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <PetDrawing species={report.species} mood="normal" size={size} />}
    </View>
  );
}

export function photoTotal(r: Report) {
  return Math.max(1, r.photos?.filter(Boolean).length || r.photoCount || 1);
}

export async function shareReport(r: Report) {
  const text = `${badge(r)}: ${title(r)} · ${r.place}. ${r.description} (Animaapp, Mascotas perdidas)`;
  try {
    await Share.share({ message: text });
  } catch {
    soon('Compartir', 'En el teléfono se abre la lista para compartir el reporte por WhatsApp u otras apps.');
  }
}

export function ReportCard({ report: r, now }: { report: Report; now: number }) {
  const { data, toggleSupport } = useStore();
  const liked = data.supported?.includes(r.id);
  const comments = (r.commentCount ?? 0) + (r.comments?.length ?? 0);
  const open = () => router.push({ pathname: '/reporte', params: { id: r.id } });
  return (
    <View style={[s.card, softShadow]}>
      <Pressable accessibilityLabel={`Perfil de ${r.by ?? 'vecino'}`} onPress={() => router.push({ pathname: '/vecino', params: { nombre: r.by ?? '' } })} style={s.head}>
        <Avatar name={r.by} />
        <View style={{ flex: 1 }}>
          <T.Black style={{ fontSize: 15 }} numberOfLines={1}>
            {r.mine ? `${r.by ?? 'Tú'} (tú)` : (r.by ?? 'Vecino')}
          </T.Black>
          <T.Muted style={{ fontSize: 12 }}>
            {ago(posted(r), now)}
            {r.example ? ' · ejemplo' : ''}
          </T.Muted>
        </View>
        <KindBadge report={r} />
      </Pressable>
      <Pressable accessibilityLabel={`Ver reporte ${title(r)}`} onPress={open} style={{ gap: 8 }}>
        <View>
          <ReportPhoto report={r} height={170} />
          <View style={s.counter}>
            <Text style={s.counterText}>1/{photoTotal(r)}</Text>
          </View>
        </View>
        <T.Black style={{ fontSize: 17 }}>{title(r)}</T.Black>
        <T.Body style={{ fontSize: 14 }} numberOfLines={3}>
          {r.description}
        </T.Body>
        <T.Muted style={{ fontSize: 13 }}>
          📍 {speciesWord(r)} · {r.barrio ?? r.place} · {distanceText(meters(r))}
        </T.Muted>
      </Pressable>
      <View style={s.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Quitar apoyo' : 'Dar apoyo'}
          accessibilityState={{ selected: liked }}
          onPress={() => toggleSupport(r.id)}
          style={s.action}
        >
          <Text style={[s.actionIcon, liked && { color: colors.lost }]}>{liked ? '♥' : '♡'}</Text>
          <T.Black style={{ fontSize: 14 }}>{r.apoyos ?? 0}</T.Black>
        </Pressable>
        <Pressable accessibilityLabel="Comentarios" onPress={open} style={s.action}>
          <Text style={s.actionIcon}>💬</Text>
          <T.Black style={{ fontSize: 14 }}>{comments}</T.Black>
        </Pressable>
        <Pressable accessibilityLabel="Compartir" onPress={() => shareReport(r)} style={[s.action, { marginLeft: 'auto' }]}>
          <Text style={s.actionIcon}>↗</Text>
          <T.Black style={{ fontSize: 14 }}>Compartir</T.Black>
        </Pressable>
      </View>
    </View>
  );
}

export type Filter = 'todos' | Kind;

export function FilterChips({ value, onChange, list }: { value: Filter; onChange: (f: Filter) => void; list: Report[] }) {
  const count = (f: Filter) => (f === 'todos' ? list.length : list.filter((r) => kindOf(r) === f).length);
  const items: { id: Filter; label: string }[] = [{ id: 'todos', label: 'Todos' }, ...KIND_ORDER.map((k) => ({ id: k, label: KINDS[k].filter }))];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
      {items.map((f) => {
        const on = f.id === value;
        const tint = f.id === 'todos' ? null : KINDS[f.id];
        return (
          <Pressable
            key={f.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={`${f.label} ${count(f.id)}`}
            onPress={() => onChange(f.id)}
            style={[s.filter, on && { backgroundColor: colors.accent, borderColor: colors.accent }]}
          >
            {tint ? <View style={[s.dot, { backgroundColor: tint.pin }, on && { borderColor: '#FFFFFF', borderWidth: 1.5 }]} /> : null}
            <T.Black style={{ fontSize: 14, color: on ? '#FFFFFF' : colors.text }}>{f.label}</T.Black>
            <View style={[s.count, on && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={[s.countText, on && { color: '#FFFFFF' }]}>{count(f.id)}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// Pin redondo con el color del tipo de reporte.
export function ReportPin({ report, selected, onPress }: { report: Report; selected?: boolean; onPress: () => void }) {
  const c = badgeColors(report);
  const size = selected ? 46 : 36;
  return (
    <Pressable accessibilityLabel={`Pin ${title(report)}`} onPress={onPress} style={{ alignItems: 'center' }}>
      <View style={[s.pin, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.pin }, selected && s.pinOn]}>
        <Text style={{ fontSize: selected ? 20 : 16 }}>{report.species === 'gato' ? '🐱' : '🐶'}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  badge: { height: 24, paddingHorizontal: 9, borderRadius: 12, justifyContent: 'center', alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, letterSpacing: 0.4, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.display, fontWeight: '700', color: colors.text },
  photo: { borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 12, gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  counter: { position: 'absolute', right: 10, top: 10, paddingHorizontal: 9, height: 24, borderRadius: 12, backgroundColor: 'rgba(15,37,64,0.6)', justifyContent: 'center' },
  counterText: { color: '#FFFFFF', fontSize: 12, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: colors.grey, paddingTop: 6 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 10, borderRadius: 20 },
  actionIcon: { fontSize: 18, color: colors.text },
  filters: { gap: 8, paddingHorizontal: 16, paddingVertical: 2 },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.grey,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  count: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: colors.grey, alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: 12, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.text },
  pin: { alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF', ...softShadow },
  pinOn: { borderWidth: 4 },
});
