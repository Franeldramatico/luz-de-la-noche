# Para Aranza

## Publicación actual

- Web: https://franeldramatico.github.io/luz-de-la-noche/
- GitHub Pages se publica automáticamente al subir a `main` mediante `.github/workflows/pages.yml`.
- `npm ci`, `npm run dev`, `npm test` y `npm run build`.
- Vite usa rutas relativas para mantener imágenes, música y escenas dentro de la ruta del proyecto de Pages.
- Los textos personales se editan en `CONTENT` de `menu.html`. La carta está firmada únicamente por Franxito.
- El parpadeo de Historia usa las coordenadas, escala y fuente del retrato original; se prueba en escritorio y móviles de 390 y 320 píxeles con `node scripts/history.browser.mjs`.
- Me gusta parpadea automáticamente, sin botón manual. Las animaciones completas están activadas por petición del autor, sin consultar la preferencia de reducir movimiento.

Las notas inferiores conservan el historial de diseño y pueden describir versiones anteriores.

## Experiencia actual

### Acabado visual y navegación coordinada

La portada conserva su identidad acuática y añade un emblema de luna y corazón, apariciones escalonadas, una dedicatoria que entra al desplazarse, progreso de lectura y estados hover más suaves. El icono de pestaña está en `public/favicon.svg`. `src/home-polish.css` reúne el acabado de portada y `src/experience.css` los scrollbars nativos personalizados y los detalles compartidos de accesibilidad.

Historia, Me gusta y Carta utilizan ahora una única superficie de transición: primero se desvanece el contenido anterior, después cambia la composición y entra la siguiente. La navegación superior permanece fija, con un indicador deslizante y soporte de flechas, Inicio y Fin. `src/menu-polish.css` contiene su acabado. No se clonan retratos ni iframes durante los cambios; se conservan la selección de recuerdos y gustos y el estado de la carta. Las solicitudes rápidas dejan activa la última sección elegida. Esta secuencia sustituye los tiempos y las transiciones de retratos descritos en las notas históricas inferiores.

Las burbujas compartidas tienen bordes nacarados, movimiento más suave y una reacción breve al clic o toque sobre el fondo, sin interceptar controles. Siguen usando un único Canvas acotado a 30 FPS, con 18/28 burbujas y pausa cuando no está visible; el texto principal recibe menos efectos encima. Con movimiento reducido se conserva un ambiente estático y se reemplazan los desplazamientos por fundidos breves. Se mantienen las ilustraciones originales, los contenidos y los dos MP3.

Comprobaciones adicionales (Playwright disponible en el entorno, sin dependencia nueva de producción): `npm run test:design -- http://localhost:4173`. Verifica siete tamaños, título sin recortes, ambos temas, scroll, icono, scrollbar, interacción de burbujas, indicador, navegación rápida, teclado y movimiento reducido. En móviles bajos se compacta la tarjeta musical sin quitar los controles ni las dos líneas de letra para dejar visible la invitación. Un segundo argumento opcional guarda capturas en la carpeta indicada. Se mantienen `npm test`, `npm run build` y las pruebas anteriores de `scripts/menu.browser.mjs`.

### «Lo que me gusta»: escena animada integrada

La pestaña **Me gusta** del menú en `http://localhost:5173/` utiliza ahora la composición aprobada de Aranxita: retrato a la izquierda, luna con reloj romano, panel inclinado con cinco gustos, título original pequeño en Barlow Condensed, pelo en tres zonas, reflejos, parpadeo irregular y burbujas interactivas. En móvil vertical la ilustración aparece arriba y los gustos debajo. No se aplicó la ampliación del título de la última referencia descartada.

La fuente es `src/gustos/template.html`; sus cinco textos se editan en `GUSTOS`. `npm run prepare:gustos` (Python, Pillow y numpy) genera `public/scenes/gustos.html`, que ya está incluido y se copia a producción con el build normal de Vite, sin requerir Python para servir la web. Usa los originales de `nightfall_assets/`; no modifica la imagen ni los SVG. La escena generada también puede abrirse como HTML independiente.

`src/menu-sections.js` la monta una sola vez en un iframe interno para conservar sus estilos sin que Teko sobrescriba Barlow, y mantiene la navegación compartida y el reproductor original. Los mensajes validan origen y ventana emisora; conservan la selección, devuelven Escape al menú y completan la navegación por Tab. Al cambiar de sección se pausan CSS, Web Animations y SMIL; con movimiento reducido también se suprimen burbujas y parallax. No se duplica el ambiente Canvas del menú sobre esta escena.

La altura de la cabecera se mide con `ResizeObserver`. La escena recibe el espacio del reproductor: en escritorio el panel derecho tiene desplazamiento propio cuando no cabe; en móvil el contenido deja espacio al final para poder leerlo y usar «Parpadear» sin que la tarjeta musical lo tape. La portada, Historia, Carta, los MP3 y sus subtítulos se conservan. Los párrafos de abajo sobre los diez motivos y la pose 4 precalculada describen la implementación anterior, no esta pestaña actual.

**Ambiente actualizado:** burbujas más visibles (18 en compacto, 28 en escritorio; 8 estáticas con movimiento reducido), haces de luz y corrientes animadas dentro del Canvas limitado a 30 FPS. En las secciones siguen activas aproximadamente dos tercios de las burbujas y las órbitas pulsan suavemente. Esto sustituye las cifras anteriores de 12/22 burbujas; no reactiva los filtros de cabello ni la refracción del fondo.

Los títulos, encabezados, logotipos de texto y botones usan **Teko 600** mediante `--display`, con ajustes responsive en `src/display-type.css`. Los tamaños de escritorio crecen aproximadamente un 15 %; en móvil se ajustan al ancho disponible y las mayúsculas utilizan `.02em` de espaciado. `index.html` y `menu.html` cargan la misma fuente de Google con preconexión. Se mantiene Inter para texto corrido y subtítulos, y Georgia para el cuerpo de la carta; no se añadieron otras familias de Google. Los logotipos dibujados dentro de las ilustraciones permanecen intactos.

La portada React utiliza una atmósfera ilustrada de agua, luz y tipografía inspirada en Persona 3 Reload. El botón de tres líneas abre **tu menú original** a pantalla completa. Conserva las ilustraciones y adapta su encuadre a móvil; una capa Canvas ligera añade ambiente. Sol/luna cambia el ambiente de la portada; el menú mantiene su ilustración Nightfall original.

Ejecuta `npm run dev` para abrirla. La compilación `npm run build` incluye tanto la portada como el menú. Requiere servidor web; abrir la portada React como archivo local no ejecuta Vite.

El contenido del menú se personaliza en el objeto `CONTENT` de `menu.html`. La copia original intacta está en `legacy.html` y sus instrucciones están en `LEGACY.md`. No modifiques esa copia si quieres conservar el respaldo.

El menú activo utiliza letras HTML con gradiente e inclinación, no los antiguos recortes PNG que incluían partes de otros botones. Los PNG y la ilustración se conservan intactos.

### Renderizado optimizado y móvil

`src/menu-scene.js` muestra composiciones transparentes WebP en lugar de animar máscaras y filtros SVG en tiempo real. `menu_composite.webp` y `menu_composite_compact.webp` conservan el dibujo del menú; las tres imágenes `aranza_*_scene.webp` reúnen las poses y su escenografía. `scene_composite_bounds.json` guarda las coordenadas de los recortes y debe regenerarse junto con las imágenes.

Con Vite abierto, `node scripts/prepare-menu-composites.mjs http://localhost:5173` regenera los cinco WebP y sus coordenadas. Esta herramienta opcional requiere Playwright disponible en el entorno; no es una dependencia nueva del proyecto. Lee los originales sin modificarlos y desactiva HMR durante la captura.

El motor compartido `src/ocean-effects.js` utiliza un solo Canvas con resolución limitada y un máximo de 30 dibujos por segundo, 22 burbujas en escritorio o 12 en compacto, y hasta 12 partículas de interacción. Se detiene cuando queda oculto. Los fondos permanecen estáticos; los retratos de sección conservan una suspensión pequeña y escalonada. **Compromiso de rendimiento:** el parpadeo de las poses de sección y la deformación continua del cabello/agua no se ejecutan en las ilustraciones precalculadas. El menú principal sí parpadea: `src/menu-eyes.svg` superpone únicamente dos párpados en un área de 160 × 120 del dibujo original, compartiendo su encuadre en PC y móvil. El ciclo dura 6,4 segundos y se pausa durante la entrada, al abrir secciones o al ocultarse; se desactiva con movimiento reducido. Los SVG y efectos fuente siguen conservados para edición y regeneración.

`src/menu-motion.css` reúne los ajustes actuales. En móvil vertical el retrato forma parte del contenido desplazable, después de la introducción, sin superponerse al texto. La tarjeta musical comunica su altura desde `src/App.jsx` al iframe mediante mensajes validados por origen y ventana emisora: se reserva espacio para las opciones y el final del contenido. En horizontal el reproductor se coloca a la izquierda. Se respeta `prefers-reduced-motion`.

Comprobaciones: `npm test`, `npm run build` y `node scripts/menu.browser.mjs http://localhost:4173` con el servidor de preview abierto. El script opcional de navegador verifica cinco tamaños, espacio del reproductor, navegación rápida, estados conservados, carta, teclado, orientación, limpieza y movimiento reducido.

En muestras de 3 segundos de Chromium headless, la versión compilada obtuvo 60/58/44 FPS en escritorio (menú/historia/cambio a razones), frente a 8/4/4 antes. En emulación móvil 390 × 844, DPR 2 y CPU ralentizada 4× obtuvo 60/60/60 frente a 22/6/7. Son mediciones orientativas de ese entorno, **no una garantía de FPS ni una prueba en teléfono real**.

### Apertura con caída al agua

Cada apertura monta una secuencia nueva en `src/menu-arrival.js`: primero se ve el agua, Aranza desciende desde fuera del encuadre, aparecen ondas elípticas, unas pocas gotas y burbujas, y la caída frena antes de integrarse con la ilustración. Las opciones aparecen escalonadas. Las coordenadas se calculan desde los límites HTML del dibujo; el SVG solo aloja los efectos temporales. Con movimiento reducido se omite la caída.

La entrada utiliza `nightfall_assets/aranza_recortada.webp`, una capa con transparencia y contorno trazado sobre la ilustración original, no una copia rectangular con el fondo pegado. `aranza_recortada.png` conserva la versión editable sin pérdida. Para regenerarlas: `python scripts/extract-portrait.py` (requiere Pillow). El archivo original y `legacy.html` no se modifican.

El cabello que terminaba en el borde inferior se completa durante la caída con `nightfall_assets/aranza_cabello_extension.svg`: mechones vectoriales con puntas, sombras y reflejos azul oscuro, dibujados detrás de la capa RGBA. Las coordenadas del retrato siguen siendo 0,0 y 1672 × 941; el dibujo nuevo se prolonga hasta aproximadamente y=1187. Una máscara mezcla los últimos 31 px de cabello con la continuación, únicamente en la capa de entrada. No se desplaza el personaje ni se modifica el rostro, la pose, la trayectoria o la composición final. La extensión es independiente de los recortes y no la sobrescribe el script de extracción.

Girar el dispositivo durante la entrada o abrir una sección termina la coreografía sin bloquear controles; salir del menú la cancela. Tras la llegada continúan el ambiente Canvas y el parpadeo ligero, no los antiguos filtros de cabello SVG. Es una adaptación 2D, no una reproducción del modelo 3D del juego.

Referencias de movimiento consultadas: [vídeo del menú de Persona 3 Reload](https://www.youtube.com/watch?v=4d6x1CIgLSc) y [notas técnicas de una recreación sobre caída y flotación](https://github.com/Ultipuk/persona_3_reload_pause_menu#floating-character). No se utilizan modelos ni recursos de ese repositorio.

### Tres escenas de sección

Las opciones ya no abren la misma ventana genérica. `src/menu-sections.js` y `src/menu-sections.css` construyen tres escenas a pantalla completa:

- **Nuestra historia:** archivo de recuerdos con capítulos seleccionables, detalle y contador del recuerdo actual. Utiliza `aranza modelo/aranza posicion 2.png`, a la izquierda.
- **Lo que me gusta:** selector de diez notas, detalle destacado y controles anterior/siguiente. Utiliza `aranza modelo/aranza posicion 4.png`, mostrando la pose sentada completa a la derecha.
- **Carta especial:** composición azul nocturna con acentos cálidos, sobre con sello interactivo y carta en papel con tipografía serif. Utiliza `aranza modelo/aranza posicion 3.png`, a la izquierda.

El menú principal mantiene su ilustración y la caída. Las otras tres secciones muestran ilustraciones realmente distintas: no se gira la original para simular poses. `src/section-portrait.svg` se usa como fuente para generar los WebP con sus puntos focales, sin deformarlos. Las transiciones combinan desplazamiento, escala y fundido; no pretenden ser un morph ni un modelo 3D.

Los tres PNG originales permanecen intactos en `aranza modelo/` y tienen copias verificadas en `copias/aranza modelo/`. Sus versiones para la web son `nightfall_assets/aranza_historia.webp`, `aranza_carta.webp` y `aranza_gustos.webp`. La posición 2 conserva su transparencia original; en las posiciones 3 y 4 se deriva una máscara del fondo negro exterior, preservando las zonas oscuras interiores del cabello y del traje. Se pueden regenerar con `python scripts/prepare-section-poses.py` (Pillow, numpy y opencv-python). Si se editan las poses, hay que ajustar también sus puntos focales en `src/menu-sections.js`.

Los textos siguen procediendo de `CONTENT` en `menu.html`: no se inventan fechas ni recuerdos reales. Se mantienen la selección al cambiar de sección y el estado del sobre mientras el menú siga abierto. Las razones y los capítulos admiten flechas izquierda/derecha; Escape vuelve al menú y el foco regresa al botón original. El contenido se desplaza sin perder los controles superiores, tanto en vertical como en horizontal. Las burbujas siguen activas y el modelo del menú subyacente se pausa mientras se muestra una sección.

Referencia adicional revisada: [entrevista con el equipo de UI de Reload](https://personacentral.com/p3r-interview-menu-ui/), donde explican sus composiciones, reflejos de agua y cambios de pose por sección. No se han descargado recursos del juego.

### Fuentes conservadas de agua y escenografía

`src/section-water.js` monta ahora texturas estáticas reutilizables. Se retiró la refracción Canvas por bandas para evitar repintar todo el fondo en cada fotograma. El texto y el rostro no se deforman. Los efectos descritos a continuación son las fuentes de preparación, no animaciones activas en producción.

`src/section-character-effects.js` monta durante la preparación capas propias para cada pose:

- `escenografia_historia.svg`: cinta de película de cristal, recuerdos flotantes y una órbita; el recuerdo seleccionado ilumina su marco.
- `escenografia_gustos.svg`: esfera y media luna de luz alrededor de la pose sentada, anillos de agua bajo los pies y pequeños corazones. El anillo responde a la selección de las diez notas.
- `escenografia_carta.svg`: luna cálida, órbitas, páginas suspendidas y una corriente de tinta. El sobre y la luna reaccionan al abrir la carta.

`parpados_posicion_2.svg`, `parpados_posicion_3.svg` y `parpados_posicion_4.svg` contienen cierres de ojos trazados individualmente en las coordenadas de cada imagen; no reutilizan los párpados de la pose original. El cabello exterior se ondula mediante copias enmascaradas muy pequeñas, y las bandas de luz se recortan a la silueta excluyendo una zona protectora alrededor del rostro. Son efectos 2D sobre copias; los PNG originales y `copias/` no se editan.

Los estilos fuente están en `src/menu-section-polish.css`; `src/menu-motion.css` aplica las optimizaciones actuales. Referencia técnica consultada: [desglose de la recreación de UI de Adrian Kowalik](https://adrian-kowalik.com/projects/persona-3-reload-ui-recreation). El código y los SVG de esta web son propios, no recursos extraídos del juego.

### Transiciones de navegación

`src/section-transition.js` coordina un breve paso de luz, dos ondas y tres burbujas HTML, sin clonar la escenografía SVG. El retrato anterior se funde mientras entra el siguiente con una deriva suave; el texto aparece con un desplazamiento corto. El contacto se calcula desde el encuadre de cada pose. La navegación superior permanece accesible.

Cada cambio cancela las animaciones anteriores y elimina las capas temporales; cerrar y redimensionar también limpian la secuencia. La entrada completa termina en 1240 ms, los cambios de sección en 940 ms y el regreso en 360 ms. Con `prefers-reduced-motion` se utiliza un fundido de 180 ms sin caída ni partículas. No requiere librerías ni recursos externos adicionales.

### Partes que faltaban en las ilustraciones

`complemento_posicion_2.svg`, `complemento_posicion_3.svg` y `complemento_posicion_4.svg` reconstruyen los contornos superiores del cabello. Las dos primeras también añaden rizos laterales; la tercera completa la puntera y suela del zapato que terminaba en la fila 1535. Son capas independientes detrás del PNG/WebP, con pequeñas líneas de unión delante. El cabello combina contornos vectoriales, mechones de detalle y una muestra reflejada/estirada de la textura del propio dibujo para mantener la continuidad en el borde; no es una reconstrucción 3D ni generación de imagen. Los dibujos originales y sus copias permanecen intactos.

Se eliminó el fundido que ocultaba las coronillas. Solamente se conserva un fundido localizado en la base del busto, sin aplicarlo a los rizos inferiores de la pose 3 ni al zapato de la pose 4. El diseño móvil deja espacio para la silueta antes de los controles.

Dirección de movimiento basada en la [entrevista de Tomohiro Kumagai sobre la UI de Reload](https://personacentral.com/p3r-interview-menu-ui/): hundimiento, suspensión, reflejos de cristal y movimiento delicado del cabello, en contraste con los movimientos agresivos de Persona 5. Es una adaptación 2D con ilustraciones propias, no una reproducción exacta del modelo y las animaciones 3D del juego.

### Detalles históricos de las fuentes SVG

Las fuentes de las poses 2–4 conservan aberturas trazadas individualmente para los ojos y máscaras protectoras de las gafas. La preparación fija los ojos abiertos. No se ejecuta este parpadeo en los WebP actuales.

`src/section-living-details.css` conserva los estilos fuente de cabello, agua e inmersión. Sus máscaras y reflejos se fijan durante la preparación; en producción se mueve el retrato precalculado completo. Las capas decorativas no capturan clics ni afectan la lectura.

En pantallas compactas (hasta 1024 px y móviles horizontales), el menú usa una composición propia: la ilustración se encuadra por separado y los botones mantienen tamaños nativos, con filas táctiles de 64–84 px en vertical y al menos 48 px en horizontal. El rostro queda arriba en vertical y a la izquierda en horizontal. Se contemplan áreas seguras, cambios de orientación y la altura dinámica del navegador; los paneles interiores se desplazan y conservan su botón de cierre accesible.

El modo compacto usa la ilustración precalculada y menos burbujas Canvas. El menú principal mantiene a Aranza anclada al borde izquierdo y las tres opciones a su derecha, también en vertical; no presenta el dibujo como una miniatura centrada sobre una lista. El encuadre sigue el punto focal del rostro y descuenta la altura del reproductor. Los cambios de tamaño se agrupan mediante `requestAnimationFrame`. El escritorio mantiene su composición ilustrada original.

El ambiente comienza automáticamente y se suspende cuando queda oculto por el menú, la referencia original o una pestaña en segundo plano. Con movimiento reducido se dibuja un ambiente estático y se desactivan la caída y la suspensión continua.

Detalles ambientales: burbujas con reflejos, motas y pequeños corazones dibujados en Canvas. El cursor o un toque sobre el fondo deja una estela breve, sin bloquear los botones. Las estelas caducan y tienen un límite de 12 elementos. O muestra la referencia original y E alterna el color de las letras.

La portada está en `src/App.jsx` y los estilos activos en `src/reload.css`. `WaterScene.jsx` utiliza `nightfall_assets/agua_portada.webp`, un recorte acuático sin personaje ni logotipo. `OceanAtmosphere.jsx` utiliza el mismo motor Canvas del menú. El fondo permanece fijo; se mantienen el contraste y la atmósfera cálida/nocturna. El ambiente de la portada se suspende mientras el menú está abierto.

Los temas cambian automáticamente a las 06:00 y 20:00 locales, o manualmente con el interruptor. «Auto» restablece el horario. Las dos canciones aportadas están conectadas desde `public/audio/`, con las rutas y créditos de `src/content.js`.

### Banda sonora para Aranza

El reproductor y la letra comparten una tarjeta de bordes suaves, con título, intérprete, botón circular y subtítulos debajo. Sus superficies son opacas y sus colores están aislados del fondo acuático para mantener el contraste en ambos temas; la línea activa sigue siendo azul. Las opciones de importación se agrupan en «Opciones de subtítulos». Este acabado visual no cambia audios, marcas temporales ni fundidos. En modo claro se corrige también el texto antes blanco de las leyendas de la portada, sin modificar su composición.

**Traducción al español:** el botón «Español» junto a los subtítulos alterna con «English» sin reiniciar el MP3 ni cambiar su posición, volumen o pausa. Incluye traducciones manuales no oficiales de las dos letras aportadas por el usuario, en `src/audio/day-lyrics-es.js` y `src/audio/night-lyrics-es.js`. Cada línea conserva exactamente el tiempo de su original. Cambian tanto el karaoke como la lectura completa y el atributo de idioma. La preferencia se mantiene al alternar día/noche durante la visita; al recargar vuelve al inglés. No se consulta ningún traductor ni servicio externo. Para archivos de subtítulos importados no se ofrece esta traducción, porque podría no corresponder a su contenido; al restaurar la letra incluida vuelve a estar disponible. Las marcas aproximadas de la canción de día siguen siendo aproximadas en ambos idiomas.

- Día: **When The Moon’s Reaching Out Stars -Reload-**, Azumi Takahashi.
- Noche: **Color Your Night**, Lotus Juice y Azumi Takahashi.

Los MP3 de la raíz se conservan intactos; sus copias en `public/audio/` se incluyen en la compilación. La web intenta iniciar la música automáticamente al abrirse, con una entrada gradual. Si el navegador bloquea el audio con sonido, se reintenta con el primer clic/toque en la web o con Enter/espacio; play siempre permite iniciarlo explícitamente. No se eluden las políticas del navegador con audio silenciado. Cambiar de tema mientras suena inicia la nueva pista desde el principio con un fundido de 2,8 segundos y curva suave; cambiar estando en pausa no reproduce nada. Una pausa deliberada cancela también los reintentos por interacción. Las pistas se repiten y el volumen empieza al 30 %, recordándose en este navegador. No se guarda una autorización de reproducción.

El reproductor permanece montado fuera de la portada y del iframe, por lo que no se interrumpe al abrir el menú, recuerdos, razones o carta. Dentro del menú se reduce a dos controles, música y play/pausa. La letra sincronizada está **debajo de los controles**, siempre visible incluso con los detalles cerrados, y muestra la línea actual y la siguiente. La actual se resalta en azul durante la reproducción; en pausa o mientras carga queda atenuada. El azul tiene variantes de contraste para día y noche. El botón de música abre detalles, posición, volumen, dedicatoria original y letra completa. Solo se reproducen los dos MP3 locales: se retiraron el vídeo incrustado, sus controles y los enlaces de YouTube. Escape o un clic fuera cierra los detalles sin ocultar los subtítulos.

**Letra de noche sincronizada:** `src/audio/night-synced-lyrics.js` incluye la versión inglesa y todas las marcas LRC aportadas por el usuario, desde 00:20 hasta 03:06, sin cambios ni tiempos añadidos. El reproductor nocturno muestra por defecto la línea actual y la siguiente debajo de los controles, según la posición real del MP3. Pausar mantiene la línea pero retira el azul; adelantar, retroceder o repetir la canción actualiza el karaoke. Antes de 00:20 se muestra ♪. Como el LRC solo aporta comienzos, cada línea se mantiene hasta la siguiente y la última hasta que la canción se reinicia; no se han inventado finales ni cortes instrumentales. El resaltado sigue las marcas, no una detección de voz.

**Letra de día sincronizada:** `src/audio/day-synced-lyrics.js` incluye la letra inglesa de «When The Moon’s Reaching Out Stars -Reload-» y sus marcas aportadas por el usuario, desde 00:12 hasta 02:58. Se conservan sin cambios y la interfaz indica que son **aproximadas (±1–2 s según la versión del audio)**; no se presentan como verificadas contra el MP3. Funciona con el mismo karaoke, lectura completa, pausa, búsqueda y repetición que el modo noche. Antes de 00:12 aparece ♪. Solo se aportaron inicios: cada línea permanece hasta la siguiente y la última hasta el reinicio, sin inventar finales instrumentales.

«Letra completa» permite desplegar la misma versión actualizada para leerla por estrofas, con un área desplazable y acceso por teclado. La versión anterior sin tiempos permanece conservada en `src/audio/night-lyrics.js`, pero ya no es la letra mostrada. La versión sincronizada se incluye en la compilación y sigue disponible al recargar, sin cargar archivos manualmente. Un archivo importado puede sustituirla durante la visita; «Restaurar letra incluida» vuelve al karaoke original.

**Karaoke opcional:** se pueden cargar subtítulos aportados por el usuario en formato `.lrc`, `.srt` o `.vtt` (máximo 200 KB), uno por canción. El idioma del archivo se selecciona explícitamente: inglés por defecto para ambas; no se traduce ni se detecta automáticamente. Se resaltan líneas siguiendo la posición real del audio, también después de adelantar o retroceder. LRC admite marcas `[mm:ss.xx]`, múltiples marcas por línea y `[offset:milisegundos]`. SRT/WebVTT conservan los tiempos de inicio y final, los saltos de línea y los intervalos instrumentales; se muestran como texto, sin ejecutar formato HTML/VTT. Los archivos importados no se suben a ningún servidor y desaparecen al recargar; la letra nocturna incluida permanece. No se extraen letras de terceros automáticamente. Las dedicatorias son textos originales, no traducciones de las canciones.

La aplicación **no certifica la sincronización de un archivo importado**: conserva los tiempos aportados sin repartir líneas, interpolar palabras ni estirar la duración. Advierte si hay marcas que exceden el final del audio. El MP3 de día aportado mide **207,760 s** según ffprobe, pero no contiene etiquetas de título, artista ni álbum; duración y nombre del archivo no prueban por sí solos la identidad de la grabación.

Las dos letras predeterminadas actuales proceden del texto y los tiempos aportados por el usuario, no de las fuentes externas de la investigación anterior. Para verificar una fuente adicional, confirmar grabación e idioma y cotejar las entradas vocales del inicio, mitad y final contra el MP3, además de comprobar sus permisos de reutilización. Si hay diferencia constante, medir y documentar el desfase; si varía, revisar cada marca. No dar por verificado un candidato solo por llamarse Reload o medir 208 segundos.

La alternativa anterior basada en un vídeo de YouTube fue retirada por petición del usuario. La reproducción musical actual es exclusivamente mediante los MP3 locales; los enlaces de investigación siguientes son referencias históricas, no reproductores ni conexiones de la aplicación.

Referencias de integración consultadas:
- [Vídeo de referencia de h4kk0](https://www.youtube.com/watch?v=UJnGYdVej0M): su título indica subtítulos en español; no se confirmó una pista inglesa autorizada. [Publicación oficial de Azumi Takahashi](https://www.youtube.com/watch?v=GZTp2JzcOJ0) para contrastar los créditos.
- [Candidato comunitario de LRCLIB](https://lrclib.net/api/get/10718708): los metadatos indican Azumi Takahashi, Reload y 208 s; se observaron 51 marcas ordenadas, desde 12,62 hasta 183,19 s. Son tiempos existentes, **no verificados contra el audio local**, y no se estableció permiso de redistribución. No se copió su letra al proyecto.
- [YouTube: descarga de subtítulos](https://developers.google.com/youtube/v3/docs/captions/download): la API requiere autorización y permiso para editar el vídeo. No se utilizaron extractores para eludir esos requisitos.
- [Musixmatch: coincidencia de subtítulos](https://docs.musixmatch.com/api-reference/lyrics-catalog/matcher-subtitle-get): posible integración con licencia y credenciales del proveedor, pendiente de confirmar cobertura de esta grabación. Requiere respetar restricciones territoriales, atribución y seguimiento de visualizaciones; las credenciales deben permanecer en servidor, no en Vite/React.
- [LRCLIB](https://github.com/tranxuanthang/lrclib) y [LRCGET](https://github.com/tranxuanthang/lrcget): referencias de herramientas de letras temporizadas. La licencia del software no concede derechos sobre las letras de terceros.

Implementación: `src/components/AudioPlayer.jsx`, `src/components/audio-player.css`, `src/audio/soundtrack.js` y `src/audio/lyrics.js`. Pruebas: `npm test`. La reproducción y el volumen dependen de las políticas del navegador; si rechaza el cambio automático de pista, el reproductor pide pulsar play de nuevo.

La propuesta visual anterior sigue apartada en `propuesta-react.html`, `src/styles.css` y los componentes que la portada actual no importa. La documentación siguiente es histórica; las seis tarjetas y la carta de aquella propuesta no se utilizan en la portada actual.

---

## Propuesta React apartada

Web romántica responsive con React, Vite, Tailwind CSS, Framer Motion y Lucide React. Sin emojis ni archivos de audio incluidos.

## Ejecutar

```sh
npm install
npm run dev
```

Abre la dirección local que indica Vite. Para producción: `npm run build`. Para probar la compilación: `npm run preview`.

## Personalizar

Edita `src/content.js` para cambiar el subtítulo, los recuerdos, las seis razones, la carta y la firma. Los textos iniciales son propuestas editables, no recuerdos personales confirmados.

Configura `startDate` con una fecha real en formato `AAAA-MM-DD` para mostrar el contador de días juntos. Con `null` se muestra un mensaje sin inventar una fecha. El contador usa días de calendario locales y se actualiza cada minuto.

## Música

Añade tus archivos obtenidos legalmente en:

- `public/audio/when-the-moons-reaching-out-stars.mp3`
- `public/audio/color-your-night.mp3`

La sección anterior describe los archivos actuales ya conectados. Puedes modificar las rutas en `src/content.js`. El servidor debe servirlos con un tipo MIME de audio correcto. Si falla una pista, el reproductor actual permite reintentar el MP3 con play. Intenta reproducir al abrirse y, si el navegador lo bloquea, espera una interacción; no intenta saltarse sus restricciones.

## Tema y accesibilidad

- Día: 06:00–19:59. Noche: 20:00–05:59, según la hora del dispositivo.
- El interruptor establece una selección manual durante esta sesión; «Auto» restaura el horario. Recargar devuelve el modo automático.
- Navegación por teclado, enlace para saltar al contenido, tarjetas por clic/toque y soporte para movimiento reducido.
- Fuentes opcionales de Google Fonts con alternativas locales.

## Versión anterior

`legacy.html`, `nightfall_assets/` y `LEGACY.md` conservan el trabajo anterior. Para publicarlo también, copia sus recursos al directorio de publicación; la compilación Vite solo incluye la nueva experiencia.
