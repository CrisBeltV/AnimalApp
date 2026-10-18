import { Platform } from 'react-native';

// Paleta de la maqueta (Ventana Jim): azul claro, grises claros y lila claro.
export const colors = {
  bg: '#F3F5F8',
  card: '#FFFFFF',
  blue: '#E1EEFB',
  blueOutline: '#BFD7F1',
  blueTint: '#D6EAFB',
  accent: '#2A64A8',
  text: '#0F2540',
  body: '#1F2A3A',
  textMuted: '#5B6676',
  grey: '#E7EBF1',
  lilac: '#C9B6F2',
  lilacSoft: '#EDE5FB',
  lilacText: '#4B3A78',
  lilacStrong: '#8C6FD6',
  lost: '#E8344B',
  lostText: '#B0182D',
  lostSoft: '#FDE3E6',
  found: '#1E8A4C',
  foundText: '#146B39',
  foundSoft: '#DDF2E5',
  good: '#3E9B6E',
  warn: '#C98A1A',
  bad: '#C0504D',
  // mapa estilo juego
  grass: '#9EE6A8',
  block: '#C5F2CB',
  road: '#F7F3E3',
  park: '#6FCF8A',
  tree: '#58BC76',
};

// En la web las fuentes llegan de Google Fonts; en el teléfono se cargan con expo-font.
export const fonts = Platform.select({
  web: {
    display: 'Fredoka, system-ui, sans-serif',
    body: '"Nunito Sans", system-ui, sans-serif',
    bodyBold: '"Nunito Sans", system-ui, sans-serif',
    bodyBlack: '"Nunito Sans", system-ui, sans-serif',
  },
  default: {
    display: 'Fredoka-Bold',
    body: 'NunitoSans-Regular',
    bodyBold: 'NunitoSans-Bold',
    bodyBlack: 'NunitoSans-ExtraBold',
  },
});

// Cada tipo de letra con su grosor (en el teléfono el grosor va en el nombre de la fuente).
export const type = {
  display: { fontFamily: fonts.display, fontWeight: '700' as const, color: colors.text },
  body: { fontFamily: fonts.body, fontWeight: '400' as const, color: colors.body },
  bold: { fontFamily: fonts.bodyBold, fontWeight: '700' as const, color: colors.body },
  black: { fontFamily: fonts.bodyBlack, fontWeight: '800' as const, color: colors.body },
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 26, pill: 999 };

export const shadow = {
  shadowColor: '#1F2A3A',
  shadowOpacity: 0.18,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
};

export const softShadow = {
  shadowColor: '#1F2A3A',
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
