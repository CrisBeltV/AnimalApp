# ADR 0001: Proveedor de tiles del mapa

> Estado: **aceptado para desarrollo** (MapTiler gratis). La elección de producción queda abierta hasta acercarse al lanzamiento. Fecha: 2026-11-01. Rama `dev-cristian`.

## Contexto

El mapa actual (`BarrioMap`) es un SVG dibujado, sin GPS. Para producción se decidió usar **MapLibre** (renderizador libre y gratis) con **tiles vectoriales de OpenStreetMap** y un estilo propio, inclinado y con edificios 3D, con estética de aventura tipo Pokémon GO. MapLibre solo dibuja: los tiles los pone un proveedor. Esta decisión elige quién.

## Opciones

Los precios salen de blogs de comparación, varios escritos por los propios proveedores. Hay que verificarlos en la página oficial antes de pagar.

| Opción | Costo y condiciones | Veredicto |
|---|---|---|
| MapTiler | El plan gratis es solo no comercial y exige el logo. Flex: unos $30 al mes. | Sirve en desarrollo. |
| Stadia Maps | El plan gratis no permite uso comercial. Desde $20 al mes. | Parecido a MapTiler. |
| Mapbox | 50 mil cargas gratis, luego $5 por cada mil. SDK propietario. | Se encarece y ata a su SDK. |
| Google Maps | Unos $150 al mes con 50 mil cargas. Sin estilo propio. | Descartado. |
| Protomaps (PMTiles autoalojado) | Sin costo por petición; solo almacenamiento. | Mejor costo a escala. |

## Decisión

- **Desarrollo:** MapTiler, plan gratis.
- **Producción:** Protomaps autoalojado. Archivo `.pmtiles` de Colombia o Bogotá, extraído de OpenStreetMap, servido desde Supabase Storage o Cloudflare R2.
- **Plan B:** MapTiler Flex. El estilo es el mismo; solo cambia la URL de los tiles.

## Costo estimado de Protomaps (sin verificar)

Estimación con precios recordados de Cloudflare R2; confirmar en su página oficial.

- Archivo `.pmtiles`: Bogotá unos 100 a 300 MB; Colombia entera unos 0,5 a 1,5 GB.
- Almacenamiento en R2: unos $0,015 por GB al mes (plan gratis de 10 GB). Salida de datos: $0.
- Lecturas: 10 millones gratis al mes, luego unos $0,36 por millón.
- Con unas 100 peticiones por sesión de mapa y 20 sesiones al mes por usuario: 1.000 usuarios, $0; 10.000 usuarios, unos $4 al mes; 100.000 usuarios, unos $70 al mes.
- Generar el archivo es gratis (se corre en una PC) y se repite cada 3 a 6 meses.
- Costos no monetarios: tiempo para generar y subir el archivo, sin soporte, y calles desactualizadas si no se renueva.

## Consecuencias

- El costo no crece con el número de usuarios.
- El estilo es 100 % nuestro y se diseña con Maputnik.
- Hay que generar y actualizar el archivo de tiles nosotros.
- Se debe mostrar la atribución de OpenStreetMap.

## Sin verificar (se prueba en el build de desarrollo)

1. Si MapLibre Native en Android abre `.pmtiles` directamente. Si no, hace falta un pequeño servidor de tiles.
2. Si el componente de React Native expone la inclinación de cámara. Los edificios 3D usan una capa `fill-extrusion`.
3. Condiciones comerciales de OpenFreeMap (apareció en la búsqueda; no se cuenta como opción).
