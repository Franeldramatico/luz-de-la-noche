// Subtitle text is user-provided data, rendered as text only (never HTML).
export function parseLrc(source) {
  if (typeof source !== 'string' || source.length > 200000) throw new Error('size');
  const offset = Number(source.match(/\[offset:\s*([+-]?\d+)\]/i)?.[1] || 0) / 1000;
  const cues = [];
  for (const line of source.split(/\r?\n/)) {
    const timestamps = [...line.matchAll(/\[(\d{1,3}):([0-5]\d)(?:[.:](\d{1,3}))?\]/g)];
    const text = line.replace(/\[[^\]]*\]/g, '').trim();
    for (const match of timestamps) {
      // LRC positive offset advances the lyrics; negative offset delays them.
      const time = Number(match[1]) * 60 + Number(match[2]) + Number(`0.${match[3] || 0}`) - offset;
      cues.push({ time: Math.max(0, time), text });
    }
  }
  if (!cues.some(cue => cue.text)) throw new Error('empty');
  return cues.sort((a, b) => a.time - b.time);
}

function subtitleTime(value) {
  const match = value.match(/^(?:(\d{2,}):)?([0-5]\d):([0-5]\d)[.,](\d{3})$/);
  if (!match) throw new Error('timestamp');
  return Number(match[1] || 0) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
}

export function parseSubtitles(source, filename = '') {
  if (typeof source !== 'string' || source.length > 200000) throw new Error('size');
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
  const extension = filename.split('.').pop().toLowerCase();
  const webvtt = /^WEBVTT(?:[ \t].*)?(?:\n|$)/.test(text);
  if (extension === 'lrc' || (!webvtt && !['srt', 'vtt'].includes(extension) && !text.includes('-->'))) return parseLrc(text);
  const cues = [];
  for (const block of text.split(/\n[ \t]*\n/)) {
    const lines = block.split('\n');
    if (/^(WEBVTT(?:[ \t]|$)|NOTE(?:[ \t]|$)|STYLE$|REGION$)/.test(lines[0])) continue;
    const timingIndex = lines.findIndex(line => line.includes('-->'));
    if (timingIndex < 0 || timingIndex > 1) throw new Error('timestamp');
    const timing = lines[timingIndex].match(/^(\S+)\s+-->\s+(\S+)(?:[ \t]+.*)?$/);
    if (!timing) throw new Error('timestamp');
    const time = subtitleTime(timing[1]), end = subtitleTime(timing[2]);
    if (end <= time) throw new Error('timestamp');
    const content = lines.slice(timingIndex + 1).join('\n').trim();
    // No DOM parsing or HTML injection. VTT formatting is intentionally not executed.
    cues.push({ time, end, text: content });
  }
  if (!cues.some(cue => cue.text)) throw new Error('empty');
  return cues.sort((a, b) => a.time - b.time);
}

export function cuesExceedDuration(cues, duration) {
  return Number.isFinite(duration) && duration > 0 && cues.some(cue => (cue.end ?? cue.time) > duration + .5);
}

export function currentCue(cues, time) {
  let low = 0, high = cues.length - 1, result = -1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (cues[middle].time <= time) { result = middle; low = middle + 1; }
    else high = middle - 1;
  }
  // SRT/VTT have explicit end times. Don't leave a sung line on screen during
  // an instrumental gap; overlapping cues choose the most recent active cue.
  while (result >= 0) {
    if (cues[result].end === undefined || time < cues[result].end) return result;
    --result;
  }
  return -1;
}
