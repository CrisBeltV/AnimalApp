import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Check } from '../components/form';
import { Avatar, KindBadge } from '../components/Reports';
import { BackHeader, Button, Card, T, soon } from '../components/ui';
import { REUNITED, ago, posted, title } from '../lib/reports';
import { NEIGHBORS } from '../lib/samples';
import { useStore } from '../lib/store';
import { colors, fonts, shadow, softShadow } from '../lib/theme';
import { useNow } from '../lib/useNow';

const REASONS = ['Reporte falso', 'Está vendiendo mascotas', 'Mensajes ofensivos', 'Otro motivo'];

// Perfil público de quien publica un reporte. Su número y dirección nunca se muestran.
export default function Vecino() {
  const { nombre = '' } = useLocalSearchParams<{ nombre?: string }>();
  const { data, reports } = useStore();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const [tab, setTab] = useState<'activos' | 'cerrados'>('activos');
  const [report, setReport] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const mine = reports(now).filter((r) => r.by === nombre);
  const me = mine.some((r) => r.mine);
  const known = NEIGHBORS[nombre];
  const active = mine.filter((r) => !r.closed);
  const closedMine = mine.filter((r) => r.closed);
  const closedCount = closedMine.length + (known?.closed.length ?? 0);
  const apoyos = known?.apoyos ?? mine.reduce((a, r) => a + (r.apoyos ?? 0), 0);
  const stats = [
    { label: 'Reportes', value: known?.reports ?? mine.length },
    { label: 'Apoyos', value: apoyos },
    { label: 'Reencuentros', value: (known?.reunions ?? 0) + closedMine.length },
  ];
  const barrio = known?.barrio ?? mine[0]?.barrio ?? 'Engativá';
  const angel = (known?.reunions ?? 0) + closedMine.length >= 2;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Perfil del vecino" />
      <ScrollView contentContainerStyle={[s.page, { paddingBottom: insets.bottom + 120 }]}>
        <Card style={{ alignItems: 'center', gap: 6 }}>
          <Avatar name={nombre} size={76} />
          <T.Display style={{ fontSize: 24, textAlign: 'center' }}>{nombre || 'Vecino'}</T.Display>
          <T.Muted>
            {barrio} · en Animaapp desde {known?.since ?? new Date(now).getFullYear()}
          </T.Muted>
          {known?.verified ? (
            <View style={s.verified}>
              <T.Black style={{ fontSize: 13, color: colors.foundText }}>✓ {known.verified}</T.Black>
            </View>
          ) : null}
        </Card>

        <View style={s.stats}>
          {stats.map((x) => (
            <View key={x.label} style={[s.stat, softShadow]}>
              <Text style={s.statNum}>{x.value}</Text>
              <T.Muted style={{ fontSize: 13 }}>{x.label}</T.Muted>
            </View>
          ))}
        </View>

        {angel ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.lilacSoft }}>
            <Text style={{ fontSize: 30 }}>👼</Text>
            <View style={{ flex: 1 }}>
              <T.Black style={{ color: colors.lilacText }}>Insignia: Ángel del barrio</T.Black>
              <T.Muted style={{ fontSize: 13 }}>Ayudó a reunir {stats[2].value} familias con su mascota</T.Muted>
            </View>
          </Card>
        ) : null}

        <View style={s.tabs} accessibilityRole="tablist">
          {(['activos', 'cerrados'] as const).map((t) => (
            <Pressable key={t} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} onPress={() => setTab(t)} style={[s.tab, tab === t && s.tabOn]}>
              <T.Black style={{ fontSize: 14, color: tab === t ? '#FFFFFF' : colors.text }}>
                {t === 'activos' ? `Activos · ${active.length}` : `Cerrados · ${closedCount}`}
              </T.Black>
            </Pressable>
          ))}
        </View>

        {tab === 'activos'
          ? active.map((r) => (
              <Pressable key={r.id} onPress={() => router.push({ pathname: '/reporte', params: { id: r.id } })} style={[s.row, softShadow]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <KindBadge report={r} small />
                  <T.Black>{title(r)}</T.Black>
                  <T.Muted style={{ fontSize: 13 }}>
                    {ago(posted(r), now)} · {r.place}
                  </T.Muted>
                </View>
                <Text style={{ fontSize: 20, color: colors.textMuted }}>›</Text>
              </Pressable>
            ))
          : [
              ...closedMine.map((r) => (
                <Pressable key={r.id} onPress={() => router.push({ pathname: '/reporte', params: { id: r.id } })} style={[s.row, softShadow]}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <KindBadge report={r} small />
                    <T.Black>{title(r)}</T.Black>
                  </View>
                </Pressable>
              )),
              ...(known?.closed ?? []).map((c) => (
                <View key={c.title} style={[s.row, softShadow]}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={[s.badge, { backgroundColor: REUNITED.bg }]}>
                      <Text style={[s.badgeText, { color: REUNITED.text }]}>{c.badge}</Text>
                    </View>
                    <T.Black>{c.title}</T.Black>
                    <T.Muted style={{ fontSize: 13 }}>{c.detail}</T.Muted>
                  </View>
                </View>
              )),
            ]}
        {tab === 'activos' && active.length === 0 ? <T.Muted>No tiene reportes activos.</T.Muted> : null}
        {tab === 'cerrados' && closedCount === 0 ? <T.Muted>Todavía no tiene reportes cerrados.</T.Muted> : null}

        {!me ? (
          <Pressable onPress={() => setReport(true)} style={{ alignSelf: 'center', padding: 10 }}>
            <T.Black style={{ color: colors.lostText, fontSize: 14 }}>Denunciar este perfil</T.Black>
          </Pressable>
        ) : null}
        {sent ? <T.Muted style={{ textAlign: 'center' }}>Gracias. Revisaremos este perfil.</T.Muted> : null}
      </ScrollView>

      {!me ? (
        <View style={[s.bottom, { paddingBottom: insets.bottom + 14 }]}>
          <Button
            label="Escribirle por el chat"
            kind="solid"
            onPress={() => soon('Chat seguro', 'El contacto es solo por el chat de la app. Llega en la siguiente versión.')}
          />
          <T.Muted style={{ fontSize: 12, textAlign: 'center' }}>Su número y dirección nunca se muestran</T.Muted>
        </View>
      ) : null}

      <Modal transparent visible={report} animationType="fade" onRequestClose={() => setReport(false)}>
        <Pressable accessibilityLabel="Cerrar denuncia" style={s.backdrop} onPress={() => setReport(false)} />
        <View style={[s.sheet, shadow]}>
          <T.Display style={{ fontSize: 20 }}>Denunciar a {nombre}</T.Display>
          <T.Muted style={{ fontSize: 13 }}>Elige el motivo. Nadie sabrá que fuiste tú.</T.Muted>
          {REASONS.map((x) => (
            <Check
              key={x}
              label={x}
              on={reasons.includes(x)}
              onPress={() => setReasons(reasons.includes(x) ? reasons.filter((y) => y !== x) : [...reasons, x])}
            />
          ))}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Cancelar" kind="secondary" style={{ flex: 1 }} onPress={() => setReport(false)} />
            <Button
              label="Enviar"
              kind="lost"
              style={{ flex: 1 }}
              disabled={!reasons.length}
              onPress={() => {
                setReport(false);
                setSent(true);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  verified: { paddingHorizontal: 12, height: 30, borderRadius: 15, backgroundColor: colors.foundSoft, justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: 18, paddingVertical: 12, alignItems: 'center' },
  statNum: { fontFamily: fonts.display, fontWeight: '700', fontSize: 26, color: colors.text },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 22, padding: 4 },
  tab: { flex: 1, height: 40, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.accent },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 18, padding: 12 },
  badge: { height: 20, paddingHorizontal: 7, borderRadius: 10, justifyContent: 'center', alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, letterSpacing: 0.4, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, gap: 6, backgroundColor: colors.bg },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,37,64,0.35)' },
  sheet: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    width: 340,
    maxWidth: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
});
