// Web Audio API Sound Engine
// Provides procedural dreamlike music-box background music and interactive sound effects
// 100% self-contained, no external mp3 download dependencies or CORS issues.

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.masterVolume = 0.5;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentNoteIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.masterVolume * 0.45, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.masterVolume * 0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.masterVolume * 0.45, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.masterVolume * 0.7, this.ctx.currentTime);
    }
  }

  // Romantic Dreamy Music Box Melody:
  // Happy Birthday variations + Canon in D sweet romantic lullaby arpeggios
  startMusic() {
    this.init();
    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;

    // Frequencies (Hz) for a sweet, dreamy music box in C / F major
    const notes = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
      C6: 1046.50
    };

    // Melody sequence: Happy Birthday phrase + Romantic Music Box variations
    const score = [
      // Happy birthday to you
      { note: notes.C5, dur: 0.35, pause: 0.4 },
      { note: notes.C5, dur: 0.25, pause: 0.28 },
      { note: notes.D5, dur: 0.55, pause: 0.6 },
      { note: notes.C5, dur: 0.55, pause: 0.6 },
      { note: notes.F5, dur: 0.6, pause: 0.65 },
      { note: notes.E5, dur: 0.9, pause: 1.0 },

      // Happy birthday to you
      { note: notes.C5, dur: 0.35, pause: 0.4 },
      { note: notes.C5, dur: 0.25, pause: 0.28 },
      { note: notes.D5, dur: 0.55, pause: 0.6 },
      { note: notes.C5, dur: 0.55, pause: 0.6 },
      { note: notes.G5, dur: 0.6, pause: 0.65 },
      { note: notes.F5, dur: 0.9, pause: 1.0 },

      // Happy birthday dear friend
      { note: notes.C5, dur: 0.35, pause: 0.4 },
      { note: notes.C5, dur: 0.25, pause: 0.28 },
      { note: notes.C6, dur: 0.6, pause: 0.65 },
      { note: notes.A5, dur: 0.55, pause: 0.6 },
      { note: notes.F5, dur: 0.55, pause: 0.6 },
      { note: notes.E5, dur: 0.55, pause: 0.6 },
      { note: notes.D5, dur: 0.8, pause: 0.9 },

      // Happy birthday to you!
      { note: notes.B5, dur: 0.35, pause: 0.38 },
      { note: notes.B5, dur: 0.25, pause: 0.28 },
      { note: notes.A5, dur: 0.55, pause: 0.6 },
      { note: notes.F5, dur: 0.55, pause: 0.6 },
      { note: notes.G5, dur: 0.6, pause: 0.65 },
      { note: notes.F5, dur: 1.2, pause: 1.4 },

      // Romantic music-box gentle outro arpeggios
      { note: notes.A4, dur: 0.4, pause: 0.45 },
      { note: notes.C5, dur: 0.4, pause: 0.45 },
      { note: notes.E5, dur: 0.4, pause: 0.45 },
      { note: notes.G5, dur: 0.5, pause: 0.55 },
      { note: notes.A5, dur: 0.7, pause: 0.8 },
      { note: notes.G5, dur: 0.5, pause: 0.55 },
      { note: notes.E5, dur: 0.5, pause: 0.55 },
      { note: notes.C5, dur: 0.9, pause: 1.2 }
    ];

    let noteIdx = 0;

    const playNext = () => {
      if (!this.isPlayingMusic) return;
      const item = score[noteIdx];
      this.playMusicBoxNote(item.note, item.dur);

      if (noteIdx % 4 === 0) {
        this.playSoftChime(item.note / 2, item.dur * 1.5, 0.25);
      }

      noteIdx = (noteIdx + 1) % score.length;
      this.musicTimer = setTimeout(playNext, item.pause * 1000);
    };

    playNext();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleMusic() {
    if (this.isPlayingMusic) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  playMusicBoxNote(freq, duration) {
    if (!this.ctx || !this.isPlayingMusic) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2.01, t);

    noteGain.gain.setValueAtTime(0, t);
    noteGain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 2.2);

    osc.connect(noteGain);
    oscHarmonic.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc.start(t);
    oscHarmonic.start(t);
    osc.stop(t + duration * 2.5);
    oscHarmonic.stop(t + duration * 2.5);
  }

  playSoftChime(freq, duration, vol = 0.2) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  playSparkleSound() {
    this.init();
    if (!this.ctx) return;
    const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.65);
      }, idx * 75);
    });
  }

  playPopSound() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);

    setTimeout(() => {
      this.playSoftChime(880, 0.4, 0.15);
    }, 70);
  }

  playExtinguishSound() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(200, t + 0.25);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);

    setTimeout(() => {
      this.playFanfare();
    }, 180);
  }

  playFanfare() {
    const fanfareNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    fanfareNotes.forEach((f, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.9);
      }, i * 90);
    });
  }

  playTypewriterSound() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, t);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  playEnvelopeSound() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(880, t + 0.15);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export const soundEngine = new SoundEngine();
