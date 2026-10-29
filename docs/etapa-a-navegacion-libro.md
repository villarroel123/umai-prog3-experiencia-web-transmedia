# Etapas A y B · Libro y experiencia de Chihiro

La portada, el prólogo, el índice independiente, las tres páginas de película y el recorrido de Chihiro comparten la misma instancia de `BookScene`. La cámara acerca el libro según el viewport y conserva el volumen de hojas, tapas y lomo. `BookJourney` mantiene el estado del recorrido, bloquea nuevos giros y sincroniza cada giro de 1,55 segundos con la URL.

Durante el paso, la página de destino permanece debajo y la hoja anterior gira encima con su texto e ilustración. La cara posterior muestra el contenido de la hoja de destino. El papel de la animación reutiliza la textura generada para el libro Three.js y el ángulo del contenido se actualiza en el mismo cuadro que la geometría, sin desvanecer las páginas. En móvil se muestra una hoja por vez y se puede cambiar con los controles «Ilustración» y «Historia». La preferencia de movimiento reducido cambia de página sin animación.

## Recorrido

- `/biblioteca`: prólogo.
- `/biblioteca/indice`: índice de los tres capítulos, con estado calculado desde el progreso guardado. El señalador del borde regresa aquí desde las demás páginas y se oculta durante el giro. Si Chihiro está completado, el índice ofrece abrir la página restaurada.
- `/recuerdos/chihiro`: película e inicio de la experiencia.
- `/recuerdos/chihiro/experiencia`: boleto de cuatro piezas sobre la hoja derecha. Admite arrastre con Pointer Events y selección accesible de pieza y espacio.
- `/recuerdos/chihiro/objeto`: boleto recuperado y pregunta personal. La respuesta no puede estar vacía.
- `/recuerdos/chihiro/restaurado`: tren, boleto y respuesta escrita sobre la página. La ruta antigua `/biblioteca?pagina=chihiro` redirige aquí.
- `/recuerdos/howl` y `/recuerdos/totoro`: páginas de película, sin minijuegos en esta etapa.

El tren y el boleto están en `public/images/experiences/chihiro/`. Los cuatro fragmentos son cuadrantes del mismo archivo transparente del boleto, por lo que encajan exactamente. El progreso nuevo se guarda en la clave local `biblioteca-tres-recuerdos-v1` y, cuando Firebase está configurado, en `storyProgress/{uid}`. Los campos `gameComplete`, `ticketRecovered`, `answer` y `pageRestored` registran las fases. El capítulo se considera terminado solo al guardar una respuesta.

## Verificación

Se comprobó el recorrido en el navegador móvil: colocar las cuatro piezas, abrir el boleto, escribir, restaurar, recargar y consultar la respuesta. También se comprobó la navegación Chihiro → Howl → Chihiro. `npm run lint`, `npm run build` y `node --test tests/storyProgress.test.mjs` pasan. Sin configuración de Firebase en este entorno, la sincronización remota requiere una prueba con credenciales del proyecto.
