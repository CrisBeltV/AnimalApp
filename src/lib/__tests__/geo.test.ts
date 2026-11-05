import { markerScale, offsetLngLat } from '../geo';

describe('offsetLngLat', () => {
  const bogota: [number, number] = [-74.08, 4.61];

  it('sin desplazamiento devuelve el mismo punto', () => {
    expect(offsetLngLat(bogota, 0, 0)).toEqual(bogota);
  });

  it('y positivo va al sur y x positivo al este', () => {
    const [lng, lat] = offsetLngLat(bogota, 100, 100);
    expect(lng).toBeGreaterThan(bogota[0]);
    expect(lat).toBeLessThan(bogota[1]);
  });

  it('1 km al sur baja unos 0,009 grados de latitud', () => {
    const [, lat] = offsetLngLat(bogota, 0, 1000);
    expect(bogota[1] - lat).toBeCloseTo(0.00898, 4);
  });
});

describe('markerScale', () => {
  it('es 1 en el zoom de arranque', () => {
    expect(markerScale(18, 18)).toBe(1);
  });

  it('achica al alejar y nunca baja de 0,45', () => {
    expect(markerScale(17, 18)).toBeCloseTo(0.78, 2);
    expect(markerScale(14, 18)).toBe(0.45);
  });

  it('agranda poco al acercar y topa en 1,1', () => {
    expect(markerScale(18.25, 18)).toBeCloseTo(1.055, 3);
    expect(markerScale(20, 18)).toBe(1.1);
  });
});
