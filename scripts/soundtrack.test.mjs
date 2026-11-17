import test from 'node:test';
import assert from 'node:assert/strict';
import { Soundtrack } from '../src/audio/soundtrack.js';
import { cuesExceedDuration, currentCue, parseLrc, parseSubtitles } from '../src/audio/lyrics.js';
import { nightLyrics } from '../src/audio/night-lyrics.js';
import { nightSyncedLyrics } from '../src/audio/night-synced-lyrics.js';
import { daySyncedLyrics } from '../src/audio/day-synced-lyrics.js';

class FakeAudio extends EventTarget {
  currentTime = 0;
  duration = 200;
  readyState = 1;
  paused = true;
  volume = 1;
  playCalls = 0;
  play() { this.paused = false; ++this.playCalls; return Promise.resolve(); }
  pause() { this.paused = true; }
  load() {}
  removeAttribute(name) { delete this[name]; }
}

function setup(options = {}) {
  const audios = [];
  const states = [];
  const controller = new Soundtrack({
    tracks: { day: { src: 'day.mp3' }, night: { src: 'night.mp3' } },
    theme: 'day', fadeMs: 0,
    createAudio: () => { const audio = new FakeAudio(); audios.push(audio); return audio; },
    onChange: state => states.push(state), ...options,
  });
  return { controller, day: audios[0], night: audios[1], states };
}

test('construction and theme changes alone never start playback', () => {
  const { controller, day, night } = setup();
  controller.setTheme('night');
  assert.equal(day.playCalls + night.playCalls, 0);
  assert.ok(day.paused && night.paused);
  controller.destroy();
});

test('explicit autoplay request starts the selected track', async () => {
  const { controller, day, night, states } = setup();
  await controller.autoplay();
  assert.equal(day.paused, false);
  assert.equal(night.paused, true);
  assert.equal(states.at(-1).status, 'playing');
  assert.equal(controller.autoplayPending, false);
  controller.destroy();
});

test('blocked autoplay retries on interaction, but a deliberate pause never does', async () => {
  const { controller, day, night, states } = setup();
  day.play = () => Promise.reject(Object.assign(new Error(), { name: 'NotAllowedError' }));
  await controller.autoplay();
  assert.equal(states.at(-1).status, 'interaction');
  assert.equal(controller.autoplayPending, true);
  assert.ok(day.paused && night.paused);
  day.play = FakeAudio.prototype.play;
  await controller.resumeFromInteraction();
  assert.equal(day.paused, false);
  assert.equal(controller.autoplayPending, false);
  controller.pause();
  await controller.resumeFromInteraction();
  assert.ok(day.paused && night.paused);
  controller.destroy();
});

test('blocked autoplay uses the latest theme when interaction arrives', async () => {
  const { controller, day, night, states } = setup();
  day.play = () => Promise.reject(Object.assign(new Error(), { name: 'NotAllowedError' }));
  await controller.autoplay();
  controller.setTheme('night');
  assert.equal(states.at(-1).status, 'interaction');
  await controller.resumeFromInteraction();
  assert.equal(night.paused, false);
  assert.equal(day.paused, true);
  controller.destroy();
});

test('entrance begins quietly and rises gradually without muting', async () => {
  const { controller, day } = setup({ fadeMs: 120 });
  await controller.autoplay();
  assert.ok(day.volume > 0 && day.volume < .01);
  await new Promise(resolve => setTimeout(resolve, 75));
  assert.ok(day.volume > .003 && day.volume < .3);
  await new Promise(resolve => setTimeout(resolve, 120));
  assert.equal(day.volume, .3);
  controller.destroy();
});

test('plays only the selected track, looping at a gentle default volume', async () => {
  const { controller, day, night } = setup();
  await controller.play();
  assert.equal(day.paused, false);
  assert.equal(night.paused, true);
  assert.equal(day.volume, .3);
  assert.ok(day.loop && night.loop);
  controller.destroy();
});

test('theme changes reset the new song and preserve play intent', async () => {
  const { controller, day, night, states } = setup();
  await controller.play();
  night.currentTime = 57;
  await controller.setTheme('night');
  assert.equal(day.paused, true);
  assert.equal(night.paused, false);
  assert.equal(night.currentTime, 0);
  assert.equal(states.at(-1).theme, 'night');
  controller.pause();
  controller.setTheme('day');
  assert.ok(day.paused && night.paused);
  controller.destroy();
});

test('crossfade settles with just one audible song', async () => {
  const { controller, day, night } = setup({ fadeMs: 60 });
  await controller.play();
  await controller.setTheme('night');
  await new Promise(resolve => setTimeout(resolve, 120));
  assert.equal(day.paused, true);
  assert.equal(day.volume, 0);
  assert.equal(night.paused, false);
  assert.equal(night.volume, .3);
  controller.destroy();
});

test('pause cancels an in-flight crossfade', async () => {
  const { controller, day, night } = setup({ fadeMs: 60 });
  await controller.play();
  await controller.setTheme('night');
  controller.pause();
  assert.equal(controller.fadeTimer, null);
  assert.ok(day.paused && night.paused);
  controller.destroy();
});

test('a late play promise cannot restart music after pause', async () => {
  const { controller, day, night, states } = setup();
  let resolve;
  day.play = () => new Promise(done => { resolve = () => { day.paused = false; done(); }; });
  const pending = controller.play();
  controller.pause();
  resolve();
  await pending;
  assert.ok(day.paused && night.paused);
  assert.equal(states.at(-1).playing, false);
  controller.destroy();
});

test('a superseded song cannot override the selected theme', async () => {
  const { controller, day, night, states } = setup();
  let resolve;
  day.play = () => new Promise(done => { resolve = () => { day.paused = false; done(); }; });
  const pending = controller.play();
  await controller.setTheme('night');
  resolve();
  await pending;
  assert.ok(day.paused);
  assert.equal(night.paused, false);
  assert.equal(states.at(-1).theme, 'night');
  controller.destroy();
});

test('blocked playback stops both songs and requests a gesture', async () => {
  const { controller, day, night, states } = setup();
  day.play = () => Promise.reject(Object.assign(new Error(), { name: 'NotAllowedError' }));
  await controller.play();
  assert.ok(day.paused && night.paused);
  assert.equal(states.at(-1).status, 'interaction');
  assert.equal(states.at(-1).playing, false);
  controller.destroy();
});

test('active media errors are recoverable without leaving an old song playing', async () => {
  const { controller, day, night, states } = setup();
  await controller.play();
  day.dispatchEvent(new Event('error'));
  assert.ok(day.paused && night.paused);
  assert.equal(states.at(-1).status, 'error');
  await controller.play();
  assert.equal(states.at(-1).status, 'playing');
  controller.destroy();
});

test('volume and seek values stay in bounds', () => {
  const { controller, day } = setup();
  controller.setVolume(2);
  assert.equal(day.volume, 1);
  controller.setVolume(-1);
  assert.equal(day.volume, 0);
  controller.setVolume(NaN);
  assert.equal(day.volume, 0);
  controller.seek(300);
  assert.equal(day.currentTime, 200);
  controller.seek(-20);
  assert.equal(day.currentTime, 0);
  controller.destroy();
});

test('destroy releases audio, events, and timers', async () => {
  const { controller, day, night, states } = setup({ fadeMs: 900 });
  await controller.play();
  controller.destroy();
  const count = states.length;
  day.dispatchEvent(new Event('error'));
  assert.equal(states.length, count);
  assert.ok(day.paused && night.paused);
  assert.equal(controller.fadeTimer, null);
  assert.equal(day.src, undefined);
});

test('LRC supports metadata, repeated timestamps, decimals, and offset', () => {
  const cues = parseLrc('[ti:Texto de prueba]\n[offset:-500]\n[00:02.50][00:12.500]Una línea de prueba\r\n[00:08]Otra línea');
  assert.deepEqual(cues, [
    { time: 3, text: 'Una línea de prueba' },
    { time: 8.5, text: 'Otra línea' },
    { time: 13, text: 'Una línea de prueba' },
  ]);
});

test('LRC active cue follows seeks and blank instrumental sections', () => {
  const cues = parseLrc('[00:02]Primera prueba\n[00:05]\n[00:08]Segunda prueba');
  assert.equal(currentCue(cues, 0), -1);
  assert.equal(currentCue(cues, 2), 0);
  assert.equal(currentCue(cues, 6), 1);
  assert.equal(cues[currentCue(cues, 6)].text, '');
  assert.equal(currentCue(cues, 10), 2);
  assert.equal(currentCue(cues, 3), 0);
});

test('LRC rejects invalid and oversized input; HTML remains plain text', () => {
  assert.throws(() => parseLrc('No timestamps'));
  assert.throws(() => parseLrc('[00:99]Invalid'));
  assert.throws(() => parseLrc('a'.repeat(200001)));
  assert.equal(parseLrc('[00:01]<img src=x onerror=alert(1)>')[0].text, '<img src=x onerror=alert(1)>');
});

test('night lyrics preserve user-provided English text without inferred timing', () => {
  assert.equal(nightLyrics.language, 'en');
  assert.equal(nightLyrics.text.split('\n\n').length, 7);
  assert.equal(nightLyrics.text.split('\n')[0], "Time to shine and I'm down to ride");
  assert.ok(nightLyrics.text.includes("I'm at easy with things that used to bother me"));
  assert.ok(nightLyrics.text.endsWith("I'll be seeing, baby"));
  assert.doesNotMatch(nightLyrics.text, /\[\d+:\d+/);
});

test('built-in night sync preserves every supplied timestamp and line', () => {
  const supplied = nightSyncedLyrics.lrc.split('\n').filter(Boolean).map(line => {
    const match = line.match(/^\[(\d{2}):(\d{2})\] (.*)$/);
    assert.ok(match);
    return { time: Number(match[1]) * 60 + Number(match[2]), text: match[3] };
  });
  assert.deepEqual(nightSyncedLyrics.cues, supplied);
  assert.equal(nightSyncedLyrics.language, 'en');
  assert.equal(supplied[0].time, 20);
  assert.equal(supplied.at(-1).time, 186);
  assert.ok(supplied.every((cue, index) => index === 0 || cue.time > supplied[index - 1].time));
  assert.equal(cuesExceedDuration(supplied, 227.416236), false);
});

test('night karaoke uses exact boundaries and follows backward seeks and loop reset', () => {
  const cues = nightSyncedLyrics.cues;
  assert.equal(currentCue(cues, 19.999), -1);
  for (const [index, cue] of cues.entries()) {
    assert.equal(currentCue(cues, cue.time), index);
    assert.equal(currentCue(cues, cue.time - .001), index - 1);
  }
  assert.equal(cues[currentCue(cues, 101)].text, 'When two hands meet at zenith');
  assert.equal(cues[currentCue(cues, 121)].text, 'Around the world I slowly dance');
  assert.equal(cues[currentCue(cues, 186)].text, "I'll be seeing you, baby");
  assert.equal(cues[currentCue(cues, 22)].time, 22);
  assert.equal(currentCue(cues, 0), -1);
});

test('full reading text matches the latest user-supplied synchronized version', () => {
  assert.equal(nightSyncedLyrics.text.split('\n\n').length, 8);
  assert.ok(nightSyncedLyrics.text.includes("I'm at ease with things that used to bother me"));
  assert.ok(nightSyncedLyrics.text.endsWith("I'll be seeing you, baby"));
  assert.doesNotMatch(nightSyncedLyrics.text, /\[\d+:\d+/);
});

test('built-in day sync preserves every supplied timestamp and marks approximate timing', () => {
  const supplied = daySyncedLyrics.lrc.split('\n').filter(Boolean).map(line => {
    const match = line.match(/^\[(\d{2}):(\d{2})\] (.*)$/);
    assert.ok(match);
    return { time: Number(match[1]) * 60 + Number(match[2]), text: match[3] };
  });
  assert.deepEqual(daySyncedLyrics.cues, supplied);
  assert.equal(daySyncedLyrics.language, 'en');
  assert.equal(supplied[0].time, 12);
  assert.equal(supplied.at(-1).time, 178);
  assert.ok(supplied.every((cue, index) => index === 0 || cue.time > supplied[index - 1].time));
  assert.equal(cuesExceedDuration(supplied, 207.76), false);
  assert.match(daySyncedLyrics.timingNote, /aproximados/);
  assert.match(daySyncedLyrics.timingNote, /±1–2 s/);
});

test('day karaoke follows supplied boundaries, backward seeks, and reset', () => {
  const cues = daySyncedLyrics.cues;
  assert.equal(currentCue(cues, 11.999), -1);
  for (const [index, cue] of cues.entries()) {
    assert.equal(currentCue(cues, cue.time), index);
    assert.equal(currentCue(cues, cue.time - .001), index - 1);
  }
  assert.equal(cues[currentCue(cues, 54)].text, 'When stars smile at moon');
  assert.equal(cues[currentCue(cues, 161)].text, 'When stars smile at moon');
  assert.equal(cues[currentCue(cues, 178)].text, 'Will this last long?');
  assert.equal(cues[currentCue(cues, 17)].time, 17);
  assert.equal(currentCue(cues, 0), -1);
});

test('full day lyrics retain supplied stanzas without timestamps or commentary', () => {
  assert.equal(daySyncedLyrics.text.split('\n\n').length, 7);
  assert.ok(daySyncedLyrics.text.startsWith("I've never felt like, so miserable"));
  assert.ok(daySyncedLyrics.text.endsWith('Will this last long?'));
  assert.doesNotMatch(daySyncedLyrics.text, /\[\d+:\d+|Notas:|Duración aproximada/);
});

for (const [name, original] of [['day', daySyncedLyrics], ['night', nightSyncedLyrics]]) {
  test(`${name} manual Spanish translation preserves all original cue times`, () => {
    const spanish = original.translations.es;
    assert.equal(spanish.language, 'es');
    assert.match(spanish.translationNote, /Traducción manual/);
    assert.match(spanish.translationNote, /no oficial/);
    assert.deepEqual(spanish.cues.map(cue => cue.time), original.cues.map(cue => cue.time));
    assert.ok(spanish.cues.every(cue => cue.text.trim().length > 0));
    assert.equal(spanish.text.split('\n\n').length, original.text.split('\n\n').length);
    assert.equal(parseLrc(spanish.lrc).length, original.cues.length);
    assert.doesNotMatch(spanish.text, /\[\d+:\d+/);
    assert.notEqual(spanish.text, original.text);
  });

  test(`${name} switching translation never changes the active cue index`, () => {
    const spanish = original.translations.es;
    for (const cue of original.cues) {
      for (const time of [cue.time - .001, cue.time, cue.time + .5]) {
        assert.equal(currentCue(spanish.cues, time), currentCue(original.cues, time));
      }
    }
    assert.equal(currentCue(spanish.cues, 0), -1);
    assert.equal(spanish.cues.at(-1).time, original.cues.at(-1).time);
  });
}

// All timed subtitle fixtures below are original test text, not song lyrics.
test('SRT preserves millisecond starts, ends, and multiline text', () => {
  const cues = parseSubtitles('1\r\n00:00:02,125 --> 00:00:04,500\r\nFirst test\r\nSecond test\r\n\r\n2\r\n00:00:06,000 --> 00:00:08,000\r\nFinal test', 'test.srt');
  assert.deepEqual(cues, [
    { time: 2.125, end: 4.5, text: 'First test\nSecond test' },
    { time: 6, end: 8, text: 'Final test' },
  ]);
  assert.equal(currentCue(cues, 2.124), -1);
  assert.equal(currentCue(cues, 2.125), 0);
  assert.equal(currentCue(cues, 4.5), -1);
  assert.equal(currentCue(cues, 6), 1);
  assert.equal(currentCue(cues, 8), -1);
});

test('WebVTT handles BOM, headers, comments, identifiers, and settings', () => {
  const cues = parseSubtitles('\uFEFFWEBVTT\n\nNOTE ignored\nComment\n\ntest-id\n00:02.125 --> 00:04.500 align:center\nFirst test\n\n00:00:06.000 --> 00:00:08.000\nFinal test', 'test.vtt');
  assert.deepEqual(cues, [
    { time: 2.125, end: 4.5, text: 'First test' },
    { time: 6, end: 8, text: 'Final test' },
  ]);
});

test('overlapping timed cues use the latest active subtitle', () => {
  const cues = [{ time: 1, end: 10, text: 'Long test' }, { time: 2, end: 3, text: 'Short test' }];
  assert.equal(currentCue(cues, 2.5), 1);
  assert.equal(currentCue(cues, 4), 0);
  assert.equal(currentCue(cues, 10), -1);
});

test('subtitle import rejects malformed intervals without making up times', () => {
  assert.throws(() => parseSubtitles('1\n00:00:04,000 --> 00:00:02,000\nTest', 'bad.srt'));
  assert.throws(() => parseSubtitles('1\n00:99:01,000 --> 01:00:02,000\nTest', 'bad.srt'));
  assert.throws(() => parseSubtitles('Untimed text', 'bad.vtt'));
  assert.throws(() => parseSubtitles('a'.repeat(200001), 'large.srt'));
  assert.deepEqual(parseSubtitles('[00:01.25]Original test', 'test.lrc'), [{ time: 1.25, text: 'Original test' }]);
});

test('duration warnings never stretch or change imported timestamps', () => {
  const cues = [{ time: 207, end: 215, text: 'Original test' }];
  const original = JSON.stringify(cues);
  assert.equal(cuesExceedDuration(cues, 207.76), true);
  assert.equal(cuesExceedDuration(cues, 220), false);
  assert.equal(cuesExceedDuration(cues, 0), false);
  assert.equal(JSON.stringify(cues), original);
});
