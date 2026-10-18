import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PetDrawing } from '../components/PetDrawing';
import { BackHeader, Button, Card, T, soon, when } from '../components/ui';
import { sampleReports } from '../lib/samples';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

// Detalle de un reporte de mascota perdida o encontrada.
export default function Reporte() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useStore();
  const r = [...data.reports, ...sampleReports(Date.now())].find((x) => x.id === id);

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

  const lost = r.kind === 'perdida';
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={lost ? `${r.petName} se perdió` : r.petName} subtitle={r.example ? 'Reporte de ejemplo' : 'Tu reporte'} />
      <ScrollView contentContainerStyle={s.page}>
        <View style={[s.photo, { backgroundColor: lost ? '#F1E4D6' : colors.foundSoft }]}>
          <PetDrawing species={r.species} mood="normal" size={150} />
        </View>
        <Card style={{ gap: 6, borderWidth: 2, borderColor: lost ? colors.lost : colors.found }}>
          <T.Black style={{ color: lost ? colors.lostText : colors.foundText }}>{lost ? 'PERDIDA' : 'ENCONTRADA'}</T.Black>
          <T.Body>{r.description}</T.Body>
          <T.Bold>
            {lost ? 'Se perdió en ' : 'Encontrada en '}
            {r.place} · {when(r.at)}
          </T.Bold>
          {r.note ? <T.Body>{r.note}</T.Body> : null}
          {r.withMe !== undefined ? <T.Muted>{r.withMe ? 'Quien la encontró la tiene consigo' : 'La vieron pasar'}</T.Muted> : null}
        </Card>
        {lost ? (
          <Button
            label="La vi: tomar una foto"
            kind="found"
            onPress={() =>
              soon('Reconocer por foto', 'Tomas una foto y la app compara la cara y la nariz con las fotos del reporte. Si se parece, te avisa "¡Puede ser ella!" y abres el chat con su dueño.')
            }
          />
        ) : null}
        <Button
          label={lost ? 'Escribir a su dueño' : 'Es mi mascota: escribir'}
          kind="solid"
          onPress={() => soon('Chat seguro', 'El contacto será solo por chat dentro de la app, para que nadie vea tu número. Llega cuando conectemos la nube.')}
        />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  photo: { height: 200, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
