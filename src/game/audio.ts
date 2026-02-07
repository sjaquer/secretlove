// ===== AUDIO SYSTEM =====

import { MELODY_INTERIOR, MELODY_EXTERIOR, TILE_SIZE } from './constants';

export class AudioSystem {
  private audioCtx: AudioContext | null = null;
  private nextNoteTime = 0;
  private currentNoteIndex = 0;

  init() {
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not available');
    }
  }

  resume() {
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  suspend() {
    this.audioCtx?.suspend();
  }

  playSound(type: 'jump' | 'coin' | 'win' | 'fall' | 'lava') {
    if (!this.audioCtx) return;
    try {
      this.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      const t = this.audioCtx.currentTime;

      switch (type) {
        case 'jump':
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          osc.start(); osc.stop(t + 0.1);
          break;
        case 'coin':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, t);
          osc.frequency.setValueAtTime(900, t + 0.1);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.start(); osc.stop(t + 0.3);
          break;
        case 'win':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, t);
          osc.frequency.linearRampToValueAtTime(880, t + 1);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 2);
          osc.start(); osc.stop(t + 2);
          break;
        case 'fall':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.linearRampToValueAtTime(50, t + 0.5);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.5);
          osc.start(); osc.stop(t + 0.5);
          break;
        case 'lava':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.linearRampToValueAtTime(30, t + 0.3);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.3);
          osc.start(); osc.stop(t + 0.3);
          break;
      }
    } catch (e) {
      // Silent fail
    }
  }

  updateMusic(playerX: number, isRunning: boolean) {
    if (!this.audioCtx || !isRunning) return;
    try {
      if (this.audioCtx.currentTime >= this.nextNoteTime) {
        const currentMelody = (playerX > 150 * TILE_SIZE && playerX < 300 * TILE_SIZE) || playerX > 450 * TILE_SIZE
          ? MELODY_EXTERIOR
          : MELODY_INTERIOR;

        const noteData = currentMelody[this.currentNoteIndex % currentMelody.length];
        
        if (noteData.note > 0) {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = noteData.note;
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + noteData.dur);
          osc.start();
          osc.stop(this.audioCtx.currentTime + noteData.dur);
        }
        this.nextNoteTime += noteData.dur + 0.05;
        this.currentNoteIndex++;
      }
    } catch (e) {
      // Silent fail
    }
  }
}
