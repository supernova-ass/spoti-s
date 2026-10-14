// Web Audio Synthesizer for authentic Sundanese traditional tuning (Salendro & Pelog)
// Models metallic Degung bonang bells and gentle Suling bamboo flute harmonics

class SundaAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentSongKey = '';
  private currentTime = 0;
  private duration = 100;
  private masterGain: GainNode | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  // Traditional Sundanese Pentatonic Scales (frequencies in Hz)
  private scales: Record<string, number[]> = {
    manuk_dadali: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25], // C D E G A C D E
    bubuy_bulan: [220.0, 246.94, 277.18, 329.63, 369.99, 440.0, 493.88], // Melancholic Pelog
    es_lilin: [261.63, 311.13, 349.23, 392.0, 466.16, 523.25], // Salendro energetic
    mojang_priangan: [246.94, 293.66, 329.63, 392.0, 440.0, 493.88, 587.33],
    tokecang: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    warung_pojok: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0],
    sabilulungan: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25],
    panon_hideung: [220.0, 261.63, 293.66, 329.63, 369.99, 440.0],
    default: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
  };

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a resonant bell note (Gamelan Degung / Bonang)
  private playDegungNote(freq: number, timeOffset = 0, volume = 0.3) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime + timeOffset;

    // Fundamental oscillator (metallic bell tone)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Subtle overtone for bronze bell resonance
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 1.8);

    // Natural bell envelope: sharp attack, long resonant decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.3);
    osc2.stop(now + 2.3);
  }

  // Play gentle bamboo flute (Suling Sunda) with vibrato
  private playSulingNote(freq: number, duration: number, timeOffset = 0, volume = 0.25) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime + timeOffset;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator(); // Vibrato
    const lfoGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Gentle vibrato 5Hz
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.2, now);
    lfoGain.gain.setValueAtTime(4.5, now);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.08);
    gain.gain.setValueAtTime(volume * 0.9, now + duration - 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + duration + 0.1);
    osc.stop(now + duration + 0.1);
  }

  // Play a soft low rhythmic percussion pulse (Kendang)
  private playKendangPulse(timeOffset = 0, isTung = false) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime + timeOffset;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isTung ? 180 : 90;
    const endFreq = isTung ? 75 : 42;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.18);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(isTung ? 0.2 : 0.28, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playTrack(melodyKey: string, duration: number, startFrom = 0) {
    this.initContext();
    this.stop();

    this.isPlaying = true;
    this.currentSongKey = melodyKey;
    this.duration = duration;
    this.currentTime = startFrom;

    const scale = this.scales[melodyKey] || this.scales.default;

    // Trigger melodic notes in a recurring musical beat loop
    let beat = Math.floor(startFrom * 2);

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;

      this.currentTime += 0.5;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentTime);
      }

      if (this.currentTime >= this.duration) {
        this.stop();
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
        return;
      }

      // Synthesize rhythmic pattern for this step
      const noteIdx1 = (beat * 3 + (beat % 5)) % scale.length;
      const noteIdx2 = ((beat * 2) + 1) % scale.length;

      // Degung bell chime
      if (beat % 2 === 0) {
        this.playDegungNote(scale[noteIdx1], 0, 0.24);
      } else {
        this.playDegungNote(scale[noteIdx2] * (beat % 4 === 3 ? 1.5 : 1), 0, 0.16);
      }

      // Suling flute melody lines on sustained bars
      if (beat % 4 === 0) {
        const fluteFreq = scale[(beat + 2) % scale.length] * 2;
        this.playSulingNote(fluteFreq, 1.4, 0, 0.18);
      }

      // Kendang pulse on downbeats
      if (beat % 4 === 0) {
        this.playKendangPulse(0, false);
      } else if (beat % 4 === 2) {
        this.playKendangPulse(0, true);
      }

      beat++;
    }, 500);
  }

  public pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public resume() {
    if (this.currentSongKey && !this.isPlaying) {
      this.playTrack(this.currentSongKey, this.duration, this.currentTime);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.isPlaying) {
      this.playTrack(this.currentSongKey, this.duration, this.currentTime);
    } else if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime);
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public onTimeUpdate(cb: (time: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onEnded(cb: () => void) {
    this.onEndedCallback = cb;
  }
}

export const sundaAudio = typeof window !== 'undefined' ? new SundaAudioEngine() : (null as unknown as SundaAudioEngine);
