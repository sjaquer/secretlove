// ===== GAME CONSTANTS =====

export const VIEWPORT_WIDTH = 800;
export const VIEWPORT_HEIGHT = 450;
export const TILE_SIZE = 32;
export const LEVEL_HEIGHT = 15; // tiles

// Tile types (universal across levels)
export const TILE_AIR = 0;
export const TILE_GROUND = 1;    // Solid – visual per theme
export const TILE_PLATFORM = 2;  // Semi-solid (can jump through bottom)
export const TILE_HAZARD = 3;    // Lava / water / quicksand / void
export const TILE_BRIDGE = 4;    // Walkable bridge
export const TILE_SPECIAL = 5;   // Moss / themed solid

// Physics
export const BASE_GRAVITY = 0.55;
export const MOON_GRAVITY = 0.22;
export const MAX_FALL_SPEED = 12;
export const COYOTE_FRAMES = 6;
export const JUMP_BUFFER_FRAMES = 5;

// -- Color palettes per level theme --
export const THEME_COLORS: Record<string, Record<string, string>> = {
  castle: {
    ground1: '#5a5060', ground2: '#4a4050', groundHighlight: '#6a6070',
    groundLine: '#3a3040', brick1: '#8a4030', brick2: '#7a3525',
    brickLine: '#5a2015', hazard1: '#ff4400', hazard2: '#ff6600',
    hazardGlow: '#ff880055', bridge: '#8b6914', bridgeLine: '#5a4510',
    special1: '#4a5a40', special2: '#3a4a30', specialMoss: '#6a8a50',
    bgSky: '#0d0a14', bgFar: '#1a1025', bgMid: '#201530',
    platform: '#6e5e7e', platformLine: '#4e3e5e',
    uiAccent: '#d4af37',
  },
  rooftop: {
    ground1: '#5a5a6a', ground2: '#4a4a5a', groundHighlight: '#7a7a8a',
    groundLine: '#3a3a4a', brick1: '#6a6a7a', brick2: '#5a5a6a',
    brickLine: '#3a3a4a', hazard1: '#1a2a4a', hazard2: '#0a1a3a',
    hazardGlow: '#00000000', bridge: '#8b7e64', bridgeLine: '#5a5040',
    special1: '#7a7a8a', special2: '#6a6a7a', specialMoss: '#8a8a9a',
    bgSky: '#0a0e1a', bgFar: '#10152a', bgMid: '#1a2040',
    platform: '#6a6a7a', platformLine: '#4a4a5a',
    uiAccent: '#88bbff',
  },
  swamp: {
    ground1: '#3a4a2a', ground2: '#2a3a1a', groundHighlight: '#4a5a3a',
    groundLine: '#1a2a0a', brick1: '#5a4a3a', brick2: '#4a3a2a',
    brickLine: '#3a2a1a', hazard1: '#2a5a2a', hazard2: '#1a4a1a',
    hazardGlow: '#3a8a3a44', bridge: '#6a5a3a', bridgeLine: '#4a3a2a',
    special1: '#3a5a2a', special2: '#2a4a1a', specialMoss: '#5a8a3a',
    bgSky: '#0a1a0a', bgFar: '#0a200a', bgMid: '#102a10',
    platform: '#5a4a3a', platformLine: '#3a2a1a',
    uiAccent: '#7adb7a',
  },
  desert: {
    ground1: '#c8a86e', ground2: '#b89858', groundHighlight: '#d8b87e',
    groundLine: '#987840', brick1: '#c8a060', brick2: '#b89050',
    brickLine: '#987030', hazard1: '#c8a040', hazard2: '#b89030',
    hazardGlow: '#dab04044', bridge: '#a08050', bridgeLine: '#806030',
    special1: '#b89858', special2: '#a88848', specialMoss: '#c8a868',
    bgSky: '#2a1800', bgFar: '#3a2808', bgMid: '#4a3818',
    platform: '#b09060', platformLine: '#907040',
    uiAccent: '#ffa040',
  },
  moon: {
    ground1: '#8a8a9a', ground2: '#7a7a8a', groundHighlight: '#aaaaBA',
    groundLine: '#5a5a6a', brick1: '#7a7a8a', brick2: '#6a6a7a',
    brickLine: '#4a4a5a', hazard1: '#0a0a1a', hazard2: '#05050f',
    hazardGlow: '#4444aa22', bridge: '#9090a0', bridgeLine: '#606070',
    special1: '#8a8a9a', special2: '#7a7a8a', specialMoss: '#9a9aaa',
    bgSky: '#02020a', bgFar: '#050510', bgMid: '#08081a',
    platform: '#8888aa', platformLine: '#5555770',
    uiAccent: '#cc88ff',
  },
};

// Flower messages (12 total, distributed across 5 levels)
export const FLOWER_MESSAGES: string[] = [
  "Eres la estrella que ilumina mi camino cada día ✨",
  "Tu sonrisa es mi melodía favorita, la que nunca me canso de escuchar 🎵",
  "En cada latido de mi corazón, tu nombre resuena 💓",
  "Eres la razón por la que creo en la magia y los cuentos de hadas 🏰",
  "Tu amor es mi refugio en las tormentas más fuertes 🌹",
  "Cada momento a tu lado es un tesoro que guardo en mi alma 💎",
  "Tu luz brilla más fuerte que todas las estrellas juntas 🌟",
  "Eres la flor más hermosa en el jardín de mi vida 🌷",
  "Me haces sentir que todo es posible cuando estás cerca 💫",
  "Eres la melodía que mi corazón siempre quiso cantar 🎶",
  "Tu amor convierte cada día gris en un arcoíris de colores 🌈",
  "Contigo, hasta el final del universo sería un hermoso viaje 🚀",
];

// Level music definitions (note frequencies, 0 = rest)
const C3 = 130.81, D3 = 146.83, Eb3 = 155.56, E3 = 164.81, F3 = 174.61;
const G3 = 196.00, Ab3 = 207.65, A3 = 220.00, Bb3 = 233.08, B3 = 246.94;
const C4 = 261.63, D4 = 293.66, Eb4 = 311.13, E4 = 329.63, F4 = 349.23;
const G4 = 392.00, Ab4 = 415.30, A4 = 440.00, Bb4 = 466.16;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
const C2 = 65.41, D2 = 73.42, E2 = 82.41, F2 = 87.31, G2 = 98.00, Ab2 = 103.83, A2 = 110.00, Bb2 = 116.54;

export const LEVEL_MUSIC = [
  // Level 0 – Castle: C minor, dark, slow
  {
    bpm: 72, melodyType: 'square' as OscillatorType, bassType: 'triangle' as OscillatorType,
    melodyGain: 0.06, bassGain: 0.08,
    melody: [C4, 0, Eb4, 0, G3, 0, C4, 0, Bb3, 0, Ab3, 0, G3, 0, 0, 0,
             Ab3, 0, Bb3, 0, C4, 0, Eb4, 0, D4, 0, C4, 0, Bb3, 0, 0, 0],
    bass:   [C2, C2, 0, C3, Ab2, Ab2, 0, Ab2, Bb2, Bb2, 0, Bb2, G2, G2, 0, 0,
             Ab2, Ab2, 0, Ab2, Bb2, Bb2, 0, Bb2, C2, C2, 0, C3, G2, G2, 0, 0],
  },
  // Level 1 – Rooftop: G major, airy
  {
    bpm: 95, melodyType: 'triangle' as OscillatorType, bassType: 'sine' as OscillatorType,
    melodyGain: 0.07, bassGain: 0.09,
    melody: [G4, B3, D4, G4, A4, 0, G4, 0, E4, D4, 0, E4, G4, 0, A4, 0,
             B3, D4, G4, B3, A4, G4, 0, 0, E4, G4, A4, 0, G4, D4, 0, 0],
    bass:   [G2, 0, G2, 0, D3, 0, D3, 0, C3, 0, C3, 0, G2, 0, D3, 0,
             G2, 0, G2, 0, E2, 0, E2, 0, C3, 0, D3, 0, G2, 0, 0, 0],
  },
  // Level 2 – Swamp: D minor, eerie
  {
    bpm: 65, melodyType: 'sawtooth' as OscillatorType, bassType: 'triangle' as OscillatorType,
    melodyGain: 0.04, bassGain: 0.07,
    melody: [D4, 0, 0, F3, 0, A3, 0, 0, Bb3, 0, A3, 0, G3, 0, 0, 0,
             D4, 0, C4, 0, Bb3, 0, A3, 0, G3, 0, F3, 0, E3, 0, D3, 0],
    bass:   [D2, 0, D2, 0, 0, A2, 0, 0, Bb2, 0, 0, Bb2, G2, 0, 0, 0,
             D2, 0, D2, 0, 0, 0, A2, 0, G2, 0, 0, 0, D2, 0, 0, 0],
  },
  // Level 3 – Desert: E phrygian, exotic
  {
    bpm: 88, melodyType: 'triangle' as OscillatorType, bassType: 'square' as OscillatorType,
    melodyGain: 0.06, bassGain: 0.05,
    melody: [E4, F4, E4, 0, D4, C4, 0, 0, E4, G4, A4, 0, G4, E4, 0, 0,
             A4, G4, F4, E4, 0, 0, D4, E4, F4, E4, D4, C4, 0, 0, E4, 0],
    bass:   [E2, 0, E2, E3, 0, 0, A2, 0, E2, 0, E2, E3, 0, 0, A2, 0,
             D2, 0, D2, 0, C2, 0, C2, 0, E2, 0, E2, 0, A2, 0, E2, 0],
  },
  // Level 4 – Moon: F lydian, ethereal
  {
    bpm: 55, melodyType: 'sine' as OscillatorType, bassType: 'sine' as OscillatorType,
    melodyGain: 0.08, bassGain: 0.06,
    melody: [F4, 0, 0, A4, 0, 0, C5, 0, 0, E5, 0, 0, C5, 0, A4, 0,
             G4, 0, 0, F4, 0, 0, E4, 0, 0, D4, 0, 0, C4, 0, 0, 0],
    bass:   [F2, 0, 0, 0, C3, 0, 0, 0, A2, 0, 0, 0, F2, 0, 0, 0,
             G2, 0, 0, 0, E2, 0, 0, 0, D2, 0, 0, 0, C2, 0, 0, 0],
  },
];

// Sound effect definitions (frequency, duration, type)
export const SFX = {
  jump:       { freq: 440, dur: 0.12, type: 'square' as OscillatorType, slide: 600 },
  stomp:      { freq: 200, dur: 0.15, type: 'square' as OscillatorType, slide: 80 },
  coin:       { freq: 880, dur: 0.15, type: 'square' as OscillatorType, slide: 1200 },
  hurt:       { freq: 200, dur: 0.30, type: 'sawtooth' as OscillatorType, slide: 80 },
  portal:     { freq: 500, dur: 0.40, type: 'sine' as OscillatorType, slide: 1000 },
  enemyDeath: { freq: 300, dur: 0.20, type: 'square' as OscillatorType, slide: 100 },
  lava:       { freq: 120, dur: 0.35, type: 'sawtooth' as OscillatorType, slide: 50 },
  win:        { freq: 523, dur: 0.50, type: 'sine' as OscillatorType, slide: 1047 },
  timeWarn:   { freq: 660, dur: 0.08, type: 'square' as OscillatorType, slide: 440 },
};
