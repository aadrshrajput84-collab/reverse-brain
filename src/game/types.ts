export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameModeId =
  | 'classic'
  | 'color'
  | 'number'
  | 'speed'
  | 'memory'
  | 'daily';

export type ColorId = 'cyan' | 'magenta' | 'yellow' | 'blue' | 'green' | 'purple';

export interface ColorDef {
  id: ColorId;
  name: string;
  oppositeId: ColorId;
  hex: string;
  glowHex: string;
  twBorder: string;
  twBg: string;
  twText: string;
}

export type ThemeId =
  | 'violet'
  | 'cyan'
  | 'synthwave'
  | 'toxic'
  | 'gold'
  | 'crimson';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  price: number;
  unlockedByDefault?: boolean;
  accent: string;
  accentSecondary: string;
  bgGlow: string;
  brainColor: number; // Three.js hex
  brainWireColor: number;
  borderClass: string;
  buttonClass: string;
}

export interface PlayerStats {
  coins: number;
  highScores: Record<GameModeId, number>;
  gamesPlayed: number;
  totalCorrectAnswers: number;
  bestCombo: number;
  unlockedThemes: ThemeId[];
  equippedTheme: ThemeId;
  lastDailyCompletedDate: string | null;
  dailyStreak: number;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  vibrationEnabled: boolean;
  mobileFrameMode: boolean; // toggle between centered mobile mockup vs full bleed
}

export interface MemoryRoundState {
  sequence: Direction[];
  playerInputs: Direction[];
  phase: 'display' | 'input' | 'success' | 'failure';
  displayIndex: number;
}

export interface DailyRoundQuestion {
  type: 'direction' | 'color' | 'number';
  prompt: string;
  subPrompt: string;
  displayValue: any;
  options: any[];
  correctAnswer: any;
}
