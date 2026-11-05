# La biblioteca de los recuerdos

Experiencia web narrativa para Programación III con Next.js, Three.js y Firebase. Un libro mágico conecta tres historias: **El viaje de Chihiro**, **El castillo ambulante** y **Mi vecino Totoro**. Cada una tiene un minijuego, un objeto recuperado y una respuesta personal que restaura una página del libro.

## Estado actual

- `/`: biblioteca ilustrada y libro 3D de Three.js.
- `/biblioteca`: presentación dentro del libro 3D. La página siguiente abre el índice.
- `/biblioteca/indice`: índice interactivo con los tres capítulos y sus estados. Un señalador permite volver desde cualquier capítulo y abrir los recuerdos completados.
- `/recuerdos/chihiro`, `/recuerdos/howl` y `/recuerdos/totoro`: páginas ilustradas dentro de la misma instancia del libro. Las flechas giran hojas tridimensionales y cada URL restaura su capítulo al recargar.
- `/recuerdos/chihiro/experiencia`: rompecabezas de cuatro piezas dentro del mismo libro. Admite arrastre con mouse o toque y selección accesible de pieza y espacio.
- `/recuerdos/chihiro/objeto`: boleto recuperado, pregunta y guardado de la respuesta personal dentro del libro.
- `/recuerdos/chihiro/restaurado`: primera página restaurada, con boleto y respuesta escrita con animación de tinta. `/biblioteca?pagina=chihiro` redirige allí.
- `/recuerdos/howl/experiencia`: exploración del escritorio, llave, caja y carta. La carta recuperada abre `/objeto`; la respuesta guardada abre `/restaurado`, donde el sobre puede consultarse de nuevo.
- `/recuerdos/totoro/experiencia`: lluvia y luz hacen crecer un árbol. Al tomar la hoja se abre `/objeto`; la respuesta guardada abre `/restaurado`.
- `/final`: última doble página del mismo libro, desbloqueada únicamente al guardar los tres recuerdos. Se puede volver al índice sin borrar el progreso.

Los nueve minijuegos anteriores no están en la navegación. Sus rutas antiguas redirigen a la portada de la película. Los archivos se conservan como referencia y los datos históricos permanecen separados.

## Datos y guardado

`data/chapterExperiences.js` define las tres historias nuevas. `lib/storyProgress.js` y `hooks/useStoryProgress.js` calculan el progreso de tres capítulos y guardan las respuestas en una clave local nueva. Con Firebase configurado, el documento privado es `storyProgress/{uid}`; `firestore.rules` limita el acceso al usuario autenticado. Por película se registran inicio, juego completado, objeto recuperado, respuesta, página restaurada y fecha de actualización. Los campos antiguos de `progress/{uid}` no se leen para completar el recorrido nuevo.

La autenticación existente admite acceso anónimo, Google y email/contraseña. Sin `.env.local`, el sitio funciona con guardado local. Para activar Firebase, completá las variables de `.env.example`, habilitá los proveedores de Authentication y publicá `firestore.rules` en tu proyecto.

## Red de recuerdos

`/red-recuerdos` abre una nueva doble página del mismo libro. El índice y el señalador lateral llevan allí con el paso de página existente. Cada página restaurada ofrece compartir el texto voluntariamente; guardarlo en privado nunca lo publica. La red requiere Firebase configurado y una sesión, incluso anónima.

Las publicaciones viven en `sharedMemories` sin UID ni correo. La relación entre autor y publicación está en `sharedMemoryOwners/{uid}/items/{pelicula}`, accesible solo al dueño. Se permite una publicación activa por película y usuario. La lectura pública consulta únicamente documentos con `status: "published"`; los nuevos nacen con `status: "pending"`. El autor puede editar nombre público y texto, o retirar la publicación sin borrar su respuesta privada en `storyProgress/{uid}`.

**Revisión antes de abrir la red al público:** un responsable revisa en la consola de Firebase las entradas `sharedMemories` con `status: "pending"` y los reportes en `sharedMemoryReports/{uid}/items`. Si aprueba una entrada, cambia su estado a `published` con permisos administrativos; si recibe un reporte fundado, cambia el estado a `hidden` y decide si corresponde retirarla. Las reglas bloquean cambios de estado desde el cliente y restringen creación, edición y borrado a cada autor. Publicá y verificá `firestore.rules` antes de habilitar Firebase para visitantes; el código local sin credenciales muestra la red como no disponible. Para un lanzamiento público también conviene activar App Check y definir responsables y tiempos de revisión.

La ficha de archivo `/archivo/[chapter]` consulta [Studio Ghibli API](https://ghibliapi.dev/) mediante `lib/ghibli.js`; si falla la consulta usa los datos locales. Las páginas narrativas del libro utilizan textos breves adaptados a esta experiencia. Las ilustraciones y animaciones narrativas se integran manualmente.

## Recursos visuales

Las imágenes nuevas de las tres películas están en `public/images/experiences/`. Se generaron para este proyecto y se optimizaron a WebP. Los recursos y sus prompts están en [docs/etapa-c-recursos.md](docs/etapa-c-recursos.md).

La navegación y la animación del libro de la etapa A se describen en [docs/etapa-a-navegacion-libro.md](docs/etapa-a-navegacion-libro.md).

## Ejecutar y verificar

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
npm run lint
npm run build
```

Proyecto académico inspirado en universos de Studio Ghibli. Sus obras y marcas pertenecen a sus titulares; esta base usa ilustraciones y geometría originales.
