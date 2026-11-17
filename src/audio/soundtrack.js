// One owner for both audio elements. A new command invalidates pending play()
// promises, so quick theme changes can never revive an old song after a pause.
export class Soundtrack {
  constructor({ tracks, theme, volume = .3, createAudio = () => new Audio(), fadeMs = 2800, onChange = () => {} }) {
    this.theme = theme;
    this.volume = volume;
    this.fadeMs = fadeMs;
    this.onChange = onChange;
    this.intent = false;
    this.autoplayPending = false;
    this.revision = 0;
    this.status = 'loading';
    this.gains = { day: theme === 'day' ? 1 : 0, night: theme === 'night' ? 1 : 0 };
    this.removers = [];
    this.audios = Object.fromEntries(Object.entries(tracks).map(([key, track]) => {
      const audio = createAudio();
      audio.preload = 'metadata';
      audio.loop = true;
      audio.src = track.src;
      audio.volume = this.volume * this.gains[key];
      const listen = (event, callback) => {
        audio.addEventListener(event, callback);
        this.removers.push(() => audio.removeEventListener(event, callback));
      };
      for (const event of ['timeupdate', 'durationchange', 'loadedmetadata']) {
        listen(event, () => {
          if (this.theme !== key) return;
          if (!this.intent && this.status === 'loading') this.status = 'ready';
          this.emit();
        });
      }
      listen('waiting', () => {
        if (this.theme === key && this.intent) { this.status = 'buffering'; this.emit(); }
      });
      listen('playing', () => {
        if (this.theme === key && this.intent) { this.status = 'playing'; this.emit(); }
      });
      listen('error', () => {
        if (this.theme === key) this.fail('error');
      });
      return [key, audio];
    }));
    this.emit();
  }

  emit() {
    const audio = this.audios[this.theme];
    this.onChange({
      theme: this.theme,
      playing: this.intent,
      status: this.status,
      time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      volume: this.volume,
    });
  }

  cancelFade() { clearInterval(this.fadeTimer); this.fadeTimer = null; }

  applyVolume() {
    for (const [key, audio] of Object.entries(this.audios)) audio.volume = this.volume * this.gains[key];
  }

  settle() {
    for (const [key, audio] of Object.entries(this.audios)) {
      this.gains[key] = key === this.theme ? 1 : 0;
      if (key !== this.theme || !this.intent) audio.pause();
    }
    this.applyVolume();
  }

  fadeToTarget() {
    this.cancelFade();
    if (!this.fadeMs) { this.settle(); return; }
    const from = { ...this.gains };
    const started = Date.now();
    this.fadeTimer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - started) / this.fadeMs);
      const eased = (1 - Math.cos(Math.PI * progress)) / 2;
      for (const key of Object.keys(this.gains)) {
        const target = key === this.theme ? 1 : 0;
        this.gains[key] = from[key] + (target - from[key]) * eased;
      }
      this.applyVolume();
      if (progress === 1) { this.cancelFade(); this.settle(); }
    }, 30);
  }

  async start(revision) {
    const theme = this.theme;
    const audio = this.audios[theme];
    this.status = 'loading';
    this.emit();
    try {
      if (audio.error) audio.load();
      // Called directly from the play gesture, without awaiting a network check.
      await audio.play();
      if (revision !== this.revision) {
        if (theme !== this.theme || !this.intent) audio.pause();
        return;
      }
      this.status = 'playing';
      this.autoplayPending = false;
      this.fadeToTarget();
      this.emit();
    } catch (error) {
      if (revision === this.revision) this.fail(error.name === 'NotAllowedError' ? 'interaction' : 'error');
    }
  }

  fail(status) {
    ++this.revision;
    this.intent = false;
    if (status !== 'interaction') this.autoplayPending = false;
    this.cancelFade();
    this.status = status;
    this.settle();
    this.emit();
  }

  autoplay() {
    this.autoplayPending = true;
    return this.play(true);
  }

  resumeFromInteraction() {
    if (this.autoplayPending && !this.intent) return this.play(true);
  }

  play(automatic = false) {
    if (!automatic) this.autoplayPending = false;
    if (Object.values(this.audios).every(audio => audio.paused)) {
      // Very quiet but not muted: this is a genuine audible autoplay attempt,
      // not a muted-autoplay/unmute workaround for browser permissions.
      for (const key of Object.keys(this.gains)) this.gains[key] = key === this.theme ? .01 : 0;
      this.applyVolume();
    }
    this.intent = true;
    this.cancelFade();
    return this.start(++this.revision);
  }

  pause() {
    ++this.revision;
    this.intent = false;
    this.autoplayPending = false;
    this.cancelFade();
    this.status = 'ready';
    this.settle();
    this.emit();
  }

  setTheme(theme) {
    if (theme === this.theme) return;
    ++this.revision;
    this.cancelFade();
    this.theme = theme;
    this.audios[theme].currentTime = 0;
    if (this.intent) return this.start(this.revision);
    this.status = this.autoplayPending ? 'interaction' : this.audios[theme].readyState >= 1 ? 'ready' : 'loading';
    this.settle();
    this.emit();
  }

  setVolume(value) {
    if (!Number.isFinite(value)) return;
    this.volume = Math.max(0, Math.min(1, value));
    this.applyVolume();
    this.emit();
  }

  seek(value) {
    const audio = this.audios[this.theme];
    if (!Number.isFinite(value) || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, value));
    this.emit();
  }

  destroy() {
    ++this.revision;
    this.intent = false;
    this.autoplayPending = false;
    this.cancelFade();
    this.removers.forEach(remove => remove());
    for (const audio of Object.values(this.audios)) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }
}
