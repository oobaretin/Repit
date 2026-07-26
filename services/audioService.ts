
import { MALA_SOUND_PATH } from '../constants/sounds';
import { SoundOption } from '../types';

type ScheduledNode = AudioScheduledSourceNode | OscillatorNode;

class AudioService {
  private audioCtx: AudioContext | null = null;
  private isInitialized = false;
  private masterGain: GainNode | null = null;
  private audioBuffers = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<AudioBuffer | null>>();
  private activeNodes: ScheduledNode[] = [];

  public initialize() {
    if (this.isInitialized) return;
    try {
      this.audioCtx = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
      this.isInitialized = true;
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
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

  private scheduleDecay(gain: GainNode, peak: number, duration: number, attack = 0.012) {
    const t = this.now();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  }

  private playOsc(
    frequency: number,
    type: OscillatorType,
    duration: number,
    peak: number,
    options?: { detune?: number; pitchEnd?: number; attack?: number },
  ) {
    const osc = this.audioCtx!.createOscillator();
    const gain = this.createGain(0.0001);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.now());
    if (options?.detune) osc.detune.setValueAtTime(options.detune, this.now());
    if (options?.pitchEnd) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(options.pitchEnd, 1), this.now() + duration);
    }
    osc.connect(gain);
    this.scheduleDecay(gain, peak, duration, options?.attack);
    osc.start(this.now());
    osc.stop(this.now() + duration + 0.05);
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
    this.scheduleDecay(gain, peak, duration, 0.008);
    source.start(this.now());
    source.stop(this.now() + duration + 0.05);
    this.track(source);
  }

  private async loadSound(url: string): Promise<AudioBuffer | null> {
    if (!this.audioCtx) return null;
    if (this.audioBuffers.has(url)) return this.audioBuffers.get(url)!;
    if (this.loadingPromises.has(url)) return this.loadingPromises.get(url)!;

    const promise = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => this.audioCtx!.decodeAudioData(arrayBuffer))
      .then((decoded) => {
        this.audioBuffers.set(url, decoded);
        this.loadingPromises.delete(url);
        return decoded;
      })
      .catch((err) => {
        console.error(`Failed to load sound from ${url}:`, err);
        this.loadingPromises.delete(url);
        return null;
      });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  private async playMala() {
    const buffer = await this.loadSound(MALA_SOUND_PATH);
    if (!buffer || !this.audioCtx) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    const gain = this.createGain(0.0001);
    source.connect(gain);
    const duration = Math.min(buffer.duration, 1.1);
    this.scheduleDecay(gain, 0.55, duration, 0.015);
    source.start(this.now());
    source.stop(this.now() + duration + 0.05);
    this.track(source);
  }

  private playWood() {
    this.playNoise(0.18, 0.28, 420, 2.4);
    this.playOsc(180, 'triangle', 0.35, 0.18, { pitchEnd: 120, attack: 0.005 });
  }

  private playGong() {
    this.playOsc(120, 'sine', 1.5, 0.42, { pitchEnd: 82, attack: 0.02 });
    this.playOsc(60, 'sine', 1.7, 0.22, { pitchEnd: 48, attack: 0.025 });
  }

  private playBell() {
    this.playOsc(520, 'sine', 1.15, 0.32, { attack: 0.008 });
    this.playOsc(780, 'sine', 0.95, 0.12, { attack: 0.01 });
  }

  private playCrystal() {
    this.playOsc(2200, 'sine', 0.75, 0.28, { attack: 0.006 });
    this.playOsc(4400, 'sine', 0.55, 0.08, { attack: 0.004 });
  }

  private playBowl() {
    this.playOsc(440, 'sine', 1.85, 0.34, { pitchEnd: 380, attack: 0.018 });
    this.playOsc(880, 'sine', 1.4, 0.08, { attack: 0.02 });
  }

  private playTap() {
    this.playNoise(0.12, 0.16, 680, 1.8);
    this.playOsc(300, 'triangle', 0.22, 0.1, { attack: 0.004 });
  }

  private playBreath() {
    this.playNoise(0.55, 0.12, 900, 0.7);
    this.playOsc(220, 'sine', 0.5, 0.04, { attack: 0.08 });
  }

  private playOm() {
    this.playOsc(136, 'sine', 0.95, 0.2, { attack: 0.06 });
    this.playOsc(272, 'sine', 0.85, 0.07, { attack: 0.08 });
  }

  public playSound(sound: SoundOption) {
    if (!this.isInitialized || !this.audioCtx || sound === SoundOption.None) return;

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
