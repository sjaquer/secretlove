// ===== GAME TYPES =====

export type LevelTheme = 'castle' | 'rooftop' | 'swamp' | 'desert' | 'moon';

export type EnemyType = 'slime' | 'bat' | 'frog' | 'scorpion' | 'alien';

export type PlayerAnimState = 'idle' | 'walk' | 'jump' | 'fall' | 'stomp' | 'death';

export interface Inputs {
  left: boolean;
  right: boolean;
  up: boolean;
}

export interface Flower {
  x: number;
  y: number;
  id: number;
  active: boolean;
  animOffset: number;
}

export interface EnemySpawn {
  x: number;
  y: number;
  type: EnemyType;
  patrolLeft: number;
  patrolRight: number;
}

export interface TorchObj {
  x: number;
  y: number;
}

export interface Checkpoint {
  x: number;
  y: number;
}

export interface Portal {
  x: number;
  y: number;
  active: boolean;
}

export interface LevelData {
  width: number;
  height: number;
  tiles: Uint8Array;
  startX: number;
  startY: number;
  portalX: number;
  portalY: number;
  enemies: EnemySpawn[];
  flowers: { x: number; y: number }[];
  torches: TorchObj[];
  checkpoints: Checkpoint[];
}

export interface LevelDef {
  id: number;
  name: string;
  subtitle: string;
  theme: LevelTheme;
  gravity: number;
  timeLimit: number;
  build: () => LevelData;
}

export interface IMapAccessor {
  width: number;
  height: number;
  getTile(x: number, y: number): number;
}

export interface GameState {
  running: boolean;
  inputs: Inputs;
  isFading: boolean;
  fadeOpacity: number;
  lastCheckpoint: { x: number; y: number };
  isPausedForFlower: boolean;
  flowerPauseStartTime: number;
  deathMessageShown: boolean;
  currentLevel: number;
  lives: number;
  timeRemaining: number;
  lastTimeTick: number;
  totalFlowers: number;
  score: number;
  levelTransitioning: boolean;
  enemiesKilled: number;
}

export interface LevelMusicDef {
  bpm: number;
  melodyType: OscillatorType;
  bassType: OscillatorType;
  melodyGain: number;
  bassGain: number;
  melody: number[];
  bass: number[];
}
