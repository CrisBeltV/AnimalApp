# Animaapp

App para cuidar a tu perro o gato y convertir su cuidado diario en un juego.
Hecha con Expo (React Native): un solo código para Android, iPhone y web.

## Qué tiene esta versión

Sigue el diseño de la maqueta (Ventana Jim): paleta azul claro, gris y lila, letras Fredoka y Nunito Sans.

- **Barra de abajo**: Mi mascota · INICIO (círculo grande al centro) · Comunidad, y aparte el botón **+**.
- **Inicio (Paseo)**: el barrio como mapa de juego con la mascota al centro, la misión del día, y el menú **Paseo ⌄** (iniciar paseo, resumen, conquista de parques).
- **Paseo en curso**: cronómetro, puntos y metas de 15, 30 y 45 minutos; al terminar, el resumen con XP.
- **Mi mascota**: 6 íconos arriba (Todo, Actividad, Comida y agua, Cuerpo, Salud, Ánimo) con datos reales de lo que anotas.
- **Botón + (Añadir rápidamente)**: iniciar paseo, comida, agua, peso, medicamento, vacuna, cita, novedades, diario, y ayuda urgente.
- **Salud**: vacunas y medicamentos con foto de ambos lados del carnet o la caja, datos separados (nombre, dosis, ingredientes, para qué sirve, contraindicaciones, fechas), vista previa antes de guardar y recordatorios 1 día, 1 semana o 1 mes antes (y en cada toma). Citas al veterinario con veterinaria, dirección, ubicación y doctor; la veterinaria queda guardada para buscarla. Novedades o comportamiento inusual (deposiciones, vómito, babeo, falta de apetito, temblores, desorientación, cojera, lesiones).
- **Editar**: toca cualquier registro para corregirlo o borrarlo.
- **Pendiente**: leer el texto de las fotos automáticamente y completar datos generales desde internet citando la fuente (necesitan un servicio en la nube).
- **Comunidad**: perdidas y encontradas (reportar perdida, encontré una, lista con mapa), tabla del barrio y desafíos.
- **Tu cuenta** (botón con tu inicial): perfil, ajustes, nivel y XP, insignias.
- **Juego**: XP, 15 niveles, misión diaria, 9 insignias, y el ánimo de la mascota baja si pasan días sin cuidarla.

Los datos se guardan en el teléfono. Lo marcado como "Muy pronto" (mapa real con GPS, conquista de parques, cámara y reconocimiento por foto, chat seguro, cuentas, amigos, modelo 3D) necesita la nube (Supabase) y llega después. Los pines del mapa y los vecinos de la tabla son ejemplos.

## Cómo correrla

```bash
npm install
npm run web       # en el navegador
npx expo start    # en el teléfono con la app Expo Go
npm run typecheck
npm run build:web # versión web en dist/
```

## Dónde está cada cosa

- `src/app/` pantallas (cada archivo es una pantalla; `(tabs)` es la barra de abajo).
- `src/lib/game.ts` reglas del juego: XP, niveles, misión diaria, estadísticas, ánimo y logros.
- `src/components/` piezas de la maqueta: barra de abajo, mapa, dibujo de la mascota, íconos, menú Tu cuenta.
- `src/lib/store.tsx` datos de la mascota y cómo se guardan.
- `src/lib/theme.ts` colores de la maqueta.
