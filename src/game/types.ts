// ===== GAME TYPES =====

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

export interface CastleObj {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TorchObj {
  x: number;
  y: number;
  side: 'left' | 'right'; // which side of wall
}

export interface LavaPool {
  x: number;
  y: number;
  width: number;
}

export interface Checkpoint {
  x: number;
  y: number;
}

export interface DecoChain {
  x: number;
  y: number;
  length: number;
}

export interface Banner {
  x: number;
  y: number;
  color: string;
}

export interface IMapAccessor {
  width: number;
  height: number;
  getTile(x: number, y: number): number;
}

export interface GameCallbacks {
  onFlowerCollected: (total: number) => void;
  onMessage: (text: string, opts?: { autoClear?: boolean; duration?: number }) => void;
  onWin: (flowersCount: number) => void;
  onDeath: () => void;
  isPausedForFlower: () => boolean;
  isGamePaused: () => boolean;
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
}
