import { parseLrc } from './lyrics.js';

// Manual Spanish translation of the English text supplied by the user.
// The original approximate timestamps are retained exactly. Not official lyrics.
const lrc = `[00:12] Nunca me había sentido tan mal
[00:17] Nunca imaginé que pensaría que esto duraría para siempre
[00:23] Cariño, quédate conmigo
[00:28] Tienes que decirlo ya: tu amor me envuelve por completo

[00:34] Nunca me había sentido tan diferente como ahora
[00:39] No parece que hayamos estado tan separados; siento tantos celos
[00:45] Mi vida cambiará
[00:49] No parece que esto pueda durar toda mi vida

[00:54] Cuando las estrellas le sonríen a la luna
[00:56] Me pregunto cómo se ve a través de tus ojos
[00:59] Estoy marcando tu número
[01:01] Pero no logro pulsar las dos últimas cifras
[01:04] Rezo en mi corazón
[01:05] La luna alcanza las estrellas
[01:07] Si me abrazas fuerte
[01:09] Siento los latidos de tu corazón tan cerca
[01:12] ¿Durará mucho esto?

[01:37] Mi vida acabará
[01:40] Siguiendo adelante así
[01:43] Solo dame algo que demuestre que no estás jugando conmigo
[01:48] Solo dame algo
[01:53] Tienes que decírmelo: tu amor me envuelve por completo

[01:59] Mi vida acabará
[02:02] Siendo tan cruel
[02:04] Solo dame algo que demuestre que no estás jugando conmigo
[02:10] Si esto es tan real
[02:15] Ahora solo dímelo: tu amor me envuelve por completo

[02:20] Cuando las estrellas le sonríen a la luna
[02:23] Me pregunto cómo se ve a través de tus ojos
[02:24] Si pudiera decírtelo, ¿no me sentiría tan vulnerable?
[02:30] Rezo en mi corazón
[02:31] La luna alcanza las estrellas
[02:34] No volverás a dejarme
[02:35] Si pudiera decírtelo
[02:37] No me dejarías

[02:41] Cuando las estrellas le sonríen a la luna
[02:43] Me pregunto cómo se ve a través de tus ojos
[02:45] Necesito esa sonrisa tan cerca
[02:48] Siempre pienso en ti
[02:51] En lo alto del cielo
[02:52] La luna alcanza las estrellas
[02:54] Si me abrazas fuerte
[02:56] Siento los latidos de tu corazón tan cerca
[02:58] ¿Durará mucho esto?`;

export const daySpanishLyrics = {
  language: 'es',
  translationNote: 'Traducción manual al español · no oficial.',
  lrc,
  cues: parseLrc(lrc),
  text: lrc.replace(/^\[\d{2}:\d{2}\] /gm, ''),
};
