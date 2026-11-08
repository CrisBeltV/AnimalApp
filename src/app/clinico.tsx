import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chips, Input, finish } from '../components/form';
import { BackHeader, Button, T } from '../components/ui';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import type { ClinicalProfile } from '../lib/types';

// Ficha clínica fija: lo primero que pregunta cualquier veterinaria.
export default function Clinico() {
  const { data, setClinical } = useStore();
  const pet = data.pet!;
  const [c, setC] = useState<ClinicalProfile>(data.clinical ?? {});
  const text = (k: 'microchip' | 'marks' | 'allergies' | 'conditions') => (v: string) => setC((x) => ({ ...x, [k]: v }));

  const save = () => {
    const clean = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]).filter(([, v]) => v)) as ClinicalProfile;
    setClinical(clean);
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Ficha clínica" subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
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
});
