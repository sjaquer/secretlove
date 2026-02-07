// ===== LEVEL DEFINITIONS – 5 unique levels =====

import {
  TILE_SIZE, LEVEL_HEIGHT,
  TILE_AIR, TILE_GROUND, TILE_PLATFORM, TILE_HAZARD, TILE_BRIDGE, TILE_SPECIAL,
  BASE_GRAVITY, MOON_GRAVITY,
} from './constants';
import type { LevelDef, LevelData, EnemySpawn, TorchObj, Checkpoint } from './types';

// ---- Helpers ----
function create(w: number, h: number): Uint8Array { return new Uint8Array(w * h); }
function set(t: Uint8Array, w: number, x: number, y: number, v: number) {
  if (x >= 0 && x < w && y >= 0 && y < LEVEL_HEIGHT) t[y * w + x] = v;
}
function hLine(t: Uint8Array, w: number, x: number, y: number, len: number, v: number) {
  for (let i = 0; i < len; i++) set(t, w, x + i, y, v);
}
function rect(t: Uint8Array, w: number, x1: number, y1: number, x2: number, y2: number, v: number) {
  for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) set(t, w, x, y, v);
}

// =========================================================
// LEVEL 1 – Castillo de las Sombras  (castle, lava)
// =========================================================
function buildCastle(): LevelData {
  const W = 100, H = LEVEL_HEIGHT;
  const t = create(W, H);

  // Base ground (stone) rows 13-14
  rect(t, W, 0, 13, 99, 14, TILE_GROUND);
  // Ceiling
  rect(t, W, 0, 0, 99, 1, TILE_GROUND);

  // Walls left
  rect(t, W, 0, 0, 1, 14, TILE_GROUND);

  // --- Section 1: Entrance (0-25) ---
  // Lava pit 1
  rect(t, W, 8, 12, 12, 14, TILE_HAZARD);
  hLine(t, W, 9, 11, 3, TILE_BRIDGE);

  // Platforms
  hLine(t, W, 15, 10, 4, TILE_PLATFORM);
  hLine(t, W, 21, 8, 3, TILE_PLATFORM);

  // --- Section 2: Gauntlet (25-50) ---
  // Lava pit 2
  rect(t, W, 27, 12, 32, 14, TILE_HAZARD);
  hLine(t, W, 28, 11, 2, TILE_BRIDGE);
  hLine(t, W, 31, 11, 2, TILE_BRIDGE);

  // Raised ground islands
  rect(t, W, 35, 11, 39, 12, TILE_GROUND);
  rect(t, W, 42, 10, 45, 12, TILE_GROUND);

  // High platforms
  hLine(t, W, 37, 7, 4, TILE_PLATFORM);
  hLine(t, W, 44, 6, 3, TILE_PLATFORM);

  // Lava pit 3
  rect(t, W, 46, 12, 50, 14, TILE_HAZARD);

  // --- Section 3: Ascent (50-75) ---
  rect(t, W, 52, 11, 56, 12, TILE_GROUND);
  hLine(t, W, 55, 9, 4, TILE_PLATFORM);
  hLine(t, W, 60, 7, 3, TILE_PLATFORM);
  hLine(t, W, 65, 5, 4, TILE_PLATFORM);
  rect(t, W, 70, 4, 74, 5, TILE_GROUND);

  // Lava river below ascent
  rect(t, W, 57, 13, 73, 14, TILE_HAZARD);

  // --- Section 4: Portal room (75-99) ---
  rect(t, W, 76, 6, 80, 14, TILE_GROUND);
  rect(t, W, 77, 6, 79, 12, TILE_AIR); // hollow
  hLine(t, W, 83, 10, 5, TILE_PLATFORM);
  hLine(t, W, 90, 8, 4, TILE_PLATFORM);
  rect(t, W, 95, 7, 99, 7, TILE_GROUND);
  rect(t, W, 98, 0, 99, 14, TILE_GROUND); // right wall

  // Moss stones
  set(t, W, 15, 13, TILE_SPECIAL);
  set(t, W, 35, 13, TILE_SPECIAL);
  set(t, W, 52, 13, TILE_SPECIAL);

  return {
    width: W, height: H, tiles: t,
    startX: 3 * TILE_SIZE, startY: 11 * TILE_SIZE,
    portalX: 96 * TILE_SIZE, portalY: 5 * TILE_SIZE,
    enemies: [
      { x: 16, y: 11, type: 'slime', patrolLeft: 14, patrolRight: 24 },
      { x: 37, y: 6, type: 'bat', patrolLeft: 30, patrolRight: 48 },
      { x: 53, y: 9, type: 'slime', patrolLeft: 52, patrolRight: 57 },
      { x: 62, y: 5, type: 'bat', patrolLeft: 55, patrolRight: 72 },
      { x: 85, y: 8, type: 'slime', patrolLeft: 83, patrolRight: 90 },
    ],
    flowers: [
      { x: 22 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 44 * TILE_SIZE, y: 5 * TILE_SIZE },
      { x: 72 * TILE_SIZE, y: 3 * TILE_SIZE },
    ],
    torches: [
      { x: 5 * TILE_SIZE, y: 10 * TILE_SIZE },
      { x: 20 * TILE_SIZE, y: 10 * TILE_SIZE },
      { x: 35 * TILE_SIZE, y: 8 * TILE_SIZE },
      { x: 55 * TILE_SIZE, y: 10 * TILE_SIZE },
      { x: 70 * TILE_SIZE, y: 3 * TILE_SIZE },
      { x: 90 * TILE_SIZE, y: 7 * TILE_SIZE },
    ],
    checkpoints: [
      { x: 25 * TILE_SIZE, y: 11 * TILE_SIZE },
      { x: 52 * TILE_SIZE, y: 10 * TILE_SIZE },
      { x: 77 * TILE_SIZE, y: 5 * TILE_SIZE },
    ],
  };
}

// =========================================================
// LEVEL 2 – Torres del Viento  (rooftop, night sky)
// =========================================================
function buildRooftop(): LevelData {
  const W = 90, H = LEVEL_HEIGHT;
  const t = create(W, H);

  // No solid ground at bottom – falling = death  (hazard void)
  rect(t, W, 0, 14, 89, 14, TILE_HAZARD);

  // --- Battlements (main platforms at various heights) ---
  // Start platform
  rect(t, W, 0, 11, 6, 12, TILE_GROUND);
  rect(t, W, 0, 11, 0, 14, TILE_GROUND);

  // Section 1: easy jumps
  hLine(t, W, 9, 11, 5, TILE_GROUND);
  hLine(t, W, 16, 10, 4, TILE_GROUND);
  hLine(t, W, 22, 9, 5, TILE_PLATFORM);
  hLine(t, W, 29, 10, 4, TILE_GROUND);

  // Section 2: ascending tower
  hLine(t, W, 34, 9, 3, TILE_GROUND);
  hLine(t, W, 38, 7, 3, TILE_PLATFORM);
  hLine(t, W, 42, 5, 3, TILE_GROUND);
  hLine(t, W, 46, 7, 4, TILE_PLATFORM);

  // Section 3: wide battlements
  rect(t, W, 51, 8, 57, 9, TILE_GROUND);
  // Crenellations
  set(t, W, 51, 7, TILE_GROUND);
  set(t, W, 53, 7, TILE_GROUND);
  set(t, W, 55, 7, TILE_GROUND);
  set(t, W, 57, 7, TILE_GROUND);

  // Section 4: final approach
  hLine(t, W, 60, 10, 3, TILE_PLATFORM);
  hLine(t, W, 65, 8, 4, TILE_GROUND);
  hLine(t, W, 71, 6, 3, TILE_PLATFORM);
  hLine(t, W, 76, 5, 4, TILE_GROUND);

  // Portal platform
  rect(t, W, 82, 4, 88, 5, TILE_GROUND);
  rect(t, W, 89, 0, 89, 14, TILE_GROUND);

  return {
    width: W, height: H, tiles: t,
    startX: 2 * TILE_SIZE, startY: 9 * TILE_SIZE,
    portalX: 85 * TILE_SIZE, portalY: 2 * TILE_SIZE,
    enemies: [
      { x: 10, y: 10, type: 'bat', patrolLeft: 8, patrolRight: 20 },
      { x: 30, y: 8, type: 'bat', patrolLeft: 25, patrolRight: 40 },
      { x: 53, y: 6, type: 'bat', patrolLeft: 50, patrolRight: 58 },
      { x: 67, y: 6, type: 'bat', patrolLeft: 64, patrolRight: 74 },
    ],
    flowers: [
      { x: 24 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 54 * TILE_SIZE, y: 6 * TILE_SIZE },
    ],
    torches: [],
    checkpoints: [
      { x: 30 * TILE_SIZE, y: 8 * TILE_SIZE },
      { x: 53 * TILE_SIZE, y: 6 * TILE_SIZE },
      { x: 77 * TILE_SIZE, y: 3 * TILE_SIZE },
    ],
  };
}

// =========================================================
// LEVEL 3 – Ciénaga Oscura  (swamp, murky water)
// =========================================================
function buildSwamp(): LevelData {
  const W = 100, H = LEVEL_HEIGHT;
  const t = create(W, H);

  // Murky water at bottom
  rect(t, W, 0, 13, 99, 14, TILE_HAZARD);

  // Dirt ground islands
  rect(t, W, 0, 11, 7, 12, TILE_GROUND);

  // Lily pad platforms (semi-solid)
  hLine(t, W, 10, 11, 3, TILE_PLATFORM);
  hLine(t, W, 15, 10, 2, TILE_PLATFORM);
  hLine(t, W, 19, 9, 3, TILE_PLATFORM);

  // Ground island 2
  rect(t, W, 24, 10, 30, 12, TILE_GROUND);
  rect(t, W, 24, 8, 25, 10, TILE_GROUND); // tree trunk

  // More lilies
  hLine(t, W, 33, 10, 2, TILE_PLATFORM);
  hLine(t, W, 37, 9, 3, TILE_PLATFORM);
  hLine(t, W, 42, 8, 2, TILE_PLATFORM);

  // Large mossy island
  rect(t, W, 46, 9, 54, 12, TILE_GROUND);
  set(t, W, 46, 9, TILE_SPECIAL);
  set(t, W, 54, 9, TILE_SPECIAL);
  hLine(t, W, 47, 7, 3, TILE_PLATFORM);

  // Bridge section
  hLine(t, W, 57, 10, 5, TILE_BRIDGE);
  hLine(t, W, 64, 9, 4, TILE_BRIDGE);

  // Ground island 3
  rect(t, W, 70, 10, 76, 12, TILE_GROUND);
  set(t, W, 70, 10, TILE_SPECIAL);

  // Final section - ascending
  hLine(t, W, 79, 9, 3, TILE_PLATFORM);
  hLine(t, W, 84, 7, 3, TILE_PLATFORM);
  rect(t, W, 89, 6, 94, 12, TILE_GROUND);
  rect(t, W, 90, 6, 93, 10, TILE_AIR); // hollow for portal
  rect(t, W, 95, 0, 99, 14, TILE_GROUND);

  return {
    width: W, height: H, tiles: t,
    startX: 2 * TILE_SIZE, startY: 9 * TILE_SIZE,
    portalX: 91 * TILE_SIZE, portalY: 8 * TILE_SIZE,
    enemies: [
      { x: 26, y: 8, type: 'frog', patrolLeft: 24, patrolRight: 31 },
      { x: 48, y: 7, type: 'frog', patrolLeft: 46, patrolRight: 55 },
      { x: 60, y: 7, type: 'bat', patrolLeft: 56, patrolRight: 68 },
      { x: 72, y: 8, type: 'frog', patrolLeft: 70, patrolRight: 77 },
    ],
    flowers: [
      { x: 20 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 49 * TILE_SIZE, y: 6 * TILE_SIZE },
      { x: 85 * TILE_SIZE, y: 5 * TILE_SIZE },
    ],
    torches: [],
    checkpoints: [
      { x: 26 * TILE_SIZE, y: 8 * TILE_SIZE },
      { x: 50 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 73 * TILE_SIZE, y: 8 * TILE_SIZE },
    ],
  };
}

// =========================================================
// LEVEL 4 – Arenas del Olvido  (desert, quicksand)
// =========================================================
function buildDesert(): LevelData {
  const W = 95, H = LEVEL_HEIGHT;
  const t = create(W, H);

  // Sand ground
  rect(t, W, 0, 12, 94, 14, TILE_GROUND);

  // Quicksand pits (hazard)
  rect(t, W, 12, 12, 16, 14, TILE_HAZARD);
  rect(t, W, 30, 12, 34, 14, TILE_HAZARD);
  rect(t, W, 55, 12, 60, 14, TILE_HAZARD);
  rect(t, W, 75, 12, 79, 14, TILE_HAZARD);

  // Sandstone platforms
  hLine(t, W, 14, 9, 3, TILE_PLATFORM);
  rect(t, W, 20, 10, 24, 11, TILE_GROUND);
  hLine(t, W, 28, 8, 3, TILE_PLATFORM);
  hLine(t, W, 35, 9, 4, TILE_PLATFORM);

  // Pyramid structures
  // Small pyramid at x40
  rect(t, W, 40, 10, 46, 11, TILE_GROUND);
  rect(t, W, 41, 8, 45, 9, TILE_GROUND);
  rect(t, W, 42, 6, 44, 7, TILE_GROUND);
  set(t, W, 43, 5, TILE_SPECIAL);

  // Platforms after pyramid
  hLine(t, W, 50, 9, 3, TILE_PLATFORM);

  // Rock formations 
  rect(t, W, 62, 9, 66, 11, TILE_GROUND);
  hLine(t, W, 63, 7, 2, TILE_PLATFORM);

  // Oasis bridge
  hLine(t, W, 70, 10, 6, TILE_BRIDGE);

  // Final section
  rect(t, W, 82, 9, 88, 11, TILE_GROUND);
  hLine(t, W, 84, 6, 3, TILE_PLATFORM);
  rect(t, W, 90, 8, 94, 8, TILE_GROUND);
  // Right wall
  rect(t, W, 94, 0, 94, 14, TILE_GROUND);

  return {
    width: W, height: H, tiles: t,
    startX: 2 * TILE_SIZE, startY: 10 * TILE_SIZE,
    portalX: 91 * TILE_SIZE, portalY: 6 * TILE_SIZE,
    enemies: [
      { x: 21, y: 8, type: 'scorpion', patrolLeft: 18, patrolRight: 28 },
      { x: 42, y: 4, type: 'scorpion', patrolLeft: 40, patrolRight: 47 },
      { x: 63, y: 7, type: 'scorpion', patrolLeft: 62, patrolRight: 67 },
      { x: 84, y: 7, type: 'scorpion', patrolLeft: 82, patrolRight: 89 },
    ],
    flowers: [
      { x: 43 * TILE_SIZE, y: 4 * TILE_SIZE },
      { x: 64 * TILE_SIZE, y: 5 * TILE_SIZE },
    ],
    torches: [],
    checkpoints: [
      { x: 22 * TILE_SIZE, y: 9 * TILE_SIZE },
      { x: 50 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 84 * TILE_SIZE, y: 7 * TILE_SIZE },
    ],
  };
}

// =========================================================
// LEVEL 5 – Jardín Lunar  (moon, low gravity, stars)
// =========================================================
function buildMoon(): LevelData {
  const W = 110, H = LEVEL_HEIGHT;
  const t = create(W, H);

  // Void at bottom
  rect(t, W, 0, 14, 109, 14, TILE_HAZARD);

  // Moon rock ground – scattered platforms, no continuous floor
  // Start area
  rect(t, W, 0, 11, 8, 12, TILE_GROUND);

  // Crater 1 (dip)
  rect(t, W, 11, 12, 15, 12, TILE_GROUND);
  set(t, W, 12, 13, TILE_GROUND); set(t, W, 13, 13, TILE_GROUND); set(t, W, 14, 13, TILE_GROUND);

  // Floating rocks (platforms)
  hLine(t, W, 18, 10, 3, TILE_PLATFORM);
  hLine(t, W, 24, 8, 2, TILE_PLATFORM);
  hLine(t, W, 29, 6, 3, TILE_PLATFORM);

  // Landing pad
  rect(t, W, 34, 9, 39, 10, TILE_GROUND);

  // Low gravity vertical section
  hLine(t, W, 42, 7, 2, TILE_PLATFORM);
  hLine(t, W, 46, 4, 3, TILE_PLATFORM);
  hLine(t, W, 50, 7, 2, TILE_PLATFORM);

  // Mid section ground
  rect(t, W, 54, 10, 60, 11, TILE_GROUND);

  // Asteroid field (many small platforms)
  hLine(t, W, 63, 9, 2, TILE_PLATFORM);
  hLine(t, W, 67, 7, 2, TILE_PLATFORM);
  hLine(t, W, 71, 5, 2, TILE_PLATFORM);
  hLine(t, W, 75, 3, 2, TILE_PLATFORM);
  hLine(t, W, 79, 5, 2, TILE_PLATFORM);
  hLine(t, W, 83, 7, 3, TILE_PLATFORM);

  // Large moon rock
  rect(t, W, 88, 8, 94, 11, TILE_GROUND);

  // Final ascent to "castle among the stars"
  hLine(t, W, 97, 6, 3, TILE_PLATFORM);
  rect(t, W, 102, 4, 109, 5, TILE_GROUND);
  // Final castle walls
  rect(t, W, 102, 2, 103, 4, TILE_SPECIAL);
  rect(t, W, 108, 2, 109, 4, TILE_SPECIAL);
  rect(t, W, 109, 0, 109, 14, TILE_GROUND);

  return {
    width: W, height: H, tiles: t,
    startX: 2 * TILE_SIZE, startY: 9 * TILE_SIZE,
    portalX: 105 * TILE_SIZE, portalY: 2 * TILE_SIZE,
    enemies: [
      { x: 36, y: 7, type: 'alien', patrolLeft: 33, patrolRight: 42 },
      { x: 56, y: 7, type: 'alien', patrolLeft: 53, patrolRight: 62 },
      { x: 76, y: 1, type: 'alien', patrolLeft: 70, patrolRight: 84 },
      { x: 90, y: 5, type: 'alien', patrolLeft: 87, patrolRight: 96 },
    ],
    flowers: [
      { x: 30 * TILE_SIZE, y: 4 * TILE_SIZE },
      { x: 75 * TILE_SIZE, y: 1 * TILE_SIZE },
    ],
    torches: [],
    checkpoints: [
      { x: 36 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 56 * TILE_SIZE, y: 8 * TILE_SIZE },
      { x: 90 * TILE_SIZE, y: 6 * TILE_SIZE },
    ],
  };
}

// =========================================================
// ALL LEVELS
// =========================================================
export const LEVELS: LevelDef[] = [
  {
    id: 0,
    name: 'Castillo de las Sombras',
    subtitle: 'Las mazmorras arden con ríos de lava',
    theme: 'castle',
    gravity: BASE_GRAVITY,
    timeLimit: 150,
    build: buildCastle,
  },
  {
    id: 1,
    name: 'Torres del Viento',
    subtitle: 'Las alturas guardan secretos entre las estrellas',
    theme: 'rooftop',
    gravity: BASE_GRAVITY,
    timeLimit: 120,
    build: buildRooftop,
  },
  {
    id: 2,
    name: 'Ciénaga Oscura',
    subtitle: 'Las aguas turbias ocultan peligros ancestrales',
    theme: 'swamp',
    gravity: BASE_GRAVITY,
    timeLimit: 140,
    build: buildSwamp,
  },
  {
    id: 3,
    name: 'Arenas del Olvido',
    subtitle: 'El desierto ardiente desafía a los más valientes',
    theme: 'desert',
    gravity: BASE_GRAVITY,
    timeLimit: 130,
    build: buildDesert,
  },
  {
    id: 4,
    name: 'Jardín Lunar',
    subtitle: 'Entre las estrellas, la gravedad es solo un recuerdo',
    theme: 'moon',
    gravity: MOON_GRAVITY,
    timeLimit: 160,
    build: buildMoon,
  },
];
