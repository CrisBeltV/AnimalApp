import { useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BackHeader, Button, Card, T } from '../components/ui';
import { emergencyInfo, hasPhones } from '../lib/emergencyCard';
import { shareEmergencyCard } from '../lib/expedienteShare';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import { useNow } from '../lib/useNow';

// Tarjeta de emergencia: lo que una veterinaria de urgencias necesita saber, en una hoja para compartir.
export default function Tarjeta() {
  const { data } = useStore();
  const now = useNow();
  const pet = data.pet!;
  const info = emergencyInfo(data, now);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const share = async (withPhones: boolean) => {
    setAsking(false);
    setBusy(true);
    setFailed(false);
    try {
      await shareEmergencyCard(data, withPhones);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const rows: { label: string; value?: string; alert?: boolean }[] = [
    { label: 'Alergias', value: info.allergies, alert: true },
    { label: 'Condiciones', value: info.conditions },
    { label: 'En tratamiento', value: info.treatments.join('; ') || undefined },
    { label: 'Última vacuna', value: info.vaccine },
    { label: 'Veterinaria', value: info.vet && [info.vet.name, info.vet.detail].filter(Boolean).join(' · ') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Tarjeta de emergencia" subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page}>
        <Card style={{ gap: 12 }}>
          <View style={s.head}>
            {data.clinical?.photo && <Image source={{ uri: data.clinical.photo.uri }} style={s.photo} resizeMode="cover" />}
            <View style={{ flex: 1 }}>
              <T.Display style={{ fontSize: 24 }}>{pet.name}</T.Display>
              <T.Muted>{info.basics}</T.Muted>
            </View>
          </View>
          {rows
            .filter((r) => r.value)
            .map((r) => (
              <View key={r.label} style={{ gap: 2 }}>
                <T.Muted style={{ fontSize: 13 }}>{r.label}</T.Muted>
                <T.Black style={{ fontSize: 16, color: r.alert ? colors.lostText : colors.text }}>{r.value}</T.Black>
              </View>
            ))}
          {rows.every((r) => !r.value) && <T.Muted>Completa la ficha clínica y el expediente para que aparezcan aquí.</T.Muted>}
        </Card>
        {failed && <T.Muted style={{ color: colors.lostText }}>No se pudo preparar la tarjeta. Inténtalo de nuevo.</T.Muted>}
        {Platform.OS !== 'web' && (
          <Button label={busy ? 'Preparando…' : 'Compartir'} kind="solid" disabled={busy} onPress={() => (hasPhones(info) ? setAsking(true) : share(false))} />
        )}
      </ScrollView>

      <Modal transparent visible={asking} animationType="fade" onRequestClose={() => setAsking(false)}>
        <Pressable style={s.backdrop} onPress={() => setAsking(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <T.Display style={{ fontSize: 20 }}>¿Incluir los teléfonos?</T.Display>
            <T.Muted>
              Saldrán en la tarjeta: {[info.ownerPhone ? 'tu número' : '', info.vet?.phone ? 'el de la veterinaria' : ''].filter(Boolean).join(' y ')}. Quien la reciba podrá verlos.
            </T.Muted>
            <Button label="Sí, incluirlos" kind="solid" onPress={() => share(true)} />
            <Button label="No, dejarlos fuera" kind="secondary" onPress={() => share(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  photo: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.grey },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,37,64,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 420, backgroundColor: colors.card, borderRadius: 28, padding: 20, gap: 12 },
});
