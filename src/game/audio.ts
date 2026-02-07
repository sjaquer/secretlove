// ===== AUDIO SYSTEM – Music + SFX =====

import { LEVEL_MUSIC, SFX } from './constants';
import type { LevelMusicDef } from './types';

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Music scheduler state
  private isPlaying = false;
  private currentLevelIdx = -1;
  private melodyIdx = 0;
  private bassIdx = 0;
  private nextBeatTime = 0;
  private schedulerTimer: number | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.6;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.8;
    this.sfxGain.connect(this.masterGain);
  }

  resume() {
    this.ctx?.resume();
  }

  suspend() {
    this.stopMusic();
    this.ctx?.suspend();
  }

  setMasterVolume(v: number) {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  // ===== SOUND EFFECTS =====
  playSound(name: keyof typeof SFX) {
    if (!this.ctx || !this.sfxGain) return;
    const def = SFX[name];
    if (!def) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = def.type;
    osc.frequency.setValueAtTime(def.freq, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(def.slide, this.ctx.currentTime + def.dur);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + def.dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + def.dur + 0.05);
  }

  // ===== MUSIC SYSTEM =====
  playMusic(levelIdx: number) {
    if (!this.ctx || !this.musicGain) return;
    if (this.currentLevelIdx === levelIdx && this.isPlaying) return;
    this.stopMusic();
    this.currentLevelIdx = levelIdx;
    if (levelIdx < 0 || levelIdx >= LEVEL_MUSIC.length) return;
    this.melodyIdx = 0;
    this.bassIdx = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.1;
    this.isPlaying = true;
    this.scheduleBeat();
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private scheduleBeat() {
    if (!this.isPlaying || !this.ctx || !this.musicGain) return;
    const music = LEVEL_MUSIC[this.currentLevelIdx] as LevelMusicDef;
    if (!music) return;

    const beatDuration = 60 / music.bpm;
    const lookahead = 0.15; // schedule 150ms ahead

    while (this.nextBeatTime < this.ctx.currentTime + lookahead) {
      // Melody note
      const melNote = music.melody[this.melodyIdx % music.melody.length];
      if (melNote > 0) {
        this.playMusicNote(melNote, this.nextBeatTime, beatDuration * 0.8, music.melodyType, music.melodyGain);
      }
      this.melodyIdx++;

      // Bass note
      const bassNote = music.bass[this.bassIdx % music.bass.length];
      if (bassNote > 0) {
        this.playMusicNote(bassNote, this.nextBeatTime, beatDuration * 0.9, music.bassType, music.bassGain);
      }
      this.bassIdx++;

      this.nextBeatTime += beatDuration;
    }

    this.schedulerTimer = window.setTimeout(() => this.scheduleBeat(), 60);
  }

  private playMusicNote(freq: number, startTime: number, duration: number, type: OscillatorType, gain: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;

    // Soft attack + release envelope
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
    gainNode.gain.setValueAtTime(gain, startTime + duration * 0.6);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.musicGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}
