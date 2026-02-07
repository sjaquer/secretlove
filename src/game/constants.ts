// ===== GAME CONSTANTS =====

export const VIEWPORT_WIDTH = 800;
export const VIEWPORT_HEIGHT = 450;
export const TILE_SIZE = 32;

// Tile types
export const TILE_AIR = 0;
export const TILE_STONE = 1;      // Dark stone floor/wall
export const TILE_BRICK = 2;      // Castle bricks  
export const TILE_LAVA = 3;       // Lava (kills player)
export const TILE_BRIDGE = 4;     // Wooden bridge
export const TILE_MOSS_STONE = 5; // Mossy stone

// Colors - Pixel Art Palette (Castle/Gothic)
export const COLORS = {
  // Stone variants
  stoneDark: '#2d2a3d',
  stoneMid: '#4a4559',
  stoneLight: '#5e587a',
  stoneHighlight: '#6e688a',
  stoneShadow: '#1e1b29',
  
  // Brick variants
  brickDark: '#3a2233',
  brickMid: '#5c3a4a',
  brickLight: '#7a4e5e',
  brickMortar: '#2a1a25',
  
  // Moss
  mossDark: '#2a4a2a',
  mossLight: '#3a6a3a',
  
  // Lava
  lavaDeep: '#8b0000',
  lavaMid: '#ff4500',
  lavaBright: '#ff6600',
  lavaGlow: '#ffaa00',
  
  // Wood (bridges, torches)
  woodDark: '#5c3a1e',
  woodMid: '#8b5a2b',
  woodLight: '#a0703c',
  
  // Metal (chains, bars)
  metalDark: '#3a3a3a',
  metalMid: '#5a5a5a',
  metalLight: '#7a7a7a',
  
  // Fire
  fireRed: '#ff2200',
  fireOrange: '#ff6600',
  fireYellow: '#ffcc00',
  fireWhite: '#fff4cc',
  
  // Backgrounds
  bgDungeon: '#0d0a14',
  bgCastle: '#1a1025',
  bgOutside: '#101030',
  bgTower: '#0a0a20',
  
  // UI
  gold: '#d4af37',
  goldDark: '#8b7222',
  pink: '#ff69b4',
  pinkDark: '#db2777',
} as const;

// Flower messages
export const FLOWER_MESSAGES = [
  "La valentía no es la ausencia de miedo.",
  "Tu corazón brilla más que la oscuridad.",
  "Cada paso cuenta, no te detengas.",
  "La esperanza florece en la piedra.",
  "Eres la dueña de tu propio destino.",
  "La bondad es la verdadera nobleza.",
  "Respira... lo estás haciendo bien.",
  "Tu fuerza interior es inquebrantable.",
  "La noche es más oscura antes del alba.",
  "Cree en la magia de tus sueños.",
  "Ya casi llegas, noble princesa.",
  "El amor lo conquista todo."
];

// Music melodies
export const MELODY_INTERIOR = [
  {note: 220, dur: 0.2}, {note: 0, dur: 0.1}, {note: 329.6, dur: 0.2}, {note: 440, dur: 0.4},
  {note: 392, dur: 0.2}, {note: 349, dur: 0.2}, {note: 329.6, dur: 0.4},
  {note: 293.7, dur: 0.2}, {note: 261.6, dur: 0.2}, {note: 246.9, dur: 0.2}, {note: 220, dur: 0.6}
];

export const MELODY_EXTERIOR = [
  {note: 523.25, dur: 0.2}, {note: 0, dur: 0.1}, {note: 659.25, dur: 0.2}, {note: 783.99, dur: 0.4},
  {note: 698.46, dur: 0.2}, {note: 659.25, dur: 0.2}, {note: 587.33, dur: 0.4},
  {note: 523.25, dur: 0.2}, {note: 493.88, dur: 0.2}, {note: 440, dur: 0.6}
];
