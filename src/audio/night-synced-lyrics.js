import { parseLrc } from './lyrics.js';
import { nightSpanishLyrics } from './night-lyrics-es.js';

// Text and timestamps supplied by the user, preserved without timing changes.
const lrc = `[00:20] Time to shine and I'm down to ride
[00:22] I'm gonna drive until the break of dawn, wilding out
[00:25] I'm on a mission grinding out
[00:26] Whatever it is I gotta do
[00:28] Riding out until the day I meet you
[00:29] I'm riding out

[00:30] I look up in the sky (Sky)
[00:32] Asking lotta, "Why?" (Why?)
[00:33] But never let it phase me, I'm keeping good vibes
[00:35] When I'm on the road, I watch out for all surprises
[00:38] What it provides us
[00:39] Good and bad but nothing unties us

[00:40] Another wander in the night
[00:43] Let me paint the view
[00:45] Colour a town with my light
[00:49] For every moment shared with you
[00:51] Not out in the day
[00:53] But never fully gone
[00:55] Going to be back again
[00:59] Until the coming of a dawn

[01:01] (Hey)
[01:02] For all the days ahead of us put your hands up
[01:04] Wave 'em side to side for good luck, ah
[01:06] (Hey)
[01:07] For all the nights like this, put your hands up
[01:09] Love the moment even from dusk, yup
[01:11] (Hey)
[01:12] You always got my back, and of course I got your back
[01:15] Don't you worry about that now
[01:16] (Hey)
[01:17] It's been a good day, good night
[01:19] It's gonna be a good day, good night

[01:41] When two hands meet at zenith
[01:44] Nothing comes between us
[01:46] Dancing like ballerinas
[01:48] Under the moon light all night long
[01:51] How these plain and simple scenes
[01:54] Get painted so vividly by you
[01:58] I just want to stay with you

[02:01] Around the world I slowly dance
[02:04] Whenever our eyes meet
[02:06] You know you leave me in a trance
[02:10] It means everything to me
[02:11] Looking down below
[02:14] The one I seek to find
[02:16] No matter where you might go
[02:20] Remember you'll be on my mind

[02:22] (Hey)
[02:23] Always watching over me somehow you make me feel invincible
[02:25] Power to my soul, yup
[02:27] (Hey)
[02:28] I'm at ease with things that used to bother me
[02:30] 'Cause your existence just lights me up, yup
[02:32] (Hey)
[02:33] You always got my back, and of course I got your back
[02:35] Don't you worry about that now
[02:37] (Hey)
[02:38] It's been a good day, good night
[02:39] It's gonna be a good day, good night

[02:41] Within the inner heart I plead
[02:44] For you to talk to me
[02:46] I want to hear all the good and bad
[02:49] The new stories you have
[02:51] As I drift across the sky
[02:54] The hour hand turns high
[02:56] So goodnight
[02:59] Let me sing a lullaby, love
[03:06] I'll be seeing you, baby`;

export const nightSyncedLyrics = {
  language: 'en',
  translations: { es: nightSpanishLyrics },
  lrc,
  cues: parseLrc(lrc),
  text: lrc.replace(/^\[\d{2}:\d{2}\] /gm, ''),
};
