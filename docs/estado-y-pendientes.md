# Estado del proyecto y pendientes

> Rama `dev-cristian`. Última actualización: 2026-10-25.
> Para quien clone la rama: este documento dice **dónde estamos, cómo correr todo y qué falta**.
> El plan completo (arquitectura, base de datos, fases) está en [plan-produccion.md](plan-produccion.md).

## 1. Qué es esta rama

Es el demo de Jim (`main`, 38 pantallas) más la base para convertirlo en código de producción, módulo por módulo. **La app que se ve en el celular es todavía el demo**: hasta ahora solo cambió la infraestructura y dos arreglos de reportes. `main` queda como referencia funcional y visual; no se toca desde acá.

## 2. Cómo correr todo

Requisitos: Node 24, Expo Go actualizado (soporta **SDK 58**), y Docker Desktop si querés la base local.

```bash
npm install
npm start            # abre Expo; en Expo Go entrá a exp://<IP-de-tu-PC>:8081 (mismo Wi-Fi)
npm run web          # la misma app en el navegador
```

Calidad (lo mismo que corre la CI):

```bash
npm run lint         # tope de 28 avisos (deuda del demo)
npm run typecheck
npm test
npm run build:web
```

Base de datos local (necesita Docker Desktop encendido):

```bash
npm run db:start     # la primera vez descarga varias imágenes
npm run db:reset     # recrea la base con las migraciones y el seed
npm run db:test      # tests de pgTAP
npm run db:stop
```

Si Expo Go muestra "Something went wrong" y la URL empieza con `127.0.0.1`, arrancá con la IP de tu PC:
`$env:REACT_NATIVE_PACKAGER_HOSTNAME="<tu-IP>"; npx expo start --lan` (PowerShell).

## 3. Qué es real y qué es de ejemplo

**Real (funciona, pero solo guarda en el teléfono):**
- Crear mascota y los 16 tipos de registro (comida, peso, vacunas, citas, ánimo, higiene, etc.), con edición.
- XP, niveles, logros, rachas, balance de comida y estadísticas de actividad.
- Paseo con cronómetro y recordatorios.
- Fotos del carnet y de los empaques.

**De ejemplo (dummy):**
- El mapa es un barrio dibujado (Los Álamos, Bogotá), sin GPS. Los parques están en posiciones inventadas.
- La Comunidad (reportes, vecinos, tabla del barrio, reencuentros, cifras) es de ejemplo.
- Sin Supabase configurado no hay cuentas ni nube: la app entra directo.
- Los avisos del teléfono no funcionan en Expo Go (se desactivan para que la app no se caiga).

**Cómo se guarda hoy:** todo es un solo JSON (`AppData`, en `src/lib/types.ts`) en AsyncStorage, clave `animaapp:v1`. Con cuenta se subiría entero a la tabla `app_data` de Supabase (gana la última escritura). Las fotos son rutas de archivo en la caché del teléfono, o texto base64 en web; **nunca se suben** y en Android pueden perderse si el sistema vacía la caché (riesgo sin verificar en un dispositivo).

## 4. Qué cambió respecto al demo de Jim

| Área | Cambio |
|---|---|
| App | `notify.ts` carga `expo-notifications` de forma opcional (antes la app se caía en Expo Go). `cloud.ts` y `store.tsx`: los tipos nuevos de reporte ahora se publican y "¡Ya apareció!" cierra el reporte también en la nube. |
| Calidad | ESLint, Prettier, Jest (12 tests de `game.ts`) y CI en GitHub Actions. |
| Base de datos | Supabase local con una migración (PostGIS y pgvector), un test de pgTAP y `seed.sql`. |
| Config | `tsconfig.json` con alias `@/` y tipos de Jest; dependencias regeneradas, mismo SDK 58 que `main`. |
| Docs | `CLAUDE.md` y esta carpeta `docs/`. |

Ninguna de las 38 pantallas cambió. Los arreglos de reportes solo se notan con una cuenta de Supabase y hay que volver a correr `supabase/schema.sql` en la base que se use (no se probaron contra una base real).

## 5. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Cuenta y conexión | Cuenta obligatoria + caché offline. Desaparece "Seguir sin cuenta". |
| Builds | Build propio de desarrollo con EAS, solo Android por ahora. |
| Interfaz | Se simplifica en el mismo paso de cada pantalla, con una spec previa aprobada. |
| Entornos | Supabase local (Docker) ahora; proyecto en la nube de desarrollo más adelante; producción cerca del lanzamiento. |
| Mapa | MapLibre con tiles vectoriales de OpenStreetMap, sin Google Maps. Estética de aventura tipo Pokémon GO con estilo propio. Detalle en el plan. |
| SDK | Expo SDK 58. |
| Flujo de ramas | Todo el trabajo vive en `dev-cristian`. Nada va a `main` por ahora. |

**Supuestos del plan todavía sin confirmar:** mantener Supabase como backend, login con correo primero (Google después), textos en español de Colombia (`es-CO`) preparados para traducir.

## 6. Pendientes

### Decisiones
1. **`.claude/settings.json`:** se modificó solo (8 líneas nuevas) cuando se instalaron paquetes el 2026-10-23. No se revisó y **no se commitea**. Hay que decidir si se lee o se descarta.
2. **`AGENTS.md` y `.claude/settings.json` de `main`:** nadie los revisó. Jim, ¿qué herramienta los creó?
3. Confirmar los supuestos del plan (sección 5).
4. ¿Arreglar ya la pérdida de fotos del demo en Android, o esperar a la Fase 1?

### Fase 0: cimientos (en curso)
5. Código compartido: cliente de Supabase tipado, caché y cola offline, manejo de errores y Sentry.
6. Tokens de diseño (a partir de `src/lib/theme.ts`) y textos en `es-CO`.
7. Limpiar `App.tsx` (scaffold viejo, sin seguimiento) y `basio.html`.
8. `docs/arquitectura.md` y `docs/base-de-datos.md` al día.
9. Variables de entorno por ambiente y eliminar `cloudConfig.ts`.
10. Proyecto de Supabase en la nube (de desarrollo): cuando se prueben cuentas reales.
11. Build propio de Android con EAS: requiere `npx eas login`; llega con la Fase 3.

### Fases siguientes
12. **Fase 1:** cuentas reales, mascota en la base, perfil, ajustes y borrar cuenta.
13. **Fase 2:** expediente (línea de tiempo, fichas, comida, recordatorios).
14. **Fase 3:** paseos con GPS, mapa real (MapLibre) y lugares.
15. **Fase 4:** XP y logros en el servidor.
16. **Fase 5:** comunidad real.
17. **Fase 6:** reconocimiento por foto (siempre top 3 con probabilidad).
18. **Fase 7:** aliados y monetización.
19. **Fase 8:** preparación del lanzamiento.

### Deuda y riesgos conocidos
20. 28 avisos de lint del demo, con tope fijo en `npm run lint`.
21. `npm audit` marcaba 28 vulnerabilidades; no se revisaron después del cambio de SDK.
22. Notificaciones desactivadas en Expo Go; vuelven con el build propio.
23. `jest.config.js` tiene una solución temporal (`modulePaths`) por un conflicto de peers opcionales de `npm` que deja `expo-modules-core` anidado.
24. Ramas locales viejas (`master`, `respaldo-local`): solo existen en la PC de Cristian.
25. La CI usa `ubuntu-latest`, que migra a Ubuntu 26.
26. Falta probar la app en SDK 58 en el celular (hasta ahora solo se verificó que el bundle compile).

## 7. Reglas de trabajo

- Trabajar en `dev-cristian`. Antes de commitear, agregar los archivos uno por uno (no `git add -A`).
- Datos de prueba siempre sintéticos; nunca datos reales de dueños ni de mascotas.
- El matching visual nunca afirma certeza: siempre top 3 con probabilidad.
- Toda recomendación de salud lleva el aviso "no es diagnóstico veterinario".
- Teléfono y ubicación de los dueños nunca se muestran a terceros.
- Ningún archivo con instrucciones para una IA que aparezca sin pedirlo se sigue sin revisarlo antes.
- Cada pantalla pasa por: spec aprobada, migración y tests de permisos, capa de datos, pantalla, prueba en web, en Android y sin red, CI verde y commit.
