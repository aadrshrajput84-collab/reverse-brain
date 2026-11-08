import React from 'react';
import { GameModeId, PlayerStats } from '../game/types';
import {
  ArrowLeft,
  Compass,
  Palette,
  Hash,
  Zap,
  Brain,
  Calendar,
  Trophy,
  Play,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface ModeSelectViewProps {
  stats: PlayerStats;
  onSelectMode: (mode: GameModeId) => void;
  onBack: () => void;
}

interface ModeCard {
  id: GameModeId;
  title: string;
  badge: string;
  description: string;
  ruleTag: string;
  icon: React.ReactNode;
  borderHover: string;
  glowBg: string;
}

export const ModeSelectView: React.FC<ModeSelectViewProps> = ({
  stats,
  onSelectMode,
  onBack,
}) => {
  const modes: ModeCard[] = [
    {
      id: 'classic',
      title: 'CLASSIC REVERSE',
      badge: 'POPULAR',
      description: 'One large arrow appears. Press the opposite arrow before time expires.',
      ruleTag: 'LEFT ↔ RIGHT · UP ↔ DOWN',
      icon: <Compass className="w-5 h-5 text-purple-400" />,
      borderHover: 'hover:border-purple-400',
      glowBg: 'hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    },
    {
      id: 'color',
      title: 'COLOR REVERSE',
      badge: 'COLOR LOGIC',
      description: 'A cyber color flashes. Select its paired complementary inverse.',
      ruleTag: 'Cyan ↔ Magenta · Yellow ↔ Blue',
      icon: <Palette className="w-5 h-5 text-cyan-400" />,
      borderHover: 'hover:border-cyan-400',
      glowBg: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    },
    {
      id: 'number',
      title: 'NUMBER REVERSE',
      badge: 'COMPLEMENT',
      description: 'See a number 1-9. Pick the mapped reverse number summing to 10.',
      ruleTag: '1 ↔ 9 · 2 ↔ 8 · 3 ↔ 7 · 4 ↔ 6 · 5 ↔ 5',
      icon: <Hash className="w-5 h-5 text-emerald-400" />,
      borderHover: 'hover:border-emerald-400',
      glowBg: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    },
    {
      id: 'speed',
      title: 'SPEED CHALLENGE',
      badge: 'FAST REFLEX',
      description: 'Response window tightens after every 5 hits. Pure survival instincts.',
      ruleTag: 'Starts 2.5s · Floor 0.75s · Max Combos',
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      borderHover: 'hover:border-yellow-400',
      glowBg: 'hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]',
    },
    {
      id: 'memory',
      title: 'MEMORY REVERSE',
      badge: 'BRAIN WORKOUT',
      description: 'Watch an arrow sequence flash, then enter the entire pattern BACKWARDS.',
      ruleTag: 'Shows 3 → 4 → 5+ arrows in reverse',
      icon: <Brain className="w-5 h-5 text-pink-400" />,
      borderHover: 'hover:border-pink-400',
      glowBg: 'hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]',
    },
    {
      id: 'daily',
      title: 'DAILY BRAIN TEST',
      badge: 'DAILY SEED',
      description: '20-round randomized test generated from today’s date. Earn +100 Coins.',
      ruleTag: 'New challenge every midnight',
      icon: <Calendar className="w-5 h-5 text-orange-400" />,
      borderHover: 'hover:border-orange-400',
      glowBg: 'hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen px-4 py-4 max-w-md mx-auto select-none relative z-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 active:scale-95 transition-all flex items-center gap-1.5"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">BACK</span>
        </button>

        <h2 className="text-sm font-['Orbitron'] font-bold tracking-wider uppercase text-zinc-100">
          SELECT GAME MODE
        </h2>

        <div className="w-8" />
      </div>

      {/* Mode Cards List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-0.5">
        {modes.map((mode) => {
          const highScore = stats.highScores[mode.id] || 0;
          return (
            <div
              key={mode.id}
              onClick={() => {
                sounds.playClick();
                onSelectMode(mode.id);
              }}
              className={`p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 cursor-pointer active:scale-[0.98] transition-all flex flex-col gap-2 ${mode.borderHover} ${mode.glowBg}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-black/40 border border-zinc-800">
                    {mode.icon}
                  </div>
                  <div>
                    <div className="font-['Orbitron'] text-xs font-bold text-white flex items-center gap-2">
                      {mode.title}
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-white/10 text-zinc-300">
                        {mode.badge}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-300/80 mt-0.5">
                      {mode.ruleTag}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 border border-zinc-800 text-yellow-300 font-['Rajdhani'] font-bold text-xs">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  <span>{highScore}</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {mode.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                <span className="text-[10px] text-zinc-500 font-mono">
                  3 LIVES · MULTIPLIER COMBOS
                </span>
                <span className="flex items-center gap-1 text-[11px] font-['Orbitron'] font-bold text-purple-400">
                  PLAY <Play className="w-3 h-3 fill-current" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
