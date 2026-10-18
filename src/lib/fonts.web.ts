const HREF =
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito+Sans:wght@400;600;700;800&display=swap';

// Web: enlaza la hoja de Google Fonts una sola vez; el texto se muestra mientras llega.
export function useAppFonts() {
  if (typeof document !== 'undefined' && !document.querySelector(`link[href="${HREF}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = HREF;
    document.head.appendChild(link);
  }
  return true;
}
