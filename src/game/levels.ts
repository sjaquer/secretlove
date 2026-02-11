// ===== LEVEL DEFINITIONS – 5 unique levels (Redesigned & Tuned) =====

import {
  TILE_SIZE, LEVEL_HEIGHT,
  TILE_AIR, TILE_GROUND, TILE_PLATFORM, TILE_HAZARD, TILE_BRIDGE, TILE_SPECIAL,
  BASE_GRAVITY, MOON_GRAVITY,
} from './constants';
import type { LevelDef, LevelData } from './types';

// ---- Helpers ----
function create(w: number, h: number): Uint8Array { return new Uint8Array(w * h); }
function set(t: Uint8Array, w: number, x: number, y: number, v: number) {
  if (x >= 0 && x < w && y >= 0 && y < LEVEL_HEIGHT) t[y * w + x] = v;
}
function hLine(t: Uint8Array, w: number, x: number, y: number, len: number, v: number) {
  for (let i = 0; i < len; i++) set(t, w, x + i, y, v);
}
function vLine(t: Uint8Array, w: number, x: number, y: number, len: number, v: number) {
  for (let i = 0; i < len; i++) set(t, w, x, y + i, v);
}
function rect(t: Uint8Array, w: number, x1: number, y1: number, x2: number, y2: number, v: number) {
  for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) set(t, w, x, y, v);
}

// Visual helpers
function buildTree(t: Uint8Array, w: number, x: number, y: number) {
  vLine(t, w, x, y - 3, 4, TILE_SPECIAL); 
  hLine(t, w, x - 2, y - 4, 5, TILE_PLATFORM);
  hLine(t, w, x - 1, y - 5, 3, TILE_PLATFORM);
}

function buildHouse(t: Uint8Array, w: number, x: number, y: number, width: number, height: number) {
  rect(t, w, x, y - height, x + width - 1, y, TILE_GROUND);
  hLine(t, w, x - 1, y - height - 1, width + 2, TILE_PLATFORM); 
  set(t, w, x + 2, y, TILE_SPECIAL);
  set(t, w, x + 2, y - 1, TILE_SPECIAL);
}

function buildPyramid(t: Uint8Array, w: number, x: number, y: number, size: number) {
  for (let i = 0; i < size; i++) {
    hLine(t, w, x + i, y - i, (size - i) * 2, TILE_GROUND);
  }
}

function buildArch(t: Uint8Array, w: number, x: number, y: number, wInner: number, hInner: number) {
  vLine(t, w, x, y - hInner, hInner + 1, TILE_GROUND);
  vLine(t, w, x + wInner + 1, y - hInner, hInner + 1, TILE_GROUND);
  hLine(t, w, x, y - hInner - 1, wInner + 2, TILE_GROUND);
}

// =========================================================
// LEVEL 1 – Castillo de las Sombras 
// Redesign: Dungeon cells, lava halls, ascending towers
// =========================================================
function buildCastle(): LevelData {
  const W = 140, H = LEVEL_HEIGHT;
  const t = create(W, H);

  rect(t, W, 0, 13, 139, 14, TILE_HAZARD); // Lava base
  
  // Start Area
  rect(t, W, 0, 10, 15, 14, TILE_GROUND);
  // REMOVED ARCH that was blocking the start
  
  // Section 1: Closer bridges
  hLine(t, W, 16, 11, 4, TILE_BRIDGE); // x16-19
  hLine(t, W, 21, 10, 3, TILE_BRIDGE); // x21-23 (gap 1)
  hLine(t, W, 25, 9, 3, TILE_BRIDGE);  // x25-27 (gap 1)
  
  // Platform helper to reach Tower 1
  hLine(t, W, 29, 8, 3, TILE_PLATFORM); // Extended helper

  // Tower 1
  rect(t, W, 32, 6, 36, 14, TILE_GROUND);
  rect(t, W, 33, 6, 35, 12, TILE_SPECIAL);
  hLine(t, W, 37, 8, 3, TILE_PLATFORM);
  
  // The Great Hall
  rect(t, W, 42, 10, 65, 12, TILE_GROUND); 
  vLine(t, W, 46, 5, 3, TILE_SPECIAL); // Shortened: y=5,6,7 (above walkway)
  vLine(t, W, 54, 5, 3, TILE_SPECIAL); // Shortened: y=5,6,7 (above walkway)
  hLine(t, W, 49, 5, 3, TILE_PLATFORM);
  hLine(t, W, 57, 5, 3, TILE_PLATFORM);
  
  // Descent
  rect(t, W, 68, 12, 75, 14, TILE_GROUND);
  hLine(t, W, 77, 11, 3, TILE_BRIDGE);
  hLine(t, W, 81, 10, 3, TILE_BRIDGE);
  
  // Castle Keep
  rect(t, W, 86, 10, 96, 14, TILE_GROUND);
  rect(t, W, 89, 5, 93, 9, TILE_GROUND);
  hLine(t, W, 84, 8, 3, TILE_PLATFORM);
  hLine(t, W, 95, 8, 3, TILE_PLATFORM); // Step down
  hLine(t, W, 88, 4, 6, TILE_PLATFORM); // Top
  
  // Balcony walk (More continuous)
  rect(t, W, 100, 6, 115, 7, TILE_BRIDGE);
  vLine(t, W, 105, 7, 7, TILE_SPECIAL);
  vLine(t, W, 110, 7, 7, TILE_SPECIAL);
  
  // Final Tower
  rect(t, W, 118, 8, 139, 14, TILE_GROUND); // Base
  
  // Throne Room (Hollow) - Fixed: Portal was buried inside solid blocks
  rect(t, W, 123, 4, 133, 4, TILE_GROUND); // Roof
  vLine(t, W, 123, 4, 2, TILE_GROUND); // Left Wall (Top only -> Entrance below)
  vLine(t, W, 133, 4, 4, TILE_GROUND); // Right Wall (Solid)

  // Decor
  buildArch(t, W, 126, 4, 4, 3);

  return {
    width: W, height: H, tiles: t,
    startX: 3 * TILE_SIZE, startY: 8 * TILE_SIZE,
    portalX: 128 * TILE_SIZE, portalY: 5 * TILE_SIZE,
    enemies: [
      { x: 45, y: 9, type: 'slime', patrolLeft: 42, patrolRight: 60 },
      { x: 55, y: 4, type: 'bat', patrolLeft: 45, patrolRight: 60 },
      { x: 72, y: 11, type: 'slime', patrolLeft: 68, patrolRight: 75 },
      { x: 90, y: 3, type: 'bat', patrolLeft: 86, patrolRight: 96 },
      { x: 108, y: 5, type: 'slime', patrolLeft: 100, patrolRight: 115 },
      { x: 122, y: 7, type: 'slime', patrolLeft: 120, patrolRight: 130 },
    ],
    flowers: [
      { x: 20 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 53 * TILE_SIZE, y: 4 * TILE_SIZE },
      { x: 89 * TILE_SIZE, y: 3 * TILE_SIZE },
    ],
    torches: [
      { x: 8 * TILE_SIZE, y: 9 * TILE_SIZE },
      { x: 34 * TILE_SIZE, y: 5 * TILE_SIZE },
      { x: 46 * TILE_SIZE, y: 8 * TILE_SIZE },
      { x: 54 * TILE_SIZE, y: 8 * TILE_SIZE },
      { x: 91 * TILE_SIZE, y: 4 * TILE_SIZE },
      { x: 126 * TILE_SIZE, y: 5 * TILE_SIZE },
    ],
    checkpoints: [
      { x: 44 * TILE_SIZE, y: 9 * TILE_SIZE },
      { x: 86 * TILE_SIZE, y: 9 * TILE_SIZE },
      { x: 118 * TILE_SIZE, y: 7 * TILE_SIZE },
    ],
  };
}

// =========================================================
// LEVEL 2 – Torres del Viento
// =========================================================
function buildRooftop(): LevelData {
  const W = 130, H = LEVEL_HEIGHT;
  const t = create(W, H);
  
  rect(t, W, 0, 14, 129, 14, TILE_HAZARD); 

  // House 1
  buildHouse(t, W, 2, 13, 8, 4); // Roof at y=9
  
  // Chimneys (Fixed: Building UP from bottom actually makes more sense if they are towers coming from below)
  // Let's make them pillars starting from y=10 down to 14
  vLine(t, W, 12, 10, 5, TILE_GROUND); // y=10,11,12,13,14
  vLine(t, W, 15, 10, 5, TILE_GROUND); 
  vLine(t, W, 19, 11, 4, TILE_GROUND); // y=11..14 (Lower)
  
  hLine(t, W, 17, 9, 1, TILE_PLATFORM); // Bridge/Wire
  
  // Cloud platform section
  hLine(t, W, 23, 7, 3, TILE_PLATFORM);
  hLine(t, W, 28, 6, 4, TILE_PLATFORM);
  hLine(t, W, 34, 7, 3, TILE_PLATFORM);
  
  // House 2
  buildHouse(t, W, 42, 13, 6, 8); // Roof at y=5
  hLine(t, W, 38, 9, 3, TILE_BRIDGE); 
  
  // Floating islands (Closer)
  rect(t, W, 50, 9, 54, 10, TILE_GROUND);
  rect(t, W, 57, 6, 61, 7, TILE_GROUND);
  
  // The Great Bridge
  hLine(t, W, 64, 8, 15, TILE_BRIDGE); // Starts x=64
  vLine(t, W, 67, 8, 5, TILE_SPECIAL);
  vLine(t, W, 75, 8, 5, TILE_SPECIAL);
  
  // House 3
  rect(t, W, 82, 10, 90, 13, TILE_GROUND);
  hLine(t, W, 82, 9, 3, TILE_PLATFORM);
  hLine(t, W, 87, 7, 3, TILE_PLATFORM);
  
  // Final clouds
  hLine(t, W, 94, 8, 3, TILE_PLATFORM);
  hLine(t, W, 99, 6, 3, TILE_PLATFORM);
  hLine(t, W, 104, 4, 3, TILE_PLATFORM);
  
  // Final Plaza (High up)
  rect(t, W, 110, 6, 125, 13, TILE_GROUND);
  // Decorative columns (non-blocking, above walkway)
  vLine(t, W, 114, 2, 3, TILE_SPECIAL);
  vLine(t, W, 119, 2, 3, TILE_SPECIAL);
  hLine(t, W, 114, 1, 6, TILE_PLATFORM);

  return {
    width: W, height: H, tiles: t,
    startX: 4 * TILE_SIZE, startY: 8 * TILE_SIZE,
    portalX: 116 * TILE_SIZE, portalY: 5 * TILE_SIZE, // Fixed: Portal was at 6 (inside floor)
    enemies: [
      { x: 18, y: 4, type: 'bat', patrolLeft: 14, patrolRight: 22 },
      { x: 45, y: 4, type: 'bat', patrolLeft: 42, patrolRight: 50 },
      { x: 70, y: 7, type: 'bat', patrolLeft: 67, patrolRight: 78 },
      { x: 86, y: 9, type: 'slime', patrolLeft: 84, patrolRight: 88 },
      { x: 115, y: 5, type: 'bat', patrolLeft: 110, patrolRight: 125 },
    ],
    flowers: [
      { x: 29 * TILE_SIZE, y: 5 * TILE_SIZE },
      { x: 67 * TILE_SIZE, y: 5 * TILE_SIZE },
    ],
    torches: [],
    checkpoints: [
      { x: 42 * TILE_SIZE, y: 4 * TILE_SIZE },  // 1 tile above House 2 surface (y=5)
      { x: 82 * TILE_SIZE, y: 9 * TILE_SIZE },
      { x: 110 * TILE_SIZE, y: 5 * TILE_SIZE },
    ],
  };
}

// =========================================================
// LEVEL 3 – Ciénaga Oscura
// =========================================================
function buildSwamp(): LevelData {
  const W = 140, H = LEVEL_HEIGHT;
  const t = create(W, H);

  rect(t, W, 0, 12, 139, 14, TILE_HAZARD); 

  // Starting docks
  hLine(t, W, 0, 11, 10, TILE_BRIDGE);
  buildTree(t, W, 5, 11);
  
  // Lily pads (More pads to close gaps)
  hLine(t, W, 12, 11, 2, TILE_PLATFORM); 
  hLine(t, W, 15, 11, 2, TILE_PLATFORM);
  hLine(t, W, 19, 10, 2, TILE_PLATFORM);
  
  // Island 1
  rect(t, W, 22, 10, 30, 13, TILE_GROUND);
  buildTree(t, W, 26, 10);
  
  // Tree canopy run
  hLine(t, W, 32, 9, 3, TILE_PLATFORM); // Helper
  hLine(t, W, 36, 7, 3, TILE_PLATFORM);
  vLine(t, W, 42, 6, 8, TILE_SPECIAL);
  hLine(t, W, 39, 6, 6, TILE_PLATFORM); 
  
  // Hanging bridges
  hLine(t, W, 48, 6, 4, TILE_BRIDGE);
  hLine(t, W, 53, 7, 4, TILE_BRIDGE);
  
  // Island 2
  rect(t, W, 59, 9, 75, 13, TILE_GROUND);
  rect(t, W, 65, 8, 66, 9, TILE_SPECIAL); 
  rect(t, W, 70, 7, 72, 9, TILE_SPECIAL); 
  
  // Water sequence
  hLine(t, W, 78, 11, 3, TILE_PLATFORM); // Wider pad
  hLine(t, W, 83, 10, 3, TILE_PLATFORM);
  hLine(t, W, 88, 9, 3, TILE_PLATFORM);
  
  // Dense forest
  rect(t, W, 92, 8, 110, 13, TILE_GROUND);
  buildTree(t, W, 96, 8);
  buildTree(t, W, 105, 8);
  
  // Final stretch
  hLine(t, W, 113, 8, 5, TILE_BRIDGE);
  hLine(t, W, 120, 7, 3, TILE_PLATFORM);
  hLine(t, W, 125, 7, 2, TILE_PLATFORM); // Extra help
  rect(t, W, 129, 6, 139, 13, TILE_GROUND);
  buildTree(t, W, 137, 6); // Moved past portal (x=134) so it doesn't block path

  return {
    width: W, height: H, tiles: t,
    startX: 2 * TILE_SIZE, startY: 10 * TILE_SIZE,
    portalX: 134 * TILE_SIZE, portalY: 5 * TILE_SIZE,
    enemies: [
      { x: 25, y: 9, type: 'frog', patrolLeft: 22, patrolRight: 29 },
      { x: 42, y: 5, type: 'bat', patrolLeft: 38, patrolRight: 50 },
      { x: 65, y: 8, type: 'frog', patrolLeft: 60, patrolRight: 74 },
      { x: 80, y: 7, type: 'bat', patrolLeft: 75, patrolRight: 90 },
      { x: 95, y: 7, type: 'frog', patrolLeft: 91, patrolRight: 108 },
      { x: 130, y: 5, type: 'bat', patrolLeft: 125, patrolRight: 135 },
    ],
    flowers: [
      { x: 40 * TILE_SIZE, y: 4 * TILE_SIZE },
      { x: 71 * TILE_SIZE, y: 5 * TILE_SIZE },
      { x: 104 * TILE_SIZE, y: 3 * TILE_SIZE },
    ],
    torches: [],
    checkpoints: [
      { x: 40 * TILE_SIZE, y: 5 * TILE_SIZE },  // Moved off tree trunk (x=42 is solid), 1 tile above platform
      { x: 92 * TILE_SIZE, y: 7 * TILE_SIZE },
    ],
  };
}

// =========================================================
// LEVEL 4 – Arenas del Olvido
// =========================================================
function buildDesert(): LevelData {
  const W = 135, H = LEVEL_HEIGHT;
  const t = create(W, H);

  rect(t, W, 0, 12, 134, 14, TILE_GROUND);

  rect(t, W, 15, 12, 22, 14, TILE_HAZARD);
  rect(t, W, 80, 12, 88, 14, TILE_HAZARD);

  // Start
  rect(t, W, 5, 11, 10, 11, TILE_GROUND);
  rect(t, W, 7, 10, 9, 10, TILE_GROUND);
  
  // Bridge
  hLine(t, W, 14, 10, 10, TILE_BRIDGE); // x14-23
  
  // Helper to pyramid
  hLine(t, W, 25, 10, 2, TILE_PLATFORM); // x25-26

  // Pyramid 1
  buildPyramid(t, W, 28, 11, 4); 
  
  // Oasis
  rect(t, W, 40, 12, 48, 14, TILE_HAZARD); 
  buildTree(t, W, 38, 12);
  hLine(t, W, 42, 10, 4, TILE_PLATFORM);
  buildTree(t, W, 50, 12);
  
  // Cave
  rect(t, W, 55, 9, 65, 14, TILE_GROUND);
  rect(t, W, 58, 10, 62, 14, TILE_SPECIAL);
  hLine(t, W, 66, 8, 4, TILE_PLATFORM);
  
  // Upper Ruin Path
  hLine(t, W, 72, 7, 3, TILE_BRIDGE);
  vLine(t, W, 75, 7, 5, TILE_SPECIAL);
  hLine(t, W, 76, 6, 3, TILE_BRIDGE);
  
  // Steps to Great Pyramid (Closer)
  hLine(t, W, 82, 6, 3, TILE_BRIDGE);
  hLine(t, W, 87, 8, 3, TILE_PLATFORM);
  hLine(t, W, 92, 10, 3, TILE_PLATFORM);

  // Great Pyramid
  buildPyramid(t, W, 98, 11, 7);
  // Descent platforms
  hLine(t, W, 113, 10, 3, TILE_PLATFORM);
  
  // Sphinx
  rect(t, W, 118, 9, 130, 14, TILE_GROUND);
  rect(t, W, 118, 7, 122, 9, TILE_GROUND);
  // Eyes removed (were blocking portal access)

  return {
    width: W, height: H, tiles: t,
    startX: 2 * TILE_SIZE, startY: 10 * TILE_SIZE,
    portalX: 120 * TILE_SIZE, portalY: 6 * TILE_SIZE, // On sphinx head surface
    enemies: [
      { x: 19, y: 9, type: 'bat', patrolLeft: 14, patrolRight: 24 },
      { x: 30, y: 9, type: 'scorpion', patrolLeft: 28, patrolRight: 35 },
      { x: 60, y: 8, type: 'scorpion', patrolLeft: 55, patrolRight: 64 },
      { x: 104, y: 6, type: 'bat', patrolLeft: 100, patrolRight: 110 },
      { x: 125, y: 8, type: 'scorpion', patrolLeft: 118, patrolRight: 130 },
    ],
    flowers: [
      { x: 44 * TILE_SIZE, y: 8 * TILE_SIZE },
      { x: 105 * TILE_SIZE, y: 2 * TILE_SIZE },
    ],
    torches: [],
    checkpoints: [
      { x: 28 * TILE_SIZE, y: 10 * TILE_SIZE },
      { x: 58 * TILE_SIZE, y: 8 * TILE_SIZE },
      { x: 104 * TILE_SIZE, y: 4 * TILE_SIZE },
    ],
  };
}

// =========================================================
// LEVEL 5 – Jardín Lunar
// =========================================================
function buildMoon(): LevelData {
  const W = 150, H = LEVEL_HEIGHT;
  const t = create(W, H);

  rect(t, W, 0, 14, 149, 14, TILE_HAZARD); 

  rect(t, W, 0, 11, 10, 14, TILE_GROUND);
  
  // Crater
  rect(t, W, 12, 12, 18, 13, TILE_GROUND);
  set(t, W, 11, 11, TILE_GROUND);
  set(t, W, 18, 11, TILE_GROUND);
  
  // Floating Rocks (Closer)
  rect(t, W, 21, 9, 25, 10, TILE_GROUND); // x21
  rect(t, W, 28, 7, 32, 8, TILE_GROUND);  // x28 (gap 2-3)
  rect(t, W, 36, 5, 40, 6, TILE_GROUND);  // x36
  
  // Space Bridge
  hLine(t, W, 44, 5, 10, TILE_BRIDGE); // x44
  vLine(t, W, 49, 5, 10, TILE_SPECIAL);
  
  // Alien Structure
  rect(t, W, 58, 7, 70, 9, TILE_SPECIAL);
  hLine(t, W, 58, 6, 13, TILE_PLATFORM);
  rect(t, W, 62, 1, 66, 4, TILE_SPECIAL); // Raised tower (doesn't block walkway at y=5)
  
  // Asteroid Field (Closer & more platforms)
  hLine(t, W, 74, 8, 3, TILE_PLATFORM);
  hLine(t, W, 78, 6, 3, TILE_PLATFORM);
  hLine(t, W, 83, 8, 3, TILE_PLATFORM);
  hLine(t, W, 88, 5, 3, TILE_PLATFORM);
  hLine(t, W, 94, 7, 3, TILE_PLATFORM);
  
  // Large Moon Base
  rect(t, W, 100, 10, 130, 14, TILE_GROUND);
  rect(t, W, 110, 6, 125, 8, TILE_SPECIAL); // Shortened: y=6-8 (player walks under at y=9)
  hLine(t, W, 112, 5, 10, TILE_PLATFORM);
  
  // Ascent
  hLine(t, W, 132, 8, 3, TILE_PLATFORM);
  hLine(t, W, 136, 6, 3, TILE_PLATFORM);
  hLine(t, W, 140, 4, 3, TILE_PLATFORM);
  
  rect(t, W, 144, 4, 149, 5, TILE_GROUND);

  return {
    width: W, height: H, tiles: t,
    startX: 2 * TILE_SIZE, startY: 9 * TILE_SIZE,
    portalX: 147 * TILE_SIZE, portalY: 2 * TILE_SIZE,
    enemies: [
      { x: 30, y: 5, type: 'alien', patrolLeft: 28, patrolRight: 35 },
      { x: 60, y: 4, type: 'alien', patrolLeft: 58, patrolRight: 70 },
      { x: 95, y: 6, type: 'alien', patrolLeft: 92, patrolRight: 98 },
      { x: 115, y: 4, type: 'alien', patrolLeft: 110, patrolRight: 125 },
      { x: 105, y: 9, type: 'alien', patrolLeft: 101, patrolRight: 109 },
    ],
    flowers: [
      { x: 38 * TILE_SIZE, y: 3 * TILE_SIZE },
      { x: 118 * TILE_SIZE, y: 3 * TILE_SIZE },
    ],
    torches: [],
    checkpoints: [
      { x: 30 * TILE_SIZE, y: 6 * TILE_SIZE },
      { x: 64 * TILE_SIZE, y: 5 * TILE_SIZE },
      { x: 105 * TILE_SIZE, y: 9 * TILE_SIZE },  // Moved before ceiling structure (x=110 has 1-tile gap)
    ],
  };
}

export const LEVELS: LevelDef[] = [
  {
    id: 0,
    name: 'Castillo de las Sombras',
    subtitle: 'Las mazmorras arden con ríos de lava',
    theme: 'castle',
    gravity: BASE_GRAVITY,
    timeLimit: 9999,
    build: buildCastle,
  },
  {
    id: 1,
    name: 'Torres del Viento',
    subtitle: 'Un camino entre los tejados bajo la luna',
    theme: 'rooftop',
    gravity: BASE_GRAVITY,
    timeLimit: 9999,
    build: buildRooftop,
  },
  {
    id: 2,
    name: 'Ciénaga Oscura',
    subtitle: 'Naturaleza muerta y ruinas olvidadas',
    theme: 'swamp',
    gravity: BASE_GRAVITY,
    timeLimit: 9999,
    build: buildSwamp,
  },
  {
    id: 3,
    name: 'Arenas del Olvido',
    subtitle: 'Pirámides antiguas en un mar de arena',
    theme: 'desert',
    gravity: BASE_GRAVITY,
    timeLimit: 9999,
    build: buildDesert,
  },
  {
    id: 4,
    name: 'Jardín Lunar',
    subtitle: 'El vacío del espacio exterior',
    theme: 'moon',
    gravity: MOON_GRAVITY,
    timeLimit: 9999,
    build: buildMoon,
  },
];
