import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { Files } from '../components/Files';
import { Chips, Input, finish } from '../components/form';
import { BackHeader, Button, Card, T } from '../components/ui';
import { deleteFiles } from '../lib/files';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import type { ClinicalProfile } from '../lib/types';

// Lo que se eligió, con palabras. Lo que quedó sin elegir no aparece.
function chosen(c: ClinicalProfile): { label: string; value: string; alert?: boolean }[] {
  const rows: { label: string; value: string; alert?: boolean }[] = [];
  if (c.sex) rows.push({ label: 'Sexo', value: c.sex === 'hembra' ? 'Hembra' : 'Macho' });
  if (c.neutered) rows.push({ label: 'Esterilizado', value: c.neutered === 'si' ? 'Sí' : 'No' });
  if (c.microchip) rows.push({ label: 'Microchip', value: c.microchip });
  if (c.marks) rows.push({ label: 'Color y señas', value: c.marks });
  if (c.allergies) rows.push({ label: 'Alergias', value: c.allergies, alert: true });
  if (c.conditions) rows.push({ label: 'Condiciones crónicas', value: c.conditions });
  return rows;
}

// Ficha clínica fija: lo primero que pregunta cualquier veterinaria.
// La primera vez se llena completa; después solo se ve lo elegido y se abre el formulario con "Editar".
export default function Clinico() {
  const { data, setClinical } = useStore();
  const pet = data.pet!;
  const saved = data.clinical ?? {};
  const isNew = Object.keys(saved).length === 0;
  const [editing, setEditing] = useState(isNew);
  const [c, setC] = useState<ClinicalProfile>(saved);
  const text = (k: 'microchip' | 'marks' | 'allergies' | 'conditions') => (v: string) => setC((x) => ({ ...x, [k]: v }));

  const save = () => {
    const clean = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]).filter(([, v]) => v)) as ClinicalProfile;
    if (saved.photo && saved.photo.id !== clean.photo?.id) deleteFiles([saved.photo]);
    setClinical(clean);
    finish();
  };

  if (!editing) {
    const rows = chosen(saved);
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BackHeader title="Ficha clínica" subtitle={pet.name} />
        <ScrollView contentContainerStyle={s.page}>
          {saved.photo && <Image source={{ uri: saved.photo.uri }} style={s.photo} resizeMode="cover" />}
          <Card style={{ gap: 12 }}>
            {rows.map((r) => (
              <View key={r.label} style={{ gap: 2 }}>
                <T.Muted style={{ fontSize: 13 }}>{r.label}</T.Muted>
                <T.Black style={{ fontSize: 17, color: r.alert ? colors.lostText : colors.text }}>{r.value}</T.Black>
              </View>
            ))}
            {rows.length === 0 && <T.Muted>Solo hay foto por ahora.</T.Muted>}
          </Card>
          <Button label="Editar" kind="solid" onPress={() => setEditing(true)} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Ficha clínica" subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <T.Black>Foto</T.Black>
        <Files photoOnly files={c.photo ? [c.photo] : []} onChange={(f) => setC((x) => ({ ...x, photo: f[0] }))} />
        <T.Black>Sexo</T.Black>
        <Chips
          options={[
            { id: 'hembra', label: 'Hembra' },
            { id: 'macho', label: 'Macho' },
          ]}
          value={c.sex}
          onChange={(id) => setC((x) => ({ ...x, sex: id as ClinicalProfile['sex'] }))}
        />
        <T.Black>Esterilizado</T.Black>
        <Chips
          options={[
            { id: 'si', label: 'Sí' },
            { id: 'no', label: 'No' },
          ]}
          value={c.neutered}
          onChange={(id) => setC((x) => ({ ...x, neutered: id as ClinicalProfile['neutered'] }))}
        />
        <Input field={{ key: 'microchip', label: 'Microchip', placeholder: 'Número del chip', number: true }} value={c.microchip ?? ''} onChange={text('microchip')} />
        <Input field={{ key: 'marks', label: 'Color y señas', placeholder: 'Café con mancha blanca en el pecho' }} value={c.marks ?? ''} onChange={text('marks')} />
        <Input field={{ key: 'allergies', label: 'Alergias', placeholder: 'Medicamentos, alimentos, picaduras…', multiline: true }} value={c.allergies ?? ''} onChange={text('allergies')} />
        <Input field={{ key: 'conditions', label: 'Condiciones crónicas', placeholder: 'Displasia, epilepsia, soplo…', multiline: true }} value={c.conditions ?? ''} onChange={text('conditions')} />
        <Button label="Guardar" kind="solid" onPress={save} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  photo: { width: 140, height: 140, borderRadius: 70, alignSelf: 'center', backgroundColor: colors.grey },
});
