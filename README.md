# La biblioteca de los recuerdos

Prototipo académico de experiencia web transmedia inspirado en **El viaje de Chihiro**, **El castillo ambulante** y **Mi vecino Totoro**. Una biblioteca mágica conserva sus historias, pero las páginas de un libro se están borrando. La persona visitante explora tres mundos, recupera un recuerdo en cada uno y recompone el libro.

El contenido narrativo actual es provisional. Los textos, escenas y referencias visuales específicas de las películas se incorporarán después de investigar fuentes y seleccionar material con créditos adecuados. Esta base ya permite probar el recorrido completo.

## Recorrido

```text
/  Portada de la biblioteca
└── /archivo/chihiro  → recuperar UMBRAL
    └── /archivo/howl → recuperar CHISPA
        └── /archivo/totoro → recuperar SEMILLA
            └── libro completo / cierre
```

Cada capítulo presenta un ambiente visual, un objeto 3D interactivo y una página que vuelve a escribirse al recuperar su recuerdo. El siguiente capítulo se habilita después de guardar el anterior. El mismo resultado se puede alcanzar con el botón **Recuperar recuerdo**, alternativa accesible al canvas. El progreso se conserva en `localStorage` y, al configurar Firebase, también en Cloud Firestore asociado al usuario autenticado.

## Datos de las películas

Cada ruta `/archivo/[chapter]` consulta en el servidor la ficha correspondiente de [Studio Ghibli API](https://ghibliapi.dev/). Los IDs de las tres películas están en `data/chapters.js`; `lib/ghibli.js` hace la petición y selecciona los campos que usa la interfaz: título internacional y original, romanización, sinopsis, dirección, producción, año y duración. La ficha se muestra debajo del recuerdo con un enlace a la respuesta de origen. Los datos se revalidan cada 24 horas.

Si la API falla, la página sigue funcionando con una copia local de esos campos, identificada como **COPIA LOCAL**. La sinopsis se muestra en el inglés original de la API. Los enlaces `image` y `movie_banner` de la respuesta no se usan: las escenas, animaciones e imágenes del proyecto se agregarán manualmente con sus créditos.

## Referencias visuales

- Moodboard y concepto: `Tp- programacion3.pdf`, proporcionado para el proyecto por Agostina Brizuela y Sofía Villarreal.
- Dirección visual aplicada: biblioteca de madera oscura, luz cálida, verdes de bosque, detalles dorados, libro de papel envejecido y contraste entre interior y paisajes abiertos.
- Imagen de portada: ilustración original generada para este prototipo con ImageGen; archivo `public/images/biblioteca-original.png`. Prompt: “original magical library of memories, antique open book, old shelves, lanterns, arched window to blue sky and green hills; hand-painted fantasy storybook illustration; deep green, walnut, aged ivory and amber; no characters, text or recognizable copyrighted settings.”
- Paisajes de capítulos y recuerdos 3D: CSS y geometría procedural originales del proyecto. No incluyen fotogramas ni personajes de las películas.
- Tipografías: Libre Baskerville y DM Sans, servidas desde Google Fonts.

## Decisiones técnicas

- **Next.js App Router**: `app/page.js` para la portada y `app/archivo/[chapter]/page.js` para los capítulos. La ruta dinámica consulta la API como Server Component y genera metadata específica. `FilmDossier` presenta los datos en el servidor; `Experience` y `ThreeArtifact` son Client Components por su estado, navegación, WebGL y acceso al navegador. La ruta incluye un estado de carga mientras consulta la ficha.
- **Three.js directo**: cada objeto usa escena, cámara, renderer, geometrías, materiales e iluminación. El canvas responde al tamaño del contenedor, limita el pixel ratio a 2, anima con `requestAnimationFrame`, permite rotar con el puntero y detecta selección con raycasting. Al desmontarse libera geometrías, materiales, eventos y renderer.
- **Contenido editable**: los tres capítulos, textos, pistas, colores y motivos 3D se definen en `data/chapters.js`.
- **Persistencia**: `hooks/useProgress.js` gestiona modo local y sincronización con Firebase Auth y Firestore. `firestore.rules` limita los documentos `users/{uid}` y `progress/{uid}` a su propio usuario.
- **Accesibilidad**: botones de navegación y recuperación operables con teclado, etiquetas para el canvas, estado textual del recuerdo, foco visible y reducción de movimiento según preferencias del sistema.

## Instalación

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`. Para verificar: `npm run lint` y `npm run build`.

## Firebase opcional

Sin configuración, la experiencia funciona en modo **LOCAL**. Para sincronización:

1. Crear proyecto y Web App en Firebase.
2. Activar Authentication anónima, Google y email/contraseña.
3. Crear Cloud Firestore.
4. Copiar `.env.example` a `.env.local` y completar `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` y `NEXT_PUBLIC_FIREBASE_APP_ID`.
5. Integrar las reglas de `firestore.rules` con las reglas existentes del proyecto y publicarlas.
6. Reiniciar el servidor.

El indicador muestra **NUBE** cuando el progreso se sincroniza. Las variables `NEXT_PUBLIC_` son visibles para el cliente; la protección de datos depende de Authentication y de las reglas de Firestore.

## Próximos contenidos

- Elegir escenas y momentos de cada película, redactar los textos definitivos y justificar la relación entre objeto, interacción y recuerdo.
- Reemplazar los paisajes de base por imágenes propias o recursos con permisos y créditos completos.
- Completar el cierre narrativo, agregar audio si aporta al relato y preparar la presentación navegada.
- Publicar un deploy y añadir aquí su enlace antes de la entrega.

Proyecto inspirado en películas de Studio Ghibli con finalidad académica. Las marcas y obras pertenecen a sus titulares; esta base usa ilustración y geometría originales.
