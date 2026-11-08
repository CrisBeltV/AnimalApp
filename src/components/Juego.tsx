import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import type { GameMessage } from '../lib/cocinaJuego';

// Muestra un juego hecho en HTML (canvas) a pantalla completa. En el celular usa WebView.
export function Juego({ html, onMessage }: { html: string; onMessage: (m: GameMessage) => void }) {
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={s.web}
      scrollEnabled={false}
      bounces={false}
      setSupportMultipleWindows={false}
      onMessage={(e) => {
        try {
          onMessage(JSON.parse(e.nativeEvent.data));
        } catch {
          // mensaje que no es del juego
        }
      }}
    />
  );
}

const s = StyleSheet.create({ web: { flex: 1, backgroundColor: 'transparent' } });
