import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACHIEVEMENTS, levelInfo, totalXp } from '../lib/game';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import { colors, fonts, shadow } from '../lib/theme';
import { MenuRow, T, soon } from './ui';

// Botón redondo con la inicial del dueño y su nivel. Abre el menú "Tu cuenta".
export function AccountButton() {
  const { data } = useStore();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const button = useRef<React.ComponentRef<typeof View>>(null);
  // El menú se abre justo debajo del botón, alineado a su borde derecho.
  const [anchor, setAnchor] = useState({ top: insets.top + 68, right: 16 });
  const openMenu = () => {
    button.current?.measureInWindow((x, y, w, h) => {
      if (w > 0) setAnchor({ top: y + h + 8, right: Math.max(8, window.width - (x + w)) });
      setOpen(true);
    });
    if (!button.current) setOpen(true);
  };
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
        ref={button}
        onPress={openMenu}
        style={[s.avatar, shadow]}
      >
        <Text style={s.initial}>{initial}</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>{lvl.level}</Text>
        </View>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityLabel="Cerrar menú de tu cuenta" style={s.backdrop} onPress={() => setOpen(false)} />
        <View style={[s.menu, shadow, { top: anchor.top, right: anchor.right }]}>
          <ScrollView>
            <T.Eyebrow style={s.group}>TU CUENTA</T.Eyebrow>
            <MenuRow
              compact
              icon="usuario"
              title="Mi perfil"
              detail={`${data.ownerName} · nivel ${lvl.level}`}
              onPress={go(() => router.push('/perfil'))}
            />
            <MenuRow
              compact
              icon="ajustes"
              title="Ajustes y privacidad"
              detail="Tu nombre y tus datos"
              onPress={go(() => router.push('/ajustes'))}
            />
            <T.Eyebrow style={s.group}>RECOMPENSAS</T.Eyebrow>
            <MenuRow
              compact
              icon="estrella"
              title="Nivel y XP"
              detail="Tu progreso y lo que desbloqueaste"
              tint="lilac"
              onPress={go(() => router.push('/logros'))}
            />
            <MenuRow
              compact
              icon="insignia"
              title="Insignias"
              detail={`${won} de ${ACHIEVEMENTS.length} ganadas`}
              tint="lilac"
              onPress={go(() => router.push('/logros'))}
            />
            <MenuRow
              compact
              icon="tienda"
              title="Tienda"
              detail="Canjea tus monedas"
              tint="lilac"
              onPress={go(() => soon('Tienda', 'Aquí podrás canjear monedas por accesorios para tu mascota.'))}
            />
            <T.Eyebrow style={s.group}>INICIO DE LA APP</T.Eyebrow>
            {auth.session ? (
              <MenuRow
              compact
                icon="entrar"
                title="Tu cuenta"
                detail={auth.email ?? 'Guardada en la nube'}
                tint="grey"
                onPress={go(() => router.push('/ajustes'))}
              />
            ) : (
              <MenuRow
              compact
                icon="entrar"
                title="Entrar o crear cuenta"
                detail="Para guardar todo en la nube"
                tint="grey"
                onPress={go(() =>
                  auth.enabled
                    ? router.push('/entrar')
                    : soon('Entrar o crear cuenta', 'Las cuentas llegan cuando conectemos la nube. Por ahora todo se guarda en este teléfono.'),
                )}
              />
            )}
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
    width: 280,
    maxWidth: '92%',
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
  },
  group: { paddingHorizontal: 8, paddingTop: 6, paddingBottom: 0, fontSize: 11 },
});
