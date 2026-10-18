// En la vista web no hay avisos del teléfono: los recordatorios quedan en la lista de Salud.
export async function scheduleAt(_title: string, _body: string, _at: number): Promise<string | undefined> {
  return undefined;
}

export async function scheduleEvery(_title: string, _body: string, _hours: number): Promise<string | undefined> {
  return undefined;
}

export async function cancel(_id?: string) {}

export const canNotify = false;

export async function scheduleDaily(_title: string, _body: string, _hour: number, _minute: number): Promise<string | undefined> {
  return undefined;
}
