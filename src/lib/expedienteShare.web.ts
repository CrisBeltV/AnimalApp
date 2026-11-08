import type { AppData, Entry } from './types';

// En la web no se comparte el expediente: la pantalla no muestra el botón.
export async function shareExpediente(_data: AppData, _entries: Entry[], _userId?: string | null): Promise<{ unlinked: number }> {
  return { unlinked: 0 };
}

export async function shareEmergencyCard(_data: AppData, _withPhones: boolean): Promise<void> {}
