import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACHIEVEMENTS, levelInfo, totalXp } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, fonts, shadow } from '../lib/theme';
import { MenuRow, T, soon } from './ui';

// Botón redondo con la inicial del dueño y su nivel. Abre el menú "Tu cuenta".
export function AccountButton() {
  const { data } = useStore();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const lvl = levelInfo(totalXp(data));
  const initial = (data.ownerName.trim()[0] ?? '?').toUpperCase();
  const won = ACHIEVEMENTS.filter((a) => data.unlocked.includes(a.id)).length;

  const go = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <Pressable
        accessibilityLabel={`Tu cuenta: ${data.ownerName}, nivel ${lvl.level}`}
        onPress={() => setOpen(true)}
        style={[s.avatar, shadow]}
      >
        <Text style={s.initial}>{initial}</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>{lvl.level}</Text>
        </View>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityLabel="Cerrar menú de tu cuenta" style={s.backdrop} onPress={() => setOpen(false)} />
        <View style={[s.menu, shadow, { top: insets.top + 108 }]}>
          <ScrollView>
            <T.Eyebrow style={s.group}>TU CUENTA</T.Eyebrow>
            <MenuRow
              icon="usuario"
              title="Mi perfil"
              detail={`${data.ownerName} · nivel ${lvl.level}`}
              onPress={go(() => router.push('/perfil'))}
            />
            <MenuRow
              icon="ajustes"
              title="Ajustes y privacidad"
              detail="Tu nombre y tus datos"
              onPress={go(() => router.push('/ajustes'))}
            />
            <T.Eyebrow style={s.group}>RECOMPENSAS</T.Eyebrow>
            <MenuRow
              icon="estrella"
              title="Nivel y XP"
              detail="Tu progreso y lo que desbloqueaste"
              tint="lilac"
              onPress={go(() => router.push('/logros'))}
            />
            <MenuRow
              icon="insignia"
              title="Insignias"
              detail={`${won} de ${ACHIEVEMENTS.length} ganadas`}
              tint="lilac"
              onPress={go(() => router.push('/logros'))}
            />
            <MenuRow
              icon="tienda"
              title="Tienda"
              detail="Canjea tus monedas"
              tint="lilac"
              onPress={go(() => soon('Tienda', 'Aquí podrás canjear monedas por accesorios para tu mascota.'))}
            />
            <T.Eyebrow style={s.group}>INICIO DE LA APP</T.Eyebrow>
            <MenuRow
              icon="entrar"
              title="Entrar o crear cuenta"
              detail="Correo, Google o Apple"
              tint="grey"
              onPress={go(() =>
                soon('Entrar o crear cuenta', 'Las cuentas llegan cuando conectemos la nube. Por ahora todo se guarda en este teléfono.'),
              )}
            />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { color: '#FFFFFF', fontFamily: fonts.display, fontWeight: '700', fontSize: 20 },
  badge: {
    position: 'absolute',
    right: -6,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: colors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, fontFamily: fonts.bodyBlack, fontWeight: '800', color: colors.body },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,37,64,0.35)' },
  menu: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxWidth: 520,
    alignSelf: 'center',
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 8,
  },
  group: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 2 },
});
