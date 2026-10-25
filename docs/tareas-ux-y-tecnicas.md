# Tareas: diseño y funcionalidad (UX) y aspectos técnicos de producción

> Rama `dev-cristian`. Creado: 2026-10-25. Complementa a [plan-produccion.md](plan-produccion.md) (fases 0 a 8) y a [estado-y-pendientes.md](estado-y-pendientes.md).
> Dos listas independientes. **Parte A:** lo que el usuario ve y usa. **Parte B:** lo que hace que la app aguante en producción.
> Cada tarea dice **qué** es, **cuándo se considera hecha** y **en qué fase** del plan entra. Las fases son las del plan: 0 cimientos, 1 identidad, 2 expediente, 3 paseos y lugares, 4 gamificación, 5 comunidad, 6 recuperación, 7 aliados, 8 lanzamiento.

---

# Parte A: Diseño, funcionalidad y UX

## A.1 Estructura y simplificación

### U1. Auditoría y recorte de pantallas
- **Qué:** el demo tiene 38 pantallas y se siente pesado. Hacer un inventario y marcar cada una como **queda**, **se une con otra**, **se pospone** o **se elimina**, con la razón.
- **Hecha cuando:** existe una tabla aprobada por Cristian con las 38 pantallas y su destino, y cada fase la usa como spec antes de programar.
- **Fase:** antes de la Fase 1, y se consulta en cada fase.

### U2. Rediseño de Inicio
- **Qué:** hoy la pantalla de Inicio (`(tabs)/index.tsx`) junta mapa, misiones, parques, recordatorios, menú de paseo y reportes cercanos. Dejar una sola acción principal (salir a pasear) y la información del día. Lo demás pasa a pantallas propias.
- **Hecha cuando:** un usuario nuevo entiende qué tocar en menos de 5 segundos; tiene una acción principal y no más de 3 bloques de información.
- **Fase:** 3.

### U3. Rediseño de Mi mascota
- **Qué:** `(tabs)/mascota.tsx` tiene 773 líneas y 6 pestañas (Todo, Actividad, Comida y agua, Cuerpo, Salud, Ánimo). Pasar a un resumen del día con acceso claro a la línea de tiempo y a cada área.
- **Hecha cuando:** el resumen responde "¿cómo está hoy mi mascota?" sin entrar a otra pantalla, y la línea de tiempo se puede filtrar.
- **Fase:** 2.

### U4. Registro rápido (botón +)
- **Qué:** reducir el menú a las 4 o 5 acciones más usadas (comida, agua, paseo, peso, nota) y mandar el resto a "Más".
- **Hecha cuando:** registrar una comida o un vaso de agua toma como máximo 2 toques y un dato.
- **Fase:** 2.

### U5. Un solo patrón de formulario
- **Qué:** hoy cada tipo de registro (ficha, higiene, medidas, novedad, veterinario, comida) tiene su propia pantalla con su propia lógica. Definir un patrón común: campos mínimos arriba, "detalles opcionales" plegados, vista previa y guardado.
- **Hecha cuando:** todos los registros usan el mismo componente de formulario y se agrega un tipo nuevo sin escribir una pantalla nueva.
- **Fase:** 2.

### U6. Onboarding
- **Qué:** primer uso guiado: crear cuenta, crear la mascota, hacer el primer registro. Los permisos de ubicación, cámara y notificaciones se piden **en el momento en que se necesitan**, con una frase que explica para qué, nunca todos al abrir.
- **Hecha cuando:** de la instalación al primer registro hay menos de 2 minutos y ningún permiso se pide sin contexto.
- **Fase:** 1.

### U7. Navegación y rutas
- **Qué:** revisar la barra inferior (Mi mascota, Inicio, Comunidad más el botón +), qué se abre como pantalla completa y qué como modal, el gesto de volver, y los enlaces profundos (por ejemplo, abrir un reporte desde una notificación).
- **Hecha cuando:** hay un mapa de navegación documentado, ningún flujo deja al usuario sin forma de volver, y los enlaces profundos abren la pantalla correcta.
- **Fase:** 1 y se ajusta en cada fase.

## A.2 Sistema visual y calidad percibida

### U8. Sistema de diseño
- **Qué:** convertir `src/lib/theme.ts` en tokens (colores, tipografía, espacios, radios, sombras) y construir los componentes base (botón, campo, tarjeta, lista, chip, modal) sobre ellos. Definir si habrá modo oscuro (hoy la app es solo clara).
- **Hecha cuando:** ninguna pantalla nueva usa colores ni tamaños escritos a mano, y existe una página de catálogo de componentes.
- **Fase:** 0 y 1.

### U9. Estados vacío, cargando, error y sin conexión
- **Qué:** cada pantalla debe tener los cuatro estados diseñados: vacío con una invitación a actuar, cargando con esqueleto, error con un botón de reintento y sin conexión con aviso claro de qué se guardará después.
- **Hecha cuando:** en cada pantalla migrada se puede forzar cada estado y se ve bien.
- **Fase:** todas.

### U10. Marca y nombre
- **Qué:** hoy hay tres nombres (AnimalApp en el repo, Animaapp en la app, `animaapp` en el paquete). Decidir el nombre definitivo, el ícono, la pantalla de arranque y el nombre en las tiendas.
- **Hecha cuando:** un solo nombre en `app.json`, el repo, los textos y las tiendas, y el ícono y el splash definitivos.
- **Fase:** antes de la Fase 8.

### U11. Textos y tono (es-CO)
- **Qué:** revisar todos los textos: tono cercano pero claro, mensajes de error que dicen qué hacer, y el aviso "no es diagnóstico veterinario" en cada recomendación de salud. Sacar los textos del código a archivos de idioma.
- **Hecha cuando:** no queda texto escrito dentro de componentes y un tercero revisó la redacción.
- **Fase:** 0 (estructura) y cada fase (contenido).

### U12. Accesibilidad
- **Qué:** zonas táctiles de al menos 44 px, contraste que cumpla WCAG AA, etiquetas para lectores de pantalla, tamaño de letra del sistema respetado y nada que dependa solo del color (por ejemplo, los tipos de reporte).
- **Hecha cuando:** pasa una revisión con TalkBack y con la letra del sistema al máximo, sin pantallas rotas.
- **Fase:** todas, con una revisión en la Fase 8.

### U13. Web responsive
- **Qué:** hoy la web es la app del celular estirada. Definir un ancho máximo, navegación para escritorio y una página de aterrizaje básica.
- **Hecha cuando:** se usa bien en celular, tableta y escritorio, y existe una landing con el encabezado "prototipo/demo educativo" mientras sea demo.
- **Fase:** 8 (el layout básico antes).

## A.3 Flujos principales

### U14. Mapa estilo aventura
- **Qué:** diseñar el estilo visual del mapa tipo Pokémon GO: paleta de AnimalApp, qué se oculta (comercios, etiquetas), cámara inclinada, edificios en 3D, avatar de la mascota, parques como islas y niebla en zonas sin explorar. Se diseña de forma visual con Maputnik y se aprueba antes de programar.
- **Hecha cuando:** hay un estilo aprobado en pantalla, corre fluido en un Android de gama media y muestra la atribución de OpenStreetMap.
- **Fase:** 3.

### U15. Flujo de paseo
- **Qué:** iniciar un paseo con un toque, objetivo opcional (no obligatorio), pausa, cronómetro visible con la pantalla bloqueada y un resumen final con XP, distancia y parque.
- **Hecha cuando:** un paseo completo se hace con 2 toques (iniciar y terminar) y el resumen aparece sin pasos extra.
- **Fase:** 3.

### U16. Recordatorios y permisos en contexto
- **Qué:** pedir permiso de notificaciones cuando el usuario crea su primer recordatorio, agrupar avisos, definir horas de silencio y permitir marcar "hecho" desde la notificación.
- **Hecha cuando:** un recordatorio de vacuna llega a tiempo, se puede marcar como hecho sin abrir la app y respeta las horas de silencio.
- **Fase:** 2.

### U17. Reporte de mascota perdida en pocos pasos
- **Qué:** crear un reporte en tres pasos como máximo (foto y datos, lugar y hora, publicar), con el modo emergencia más corto todavía. Compartir por **WhatsApp** (muy usado en Latinoamérica) con una imagen tipo cartel armada con los datos.
- **Hecha cuando:** un reporte de mascota perdida se publica en menos de 1 minuto y se comparte por WhatsApp con un toque.
- **Fase:** 5.

### U18. Privacidad visible en la comunidad
- **Qué:** que el usuario vea y controle qué se muestra: ubicación aproximada y no exacta, ningún teléfono ni dirección, y botones claros para denunciar y bloquear. Explicarlo en palabras simples antes de publicar.
- **Hecha cuando:** antes de publicar un reporte se muestra exactamente qué verá el resto, y se puede denunciar y bloquear desde cualquier tarjeta.
- **Fase:** 5.

### U19. Fotos
- **Qué:** guía de encuadre para el carnet y los empaques, recorte, indicador de subida y reintento, y galería por mascota. Hoy las fotos se pierden en Android (ver T9).
- **Hecha cuando:** una foto tomada sin señal queda visible de inmediato, se sube sola después y nunca desaparece.
- **Fase:** 2.

### U20. Carnet de salud exportable
- **Qué:** un carnet con vacunas, medicamentos y citas que se pueda compartir como imagen o PDF para llevar al veterinario, con alerta de vencimientos próximos y el aviso de que no es diagnóstico.
- **Hecha cuando:** se genera y se comparte un carnet legible desde el celular en menos de 3 toques.
- **Fase:** 2.

### U21. Varias mascotas y familia
- **Qué:** selector de mascota, y compartir una mascota con otra persona (familiar o paseador) con permisos de solo ver o de registrar. La base de datos ya lo contempla (`pet_members`); falta la pantalla.
- **Hecha cuando:** una persona invita a otra por enlace y la otra ve y registra en la misma mascota con el permiso asignado.
- **Fase:** 1 o 2.

### U22. Gamificación sana
- **Qué:** revisar el tono: hoy el ánimo de la mascota baja si pasan días sin cuidarla, y eso puede generar culpa. Mantener logros, misiones y niveles, sin castigos. Definir qué se celebra y cómo, sin interrumpir lo que el usuario está haciendo.
- **Hecha cuando:** hay una guía aprobada de tono y de qué eventos celebran, y la celebración nunca bloquea la pantalla más de 2 segundos.
- **Fase:** 4.

### U23. Perfil y ajustes
- **Qué:** nombre visible, notificaciones, privacidad, **exportar mis datos** y **borrar mi cuenta** desde la app (Google Play lo exige), versión y soporte.
- **Hecha cuando:** exportar y borrar funcionan de punta a punta y el borrado elimina datos y fotos.
- **Fase:** 1.

### U24. Pruebas de usabilidad y métricas
- **Qué:** probar con 5 personas que no conozcan la app y tareas guiadas (crear mascota, registrar comida, reportar una mascota). Definir métricas de éxito: tiempo hasta el primer registro, porcentaje de tareas completadas y dónde se traban.
- **Hecha cuando:** hay un informe por ronda de pruebas con los hallazgos priorizados y las correcciones hechas.
- **Fase:** al cierre de las fases 2, 3 y 5.

---

# Parte B: Aspectos técnicos para una app real de producción

## B.1 Datos y base de datos

### T1. Cliente de Supabase tipado
- **Qué:** generar los tipos de TypeScript desde el esquema (`npm run db:types`) y usarlos en todas las consultas. Prohibir `any`.
- **Hecha cuando:** un cambio de columna en la base rompe el typecheck en el código que la usa.
- **Fase:** 0.

### T2. Capa de datos y caché
- **Qué:** TanStack Query con caché persistida: claves ordenadas por feature, paginación por cursor, actualizaciones optimistas con rollback y errores visibles.
- **Hecha cuando:** la app abre sin red mostrando lo último que vio y ninguna pantalla trae toda una tabla de golpe.
- **Fase:** 0 y 1.

### T3. Escrituras sin conexión e idempotencia
- **Qué:** cola de escrituras pendientes que se reenvía sola al volver la red, con reintentos espaciados. Cada escritura lleva un `client_id` (UUID) único para que un reenvío no duplique el registro. Mostrar el estado de sincronización.
- **Hecha cuando:** en modo avión se registra un paseo, se vuelve a conectar y aparece una sola vez.
- **Fase:** 0 y 1.

### T4. Migraciones versionadas
- **Qué:** cada cambio de la base es una migración nueva en `supabase/migrations/`. Nunca se edita una ya aplicada. Se despliegan por CI.
- **Hecha cuando:** `npm run db:reset` reconstruye la base completa desde cero y la CI lo verifica.
- **Fase:** 0 (ya en marcha).

### T5. Modelo de datos normalizado
- **Qué:** reemplazar el JSON único por tablas (`pets`, `pet_events` y sus detalles, `places`, `reports`, etc.), con constraints, enums, índices y borrado lógico donde corresponda. Ver diagramas en el plan, sección 4.
- **Hecha cuando:** ningún dato de negocio queda guardado como texto libre dentro de un `jsonb` y el JSON de `app_data` desaparece.
- **Fase:** 1 a 5, tabla por tabla con cada pantalla.

### T6. RLS y pruebas de permisos
- **Qué:** seguridad por fila activada en **todas** las tablas, negando por defecto. Funciones auxiliares como `is_pet_member`. Cada política se prueba con pgTAP: "A no puede leer lo de B", "un `viewer` no puede escribir".
- **Hecha cuando:** toda tabla nueva trae sus políticas y sus tests, y la CI falla si una tabla pública queda sin RLS.
- **Fase:** desde la Fase 1.

### T7. Rendimiento de la base
- **Qué:** índices compuestos (`pet_id, occurred_at desc`), GiST para geografía y HNSW para vectores. Revisar con `EXPLAIN` las funciones críticas. Prueba de carga con datos sintéticos (por ejemplo 1 millón de eventos y 100.000 reportes).
- **Hecha cuando:** las consultas críticas responden en tiempo acordado con los datos de la prueba de carga.
- **Fase:** 5 y 8.

### T8. Backups y recuperación
- **Qué:** backups diarios, recuperación a un punto en el tiempo si el volumen lo justifica, y una **prueba real de restauración**. Definir cuánto dato y cuánto tiempo se puede perder.
- **Hecha cuando:** se restauró un backup en un entorno aparte y está documentado el procedimiento.
- **Fase:** 8.

## B.2 Autenticación, seguridad y privacidad

### T9. Fotos: almacenamiento y subida
- **Qué:** buckets privados de Supabase Storage con rutas por mascota o reporte, URL firmadas, compresión en el celular, **borrado de metadatos EXIF (incluido el GPS)**, límite de tamaño y limpieza de archivos huérfanos. Arregla de raíz la pérdida de fotos del demo.
- **Hecha cuando:** una foto se sube, se ve en otro dispositivo, no lleva ubicación en sus metadatos y se borra al borrar la cuenta.
- **Fase:** 2.

### T10. Autenticación completa
- **Qué:** verificación de correo, recuperar contraseña, contraseñas de 10 o más caracteres, CAPTCHA en el registro, límites de intentos, cerrar sesión en todos los dispositivos, y después Google y Apple.
- **Hecha cuando:** registro, ingreso, verificación y recuperación funcionan contra un proyecto real, y los límites de intentos están probados.
- **Fase:** 1.

### T11. Sesión en almacenamiento seguro
- **Qué:** hoy la sesión se guarda en AsyncStorage, que no está cifrado. Pasar el token a `expo-secure-store`.
- **Hecha cuando:** el token no aparece en claro en el almacenamiento de la app.
- **Fase:** 1.

### T12. Validación en los bordes
- **Qué:** validar con zod todo lo que entra (formularios y respuestas del servidor), y duplicar las reglas importantes en la base con `check` y límites de longitud.
- **Hecha cuando:** un dato inválido enviado directo a la API es rechazado por la base, aunque la app no lo mande.
- **Fase:** desde la Fase 1.

### T13. Seguridad de la app y de las dependencias
- **Qué:** seguir la guía OWASP para móviles: permisos mínimos, enlaces profundos validados, `service_role` nunca en la app, `npm audit` en la CI, lockfile revisado y política de actualización de paquetes. Incluye revisar los archivos de instrucciones para IA (`AGENTS.md`, `.claude/settings.json`) que ya generaron una alerta.
- **Hecha cuando:** la CI falla ante una vulnerabilidad alta, y los archivos de instrucciones fueron revisados y se decidió qué se queda.
- **Fase:** 0 y se mantiene.

### T14. Privacidad y cumplimiento legal
- **Qué:** Ley 1581 de Colombia (habeas data): consentimiento versionado, política de privacidad y términos publicados, exportar y borrar datos, retención mínima, y los formularios de la tienda (Data safety de Google Play).
- **Hecha cuando:** hay documentos legales publicados, los consentimientos se guardan con versión y fecha, y se superó la revisión de la tienda.
- **Fase:** 1 (consentimientos) y 8 (publicación).

### T15. Moderación y control de abuso
- **Qué:** límites de publicación por usuario, denuncias, bloqueos, ocultar reportes denunciados, y filtro básico de contenido en imágenes. Registro de auditoría de acciones de moderación.
- **Hecha cuando:** un reporte denunciado se oculta según una regla clara y un usuario no puede publicar sin límite.
- **Fase:** 5.

### T16. Atribución y licencias
- **Qué:** los datos de OpenStreetMap exigen mostrar "© OpenStreetMap contributors" en el mapa. Revisar también las licencias de las dependencias y de los conjuntos de imágenes para el reconocimiento por foto (varios son solo no comerciales).
- **Hecha cuando:** la atribución se ve en el mapa y hay una lista de licencias revisada.
- **Fase:** 3 y 6.

## B.3 Calidad y entrega

### T17. Pruebas automáticas
- **Qué:** cuatro niveles: unitarias de la lógica pura (ya hay 12 de `game.ts`), de componentes con Testing Library, de integración contra la base local y de punta a punta con Maestro para los flujos críticos (registro, primer registro, reporte).
- **Hecha cuando:** la CI corre los cuatro niveles y los flujos críticos tienen una prueba de punta a punta.
- **Fase:** crece en cada fase.

### T18. CI/CD
- **Qué:** además de lint, tipos, tests, export web y pgTAP (ya funcionan): build de EAS, despliegue de migraciones, protección de ramas, actualizaciones automáticas de dependencias y entornos separados.
- **Hecha cuando:** un cambio aprobado llega a un entorno de pruebas sin pasos manuales.
- **Fase:** 0 y 8.

### T19. Entornos y secretos
- **Qué:** tres entornos (local, desarrollo, producción; más prueba si hace falta) con variables por entorno y secretos en EAS y GitHub. Nunca claves en el repo.
- **Hecha cuando:** cambiar de entorno es cambiar una variable y no existe ninguna clave en el historial de git.
- **Fase:** 0 y 8.

### T20. Builds propios y actualizaciones
- **Qué:** build de desarrollo con EAS (Android), perfiles de `development`, `preview` y `production`, y actualizaciones sin pasar por la tienda con `expo-updates` por canales. Política de versiones del SDK.
- **Hecha cuando:** un APK propio está en el celular y un cambio de JavaScript llega sin reinstalar.
- **Fase:** 3 (necesario para mapa y GPS).

### T21. Rendimiento de la app
- **Qué:** listas largas con FlashList, imágenes con `expo-image` (caché en disco), evitar el store global que re-renderiza todo, cargar pantallas bajo demanda y fijar un presupuesto de tamaño del paquete web.
- **Hecha cuando:** la línea de tiempo con 1.000 registros se desplaza fluido en un Android de gama media y el paquete web no supera el presupuesto.
- **Fase:** 2 y 8.

### T22. Calidad de código y flujo de commits
- **Qué:** estructura por features (`src/features/<módulo>`), alias `@/`, lint estricto en el código nuevo, formato automático y un hook antes de cada commit (lint-staged). Convención de mensajes de commit.
- **Hecha cuando:** un commit con errores de lint o formato no se puede hacer, y el código nuevo no tiene avisos.
- **Fase:** 0.

### T23. Manejo de errores y registro
- **Qué:** terminar con los `.catch(() => {})` que tragan errores. Cada error se muestra al usuario con un mensaje útil o se registra. Límites de error en la interfaz y reporte a Sentry sin datos personales.
- **Hecha cuando:** ningún bloque de captura queda vacío (el lint lo exige) y los errores de producción llegan a Sentry.
- **Fase:** 0.

### T24. Observabilidad
- **Qué:** métricas de rendimiento de la app, registros de la base, alertas (errores, latencia, cuota) y una revisión de salud de los servicios.
- **Hecha cuando:** una alerta llega a Cristian o a Jim cuando suben los errores o se acerca un límite del plan.
- **Fase:** 8.

## B.4 Funciones del servidor y escala

### T25. Geografía y lugares
- **Qué:** PostGIS para ubicaciones y radios, importar parques y veterinarias de OpenStreetMap a `places`, función `reports_near`, y privacidad con ubicación aproximada del dueño. MapLibre con tiles vectoriales (ver la decisión en el plan).
- **Hecha cuando:** "reportes a menos de N km" y "parques cerca" responden con índice espacial y los datos reales de Bogotá.
- **Fase:** 3 y 5.

### T26. Notificaciones push
- **Qué:** guardar los tokens de dispositivo, una cola (`pgmq`) y una Edge Function que envía por lotes con el servicio de Expo, con preferencias del usuario y límites para no saturar.
- **Hecha cuando:** un reporte cercano genera un aviso a los dueños dentro del radio, respetando sus preferencias.
- **Fase:** 5.

### T27. Gamificación en el servidor
- **Qué:** mover las reglas de XP, niveles, logros y conquista de parques de `game.ts` a la base: registro de XP que no permite duplicados y cálculo en el servidor, de modo que no se pueda falsear. Los 12 tests actuales son la especificación.
- **Hecha cuando:** el XP y los logros salen del servidor y los mismos casos de `game.test.ts` pasan contra las funciones SQL.
- **Fase:** 4.

### T28. Reconocimiento por foto
- **Qué:** un proceso en Python que lee fotos de una cola, genera vectores (`pgvector`) y la base los compara. **Siempre devuelve los 3 mejores con una probabilidad, nunca una certeza.** Se evalúa con datos de licencia compatible y se versiona el modelo.
- **Hecha cuando:** hay una métrica medida (acierto entre los 3 primeros) con fotos de prueba y la pantalla nunca dice "este es tu perro".
- **Fase:** 6.

### T29. Escalabilidad
- **Qué:** dejar listos los mecanismos para crecer: paginación por cursor, colas para trabajos lentos, agregados mantenidos por triggers o tareas programadas, y más adelante réplicas, particionado y vistas materializadas. Presupuesto de costo por número de usuarios.
- **Hecha cuando:** la prueba de carga de T7 se repite con el volumen objetivo y cumple, y hay una tabla de cuándo activar cada mecanismo.
- **Fase:** 5 y 8.

## B.5 Producto y publicación

### T30. Textos en varios idiomas
- **Qué:** biblioteca de internacionalización con formatos de fecha, hora y plurales de `es-CO` y estructura para sumar países.
- **Hecha cuando:** agregar un idioma es agregar un archivo, sin tocar componentes.
- **Fase:** 0.

### T31. Analítica con consentimiento
- **Qué:** eventos de uso (embudos de registro y primer registro) con una herramienta como PostHog, solo si el usuario acepta, sin datos personales.
- **Hecha cuando:** se mide el tiempo hasta el primer registro y nada se envía sin consentimiento.
- **Fase:** 2.

### T32. Publicación en tiendas
- **Qué:** cuenta de Google Play, ficha, capturas, política de privacidad, firma de la app, pruebas internas y cerradas, y salida gradual. iPhone después.
- **Hecha cuando:** la app está en pruebas cerradas de Google Play con una revisión aprobada.
- **Fase:** 8.

### T33. Documentación técnica
- **Qué:** una nota por decisión importante (qué se decidió, por qué y qué alternativas se descartaron) en `docs/decisiones/`, diagramas al día, una guía para quien se suma al proyecto y pasos para resolver incidentes.
- **Hecha cuando:** una persona nueva corre la app, la base y los tests siguiendo solo la documentación.
- **Fase:** 0 y se mantiene.
