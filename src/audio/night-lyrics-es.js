import { parseLrc } from './lyrics.js';

// Manual Spanish translation of the English text supplied by the user.
// Every original cue is preserved one-to-one, without retiming. Not official lyrics.
const lrc = `[00:20] Es hora de brillar y estoy listo para partir
[00:22] Conduciré hasta el amanecer, dejándome llevar
[00:25] Estoy en una misión, trabajando sin parar
[00:26] Sea lo que sea que tenga que hacer
[00:28] Seguiré mi camino hasta el día en que te encuentre
[00:29] Sigo mi camino

[00:30] Alzo la vista al cielo (al cielo)
[00:32] Me pregunto tantas veces: «¿Por qué?» (¿por qué?)
[00:33] Pero no dejo que me afecte; mantengo la buena energía
[00:35] Cuando estoy en el camino, estoy atento a las sorpresas
[00:38] A lo que nos depare
[00:39] Lo bueno y lo malo, pero nada nos separa

[00:40] Otro paseo por la noche
[00:43] Déjame pintar el paisaje
[00:45] Darle color a la ciudad con mi luz
[00:49] Por cada momento que comparto contigo
[00:51] De día no estoy
[00:53] Pero nunca me voy del todo
[00:55] Volveré una vez más
[00:59] Hasta que llegue el amanecer

[01:01] (Eh)
[01:02] Por todos los días que nos esperan, levanten las manos
[01:04] Muévanlas de lado a lado para atraer la suerte, ah
[01:06] (Eh)
[01:07] Por todas las noches como esta, levanten las manos
[01:09] Disfruten el momento desde el anochecer, sí
[01:11] (Eh)
[01:12] Siempre me apoyas y, por supuesto, yo también te apoyo
[01:15] No te preocupes por eso ahora
[01:16] (Eh)
[01:17] Ha sido un buen día, una buena noche
[01:19] Será un buen día, una buena noche

[01:41] Cuando dos manos se encuentran en lo más alto
[01:44] Nada se interpone entre nosotros
[01:46] Bailando como bailarinas de ballet
[01:48] Bajo la luz de la luna, toda la noche
[01:51] Cómo estas escenas tan sencillas y cotidianas
[01:54] Se llenan de colores tan vivos gracias a ti
[01:58] Solo quiero quedarme contigo

[02:01] Bailo despacio alrededor del mundo
[02:04] Cada vez que nuestras miradas se cruzan
[02:06] Sabes que me dejas en trance
[02:10] Lo significa todo para mí
[02:11] Miro hacia abajo
[02:14] A quien tanto busco encontrar
[02:16] No importa adónde vayas
[02:20] Recuerda que estarás en mis pensamientos

[02:22] (Eh)
[02:23] Siempre me cuidas; de algún modo haces que me sienta invencible
[02:25] Fuerza para mi alma, sí
[02:27] (Eh)
[02:28] Ya no me inquieta lo que antes me molestaba
[02:30] Porque tu existencia me llena de luz, sí
[02:32] (Eh)
[02:33] Siempre me apoyas y, por supuesto, yo también te apoyo
[02:35] No te preocupes por eso ahora
[02:37] (Eh)
[02:38] Ha sido un buen día, una buena noche
[02:39] Será un buen día, una buena noche

[02:41] En lo más profundo de mi corazón, te ruego
[02:44] Que hables conmigo
[02:46] Quiero escuchar todo lo bueno y lo malo
[02:49] Las nuevas historias que tengas
[02:51] Mientras voy a la deriva por el cielo
[02:54] La manecilla de las horas apunta hacia lo alto
[02:56] Así que, buenas noches
[02:59] Déjame cantarte una canción de cuna, amor
[03:06] Nos veremos, cariño`;

export const nightSpanishLyrics = {
  language: 'es',
  translationNote: 'Traducción manual al español · no oficial.',
  lrc,
  cues: parseLrc(lrc),
  text: lrc.replace(/^\[\d{2}:\d{2}\] /gm, ''),
};
