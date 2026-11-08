import { useEffect, useRef } from 'react';

import type { GameMessage } from '../lib/cocinaJuego';

// En la web el juego va dentro de un iframe; los mensajes llegan con postMessage.
export function Juego({ html, onMessage }: { html: string; onMessage: (m: GameMessage) => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const cb = useRef(onMessage);
  useEffect(() => {
    cb.current = onMessage;
  });
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow || typeof e.data !== 'string') return;
      try {
        cb.current(JSON.parse(e.data));
      } catch {
        // mensaje que no es del juego
      }
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);
  return <iframe ref={ref} title="Cocina a mano" srcDoc={html} style={{ flex: 1, width: '100%', height: '100%', border: 0, display: 'block' }} />;
}
