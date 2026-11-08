import { emergencyHtml, emergencyInfo, hasPhones } from '../emergencyCard';
import { emptyData } from '../types';
import type { AppData } from '../types';

const now = new Date(2026, 10, 8, 10).getTime();
const data: AppData = {
  ...emptyData,
  ownerName: 'Ana',
  pet: { name: 'Luna', species: 'perro', breed: 'Criollo', createdAt: 0 },
  clinical: { allergies: 'Pollo', ownerPhone: '300 111 2222' },
  vets: [{ id: 'v1', name: 'Clínica <Patitas>', doctor: 'Dra. Gómez', phone: '601 555 0000' }],
  entries: [
    { id: 'a', kind: 'vacuna', at: new Date(2026, 5, 1).getTime(), xp: 0, fields: { nombre: 'Rabia' } },
    { id: 'b', kind: 'medicamento', at: 1, xp: 0, fields: { nombre: 'Amoxicilina', dosis: '1 tableta', fin: '20/11/2026' } },
  ],
};

describe('tarjeta de emergencia', () => {
  it('junta alergias, tratamientos en curso, vacuna y veterinaria', () => {
    const i = emergencyInfo(data, now);
    expect(i.allergies).toBe('Pollo');
    expect(i.treatments).toEqual(['Amoxicilina · 1 tableta']);
    expect(i.vaccine).toContain('Rabia');
    expect(i.vet?.name).toBe('Clínica <Patitas>');
    expect(hasPhones(i)).toBe(true);
  });

  it('sin permiso no sale ningún teléfono', () => {
    const html = emergencyHtml(data, undefined, false, now);
    expect(html).not.toContain('300 111 2222');
    expect(html).not.toContain('601 555 0000');
    expect(html).toContain('Clínica &lt;Patitas&gt;');
  });

  it('con permiso salen el del dueño y el de la veterinaria', () => {
    const html = emergencyHtml(data, undefined, true, now);
    expect(html).toContain('300 111 2222');
    expect(html).toContain('601 555 0000');
  });

  it('sin teléfonos guardados no hay nada que preguntar', () => {
    const none = { ...data, vets: [], clinical: {} };
    expect(hasPhones(emergencyInfo(none, now))).toBe(false);
  });
});
