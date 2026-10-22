# Recursos visuales del rediseño

Las ilustraciones de este rediseño se generaron con la herramienta integrada de ImageGen para acompañar el tablero de diseño **La biblioteca de los recuerdos**. El tablero se usó como referencia de composición, color y materiales. Estos archivos son recursos del prototipo académico, no fotogramas oficiales.

## Escenarios

| Película | Archivo | Contenido del prompt |
| --- | --- | --- |
| El viaje de Chihiro | `public/images/scenes/chihiro-bathhouse.png` | Casa de baños japonesa de varios pisos, puente rojo, cerezos, faroles, cielo azul y luz cálida. |
| El castillo ambulante | `public/images/scenes/howl-castle.png` | Castillo caminante en colinas verdes, cielo azul con nubes suaves, flores y paisaje amplio. |
| Mi vecino Totoro | `public/images/scenes/totoro-forest.png` | Sendero en bosque japonés de árboles grandes, luz filtrada, vegetación y señal rural sin texto. |
| Mi vecino Totoro | `public/images/scenes/totoro-character.png` | Figura gris y amable de Totoro, cuerpo completo y fondo transparente, para superponer en el bosque. |

**Indicaciones visuales comunes para los escenarios:** ilustración narrativa de fondo panorámico 3:2; acuarela y gouache pintados a mano, contornos de tinta fina, grano de papel, pinceladas imperfectas, colores cálidos ligeramente desaturados. Se pidió que el paisaje funcionara también recortado en un panel vertical y en una miniatura arqueada. Sin texto, marcos, interfaz, marcas de agua, fotorrealismo ni modelado 3D.

## Objetos independientes

| Recuerdo | Archivo | Contenido del prompt |
| --- | --- | --- |
| Máscara de Sin Cara | `public/images/memories/chihiro/mascara-sin-cara.png` | Máscara marfil alargada, ojos y boca negros, marcas violetas. |
| Cinta de Zeniba | `public/images/memories/chihiro/cinta-zeniba.png` | Cinta violeta hecha a mano con flores bordadas y pequeños brillos. |
| Haku | `public/images/memories/chihiro/haku.png` | Dragón de río blanco, cuerpo serpenteante y melena verde, completo. |
| Calcifer | `public/images/memories/howl/calcifer.png` | Pequeño espíritu de fuego naranja con rostro expresivo. |
| Perilla mágica | `public/images/memories/howl/perilla-magica.png` | Selector circular antiguo de cuatro colores con borde de latón. |
| Pendiente de Howl | `public/images/memories/howl/pendiente-howl.png` | Pendiente vertical de gema verde y detalles dorados. |
| Bellotas | `public/images/memories/totoro/bellotas.png` | Tres bellotas con tapas texturadas y hojas de roble. |
| Paraguas | `public/images/memories/totoro/paraguas.png` | Paraguas antiguo rojo coral con mango curvo y gotas. |
| Totoro pequeño | `public/images/memories/totoro/totoro-pequeno.png` | Pequeña criatura blanca del bosque, cuerpo completo. |

**Indicaciones visuales comunes para cada objeto:** un solo sujeto por archivo, centrado con márgenes suficientes, acuarela y gouache con tinta marrón delicada, textura de pigmento y colores suaves; PNG con transparencia real. Sin escena, papel, rectángulo de fondo, marco, texto, marca de agua, fotografía ni render 3D. Haku y el pendiente recibieron una segunda instrucción de extracción de fondo para conservar únicamente el objeto sobre alfa transparente.

## Materiales hechos en código

- `public/images/ornaments/botanical-corner.svg`: rama, hojas y flores para las esquinas de las páginas.
- `public/images/ornaments/paper-grain.svg`: grano discreto para el papel.
- `app/story-redesign.css`: tapa, grosor de hojas, pliegue, sombra, marcos y animaciones suaves.

Las escenas y objetos se sirven mediante `next/image` con tamaños responsivos. Las fuentes originales PNG quedan en `public/images`; el navegador recibe versiones dimensionadas por Next.js. Las ilustraciones pueden sustituirse por material definitivo cuando se cierre la investigación narrativa y de derechos de uso.
