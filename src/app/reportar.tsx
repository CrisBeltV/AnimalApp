import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BarrioMap } from '../components/BarrioMap';
import { Chips, PhotoSet } from '../components/form';
import { Icon } from '../components/Icon';
import { PetDrawing } from '../components/PetDrawing';
import { KindBadge } from '../components/Reports';
import { BackHeader, Button, Card, T } from '../components/ui';
import { WhenSheet } from '../components/WhenSheet';
import type { When } from '../components/WhenSheet';
import { spotFor } from '../lib/barrio';
import { KINDS, clock12, dayText, title } from '../lib/reports';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import type { Species } from '../lib/types';

const splitTraits = (text: string) =>
  text
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);

// Reportar tu mascota perdida, una mascota suelta que viste, o que viste la de un reporte ("Lo vi aquí").
export default function Reportar() {
  const { tipo, para } = useLocalSearchParams<{ tipo?: string; para?: string }>();
  const lost = tipo === 'perdida' && !para;
  const { data, reports, addReport, addSighting } = useStore();
  const pet = data.pet!;
  const target = para ? reports(Date.now()).find((r) => r.id === para) : undefined;
  const tint = KINDS[lost ? 'perdida' : 'visto'];

  const [when, setWhen] = useState<When>({ at: Date.now(), dayOnly: false });
  const [asking, setAsking] = useState(false);
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [traits, setTraits] = useState('');
  const [female, setFemale] = useState<string>('');
  const [species, setSpecies] = useState<Species>('perro');
  const [withMe, setWithMe] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  // Hasta tener GPS, el punto queda cerca de tu ubicación.
  const [here] = useState(() => spotFor(`${Date.now()}`, 450));

  function publish() {
    if (target) {
      addSighting(target.id, { at: when.at, place: place.trim(), note: note.trim() || undefined, photo: photos.some(Boolean), ...here });
      router.back();
      return;
    }
    const id = addReport(
      lost
        ? {
            kind: 'perdida',
            at: when.at,
            dayOnly: when.dayOnly,
            petName: pet.name,
            title: `${pet.name}${pet.breed ? ` · ${pet.breed.toLowerCase()}` : ''}`,
            species: pet.species,
            female: female === 'hembra',
            description: note.trim() || `${pet.species === 'gato' ? 'Gato' : 'Perro'} ${pet.breed}`.trim(),
            petInfo: [pet.species === 'gato' ? 'Gato' : 'Perro', pet.breed, female ? (female === 'hembra' ? 'hembra' : 'macho') : ''].filter(Boolean).join(' · '),
            traits: splitTraits(traits),
            place: place.trim(),
            photos: photos.filter(Boolean),
            ...here,
            sightings: [{ at: when.at, place: `Se perdió en ${place.trim()}`, by: `${data.ownerName || 'Tú'}, su familia`, ...here }],
          }
        : {
            kind: 'visto',
            at: when.at,
            dayOnly: when.dayOnly,
            petName: species === 'gato' ? 'Gato suelto' : 'Perro suelto',
            title: note.trim().split('.')[0].slice(0, 40) || (species === 'gato' ? 'Gato suelto' : 'Perro suelto'),
            species,
            description: note.trim() || 'Sin descripción',
            place: place.trim(),
            withMe,
            photos: photos.filter(Boolean),
            ...here,
          },
    );
    router.replace({ pathname: '/reporte', params: { id, nuevo: '1' } });
  }

  const header = target ? 'Lo vi aquí' : lost ? 'Se perdió mi mascota' : 'Vi una mascota suelta';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={header} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        {target ? (
          <Card style={{ gap: 4 }}>
            <KindBadge report={target} small />
            <T.Black>{title(target)}</T.Black>
            <T.Muted style={{ fontSize: 13 }}>Cuéntale a su familia dónde y cuándo lo viste. Le llega un aviso con el lugar en el mapa.</T.Muted>
          </Card>
        ) : lost ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[s.thumb, { backgroundColor: colors.blueTint }]}>
              <PetDrawing species={pet.species} mood="triste" size={56} />
            </View>
            <View style={{ flex: 1 }}>
              <T.Display style={{ fontSize: 22 }}>{pet.name}</T.Display>
              <T.Muted>Sube fotos recientes para que otros la reconozcan</T.Muted>
            </View>
          </Card>
        ) : (
          <Pressable
            style={s.camera}
            onPress={() => router.push({ pathname: '/pronto', params: { title: 'Cámara', text: 'En el teléfono tomarás la foto aquí. La app comparará la cara y la nariz con las mascotas perdidas cerca.' } })}
          >
            <View style={s.frame}>
              <Icon name="camara" size={40} color="#FFFFFF" />
            </View>
            <T.Bold style={{ color: '#FFFFFF' }}>Centra la cara y la nariz en el recuadro</T.Bold>
          </Pressable>
        )}

        <T.Black>Fotos</T.Black>
        <PhotoSet photos={photos} onChange={setPhotos} sides={target ? ['Foto (opcional)'] : lost ? ['Cara', 'Cuerpo', 'Otra'] : ['Foto 1', 'Foto 2']} />

        {lost ? (
          <>
            <T.Black>¿Es macho o hembra?</T.Black>
            <Chips
              options={[
                { id: 'macho', label: 'Macho' },
                { id: 'hembra', label: 'Hembra' },
              ]}
              value={female}
              onChange={setFemale}
            />
          </>
        ) : null}

        {!lost && !target ? (
          <>
            <T.Black>¿Es perro o gato?</T.Black>
            <View style={s.row}>
              {(['perro', 'gato'] as Species[]).map((sp) => (
                <Pressable key={sp} onPress={() => setSpecies(sp)} style={[s.choice, species === sp && s.choiceActive]}>
                  <T.Black>{sp === 'perro' ? 'Perro' : 'Gato'}</T.Black>
                </Pressable>
              ))}
            </View>
            <View style={s.row}>
              {[true, false].map((v) => (
                <Pressable key={String(v)} onPress={() => setWithMe(v)} style={[s.choice, withMe === v && s.choiceActive]}>
                  <T.Black>{v ? 'La tengo conmigo' : 'Solo la vi pasar'}</T.Black>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <T.Black>¿Cuándo?</T.Black>
        <Pressable accessibilityRole="button" accessibilityLabel="Elegir cuándo" onPress={() => setAsking(true)} style={s.when}>
          <View style={s.whenIcon}>
            <T.Black style={{ fontSize: 18 }}>📅</T.Black>
          </View>
          <View style={{ flex: 1 }}>
            <T.Black>{dayText(when.at)}</T.Black>
            <T.Muted style={{ fontSize: 13 }}>{when.dayOnly ? 'Hora no exacta' : clock12(when.at)}</T.Muted>
          </View>
          <T.Black style={{ color: colors.accent, fontSize: 14 }}>Cambiar</T.Black>
        </Pressable>

        <T.Black>{lost ? 'Lugar donde se perdió' : '¿Dónde?'}</T.Black>
        <TextInput
          value={place}
          onChangeText={setPlace}
          placeholder={lost ? 'Calle 72 con Cra. 112, Villa Luz' : 'Los Álamos, cerca de la tienda'}
          placeholderTextColor={colors.textMuted}
          style={s.input}
        />
        <View style={s.map}>
          <BarrioMap
            interactive={false}
            initialWidth={700}
            center={here}
            markers={[{ id: 'aqui', ...here, node: <View style={[s.pin, { backgroundColor: tint.pin }]} /> }]}
          />
        </View>
        <T.Muted style={{ fontSize: 12 }}>Ubicación aproximada, cerca de ti. Con el GPS del teléfono será el punto exacto.</T.Muted>

        {lost ? (
          <>
            <T.Black>Rasgos (separados por comas)</T.Black>
            <TextInput
              value={traits}
              onChangeText={setTraits}
              placeholder="Bandana rosada, mancha blanca en el pecho, miedosa"
              placeholderTextColor={colors.textMuted}
              style={s.input}
            />
          </>
        ) : null}

        <T.Black>Observación</T.Black>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={lost ? 'Lleva bandana rosada y collar rojo. Es miedosa: no la persigan.' : 'Perro café con collar rojo, iba hacia el parque.'}
          placeholderTextColor={colors.textMuted}
          style={[s.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }]}
          multiline
        />

        <T.Muted>Avisaremos a los vecinos a 2 km. Tu número no se muestra: te escriben por el chat de la app.</T.Muted>
        <Button
          label={target ? 'Enviar: lo vi aquí' : lost ? 'Publicar alerta' : `Publicar: vista${place.trim() ? ` en ${place.trim()}` : ''}`}
          kind={lost ? 'lost' : 'found'}
          disabled={!place.trim()}
          onPress={publish}
        />
      </ScrollView>

      <WhenSheet
        visible={asking}
        value={when}
        question={lost ? '¿Qué día se perdió?' : '¿Qué día la viste?'}
        onClose={() => setAsking(false)}
        onDone={(v) => {
          setWhen(v);
          setAsking(false);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 10, width: '100%', maxWidth: 560, alignSelf: 'center' },
  thumb: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  camera: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: '#25303F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  frame: {
    width: 120,
    height: 120,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: 10 },
  choice: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  choiceActive: { backgroundColor: colors.blue, borderColor: colors.blueOutline },
  when: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.grey,
  },
  whenIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  input: {
    minHeight: 50,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.grey,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.body,
  },
  map: { height: 140, borderRadius: 18, overflow: 'hidden', backgroundColor: '#BFEBC5' },
  pin: { width: 24, height: 24, borderRadius: 12, borderWidth: 4, borderColor: '#FFFFFF' },
});
