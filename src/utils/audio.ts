// Web Audio API procedural synthesizer for futuristic arcade SFX and ambient cyber drone

class SoundSystem {
  private ctx: AudioContext | null = null;
  private bgmOsc1: OscillatorNode | null = null;
  private bgmOsc2: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playClick(enabled = true) {
    if (!enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {
      // AudioContext not allowed before user gesture
    }
  }

  public playCorrect(combo: number, enabled = true) {
    if (!enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const baseFreq = 520 + Math.min(combo * 40, 400);

      // Dual oscillator synth ding
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

      osc2.frequency.setValueAtTime(baseFreq * 2, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, now + 0.15);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } catch {}
  }

  public playWrong(enabled = true) {
    if (!enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  public playCountdown(isFinal = false, enabled = true) {
    if (!enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isFinal ? 'triangle' : 'sine';
      const freq = isFinal ? 880 : 440;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.3 : 0.15));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isFinal ? 0.35 : 0.2));
    } catch {}
  }

  public playLevelUp(enabled = true) {
    if (!enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [440, 554, 659, 880];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.18);
      });
    } catch {}
  }

  public playGameOver(enabled = true) {
    if (!enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [440, 370, 311, 220];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.12;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {}
  }

  public startAmbientBgm(enabled = true) {
    if (!enabled || this.isBgmPlaying) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.bgmOsc1 = this.ctx.createOscillator();
      this.bgmOsc2 = this.ctx.createOscillator();
      this.bgmGain = this.ctx.createGain();

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      this.bgmOsc1.type = 'sine';
      this.bgmOsc1.frequency.setValueAtTime(55, now); // A1 bass drone

      this.bgmOsc2.type = 'triangle';
      this.bgmOsc2.frequency.setValueAtTime(110, now); // A2 harmonic

      this.bgmGain.gain.setValueAtTime(0.001, now);
      this.bgmGain.gain.linearRampToValueAtTime(0.04, now + 1.5); // soft fade in

      this.bgmOsc1.connect(filter);
      this.bgmOsc2.connect(filter);
      filter.connect(this.bgmGain);
      this.bgmGain.connect(this.ctx.destination);

      this.bgmOsc1.start();
      this.bgmOsc2.start();
      this.isBgmPlaying = true;
    } catch {}
  }

  public stopAmbientBgm() {
    if (!this.isBgmPlaying) return;
    try {
      if (this.bgmGain && this.ctx) {
        this.bgmGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        try {
          this.bgmOsc1?.stop();
          this.bgmOsc2?.stop();
          this.bgmOsc1?.disconnect();
          this.bgmOsc2?.disconnect();
        } catch {}
        this.bgmOsc1 = null;
        this.bgmOsc2 = null;
        this.bgmGain = null;
        this.isBgmPlaying = false;
      }, 600);
    } catch {
      this.isBgmPlaying = false;
    }
  }

  public triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error', enabled = true) {
    if (!enabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        switch (type) {
          case 'light':
            navigator.vibrate(15);
            break;
          case 'medium':
            navigator.vibrate(30);
            break;
          case 'heavy':
            navigator.vibrate([40, 20, 40]);
            break;
          case 'success':
            navigator.vibrate([20, 30, 40]);
            break;
          case 'error':
            navigator.vibrate([60, 40, 80]);
            break;
        }
      } catch {}
    }
  }
}

export const sounds = new SoundSystem();
