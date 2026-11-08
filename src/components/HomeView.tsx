import React from 'react';
import { NeonBrain3D } from './NeonBrain3D';
import { GameModeId, PlayerStats, ThemeId } from '../game/types';
import { THEMES } from '../game/themes';
import {
  Play,
  Flame,
  Coins,
  Palette,
  HelpCircle,
  Settings,
  Calendar,
  Layers,
  Volume2,
  VolumeX,
  Smartphone,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { canClaimDailyReward, getTodayDateString } from '../game/rules';

interface HomeViewProps {
  stats: PlayerStats;
  onPlayMode: (mode: GameModeId) => void;
  onOpenModes: () => void;
  onOpenDaily: () => void;
  onOpenThemes: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  onOpenPackaging: () => void;
  onToggleSound: () => void;
  onOpenRewardedAdTest: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  onPlayMode,
  onOpenModes,
  onOpenDaily,
  onOpenThemes,
  onOpenTutorial,
  onOpenSettings,
  onOpenPackaging,
  onToggleSound,
  onOpenRewardedAdTest,
}) => {
  const currentTheme = THEMES[stats.equippedTheme] || THEMES.violet;
  const todayStr = getTodayDateString();
  const dailyAvailable = canClaimDailyReward(stats.lastDailyCompletedDate, todayStr);

  return (
    <div className="flex flex-col min-h-screen px-4 py-4 max-w-md mx-auto select-none relative z-10 justify-between">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full pt-1 pb-2">
        {/* Coin Balance (Tap to open test rewarded ad) */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenRewardedAdTest();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-yellow-500/50 hover:border-yellow-400 active:scale-95 transition-all shadow-[0_0_12px_rgba(234,179,8,0.2)]"
          title="Earn virtual coins with test ad"
        >
          <Coins className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="font-['Rajdhani'] font-bold text-sm text-yellow-300">
            {stats.coins}
          </span>
          <span className="text-[10px] text-yellow-500 font-bold ml-0.5 bg-yellow-400/20 px-1 rounded">
            +
          </span>
        </button>

        {/* Daily Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-orange-500/40">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400/40" />
          <span className="font-['Rajdhani'] font-bold text-sm text-orange-300">
            {stats.dailyStreak}D STREAK
          </span>
        </div>

        {/* Quick Audio & Settings */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              onToggleSound();
            }}
            className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 active:scale-95 transition-all"
            aria-label="Toggle Sound"
          >
            {stats.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 active:scale-95 transition-all"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>

      {/* Hero 3D Brain & Brand */}
      <div className="flex flex-col items-center my-auto py-2">
        <div className="relative cursor-pointer" onClick={() => sounds.playClick()}>
          <div className="absolute inset-0 bg-purple-600/15 blur-2xl rounded-full" />
          <NeonBrain3D themeId={stats.equippedTheme} size="md" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-['Orbitron'] tracking-wider uppercase text-white mt-2">
          REVERSE <span className="text-cyan-400">BRAIN</span>
        </h2>
        <p className="text-xs font-semibold text-zinc-400 font-['Rajdhani'] tracking-[0.2em] uppercase">
          THINK OPPOSITE · REACT FASTER
        </p>

        {/* Active Theme Chip */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenThemes();
          }}
          className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/60 border border-purple-500/30 text-purple-300 text-[11px] font-mono hover:border-purple-400 active:scale-95 transition-all"
        >
          <Palette className="w-3 h-3 text-purple-400" />
          <span>THEME: {currentTheme.name}</span>
          <ChevronRight className="w-3 h-3 text-zinc-500" />
        </button>
      </div>

      {/* Main Menu Action Grid */}
      <div className="flex flex-col gap-2.5 w-full pt-1 pb-3">
        {/* Primary Play Button (Classic Mode Quick Launch) */}
        <button
          data-start="true"
          onClick={() => {
            sounds.playClick();
            onPlayMode('classic');
          }}
          className="w-full py-3.5 px-5 rounded-2xl font-['Orbitron'] font-bold text-base tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-[0.98] transition-all flex items-center justify-between border border-purple-400/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Play className="w-5 h-5 fill-current text-white ml-0.5" />
            </div>
            <div className="text-left">
              <div className="leading-tight">CLASSIC REVERSE</div>
              <div className="text-[11px] font-sans font-normal text-purple-200">
                Opposite arrows · 60s Blitz
              </div>
            </div>
          </div>
          <span className="font-['Rajdhani'] text-xs font-bold px-2 py-0.5 rounded bg-white/20 text-white">
            HIGH: {stats.highScores.classic}
          </span>
        </button>

        {/* Daily Challenge Card */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenDaily();
          }}
          className={`w-full p-3 rounded-xl border flex items-center justify-between active:scale-[0.98] transition-all text-left ${
            dailyAvailable
              ? 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-zinc-900/60 border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                dailyAvailable ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                DAILY BRAIN TEST
                {dailyAvailable && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-black font-extrabold text-[9px] rounded font-sans">
                    +100 COINS
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-400">
                {dailyAvailable ? '20-round mental test ready today' : 'Completed for today. Streak saved!'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

        {/* 2-Column Buttons: Game Modes & Theme Shop */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenModes();
            }}
            className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700/60 active:scale-95 transition-all text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-['Orbitron'] text-[11px] font-bold text-zinc-200">
                  ALL MODES
                </div>
                <div className="text-[10px] text-zinc-400">6 Game Modes</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenThemes();
            }}
            className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700/60 active:scale-95 transition-all text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <div className="font-['Orbitron'] text-[11px] font-bold text-zinc-200">
                  THEME SHOP
                </div>
                <div className="text-[10px] text-zinc-400">{stats.unlockedThemes.length}/6 Unlocked</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>

        {/* Footer Quick Links: Tutorial & Android APK Guide */}
        <div className="flex items-center justify-between pt-1 px-1">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenTutorial();
            }}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-cyan-300 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rules & Training</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenPackaging();
            }}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-purple-300 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Android APK Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
