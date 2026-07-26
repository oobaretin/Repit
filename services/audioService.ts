
import { MALA_MP3_BASE64 } from '../constants/malaAudioData';
import { SoundOption } from '../types';

type ScheduledNode = AudioScheduledSourceNode | OscillatorNode;

class AudioService {
  private audioCtx: AudioContext | null = null;
  private isInitialized = false;
  private masterGain: GainNode | null = null;
  private activeNodes: ScheduledNode[] = [];
  private malaBuffer: AudioBuffer | null = null;
  private malaDecodePromise: Promise<AudioBuffer | null> | null = null;

  public initialize() {
    if (this.isInitialized) return;
    try {
      this.audioCtx = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
      this.isInitialized = true;
      void this.decodeMalaBuffer();
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
  }

  private decodeBase64(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private async decodeMalaBuffer(): Promise<AudioBuffer | null> {
    if (this.malaBuffer) return this.malaBuffer;
    if (!this.malaDecodePromise) {
      this.malaDecodePromise = (async () => {
        if (!this.audioCtx) return null;
        try {
          await this.resumeContext();
          const copy = this.decodeBase64(MALA_MP3_BASE64).slice(0);
          this.malaBuffer = await this.audioCtx.decodeAudioData(copy);
          return this.malaBuffer;
        } catch (e) {
          console.error('Failed to decode embedded Mala audio', e);
          return null;
        }
      })();
    }
    return this.malaDecodePromise;
  }

  private async resumeContext() {
    if (this.audioCtx?.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  private getOutput(): GainNode | null {
    if (!this.audioCtx) return null;
    if (!this.masterGain) {
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.9;
      this.masterGain.connect(this.audioCtx.destination);
    }
    return this.masterGain;
  }

  private clearActive() {
    for (const node of this.activeNodes) {
      try {
        node.stop();
      } catch {
        // already stopped
      }
      try {
        node.disconnect();
      } catch {
        // disconnected
      }
    }
    this.activeNodes = [];
  }

  private track(node: ScheduledNode) {
    this.activeNodes.push(node);
    node.onended = () => {
      this.activeNodes = this.activeNodes.filter((n) => n !== node);
    };
  }

  private now() {
    return this.audioCtx!.currentTime;
  }

  private createGain(initial: number): GainNode {
    const gain = this.audioCtx!.createGain();
    gain.gain.setValueAtTime(initial, this.now());
    gain.connect(this.getOutput()!);
    return gain;
  }

  /** Immediate peak + gentle exponential fade (Gong, Crystal, bell partials). */
  private playClassicTone(frequency: number, duration: number, peak: number) {
    const osc = this.audioCtx!.createOscillator();
    const gain = this.createGain(peak);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.now());
    osc.connect(gain);
    const t = this.now();
    gain.gain.setValueAtTime(peak, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.02);
    this.track(osc);
  }

  /** Soft attack + gentle fade (Om, subtle layers). */
  private playSoftTone(
    frequency: number,
    duration: number,
    peak: number,
    options?: { type?: OscillatorType; attack?: number; pitchEnd?: number },
  ) {
    const osc = this.audioCtx!.createOscillator();
    const gain = this.createGain(0.0001);
    const type = options?.type ?? 'sine';
    const attack = options?.attack ?? 0.012;
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.now());
    if (options?.pitchEnd) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(options.pitchEnd, 1), this.now() + duration);
    }
    osc.connect(gain);
    const t = this.now();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.02);
    this.track(osc);
  }

  private playNoise(
    duration: number,
    peak: number,
    filterFreq: number,
    q = 1.2,
    attack = 0.006,
  ) {
    const bufferSize = Math.max(1, Math.floor(this.audioCtx!.sampleRate * duration));
    const buffer = this.audioCtx!.createBuffer(1, bufferSize, this.audioCtx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.audioCtx!.createBufferSource();
    source.buffer = buffer;
    const filter = this.audioCtx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = q;
    const gain = this.createGain(0.0001);
    source.connect(filter);
    filter.connect(gain);
    const t = this.now();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.start(t);
    source.stop(t + duration + 0.02);
    this.track(source);
  }

  /** Filtered noise with slow swell — breath / air tone. */
  private playNoiseSwell(duration: number, peak: number, filterFreq: number, attack: number) {
    const bufferSize = Math.max(1, Math.floor(this.audioCtx!.sampleRate * duration));
    const buffer = this.audioCtx!.createBuffer(1, bufferSize, this.audioCtx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.audioCtx!.createBufferSource();
    source.buffer = buffer;
    const filter = this.audioCtx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.6;
    const gain = this.createGain(0.0001);
    source.connect(filter);
    filter.connect(gain);
    const t = this.now();
    const sustainAt = t + attack;
    const releaseStart = t + duration * 0.55;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, sustainAt);
    gain.gain.setValueAtTime(peak * 0.85, releaseStart);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.start(t);
    source.stop(t + duration + 0.02);
    this.track(source);
  }

  private playMalaFromBuffer(buffer: AudioBuffer) {
    const source = this.audioCtx!.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx!.destination);
    source.start(0);
    this.track(source);
  }

  private async playMala() {
    const buffer = await this.decodeMalaBuffer();
    if (buffer) this.playMalaFromBuffer(buffer);
  }

  /** Dry wooden block (mokugyo-style) — short knock ~0.35s. */
  private playWood() {
    this.playNoise(0.07, 0.34, 340, 3.2, 0.002);
    this.playClassicTone(196, 0.34, 0.4);
    this.playClassicTone(392, 0.18, 0.07);
  }

  private playGong() {
    this.playClassicTone(120, 1.8, 0.5);
  }

  /** Single temple bell — inharmonic partials, ~1.2s ring. */
  private playBell() {
    this.playClassicTone(520, 1.2, 0.38);
    this.playClassicTone(780, 1.0, 0.17);
    this.playClassicTone(1170, 0.72, 0.07);
  }

  private playCrystal() {
    this.playClassicTone(2200, 1.2, 0.35);
  }

  /** Singing bowl — detuned partials for natural beat, ~2s decay. */
  private playBowl() {
    this.playClassicTone(440, 2.0, 0.35);
    this.playClassicTone(443, 2.0, 0.28);
    this.playClassicTone(880, 1.55, 0.07);
  }

  /** Soft felt mallet — very short muted tap ~0.22s. */
  private playTap() {
    this.playNoise(0.05, 0.15, 580, 2.5, 0.002);
    this.playClassicTone(290, 0.2, 0.13);
  }

  /** Gentle exhale — quiet filtered air swell ~0.6s. */
  private playBreath() {
    this.playNoiseSwell(0.6, 0.13, 820, 0.14);
    this.playSoftTone(220, 0.45, 0.035, { attack: 0.1 });
  }

  /** Short Om — traditional ~136 Hz with soft harmonics ~1s. */
  private playOm() {
    this.playSoftTone(136.1, 1.05, 0.23, { attack: 0.08 });
    this.playSoftTone(272.2, 0.92, 0.09, { attack: 0.1 });
    this.playSoftTone(408.3, 0.75, 0.03, { attack: 0.12 });
  }

  public playSound(sound: SoundOption) {
    this.initialize();
    if (!this.isInitialized || !this.audioCtx || sound === SoundOption.None) return;

    void this.audioCtx.resume();

    void this.resumeContext().then(() => {
      if (!this.audioCtx) return;
      this.clearActive();

      switch (sound) {
        case SoundOption.Mala:
          void this.playMala();
          break;
        case SoundOption.Wood:
          this.playWood();
          break;
        case SoundOption.Gong:
          this.playGong();
          break;
        case SoundOption.Bell:
          this.playBell();
          break;
        case SoundOption.Crystal:
          this.playCrystal();
          break;
        case SoundOption.Bowl:
          this.playBowl();
          break;
        case SoundOption.Tap:
          this.playTap();
          break;
        case SoundOption.Breath:
          this.playBreath();
          break;
        case SoundOption.Om:
          this.playOm();
          break;
        default:
          break;
      }
    });
  }
}

export const audioService = new AudioService();
