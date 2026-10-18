import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BackHeader, Button, Card, T } from '../components/ui';
import { colors } from '../lib/theme';

// Pantalla para lo que ya está en la maqueta pero llega en una versión siguiente.
export default function Pronto() {
  const { title, text } = useLocalSearchParams<{ title?: string; text?: string }>();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={title ?? 'Muy pronto'} />
      <View style={s.page}>
        <Card style={{ gap: 8, backgroundColor: colors.lilacSoft }}>
          <T.Eyebrow style={{ color: colors.lilacText }}>MUY PRONTO</T.Eyebrow>
          <T.Body style={{ fontSize: 16 }}>{text ?? 'Esta parte llega en la siguiente versión.'}</T.Body>
        </Card>
        <Button label="Entendido" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
