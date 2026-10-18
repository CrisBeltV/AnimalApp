import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '../components/Icon';
import { PetDrawing } from '../components/PetDrawing';
import { BackHeader, Button, Card, T } from '../components/ui';
import { useStore } from '../lib/store';
import { colors, fonts, radius } from '../lib/theme';
import type { ReportKind, Species } from '../lib/types';

// Reportar una mascota perdida (la tuya) o una que encontraste.
export default function Reportar() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const kind: ReportKind = tipo === 'encontrada' ? 'encontrada' : 'perdida';
  const { data, addReport } = useStore();
  const pet = data.pet!;
  const lost = kind === 'perdida';

  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [species, setSpecies] = useState<Species>('perro');
  const [withMe, setWithMe] = useState(true);
  const [sent, setSent] = useState(false);

  function publish() {
    addReport({
      kind,
      at: Date.now(),
      petName: lost ? pet.name : species === 'gato' ? 'Gato encontrado' : 'Perro encontrado',
      species: lost ? pet.species : species,
      description: lost ? pet.breed || (pet.species === 'gato' ? 'Gato' : 'Perro') : note.trim().split('.')[0] || 'Sin descripción',
      place: place.trim(),
      note: note.trim() || undefined,
      withMe: lost ? undefined : withMe,
    });
    setSent(true);
  }

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader title={lost ? 'Alerta publicada' : 'Reporte publicado'} />
        <View style={s.page}>
          <Card style={{ gap: 8, borderWidth: 2, borderColor: lost ? colors.lost : colors.found }}>
            <T.Display style={{ fontSize: 22 }}>{lost ? `Ojalá ${pet.name} vuelva pronto` : '¡Gracias por ayudar!'}</T.Display>
            <T.Body>
              Tu reporte ya aparece en Perdidas y encontradas. Por ahora queda guardado en este teléfono. Cuando conectemos la nube,
              llegará en tiempo real a los vecinos a 2 km y podrán escribirte por el chat seguro, sin ver tu número.
            </T.Body>
          </Card>
          <Button label="Ver alertas" kind="solid" onPress={() => router.replace('/perdidas')} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={lost ? 'Se perdió mi mascota' : 'Encontré una mascota'} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        {lost ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[s.thumb, { backgroundColor: colors.blueTint }]}>
              <PetDrawing species={pet.species} mood="triste" size={56} />
            </View>
            <View style={{ flex: 1 }}>
              <T.Display style={{ fontSize: 22 }}>{pet.name}</T.Display>
              <T.Muted>Usaremos sus fotos para que otros la reconozcan</T.Muted>
            </View>
          </Card>
        ) : (
          <>
            <Pressable
              style={s.camera}
              onPress={() => router.push({ pathname: '/pronto', params: { title: 'Cámara', text: 'En el teléfono tomarás la foto aquí. La app comparará la cara y la nariz con las mascotas perdidas cerca.' } })}
            >
              <View style={s.frame}>
                <Icon name="camara" size={40} color="#FFFFFF" />
              </View>
              <T.Bold style={{ color: '#FFFFFF' }}>Centra la cara y la nariz en el recuadro</T.Bold>
            </Pressable>
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
        )}

        <T.Black>¿Cuándo?</T.Black>
        <View style={[s.input, { justifyContent: 'center' }]}>
          <T.Body>
            Ahora ·{' '}
            {new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}
          </T.Body>
        </View>

        <T.Black>{lost ? 'Lugar donde se perdió' : '¿Dónde?'}</T.Black>
        <TextInput
          value={place}
          onChangeText={setPlace}
          placeholder={lost ? 'Calle 72 con Cra. 112, Villa Luz' : 'Los Álamos, cerca de la tienda'}
          placeholderTextColor={colors.textMuted}
          style={s.input}
        />

        <T.Black>Observación</T.Black>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={lost ? 'Lleva bandana rosada y collar rojo. Es miedosa.' : 'Perro café con collar rojo.'}
          placeholderTextColor={colors.textMuted}
          style={[s.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }]}
          multiline
        />

        <T.Muted>
          Avisaremos a los vecinos a 2 km. Tu número no se muestra: te escriben por el chat de la app.
        </T.Muted>
        <Button
          label={lost ? 'Publicar alerta' : `Publicar: encontrada${place.trim() ? ` en ${place.trim()}` : ''}`}
          kind={lost ? 'lost' : 'found'}
          disabled={!place.trim()}
          onPress={publish}
        />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 10, width: '100%', maxWidth: 560, alignSelf: 'center' },
  thumb: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  camera: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: '#25303F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  frame: {
    width: 130,
    height: 130,
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
});
