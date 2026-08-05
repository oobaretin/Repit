
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
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
  }

  /** Resume AudioContext — must run during (or right after) a user gesture on iOS. */
  public async unlock(): Promise<void> {
    this.initialize();
    if (!this.audioCtx) return;
    await this.resumeContext();
    void this.decodeMalaBuffer();
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

  /** Immediate peak + gentle exponential fade (Gong, Crystal, bowl partials). */
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

  private playSampleFromBuffer(buffer: AudioBuffer) {
    const output = this.getOutput();
    if (!output) return;
    const source = this.audioCtx!.createBufferSource();
    source.buffer = buffer;
    source.connect(output);
    source.start(0);
    this.track(source);
  }

  private async playMala() {
    const buffer = await this.decodeMalaBuffer();
    if (buffer) this.playSampleFromBuffer(buffer);
  }

  private playGong() {
    this.playClassicTone(120, 1.8, 0.5);
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

  public async playSound(sound: SoundOption): Promise<void> {
    this.initialize();
    if (!this.isInitialized || !this.audioCtx || sound === SoundOption.None) return;

    if (this.audioCtx.state === 'suspended') {
      await this.unlock();
    } else {
      void this.decodeMalaBuffer();
    }
    this.clearActive();

    switch (sound) {
      case SoundOption.Mala:
        await this.playMala();
        break;
      case SoundOption.Gong:
        this.playGong();
        break;
      case SoundOption.Crystal:
        this.playCrystal();
        break;
      case SoundOption.Bowl:
        this.playBowl();
        break;
      default:
        break;
    }
  }
}

export const audioService = new AudioService();
