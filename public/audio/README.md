Audios conectados al reproductor, copiados de los MP3 aportados en la raíz:

- when-the-moons-reaching-out-stars.mp3 (modo día)
- color-your-night.mp3 (modo noche)

Los originales se conservan sin modificaciones. Usa únicamente audio que puedas utilizar y compartir.

La web intenta iniciar la música al abrirse, con una entrada suave. Si el navegador
bloquea el audio automático con sonido, reintenta con el primer clic/toque en la web
o al pulsar Enter/espacio. El botón play también permite iniciarla explícitamente.
No se intenta eludir las restricciones del navegador mediante audio silenciado.
El tema controla la pista; si estaba sonando, el cambio utiliza un fundido suave
de 2,8 segundos. Si el usuario la pausa, permanece pausada aunque siga navegando.
Ambas pistas se repiten. El volumen inicial es 30 % y se recuerda localmente.

Los subtítulos aparecen debajo de los controles, incluso con los detalles
cerrados. La línea actual se vuelve azul al reproducir y se atenúa en pausa
o mientras carga. La próxima línea permanece atenuada. El resaltado sigue
las marcas aportadas; no es detección de voz ni inventa finales para silencios.

El botón Español / English cambia entre el texto original y las traducciones
manuales no oficiales incluidas en src/audio/day-lyrics-es.js y night-lyrics-es.js.
Ambos idiomas conservan exactamente los mismos tiempos. Cambiar de idioma
no reinicia ni pausa el audio y también actualiza la letra completa. No requiere
API ni conexión a un traductor. Se aplica a las letras incluidas, no a archivos
importados por el usuario.

La reproducción es exclusivamente MP3: no hay reproductor ni enlaces de YouTube.
La letra inglesa de día y sus marcas aportadas por el usuario están incluidas
en src/audio/day-synced-lyrics.js (00:12–02:58). Se muestran automáticamente,
con un aviso de tiempos aproximados (±1–2 s según la versión), sin ajustes
inventados ni certificación de coincidencia con el MP3.
La letra inglesa sincronizada de Color Your Night, aportada por el usuario, está
incluida en src/audio/night-synced-lyrics.js y se muestra automáticamente en el
modo noche. Conserva todas sus marcas (00:20–03:06), sin ajustarlas ni añadir
otras. Sigue la posición del MP3 al reproducir, pausar, adelantar y repetir.
La letra completa se puede desplegar para lectura. La última línea se mantiene
hasta el reinicio: no se ha inventado un tiempo de final. Los subtítulos
importados sustituyen temporalmente los incluidos; se pueden restaurar.
Desde los detalles del reproductor se puede cargar un archivo .lrc, .srt o .vtt,
y elegir inglés o español (inglés por defecto para ambas). Se conservan sus tiempos
originales, sin generar una sincronización ni certificar que corresponda al MP3.
En SRT/VTT se respetan también los tiempos de final y los intervalos sin voz.
Se advierte si hay tiempos posteriores al final del audio. El archivo se asocia
a la canción seleccionada, se procesa como texto y solo permanece en memoria
durante esa visita. No se sube a un servidor. El MP3 de día mide 207,760 segundos;
ese dato por sí solo no verifica una coincidencia con una fuente de subtítulos.
