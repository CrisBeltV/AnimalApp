import { useEffect, useState } from 'react';

// Hora actual que se refresca cada `ms` milisegundos (para el cronómetro del paseo y el ánimo).
export function useNow(ms = 60000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
