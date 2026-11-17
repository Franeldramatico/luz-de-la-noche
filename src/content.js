import { nightSyncedLyrics } from './audio/night-synced-lyrics.js';
import { daySyncedLyrics } from './audio/day-synced-lyrics.js';

// Personaliza aquí los recuerdos, la carta y la fecha de inicio (AAAA-MM-DD).
export const content = {
  name: 'Aranza',
  signature: 'Franxito',
  startDate: null,
  subtitle: 'Hay personas que llegan y lo cambian todo. Tú hiciste de mi mundo un lugar al que siempre quiero volver.',
  moments: [
    { chapter: 'El comienzo', title: 'Cuando nuestros caminos se cruzaron', text: 'Entre tantas personas y tantos lugares, la vida encontró la forma de acercarnos. Y qué suerte la mía.', label: 'Donde empezó todo' },
    { chapter: 'Los pequeños instantes', title: 'Mi lugar favorito es contigo', text: 'Las conversaciones que no queremos terminar, las risas por cualquier cosa y esa tranquilidad de estar juntos.', label: 'Lo cotidiano, extraordinario' },
    { chapter: 'Lo que viene', title: 'Nos quedan tantas primeras veces', text: 'Lugares por descubrir, abrazos pendientes y recuerdos que todavía no sabemos que serán nuestros favoritos.', label: 'Nuestra historia continúa' },
  ],
  reasons: [
    ['Tu sonrisa', 'Porque tu sonrisa tiene esa forma tan tuya de hacer que todo lo demás deje de importar.'],
    ['Tu manera de ser', 'Porque no necesitas ser nadie más. Me enamora la persona que eres cuando simplemente eres tú.'],
    ['La calma que me das', 'Porque a tu lado hasta los días difíciles encuentran un lugar donde descansar.'],
    ['Nuestras pequeñas cosas', 'Porque me encantan esos detalles que quizá nadie entiende, pero que para nosotros lo son todo.'],
    ['Tu luz', 'Porque haces más bonito lo cotidiano, incluso sin darte cuenta.'],
    ['Todo lo que nos espera', 'Porque imaginar un mañana contigo es una de mis formas favoritas de ser feliz.'],
  ],
  letter: [
    'A veces pienso que las cosas más bonitas no hacen ruido al llegar. Simplemente aparecen, se quedan y, un día, descubres que ya no imaginas tu mundo sin ellas. Así me pasó contigo.',
    'Me gustan nuestros momentos grandes, pero también los más pequeños: hablar de nada, reír sin motivo y sentir que no hace falta estar en ningún otro lugar. Contigo, lo sencillo tiene algo especial.',
    'No sé cuántas aventuras nos esperan, pero sí sé con quién quiero vivirlas. Quiero seguir conociéndote, cuidando lo nuestro y eligiéndote en los días luminosos y en las noches más largas.',
    'Este pequeño universo es para ti. Para recordarte que, sea la hora que sea, hay alguien que piensa en ti con todo su amor.',
  ],
};

export const tracks = {
  day: {
    title: "When The Moon’s Reaching Out Stars -Reload-",
    artist: 'Azumi Takahashi',
    src: `${import.meta.env.BASE_URL}audio/when-the-moons-reaching-out-stars.mp3`,
    side: 'SIDE A / DÍA',
    dedication: 'Aranza, entre tantos días por vivir, qué suerte compartirlos contigo.',
    textLyrics: { language: daySyncedLyrics.language, text: daySyncedLyrics.text },
    syncedLyrics: daySyncedLyrics,
    lyrics: 'https://www.letras.com/gao-qiao-azumei/when-the-moons-reaching-out-stars-reload/',
  },
  night: {
    title: 'Color Your Night',
    artist: 'Lotus Juice y Azumi Takahashi',
    src: `${import.meta.env.BASE_URL}audio/color-your-night.mp3`,
    side: 'SIDE B / NOCHE',
    dedication: 'Aranza, no hace falta que amanezca para que todo sea más bonito contigo.',
    textLyrics: { language: nightSyncedLyrics.language, text: nightSyncedLyrics.text },
    syncedLyrics: nightSyncedLyrics,
    lyrics: 'https://www.letras.com/persona-3-reload/color-your-night/',
  },
};
