# Nuevo recorrido · Estado de implementación

El flujo vigente sigue el tablero: **película → minijuego → objeto → pregunta → guardar → libro**. El boleto de Chihiro funciona completo. Howl y Totoro conservan su portada y esperan la revisión de Chihiro antes de desarrollar sus juegos.

## Reutilizado y desacoplado

| Componente | Estado |
| --- | --- |
| `BookScene`, `BookJourney` | Libro Three.js e índice conservados. La página de Chihiro se proyecta sobre el mismo libro. |
| `LibraryIndex`, `ChapterView`, `StoryExperience` | Adaptados a tres experiencias, una por película. Las portadas no anticipan el objeto ni la pregunta. |
| `lib/ghibli.js` | Conserva título, año y dirección desde la API. |
| `useProgress` | Conserva autenticación anónima, Google y email. |
| `useStoryProgress`, `lib/storyProgress` | Nuevo progreso separado en `storyProgress/{uid}` y `biblioteca-tres-recuerdos-v1`. Un capítulo solo se considera restaurado cuando tiene juego completo y respuesta guardada. |
| `MinigameView`, `useMemoryProgress`, `data/memories.js` | Código histórico retenido sin enlaces en el recorrido nuevo. Las antiguas rutas de objeto redirigen al capítulo. Sus datos no cuentan para el final. |

## Chihiro

- La portada introduce el viaje y abre `/recuerdos/chihiro/experiencia`.
- El boleto se arma con cuatro piezas de la misma ilustración. Se pueden arrastrar en escritorio o seleccionar y colocar con clic, toque o teclado. Los aciertos parciales persisten al recargar.
- La pregunta aparece tras la revelación del objeto. El borrador se conserva localmente hasta guardar.
- La respuesta se guarda en el estado nuevo y se ve escrita en la página de Chihiro en `/biblioteca?pagina=chihiro`. Se puede omitir la animación de tinta.
- La portada, el índice y el final usan **3 recuerdos en total**. El final permanece sellado hasta que los tres capítulos tengan juego y respuesta.

## Recursos integrados

Los siguientes recursos se generaron con la herramienta de imágenes incorporada y se optimizaron a WebP. Son ilustraciones originales para este proyecto:

| Archivo | Uso | Prompt final resumido |
| --- | --- | --- |
| `public/images/experiences/chihiro/tren-atardecer.webp` | Portada, revelación y página del libro | Tren japonés antiguo sobre una llanura inundada al atardecer, reflejos cálidos, colinas distantes, acuarela y gouache narrativos, 16:9, sin texto ni personajes. |
| `public/images/experiences/chihiro/mesa-del-boleto.webp` | Fondo del rompecabezas | Mesa de madera gastada en estación junto al agua, farol encendido, papeles en las esquinas, tren y reflejos desenfocados al fondo, 16:9, centro despejado, acuarela cálida, sin boleto impreso ni texto. |
| `public/images/experiences/chihiro/boleto-recuperado.webp` | Piezas, objeto y libro | Boleto ferroviario antiguo de frente, papel crema envejecido, bordes gastados, ornamentos verde bosque, flores y tren pintado, centro vacío para texto HTML, fondo transparente, sin letras ilegibles. |

Las cuatro piezas del juego se recortan visualmente de un único boleto por CSS, por lo que siempre reconstruyen el mismo objeto sin saltos entre imágenes.

## Recursos pendientes para las siguientes etapas

- **Howl:** panorama 16:9 de habitación mágica con escritorio, papeles, lámpara, caja cerrada y llave; caja abierta y cerrada, llave, sobre floral con sello de cera y carta desplegada, objetos aislados con transparencia, ilustración de página. Prompt: *Hand-painted watercolor and gouache storybook interior, warm old wooden desk, books, papers, brass lamp, ornate small box and hidden key, soft candlelight, forest green and parchment palette, wide 16:9, interactive zones unobstructed, no text or watermark.*
- **Totoro:** panorama 16:9 de bosque frondoso con planta central, capas de nube, lluvia, luz, planta en etapas, árbol y hoja transparente, ilustración de página. Prompt: *Hand-painted watercolor forest at morning light, lush trees, flowers and a small sprout at center, gentle sunbeams and rain cloud, warm green storybook palette, wide 16:9, separable visual layers, no text or watermark.*
- **Libro completo:** ilustraciones de la segunda y tercera página, estados desvanecido y restaurado. La primera página usa el paisaje y boleto ya integrados.

La configuración de Firebase no está incluida en el repositorio. El guardado en Firestore requiere configurar `.env.local` y publicar la nueva regla de `storyProgress/{uid}`; sin ella, el recorrido se guarda localmente.
