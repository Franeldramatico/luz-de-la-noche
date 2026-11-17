import { parseLrc } from './lyrics.js';
import { daySpanishLyrics } from './day-lyrics-es.js';

// Supplied by the user as approximate timings (±1–2 seconds), not audio-verified.
const lrc = `[00:12] I've never felt like, so miserable
[00:17] I never knew I'd think that this would last forever
[00:23] Baby stay with me
[00:28] You gotta say now, your love flows all over me

[00:34] I've never felt like, so different now
[00:39] It doesn't seem like we've been far apart, so jealous
[00:45] My life will turn out
[00:49] It doesn't seem like it could last for all my life

[00:54] When stars smile at moon
[00:56] Wonder how it looks in your eyes
[00:59] Just dialing your number
[01:01] Failing to press the last two
[01:04] Pray in my heart
[01:05] The Moon Reaches Stars
[01:07] If you hold me tight
[01:09] Feel your heartbeat so close
[01:12] Would this last long?

[01:37] My life will turn out
[01:40] To move on like that
[01:43] Just give me something that proves you're not fooling
[01:48] Just give me
[01:53] You gotta tell me, your love flows all over me

[01:59] My life will turn out
[02:02] To be so cruel
[02:04] Just give me something that proves you're not fooling
[02:10] If this is so real
[02:15] Now just tell me, your love flows all over me

[02:20] When stars smile at moon
[02:23] Wonder how it looks in your eyes
[02:24] If I could ever tell you that, wouldn't I feel so weak?
[02:30] Pray in my heart
[02:31] The Moon Reaches Stars
[02:34] You won't leave me again
[02:35] If I could ever tell you that
[02:37] You would not leave me

[02:41] When stars smile at moon
[02:43] Wonder how it looks in your eyes
[02:45] I need that smile so close
[02:48] Always thinking of you
[02:51] Up in the sky high
[02:52] The Moon Reaches Stars
[02:54] If you hold me tight
[02:56] Feel your heartbeat so close
[02:58] Will this last long?`;

export const daySyncedLyrics = {
  language: 'en',
  translations: { es: daySpanishLyrics },
  timingNote: 'Tiempos aproximados aportados por ti (±1–2 s según la versión del audio).',
  lrc,
  cues: parseLrc(lrc),
  text: lrc.replace(/^\[\d{2}:\d{2}\] /gm, ''),
};
