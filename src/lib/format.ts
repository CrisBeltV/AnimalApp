// Cronómetro mm:ss para el paseo en curso.
export function clock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export const kg = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
