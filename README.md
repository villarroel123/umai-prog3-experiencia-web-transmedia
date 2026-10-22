# La biblioteca de los recuerdos

Base navegable de una experiencia web transmedia para Programación III, inspirada en **El viaje de Chihiro**, **El castillo ambulante** y **Mi vecino Totoro**. Una biblioteca conserva sus historias en un libro mágico; nueve recuerdos perdidos deben regresar para completar sus tres capítulos.

## Recorrido implementado

```text
/                                  Intro existente con libro 3D en Three.js
└── /biblioteca                    Índice de los tres capítulos dentro de un libro abierto
    ├── /recuerdos/chihiro         Capítulo y tres objetos por recuperar
    ├── /recuerdos/howl            Capítulo y tres objetos por recuperar
    └── /recuerdos/totoro          Capítulo y tres objetos por recuperar
        └── /recuerdos/[pelicula]/[objeto]  Plantilla de los nueve ejercicios

/final                             Cierre sellado hasta recuperar los nueve recuerdos
/archivo/[chapter]                Prototipo anterior, conservado como referencia
```

El botón **Comenzar** estabiliza el libro original, acerca la cámara, pasa dos hojas flexibles y revela el índice sobre las páginas del mismo modelo 3D. El canvas permanece montado al navegar entre `/` y `/biblioteca`; desde el índice, **Inicio** invierte el movimiento. La entrada directa a `/biblioteca` muestra el libro en posición de lectura. En celular se puede enfocar una página por vez. Cada capítulo muestra un escenario pintado, tres recuerdos ilustrados y su progreso. Cada recuerdo abre la misma plantilla reutilizable: **Comenzar ejercicio** lo deja *en curso* y **Simular resolución correcta** lo registra como *recuperado*. Esta simulación está identificada en pantalla como modo de desarrollo; los desafíos reales quedan para la siguiente etapa. La vista de recuperación ilumina el objeto, muestra partículas, su nombre y una frase narrativa. Se puede repetir la prueba sin perder lo recuperado.

El libro indica los recuerdos recuperados en cada película y en total. Un capítulo se marca reconstruido cuando alcanza 3/3. `/final` muestra el estado sellado hasta alcanzar 9/9; entonces presenta los tres capítulos completos, la animación de aparición y el texto final provisional.

## Contenido y arquitectura

- `data/memories.js`: definición central de las tres películas y los nueve recuerdos, con identificador, título, descripción, tipo de interacción, instrucción, frase narrativa y estado inicial.
- `lib/memoryProgress.js`: normalización y cálculo de estados, progreso por película, progreso total y desbloqueo del final.
- `hooks/useMemoryProgress.js`: estado compartido por las pantallas, guardado local y sincronización con Firebase Auth y Firestore. Reutiliza la autenticación existente de `hooks/useProgress.js`.
- `components/StoryExperience.js`: navegación, indicador global, estado del guardado y acceso a la cuenta.
- `components/BookJourney.js`: capa persistente de las rutas `/` y `/biblioteca`, estado de la transición y cambio de página móvil.
- `components/LibraryIndex.js`, `ChapterView.js`, `MinigameView.js`, `MemoryRecovered.js` y `FinalView.js`: las vistas del recorrido. El rediseño de las primeras cuatro está en `app/story-redesign.css`; `app/story.css` mantiene las reglas compartidas y el final.
- `app/biblioteca`, `app/recuerdos/[pelicula]`, `app/recuerdos/[pelicula]/[objeto]` y `app/final`: rutas App Router. Las rutas inválidas muestran una página para volver al libro.

`components/BookScene.js` conserva el libro y el atril originales. La misma instancia Three.js anima la cámara entre reposo y lectura, curva dos hojas subdivididas durante el giro y proyecta los límites de cada página en la pantalla. `app/book-journey.css` coloca el índice HTML interactivo sobre esas caras proyectadas; no dibuja un segundo libro. El encuadre se recalcula con el tamaño del canvas y la selección de página móvil. La escena libera sus recursos al salir de estas rutas. La imagen `public/images/biblioteca-intro.png` aporta la atmósfera de la biblioteca. Los capítulos y recuerdos conservan sus ilustraciones y páginas CSS; los recursos se documentan en `docs/visual-assets.md`.

## Datos de películas

Los capítulos nuevos y el prototipo anterior consultan [Studio Ghibli API](https://ghibliapi.dev/) mediante `lib/ghibli.js`. La ficha presenta título, año y dirección; si falla la API, se usan los datos locales de `data/chapters.js`. La respuesta se revalida cada 24 horas. Las imágenes y animaciones narrativas se incorporarán manualmente tras investigar las escenas y sus créditos.

## Persistencia y acceso

Sin `.env.local`, el progreso se guarda en `localStorage` y la interfaz muestra **Guardado local**. Con Firebase configurado, la autenticación existente admite invitado anónimo, Google y email/contraseña. Los recuerdos se guardan en `progress/{uid}.memories` de Cloud Firestore, separados por usuario. El estado local y el de Firestore se fusionan conservando el estado más avanzado; cada recuerdo puede estar pendiente, en curso o recuperado. La interfaz muestra si el guardado está en la nube o si funciona sin conexión. Las reglas existentes de `firestore.rules` limitan `users/{uid}` y `progress/{uid}` al usuario autenticado.

Para configurar Firebase:

1. Crear un proyecto y una Web App en Firebase, activar Authentication anónima, Google y email/contraseña, y crear Cloud Firestore.
2. Copiar `.env.example` a `.env.local` y completar las variables `NEXT_PUBLIC_FIREBASE_*` indicadas allí.
3. Revisar e integrar `firestore.rules` con las reglas existentes del proyecto y publicarlas.
4. Reiniciar el servidor.

Las variables `NEXT_PUBLIC_` son visibles para el cliente; la protección de documentos depende de Firebase Authentication y de las reglas de Firestore.

## Diseño y accesibilidad

El índice se presenta sobre el libro 3D físico con tapa, hojas apiladas, pliegue central y tres ilustraciones de películas. Cada capítulo y recuerdo combina un paisaje propio con una página de papel envejecido. Las nueve ilustraciones de objetos son archivos independientes con fondo transparente. `next/image` adapta sus tamaños y entrega formatos modernos. El diseño se adapta a móvil, permite navegar con teclado, muestra el foco visible y respeta `prefers-reduced-motion`. Si falla WebGL, el índice conserva su presentación HTML/CSS como alternativa. La arquitectura de los ejercicios permite añadir controles accesibles junto a cada mecánica definitiva.

Referencias visuales: el moodboard de `Tp- programacion3.pdf`, el tablero de diseño adjunto y las imágenes de biblioteca, libros y atril aportadas para el proyecto. Las escenas y objetos del rediseño son ilustraciones generadas para este prototipo, inspiradas en los mundos y personajes indicados en el tablero; no son fotogramas oficiales.

## Ejecutar y verificar

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`. Para revisar el código y la compilación: `npm run lint` y `npm run build`.

## Próxima etapa

Investigar escenas y objetos de cada película, redactar la narrativa definitiva y sustituir las nueve simulaciones por mecánicas propias: identificar silueta, ordenar secuencia, reconstruir imagen, encender chimenea, girar perilla, encontrar parejas, hacer crecer árbol, completar escena y seguir personaje. La estructura común ya registra el resultado de cualquiera de ellas. También podrán ampliarse las escenas visuales y las transiciones del libro.

Proyecto académico inspirado en películas de Studio Ghibli. Sus obras y marcas pertenecen a sus titulares; esta base utiliza una ilustración y geometría originales.
