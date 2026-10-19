import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarrioMap } from '../components/BarrioMap';
import { Avatar, KindBadge, ReportPhoto, photoTotal, shareReport } from '../components/Reports';
import { BackHeader, Button, Card, T, soon } from '../components/ui';
import { SITUATIONS, SIZES, ago, posted, badgeColors, clock12, distanceText, kindOf, meters, spot, title, whenText } from '../lib/reports';
import { useStore } from '../lib/store';
import { colors, fonts, softShadow } from '../lib/theme';
import { useNow } from '../lib/useNow';

const CHAT = 'El contacto es solo por el chat de la app, para que nadie vea tu número ni tu dirección. Llega en la siguiente versión.';

// Detalle de un reporte: fotos, datos, quién lo publicó, por dónde lo han visto y comentarios.
export default function Reporte() {
  const { id, nuevo } = useLocalSearchParams<{ id: string; nuevo?: string }>();
  const { data, reports, toggleSupport, addComment, closeReport } = useStore();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const r = reports(now).find((x) => x.id === id);
  const [photo, setPhoto] = useState(0);
  const [comment, setComment] = useState('');

  if (!r) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader title="Reporte" />
        <View style={s.page}>
          <T.Body>Este reporte ya no existe.</T.Body>
        </View>
      </View>
    );
  }

  const kind = kindOf(r);
  const tint = badgeColors(r);
  const total = photoTotal(r);
  const liked = data.supported?.includes(r.id);
  const comments = r.comments ?? [];
  const commentTotal = (r.commentCount ?? 0) + comments.length;
  const tracks = kind === 'perdida' || kind === 'visto';
  const here = spot(r);
  // La línea de tiempo arranca con el reporte mismo.
  const timeline = r.sightings?.length
    ? r.sightings
    : [{ at: r.at, place: `${kind === 'perdida' ? 'Se perdió en' : 'Lo vieron en'} ${r.place}`, by: r.by ?? 'Quien reporta', ...here }];
  const situations = SITUATIONS.filter((x) => r.situations?.includes(x.id)).map((x) => x.label);
  const size = SIZES.find((x) => x.id === r.adoption?.size)?.label;

  const send = () => {
    if (!comment.trim()) return;
    addComment(r.id, comment.trim());
    setComment('');
  };

  const actions: { label: string; kind: 'found' | 'solid'; onPress: () => void }[] = r.mine || r.closed
    ? []
    : kind === 'perdida'
      ? [
          { label: 'Lo vi aquí', kind: 'found', onPress: () => router.push({ pathname: '/reportar', params: { tipo: 'visto', para: r.id } }) },
          { label: 'Escribir', kind: 'solid', onPress: () => soon('Chat seguro', CHAT) },
        ]
      : kind === 'visto'
        ? [
            { label: 'Es mi mascota', kind: 'found', onPress: () => soon('Chat seguro', CHAT) },
            { label: 'Escribir', kind: 'solid', onPress: () => soon('Chat seguro', CHAT) },
          ]
        : kind === 'emergencia'
          ? [{ label: 'Puedo ayudar: escribir', kind: 'solid', onPress: () => soon('Chat seguro', CHAT) }]
          : [{ label: kind === 'adopcion' ? 'Quiero adoptar: escribir' : 'Puedo recibirlo: escribir', kind: 'solid', onPress: () => soon('Chat seguro', CHAT) }];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Detalle del reporte" subtitle={r.example ? 'Reporte de ejemplo' : r.mine ? 'Tu reporte' : undefined} />
      <ScrollView contentContainerStyle={[s.page, { paddingBottom: insets.bottom + (actions.length ? 110 : 40) }]} keyboardShouldPersistTaps="handled">
        {nuevo ? (
          <Card style={{ gap: 4, borderWidth: 2, borderColor: tint.pin }}>
            <T.Black>¡Publicado!</T.Black>
            <T.Body style={{ fontSize: 14 }}>
              Avisamos a los vecinos a 2 km. Por ahora queda guardado en este teléfono; cuando la nube esté activa lo verán todos.
            </T.Body>
          </Card>
        ) : null}

        <View>
          <ReportPhoto report={r} index={photo} height={240} size={170} />
          <View style={s.counter}>
            <Text style={s.counterText}>
              {photo + 1}/{total}
            </Text>
          </View>
          {total > 1 ? (
            <>
              <Pressable accessibilityLabel="Foto anterior" onPress={() => setPhoto((photo + total - 1) % total)} style={[s.arrow, { left: 10 }]}>
                <Text style={s.arrowText}>‹</Text>
              </Pressable>
              <Pressable accessibilityLabel="Foto siguiente" onPress={() => setPhoto((photo + 1) % total)} style={[s.arrow, { right: 10 }]}>
                <Text style={s.arrowText}>›</Text>
              </Pressable>
            </>
          ) : null}
          <View style={s.photoActions}>
            <Pressable
              accessibilityLabel={liked ? 'Quitar apoyo' : 'Dar apoyo'}
              accessibilityState={{ selected: liked }}
              onPress={() => toggleSupport(r.id)}
              style={[s.round, softShadow]}
            >
              <Text style={[s.roundIcon, liked && { color: colors.lost }]}>{liked ? '♥' : '♡'}</Text>
              <Text style={s.roundNum}>{r.apoyos ?? 0}</Text>
            </Pressable>
            <Pressable accessibilityLabel="Compartir" onPress={() => shareReport(r)} style={[s.round, softShadow]}>
              <Text style={s.roundIcon}>↗</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <KindBadge report={r} />
            <T.Muted style={{ fontSize: 13, flex: 1 }}>
              Publicado {ago(posted(r), now).toLowerCase()} · {r.views ? `${r.views} vecinos lo vieron` : 'recién publicado'}
            </T.Muted>
          </View>
          <T.Display style={{ fontSize: 30 }}>{r.petName}</T.Display>
          <T.Muted>{r.petInfo ?? `${r.species === 'gato' ? 'Gato' : 'Perro'}${r.title && r.title !== r.petName ? ` · ${title(r)}` : ''}`}</T.Muted>
          <T.Muted>
            📍 {r.place}
            {r.barrio && r.barrio !== r.place ? ` · ${r.barrio}` : ''} · a {distanceText(meters(r))} · {whenText(r.at, r.dayOnly)}
          </T.Muted>
        </View>

        <Pressable
          accessibilityLabel={`Perfil de ${r.by ?? 'vecino'}`}
          onPress={() => router.push({ pathname: '/vecino', params: { nombre: r.by ?? '' } })}
          style={[s.by, softShadow]}
        >
          <Avatar name={r.by} size={42} />
          <View style={{ flex: 1 }}>
            <T.Black>{r.mine ? `${r.by} (tú)` : r.by}</T.Black>
            <T.Muted style={{ fontSize: 13 }}>
              {kind === 'perdida' ? 'Su familia' : kind === 'adopcion' || kind === 'hogar' ? 'Quien lo cuida' : 'Quien reporta'}
              {r.barrio ? ` · vecino de ${r.barrio}` : ''}
            </T.Muted>
          </View>
          <Text style={{ fontSize: 20, color: colors.textMuted }}>›</Text>
        </Pressable>

        <Card style={{ gap: 10 }}>
          <T.Body>{r.note ?? r.description}</T.Body>
          {situations.length ? (
            <View style={s.chips}>
              {situations.map((t) => (
                <View key={t} style={[s.chip, { backgroundColor: tint.bg }]}>
                  <T.Black style={{ fontSize: 13, color: tint.text }}>{t}</T.Black>
                </View>
              ))}
            </View>
          ) : null}
          {r.traits?.length ? (
            <View style={s.chips}>
              {r.traits.map((t) => (
                <View key={t} style={s.chip}>
                  <T.Black style={{ fontSize: 13 }}>{t}</T.Black>
                </View>
              ))}
            </View>
          ) : null}
          {r.withMe !== undefined && (kind === 'visto' || kind === 'emergencia') ? (
            <T.Muted>{r.withMe ? 'Quien reporta está con él ahora.' : 'Quien reporta no se pudo quedar con él.'}</T.Muted>
          ) : null}
          {r.adoption ? (
            <View style={{ gap: 4 }}>
              {r.adoption.age ? <T.Bold>Edad: {r.adoption.age}</T.Bold> : null}
              {size ? <T.Bold>Tamaño: {size}</T.Bold> : null}
              {r.adoption.time ? <T.Bold>Por cuánto tiempo: {r.adoption.time}</T.Bold> : null}
              <View style={s.chips}>
                {(['vacunada', 'esterilizada', 'desparasitada'] as const).map((k) => (
                  <View key={k} style={[s.chip, r.adoption?.[k] && { backgroundColor: colors.foundSoft }]}>
                    <T.Black style={{ fontSize: 13, color: r.adoption?.[k] ? colors.foundText : colors.textMuted }}>
                      {r.adoption?.[k] ? '✓' : '✕'} {k[0].toUpperCase() + k.slice(1)}
                    </T.Black>
                  </View>
                ))}
              </View>
              {kind === 'adopcion' ? <T.Muted style={{ fontSize: 13 }}>Adopción sin costo: en Animaapp no se venden mascotas.</T.Muted> : null}
            </View>
          ) : null}
        </Card>

        {r.mine && kind === 'perdida' && !r.closed ? (
          <Button label="¡Ya apareció! Marcar como reencontrado" kind="found" onPress={() => closeReport(r.id)} />
        ) : null}
        {r.closed ? (
          <Card style={{ backgroundColor: colors.foundSoft }}>
            <T.Black style={{ color: colors.foundText }}>¡Volvió a casa! Gracias a los vecinos que ayudaron.</T.Black>
          </Card>
        ) : null}

        {tracks ? (
          <View style={{ gap: 10 }}>
            <View style={s.sectionHead}>
              <T.Black style={{ fontSize: 18 }}>Por dónde lo han visto</T.Black>
              <Pressable onPress={() => router.push({ pathname: '/perdidas', params: { vista: 'mapa', id: r.id } })}>
                <T.Black style={{ color: colors.accent, fontSize: 14 }}>Ver en el mapa</T.Black>
              </Pressable>
            </View>
            <View style={s.miniMap}>
              <BarrioMap
                interactive={false}
                initialWidth={900}
                center={here}
                markers={timeline.map((t, i) => ({
                  id: `s${i}`,
                  x: t.x ?? here.x,
                  y: t.y ?? here.y,
                  node: (
                    <View style={[s.step, { backgroundColor: i === 0 ? tint.pin : colors.found }]}>
                      <Text style={s.stepText}>{i + 1}</Text>
                    </View>
                  ),
                }))}
              />
            </View>
            <Card style={{ gap: 12 }}>
              {timeline.map((t, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={[s.step, { backgroundColor: i === 0 ? tint.pin : colors.found }]}>
                    <Text style={s.stepText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <T.Black style={{ fontSize: 15 }}>
                      {clock12(t.at)} · {t.place}
                    </T.Black>
                    <T.Muted style={{ fontSize: 13 }}>
                      {t.by}
                      {t.photo ? ' · con foto' : ''}
                      {t.note ? ` · ${t.note}` : ''}
                    </T.Muted>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <T.Black style={{ fontSize: 18 }}>Comentarios · {commentTotal}</T.Black>
          {r.commentCount ? <T.Muted style={{ fontSize: 13 }}>{r.commentCount} comentarios anteriores llegan con la nube.</T.Muted> : null}
          {comments.map((c) => (
            <View key={c.id} style={{ flexDirection: 'row', gap: 10 }}>
              <Avatar name={c.by} size={32} />
              <View style={s.bubble}>
                <T.Black style={{ fontSize: 14 }}>
                  {c.mine ? `${c.by} (tú)` : c.by} <T.Muted style={{ fontSize: 12 }}>· {ago(c.at, now).toLowerCase()}</T.Muted>
                </T.Black>
                <T.Body style={{ fontSize: 14 }}>{c.text}</T.Body>
              </View>
            </View>
          ))}
          <View style={s.commentRow}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Escribe un comentario"
              placeholderTextColor={colors.textMuted}
              style={s.commentInput}
              accessibilityLabel="Escribe un comentario"
              onSubmitEditing={send}
            />
            <Pressable accessibilityRole="button" onPress={send} disabled={!comment.trim()} style={[s.send, !comment.trim() && { opacity: 0.5 }]}>
              <T.Black style={{ color: '#FFFFFF', fontSize: 14 }}>Enviar</T.Black>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {actions.length ? (
        <View style={[s.bottom, { paddingBottom: insets.bottom + 14 }]}>
          {actions.map((a) => (
            <Button key={a.label} label={a.label} kind={a.kind} style={{ flex: 1 }} onPress={a.onPress} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  counter: { position: 'absolute', left: 12, top: 12, paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: 'rgba(15,37,64,0.6)', justifyContent: 'center' },
  counterText: { color: '#FFFFFF', fontSize: 13, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  arrow: { position: 'absolute', top: 98, width: 40, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 28, color: colors.text, lineHeight: 30 },
  photoActions: { position: 'absolute', right: 12, top: 12, flexDirection: 'row', gap: 8 },
  round: { minWidth: 44, height: 44, borderRadius: 22, paddingHorizontal: 10, backgroundColor: '#FFFFFF', flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center' },
  roundIcon: { fontSize: 20, color: colors.text },
  roundNum: { fontSize: 14, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.text },
  by: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 20, padding: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, height: 32, borderRadius: 16, backgroundColor: colors.blue, justifyContent: 'center' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  miniMap: { height: 180, borderRadius: 20, overflow: 'hidden', backgroundColor: '#BFEBC5' },
  step: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  stepText: { color: '#FFFFFF', fontSize: 12, fontFamily: fonts.bodyBlack, fontWeight: '800' },
  bubble: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 10, gap: 2 },
  commentRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  commentInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.grey,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.body,
  },
  send: { height: 48, paddingHorizontal: 18, borderRadius: 24, backgroundColor: colors.accent, justifyContent: 'center' },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
  },
});
