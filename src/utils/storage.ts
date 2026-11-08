import { GameModeId, PlayerStats, ThemeId } from '../game/types';
import { THEMES } from '../game/themes';

const STORAGE_KEY = 'REVERSE_BRAIN_V1_SAVE';

const DEFAULT_STATS: PlayerStats = {
  coins: 50, // Starter bonus
  highScores: {
    classic: 0,
    color: 0,
    number: 0,
    speed: 0,
    memory: 0,
    daily: 0,
  },
  gamesPlayed: 0,
  totalCorrectAnswers: 0,
  bestCombo: 0,
  unlockedThemes: ['violet'],
  equippedTheme: 'violet',
  lastDailyCompletedDate: null,
  dailyStreak: 0,
  soundEnabled: true,
  bgmEnabled: true,
  vibrationEnabled: true,
  mobileFrameMode: false,
};

let memoryStore: PlayerStats = { ...DEFAULT_STATS };

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      return memoryStore;
    }
    const parsed = JSON.parse(raw);
    memoryStore = {
      ...DEFAULT_STATS,
      ...parsed,
      highScores: {
        ...DEFAULT_STATS.highScores,
        ...(parsed.highScores || {}),
      },
      unlockedThemes: Array.isArray(parsed.unlockedThemes)
        ? parsed.unlockedThemes
        : ['violet'],
    };
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  memoryStore = stats;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  } catch {}
}

export function updateHighScore(
  currentStats: PlayerStats,
  mode: GameModeId,
  score: number
): { stats: PlayerStats; isNewRecord: boolean } {
  const currentBest = currentStats.highScores[mode] || 0;
  const isNewRecord = score > currentBest;
  const nextStats: PlayerStats = {
    ...currentStats,
    highScores: {
      ...currentStats.highScores,
      [mode]: Math.max(currentBest, score),
    },
  };
  savePlayerStats(nextStats);
  return { stats: nextStats, isNewRecord };
}

export function addCoins(currentStats: PlayerStats, amount: number): PlayerStats {
  const nextStats: PlayerStats = {
    ...currentStats,
    coins: Math.max(0, currentStats.coins + amount),
  };
  savePlayerStats(nextStats);
  return nextStats;
}

export function unlockTheme(currentStats: PlayerStats, themeId: ThemeId): { success: boolean; stats: PlayerStats } {
  const theme = THEMES[themeId];
  if (!theme) return { success: false, stats: currentStats };
  if (currentStats.unlockedThemes.includes(themeId)) {
    return { success: true, stats: currentStats };
  }
  if (currentStats.coins < theme.price) {
    return { success: false, stats: currentStats };
  }

  const nextStats: PlayerStats = {
    ...currentStats,
    coins: currentStats.coins - theme.price,
    unlockedThemes: [...currentStats.unlockedThemes, themeId],
    equippedTheme: themeId,
  };
  savePlayerStats(nextStats);
  return { success: true, stats: nextStats };
}

export function equipTheme(currentStats: PlayerStats, themeId: ThemeId): PlayerStats {
  if (!currentStats.unlockedThemes.includes(themeId)) return currentStats;
  const nextStats: PlayerStats = {
    ...currentStats,
    equippedTheme: themeId,
  };
  savePlayerStats(nextStats);
  return nextStats;
}

export function completeDailyChallenge(
  currentStats: PlayerStats,
  todayStr: string,
  rewardCoins = 100
): { stats: PlayerStats; coinsAwarded: number } {
  // If already completed today, prevent duplicate coins and maintain existing streak
  if (currentStats.lastDailyCompletedDate === todayStr) {
    return { stats: currentStats, coinsAwarded: 0 };
  }

  const wasYesterday = isYesterday(currentStats.lastDailyCompletedDate, todayStr);
  const newStreak = wasYesterday ? currentStats.dailyStreak + 1 : 1;

  const nextStats: PlayerStats = {
    ...currentStats,
    coins: currentStats.coins + rewardCoins,
    lastDailyCompletedDate: todayStr,
    dailyStreak: newStreak,
  };
  savePlayerStats(nextStats);
  return { stats: nextStats, coinsAwarded: rewardCoins };
}

function isYesterday(prevDateStr: string | null, todayDateStr: string): boolean {
  if (!prevDateStr) return false;
  try {
    const prev = new Date(prevDateStr).getTime();
    const today = new Date(todayDateStr).getTime();
    const diffDays = Math.round((today - prev) / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  } catch {
    return false;
  }
}

export function resetPlayerStats(): PlayerStats {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return { ...DEFAULT_STATS };
}
