
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

  /** Decode original Mixkit bead click from embedded MP3 (no network fetch). */
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

  /** Immediate peak, gentle exponential fade-out (Gong, Crystal). */
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

  /** Soft attack + gentle fade (Wood, Bell, Bowl, etc.). */
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

  private playNoise(duration: number, peak: number, filterFreq: number, q = 1.2) {
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
    gain.gain.linearRampToValueAtTime(peak, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.start(t);
    source.stop(t + duration + 0.02);
    this.track(source);
  }

  /** Original Mixkit bead click — embedded MP3 via Web Audio buffer. */
  private playMalaFromBuffer(buffer: AudioBuffer) {
    const source = this.audioCtx!.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx!.destination);
    source.start(0);
    this.track(source);
  }

  private async playMala() {
    const buffer = await this.decodeMalaBuffer();
    if (buffer) {
      this.playMalaFromBuffer(buffer);
    }
  }

  private playWood() {
    this.playNoise(0.18, 0.28, 420, 2.4);
    this.playSoftTone(180, 0.35, 0.18, { type: 'triangle', attack: 0.005, pitchEnd: 120 });
  }

  private playGong() {
    this.playClassicTone(120, 1.8, 0.5);
  }

  private playBell() {
    this.playSoftTone(520, 1.15, 0.32, { attack: 0.008 });
    this.playSoftTone(780, 0.95, 0.12, { attack: 0.01 });
  }

  private playCrystal() {
    this.playClassicTone(2200, 1.2, 0.35);
  }

  private playBowl() {
    this.playSoftTone(440, 1.85, 0.34, { attack: 0.018, pitchEnd: 380 });
    this.playSoftTone(880, 1.4, 0.08, { attack: 0.02 });
  }

  private playTap() {
    this.playNoise(0.12, 0.16, 680, 1.8);
    this.playSoftTone(300, 0.22, 0.1, { type: 'triangle', attack: 0.004 });
  }

  private playBreath() {
    this.playNoise(0.55, 0.12, 900, 0.7);
    this.playSoftTone(220, 0.5, 0.04, { attack: 0.08 });
  }

  private playOm() {
    this.playSoftTone(136, 0.95, 0.2, { attack: 0.06 });
    this.playSoftTone(272, 0.85, 0.07, { attack: 0.08 });
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
