
import { SoundOption } from '../types';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private isInitialized = false;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Map<string, Promise<AudioBuffer | null>> = new Map();

  public initialize() {
    if (this.isInitialized) return;
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
  }

  private async resumeContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  private async loadSound(url: string): Promise<AudioBuffer | null> {
    if (!this.audioCtx) return null;

    if (this.audioBuffers.has(url)) {
      return this.audioBuffers.get(url)!;
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    const promise = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => this.audioCtx!.decodeAudioData(arrayBuffer))
      .then((decodedData) => {
        this.audioBuffers.set(url, decodedData);
        this.loadingPromises.delete(url);
        return decodedData;
      })
      .catch((err) => {
        console.error(`Failed to load sound from ${url}:`, err);
        this.loadingPromises.delete(url);
        return null;
      });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  private async playUrl(url: string) {
    if (!this.isInitialized || !this.audioCtx) return;

    await this.resumeContext();

    try {
      const buffer = await this.loadSound(url);
      if (buffer && this.audioCtx) {
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioCtx.destination);
        source.start(0);
      }
    } catch (e) {
      console.error(`Error playing sound from ${url}`, e);
    }
  }

  private playSynth(frequency: number, type: OscillatorType, duration: number, gainValue: number) {
    if (!this.audioCtx) return;

    this.resumeContext().then(() => {
      if (!this.audioCtx) return;

      const oscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gainNode.gain.setValueAtTime(gainValue, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      oscillator.start(this.audioCtx.currentTime);
      oscillator.stop(this.audioCtx.currentTime + duration);
    });
  }

  public playSound(sound: SoundOption) {
    if (!this.isInitialized) return;

    const MALA_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';

    switch (sound) {
      case SoundOption.Mala:
        this.playUrl(MALA_SOUND_URL);
        break;
      case SoundOption.Gong:
        this.playSynth(120, 'sine', 1.8, 0.5);
        break;
      case SoundOption.Crystal:
        this.playSynth(2200, 'sine', 1.2, 0.35);
        break;
      case SoundOption.None:
        break;
    }
  }
}

export const audioService = new AudioService();
