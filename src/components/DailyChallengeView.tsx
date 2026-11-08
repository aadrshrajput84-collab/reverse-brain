import React from 'react';
import { ArrowLeft, Calendar, Flame, Coins, CheckCircle2, Play, Sparkles, Brain } from 'lucide-react';
import { PlayerStats } from '../game/types';
import { canClaimDailyReward, getTodayDateString } from '../game/rules';
import { sounds } from '../utils/audio';

interface DailyChallengeViewProps {
  stats: PlayerStats;
  onStartDaily: () => void;
  onBack: () => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  stats,
  onStartDaily,
  onBack,
}) => {
  const todayStr = getTodayDateString();
  const available = canClaimDailyReward(stats.lastDailyCompletedDate, todayStr);

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col min-h-screen px-4 py-4 max-w-md mx-auto select-none relative z-10 justify-between">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <button
            onClick={() => {
              sounds.playClick(stats.soundEnabled);
              onBack();
            }}
            className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">BACK</span>
          </button>

          <h2 className="text-sm font-['Orbitron'] font-bold tracking-wider uppercase text-zinc-100">
            DAILY BRAIN TEST
          </h2>

          <div className="w-8" />
        </div>

        {/* Date & Streak Card */}
        <div className="my-4 p-5 rounded-3xl bg-zinc-950/90 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)] flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 border border-amber-500/40">
            <Calendar className="w-6 h-6" />
          </div>

          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
            TODAY’S NEURAL DRILL
          </span>
          <h3 className="font-['Orbitron'] text-xl font-bold text-white mt-1">
            {formattedDate}
          </h3>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800/80 w-full justify-around">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-zinc-400">ACTIVE STREAK</span>
              <span className="font-['Rajdhani'] font-bold text-lg text-orange-400 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-orange-400" />
                {stats.dailyStreak} DAYS
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-zinc-400">DAILY REWARD</span>
              <span className="font-['Rajdhani'] font-bold text-lg text-yellow-300 flex items-center gap-1">
                <Coins className="w-4 h-4 fill-yellow-400" />
                100 COINS
              </span>
            </div>
          </div>
        </div>

        {/* Challenge Specs */}
        <div className="space-y-2.5">
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-zinc-200">
                20-ROUND COGNITIVE MIX
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                A deterministic sequence testing arrow reversal, color complements, and sum-to-10 numbers.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-zinc-200">
                DAILY SYNCHRONIZATION
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Every player receives the exact same daily seed derived from the calendar date.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-4">
        {available ? (
          <button
            data-start="true"
            onClick={() => {
              sounds.playClick(stats.soundEnabled);
              onStartDaily();
            }}
            className="w-full py-4 px-6 rounded-2xl font-['Orbitron'] font-bold text-sm tracking-wider text-white bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-400/50"
          >
            <Play className="w-4 h-4 fill-current" />
            START TODAY’S TEST (+100 COINS)
          </button>
        ) : (
          <div className="w-full py-4 px-4 rounded-2xl bg-zinc-900/80 border border-emerald-500/40 text-center flex flex-col items-center">
            <span className="flex items-center gap-1.5 text-xs font-['Orbitron'] font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              TODAY’S DRILL COMPLETED
            </span>
            <span className="text-[11px] text-zinc-400 mt-1">
              Come back tomorrow at midnight for your next seed and streak reward!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
