# Etapa C: recursos e integración

Los recursos de Howl y Totoro se generaron con la herramienta integrada de generación de imágenes y se optimizaron a WebP con `scripts/prepare-stage-c-assets.py`. Todas las imágenes narrativas se muestran dentro de las páginas del libro. Las piezas recortadas conservan transparencia real.

## Prompts de los recursos generados

- **Escritorio de Howl** (`public/images/experiences/howl/escritorio-magico.webp`): Ilustración horizontal en acuarela y gouache de un escritorio antiguo dentro de un castillo ambulante acogedor. Libros apilados, papeles, un pequeño cajón, taza, lámpara cálida y caja de madera cerrada, objetos claramente separados para zonas interactivas, luz ámbar, textura de pincel artesanal, sin letras ni personajes.
- **Sobre cerrado y carta abierta** (`sobre-cerrado.webp`, `sobre-abierto.webp`): Objeto aislado con fondo transparente, papel crema envejecido y bordes irregulares, flores botánicas pintadas, sello de cera rojo oscuro, acentos dorados, acuarela delicada, vista frontal ligeramente inclinada, sin texto legible.
- **Llave antigua** (`llave.webp`): Llave pequeña de latón ornamentado, brillo cálido, acuarela y gouache, vista aislada con transparencia, sin manos ni fondo.
- **Claro del bosque** (`public/images/experiences/totoro/claro-del-bosque.webp`): Bosque mágico luminoso en acuarela horizontal, tierra despejada en el centro para una planta, árboles altos, flores, hojas y rayos de sol, verdes cálidos, sin personajes ni letras.
- **Árbol, nube, sol y hoja** (`arbol.webp`, `nube.webp`, `sol.webp`, `hoja.webp`): Elementos aislados con fondo transparente, pintura artesanal de acuarela y gouache. Árbol joven de tronco fino y follaje completo; nube azul grisácea con gotas; sol cálido con rayos suaves; hoja grande orgánica de nervaduras visibles y pequeños destellos dorados.

Las ilustraciones de castillo y bosque de las páginas restauradas reutilizan `public/images/scenes/howl-castle.png` y `public/images/scenes/totoro-forest.png`. El fondo de escritorio representa también los libros, la caja cerrada, los papeles y la lámpara, de manera que sus zonas de interacción coinciden con la pintura. La caja abierta y la carta se expresan mediante la superposición del sobre, movimiento de la llave y destellos; no hay un recorte separado de la tapa.

## Guardado

Cada capítulo recorre `sin comenzar → en curso → objeto recuperado → recuerdo completado`. La pregunta y el guardado solo se habilitan tras recuperar el objeto. Los borradores y los avances parciales de los juegos quedan en el almacenamiento local del navegador. El progreso terminado usa `storyProgress/{uid}` cuando Firebase está configurado y las reglas de Firestore permiten únicamente al usuario correspondiente leer y escribir su documento.

Sin `.env.local`, la demostración usa almacenamiento local. Para comprobar la sincronización remota hacen falta las variables de `.env.example`, un proyecto Firebase disponible y las reglas publicadas.
