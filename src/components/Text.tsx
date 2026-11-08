import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import type { ComponentProps } from 'react';

import { tr, trChildren, useLang } from '../lib/i18n';

// Text y TextInput de la app: muestran los textos en el idioma elegido en Ajustes.
// (En React 19 la ref llega como una prop más y pasa tal cual.)
export function Text({ children, ...props }: ComponentProps<typeof RNText>) {
  const lang = useLang();
  return <RNText {...props}>{trChildren(children, lang)}</RNText>;
}

export function TextInput({ placeholder, ...props }: ComponentProps<typeof RNTextInput>) {
  const lang = useLang();
  return <RNTextInput {...props} placeholder={placeholder && lang !== 'es' ? tr(placeholder, lang) : placeholder} />;
}
