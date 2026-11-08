# Animaapp

> **Rama `dev-cristian`:** el estado, los pendientes y el plan de producción están en [`docs/`](docs/README.md). Empezá por [`docs/estado-y-pendientes.md`](docs/estado-y-pendientes.md).

App para cuidar a tu perro o gato y convertir su cuidado diario en un juego.
Hecha con Expo (React Native): un solo código para Android, iPhone y web.

## Qué tiene esta versión

Sigue el diseño de la maqueta (Ventana Jim): paleta azul claro, gris y lila, letras Fredoka y Nunito Sans.

- **Barra de abajo**: Mi mascota · INICIO (círculo grande al centro) · Comunidad, y aparte el botón **+**.
- **Paseo**: "Iniciar nuevo paseo" abre directo una ventana con solo **Iniciar** y **Volver**; "Registro de paseos" muestra los recientes.
- **Inicio (Paseo)**: mapa dibujado del barrio Los Álamos (Engativá) con la mascota al centro; se arrastra y se acerca o aleja con + y − (o con dos dedos) desde todo el sector hasta unos 40 m. A la derecha tiene ⭐ misiones del día, 🏁 **Conquista de parques** (la única entrada a los parques) y 🔔 **recordatorios** (lista de vacunas, medicamentos, citas, comidas y paseo). El menú **Paseo ⌄** tiene iniciar paseo y mapa de exploración.
- **Iniciar paseo**: tres opciones iguales, cada una con su ventana: iniciar nuevo paseo (primero pregunta si quieres repetir uno ya registrado: con No se abre "Nuevo paseo", y al tocar "Registrar paseo" queda solo su nombre, "Empezar paseo" y "Volver"; con Sí pasa lo mismo con el paseo elegido), paseos recurrentes (los objetivos que hicieron 3 veces o más) y resumen de paseos. El paseo empieza con el objetivo (tipo, tiempo, distancia, parque a conquistar, explorar un parque nuevo), luego el cronómetro con el avance, y al terminar el resumen en la misma ventana (XP, misión, avance del parque).
- **Conquista de parques** (desde la bandera de Inicio): mapa de tu zona (1 km a la redonda) con cada parque pintado según el mes: Tuyo (60 min o más este mes), En conquista o Libre; hoja con % de conquista, tiempo aquí, aire y clima (muy pronto) y "Pasear aquí". **Ficha del parque** con la isla, tu historia aquí, insignias, lo que tiene, calificación y notas. **Tus lugares**: cada parque es una isla flotante, de día o de noche según la hora (o con el botón ☀️/🌙).
- **Mapa de exploración**: menú de lugares (parques, tiendas, veterinarias, restaurantes pet friendly, peluquerías, paseadores, guarderías, otros); se eligen una o varias categorías y sus pines aparecen o desaparecen del mapa.
- **Mi mascota**: 6 íconos arriba (Todo, Actividad, Comida, Cuerpo, Salud, Ánimo) con datos reales de lo que anotas.
- **Botón + (Añadir rápidamente)**: iniciar paseo, comida, agua, peso, medicamento, vacuna, cita, novedades, diario, y ayuda urgente.
- **Salud**: vacunas y medicamentos con foto de ambos lados del carnet o la caja, datos separados (nombre, dosis, ingredientes, para qué sirve, contraindicaciones, fechas), vista previa antes de guardar y recordatorios 1 día, 1 semana o 1 mes antes (y en cada toma). Citas al veterinario con veterinaria, dirección, ubicación y doctor; la veterinaria queda guardada para buscarla. Novedades o comportamiento inusual (deposiciones, vómito, babeo, falta de apetito, temblores, desorientación, cojera, lesiones).
- **Actividad** (solo datos, se registra desde Paseo): tiempo acumulado por tipo (todas, paseo, juego, entrenamiento, guardería) en 90, 30, 15 o 7 días; calendario de calor por día, días con actividad, tiempo y número de actividades frente al periodo anterior, días y horas por mes, y lo más frecuente (tipos y parques).
- **Preparar plato** (`src/app/cocina.tsx`): platos hechos con una lista de ingredientes (`src/lib/ingredients.ts`: proteínas, cereales, verduras, frutas, extras y concentrados, con calorías, proteína, grasa, carbohidratos, fibra, calcio, fósforo, hierro, zinc, sodio y potasio por 100 g). Los gramos suben y bajan de 5 en 5 (de 1 en 1 por debajo de 20 g). Las 6 categorías se ven todas, sin deslizar. "＋ Agregar otro alimento o suplemento" guarda uno propio con los valores de su etiqueta (por 100 g o por porción; `components/CustomFood.tsx`, `data.myIngredients`) y lo pone en el plato. "Nunca en el plato" muestra 3 al azar cada vez. Cada categoría tiene un botón **+ Más alimentos** que abre 20 alimentos más con buscador por nombre (`src/lib/ingredients-more.ts`). El plato se llena al tocar cada ingrediente, muestra su tabla calórica y mineral y un balance de 0 a 5 huellas (`src/lib/dishes.ts`, guía AAFCO por 1.000 kcal); "Nunca en el plato" explica los alimentos tóxicos. Cada plato puede ser alimento diario, recurrente (días de la semana) o "cuando lo elija". La primera vez aparece "¿Qué come …?". También la bolsa o lata con foto. El botón **Servir** de cada plato (o "Servir ahora" dentro del plato) anota la comida de hoy con su menú y nutrientes (`serveDish` en `src/lib/foods.ts`). `src/app/comida.tsx` queda solo para editar una comida ya anotada.
- **Comida**: "Comidas de hoy" muestra solo el nombre del plato y cuántas veces se sirvió. El agua va de segunda (+100 / +250 ml; el chip "+ Agua" de Todo abre esta pestaña). Al anotar o editar agua solo hay una casilla de mililitros con flechas de 50 en 50. Ficha del alimento con fotos del empaque (marca, tipo, porción, tamaño, fechas, ingredientes, tabla nutricional, tienda), cuántos días le quedan y alerta de vencimiento. Cada comida es un menú de uno o varios alimentos, cada uno con sus gramos usando una base de alimentos (`src/lib/foods.ts`, valores típicos aproximados más los alimentos del dueño), y el **balance de hoy** suma energía, proteína, grasa y fibra. Horarios de comida a cualquier hora con a. m. y p. m.; los horarios se ven como lista sencilla; el ícono ✎ de la esquina activa la edición: tocar un horario para cambiar la hora, el nombre (Desayuno, Cena) o el aviso, y "+ Añadir horario".
- **Cuerpo**: peso, altura, largo y condición corporal con guía visual; foto de la semana con guía de poses; higiene con uno o varios cuidados (baño, uñas, peluquería, desparasitación, limpieza de oídos, otro), próxima fecha y recordatorio.
- **Ánimo**: cómo está hoy (feliz, tranquilo, ansioso, decaído) con nota y foto; si está decaído 3 de 5 días, sugiere revisar Salud.
- **Todo**: línea de tiempo por día con filtro (hoy, 7 días, 30 días, todo), con filas compactas; el agua y el peso muestran su valor junto al nombre.
- **Editar**: toca cualquier registro para corregirlo o borrarlo.
- **Fechas**: cada fecha tiene el botón 📅 al inicio del campo para elegir día, mes y año; queda escrita como DD/MM/AAAA.
- **Mi perfil**: varias mascotas; "Editar mascota" y "Agregar mascota" (cada una con sus propios registros) y "Cambiar" para usar otra.
- **Idioma** (Ajustes): español, inglés o chino. Los textos se traducen con `src/lib/i18n/en.json` y `zh.json` (cadenas y patrones con {0}); `components/Text.tsx` reemplaza a Text y TextInput.
- **Barra de abajo**: los tres botones son iguales; el elegido crece con fondo azul e ícono blanco.
- **Pendiente**: leer el texto de las fotos automáticamente, completar datos generales desde internet citando la fuente, elegir parques en el mapa con GPS y aliados registrados (necesitan servicios en la nube).
- **Comunidad**: dos recuadros separados: **Mascotas perdidas** (reportes, mapa y crear reporte adentro) y **Reencuentros** (familias reunidas, historias, aliados del barrio y preguntas frecuentes), tabla del barrio y desafíos.
- **Mascotas perdidas**: pestañas Reportes y Mapa, buscador y 6 filtros con contador (Todos, Perdidos, Vistos, Emergencias, Adopción, Hogar temporal). Cada tarjeta tiene quién publica, tipo, fotos, apoyos ❤, comentarios y compartir; botón de kilómetros − / + (1, 2, 5, 10, 25, 50 o 100 km). En el mapa, pines del color de cada tipo, el radio elegido y una hoja con "Lo vi" y "Ver reporte". El detalle muestra fotos, rasgos, "Por dónde lo han visto" (mapa y línea de tiempo), comentarios, "Lo vi aquí" (suma un avistamiento) y el perfil del vecino (verificado, cifras, insignia, reportes activos y cerrados, denunciar; nunca su número ni dirección). "Crear un reporte" ofrece 5 tipos: se perdió mi mascota, vi una mascota suelta, emergencia, dar en adopción y hogar temporal. "¿Cuándo?" se elige en dos pasos: día (sin días futuros, Hoy/Ayer/Anteayer) y hora (Ahora, Hace 1 h, Hace 3 h, o "No sé la hora exacta"). Los 6 reportes de la maqueta salen como ejemplo; tus reportes, apoyos y comentarios se guardan en el teléfono.
- **Tu cuenta** (botón con tu inicial): perfil, ajustes, nivel y XP, insignias.
- **Juego**: XP, 15 niveles, misión diaria, 9 insignias, y el ánimo de la mascota baja si pasan días sin cuidarla.

- **Cuentas y nube** (Supabase): entrar o crear cuenta con correo y contraseña, recuperar contraseña, o seguir sin cuenta. Con cuenta, todo lo que anotas se guarda también en la nube y vuelve si cambias de teléfono. Los reportes de perdidas y encontradas se comparten entre los dueños con cuenta.
- **Bienvenida y cuenta**: pantalla de bienvenida, entrar o crear cuenta con correo y contraseña, recuperar contraseña y permisos (ubicación, notificaciones, cámara) antes de crear la mascota. Mientras la nube está apagada, la cuenta se guarda solo en este teléfono y el enlace de recuperación todavía no se envía por correo. Google o Apple llegan después.

Sin cuenta, los datos se guardan solo en el teléfono. Lo marcado como "Muy pronto" (mapa real con GPS, radio de 2 km, reconocimiento por foto, chat seguro, amigos, modelo 3D) llega después. Las fotos todavía se guardan solo en el teléfono. Los pines del mapa y los vecinos de la tabla son ejemplos.

## Conectar la nube (Supabase)

1. En [supabase.com](https://supabase.com) crea un proyecto (región São Paulo).
2. En **SQL Editor** → **New query**, pega `supabase/schema.sql` y toca **Run**. Crea las tablas y las reglas para que cada dueño solo vea sus propios datos.
3. En **Project Settings → API** copia la **Project URL** y la clave **anon public** (o **publishable**) en `src/lib/cloudConfig.ts`. Nunca pongas ahí la clave **service_role** o **secret**.
4. Para probar sin confirmar el correo: **Authentication → Sign In / Providers → Email** y apaga **Confirm email**. Vuelve a encenderlo antes de publicar la app.

Si `cloudConfig.ts` está vacío, la app funciona solo en el teléfono, como antes.

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
- `src/lib/store.tsx` datos de la mascota y cómo se guardan (en el teléfono y en la nube).
- `src/lib/auth.tsx`, `src/lib/cloud.ts`, `src/lib/supabase.ts` cuenta del dueño y conexión con la nube.
- `supabase/schema.sql` tablas de la nube y sus reglas de acceso.
- `src/lib/theme.ts` colores de la maqueta.
- `src/lib/reports.ts`, `src/lib/samples.ts` y `src/components/Reports.tsx` reportes de mascotas perdidas: tipos, colores, distancia y ejemplos.
- `src/lib/barrio.ts` y `src/components/BarrioMap.tsx` mapa dibujado del barrio (calles, carreras, barrios y lugares; aproximado, hasta tener GPS).
