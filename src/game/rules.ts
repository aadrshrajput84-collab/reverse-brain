import { ColorDef, ColorId, DailyRoundQuestion, Direction, GameModeId } from './types';

// Direction reversal mappings
export const DIRECTION_OPPOSITES: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export function getReverseDirection(dir: Direction): Direction {
  return DIRECTION_OPPOSITES[dir];
}

// 4 high-contrast cyber color pairs
export const COLOR_DEFS: Record<ColorId, ColorDef> = {
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    oppositeId: 'magenta',
    hex: '#06b6d4',
    glowHex: '#22d3ee',
    twBorder: 'border-cyan-400',
    twBg: 'bg-cyan-500/20',
    twText: 'text-cyan-300',
  },
  magenta: {
    id: 'magenta',
    name: 'Neon Magenta',
    oppositeId: 'cyan',
    hex: '#ec4899',
    glowHex: '#f472b6',
    twBorder: 'border-pink-500',
    twBg: 'bg-pink-500/20',
    twText: 'text-pink-300',
  },
  yellow: {
    id: 'yellow',
    name: 'Cyber Yellow',
    oppositeId: 'blue',
    hex: '#eab308',
    glowHex: '#facc15',
    twBorder: 'border-yellow-400',
    twBg: 'bg-yellow-500/20',
    twText: 'text-yellow-300',
  },
  blue: {
    id: 'blue',
    name: 'Cobalt Blue',
    oppositeId: 'yellow',
    hex: '#3b82f6',
    glowHex: '#60a5fa',
    twBorder: 'border-blue-500',
    twBg: 'bg-blue-500/20',
    twText: 'text-blue-300',
  },
  green: {
    id: 'green',
    name: 'Matrix Green',
    oppositeId: 'purple',
    hex: '#10b981',
    glowHex: '#34d399',
    twBorder: 'border-emerald-400',
    twBg: 'bg-emerald-500/20',
    twText: 'text-emerald-300',
  },
  purple: {
    id: 'purple',
    name: 'Plasma Violet',
    oppositeId: 'green',
    hex: '#a855f7',
    glowHex: '#c084fc',
    twBorder: 'border-purple-400',
    twBg: 'bg-purple-500/20',
    twText: 'text-purple-300',
  },
};

export const COLOR_KEYS: ColorId[] = ['cyan', 'magenta', 'yellow', 'blue'];

export function getOppositeColor(color: ColorId): ColorId {
  return COLOR_DEFS[color].oppositeId;
}

// Number pairs summing to 10: 1-9, 2-8, 3-7, 4-6, 5-5
export const NUMBER_PAIRS: Record<number, number> = {
  1: 9,
  2: 8,
  3: 7,
  4: 6,
  5: 5,
  6: 4,
  7: 3,
  8: 2,
  9: 1,
};

export function getOppositeNumber(n: number): number {
  return NUMBER_PAIRS[n] ?? 10 - n;
}

// Score and Combo calculations
export function calculateScore(basePoints: number, combo: number): number {
  const multiplier = Math.min(5, 1 + Math.floor(combo / 3) * 0.5);
  return Math.round(basePoints * multiplier);
}

// Speed challenge reaction window in seconds: decreases every 5 correct answers
export function getSpeedTimeLimit(correctCount: number): number {
  const step = Math.floor(correctCount / 5);
  // starts at 2.5s, reduces by 0.25s per tier, minimum 0.75s
  return Math.max(0.75, 2.5 - step * 0.25);
}

// Memory Reverse helper
export function generateMemorySequence(length: number, randomFn = Math.random): Direction[] {
  const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const seq: Direction[] = [];
  for (let i = 0; i < length; i++) {
    const pick = dirs[Math.floor(randomFn() * dirs.length)];
    seq.push(pick);
  }
  return seq;
}

export function getExpectedReverseSequence(sequence: Direction[]): Direction[] {
  return [...sequence].reverse();
}

export function validateMemoryStep(
  sequence: Direction[],
  playerInputs: Direction[]
): { isCorrectSoFar: boolean; isCompleted: boolean } {
  const expectedReverse = getExpectedReverseSequence(sequence);
  const currentStep = playerInputs.length - 1;
  if (currentStep < 0) return { isCorrectSoFar: true, isCompleted: false };

  if (playerInputs[currentStep] !== expectedReverse[currentStep]) {
    return { isCorrectSoFar: false, isCompleted: false };
  }

  const isCompleted = playerInputs.length === sequence.length;
  return { isCorrectSoFar: true, isCompleted };
}

// Simple seeded pseudo-random number generator for deterministic daily challenge
export function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getDailySeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function canClaimDailyReward(lastClaimDate: string | null, todayDate: string): boolean {
  return lastClaimDate !== todayDate;
}

export function generateDailyRound(roundIndex: number, dateStr: string): DailyRoundQuestion {
  const seed = getDailySeed(dateStr) + roundIndex * 37;
  const rand = pseudoRandom(seed);
  const types: ('direction' | 'color' | 'number')[] = ['direction', 'color', 'number'];
  const type = types[Math.floor(rand() * types.length)];

  if (type === 'direction') {
    const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const dir = dirs[Math.floor(rand() * dirs.length)];
    const correct = getReverseDirection(dir);
    return {
      type: 'direction',
      prompt: 'REVERSE THE ARROW',
      subPrompt: 'Press the OPPOSITE direction',
      displayValue: dir,
      options: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
      correctAnswer: correct,
    };
  } else if (type === 'color') {
    const keys: ColorId[] = ['cyan', 'magenta', 'yellow', 'blue'];
    const chosen = keys[Math.floor(rand() * keys.length)];
    const correct = getOppositeColor(chosen);
    return {
      type: 'color',
      prompt: 'REVERSE THE COLOR',
      subPrompt: `Pairs: Cyan ↔ Magenta | Yellow ↔ Blue`,
      displayValue: chosen,
      options: keys,
      correctAnswer: correct,
    };
  } else {
    const n = Math.floor(rand() * 9) + 1; // 1 to 9
    const correct = getOppositeNumber(n);
    // 4 options including correct
    const opts = new Set<number>([correct]);
    while (opts.size < 4) {
      const candidate = Math.floor(rand() * 9) + 1;
      opts.add(candidate);
    }
    const shuffledOpts = Array.from(opts).sort(() => rand() - 0.5);
    return {
      type: 'number',
      prompt: 'REVERSE THE NUMBER',
      subPrompt: 'Complement pair: Sums to 10 (e.g. 3 ↔ 7, 1 ↔ 9)',
      displayValue: n,
      options: shuffledOpts,
      correctAnswer: correct,
    };
  }
}

export interface CognitiveRank {
  rank: string;
  title: string;
  color: string;
  badgeTw: string;
}

export function getCognitiveRank(accuracy: number, maxCombo: number): CognitiveRank {
  if (accuracy >= 95 && maxCombo >= 8) {
    return {
      rank: 'S+',
      title: 'GODLIKE COGNITION',
      color: '#22d3ee',
      badgeTw: 'bg-cyan-500/20 text-cyan-300 border-cyan-400',
    };
  }
  if (accuracy >= 90) {
    return {
      rank: 'S',
      title: 'MASTER THINKER',
      color: '#a855f7',
      badgeTw: 'bg-purple-500/20 text-purple-300 border-purple-400',
    };
  }
  if (accuracy >= 80) {
    return {
      rank: 'A',
      title: 'EXPERT REFLEX',
      color: '#10b981',
      badgeTw: 'bg-emerald-500/20 text-emerald-300 border-emerald-400',
    };
  }
  if (accuracy >= 65) {
    return {
      rank: 'B',
      title: 'ADEPT MIND',
      color: '#eab308',
      badgeTw: 'bg-yellow-500/20 text-yellow-300 border-yellow-400',
    };
  }
  return {
    rank: 'C',
    title: 'NEURAL APPRENTICE',
    color: '#94a3b8',
    badgeTw: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };
}

