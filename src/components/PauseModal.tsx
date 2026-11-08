import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Smartphone, Music } from 'lucide-react';
import { PlayerStats } from '../game/types';
import { sounds } from '../utils/audio';

interface PauseModalProps {
  stats: PlayerStats;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onToggleVibration: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  stats,
  onResume,
  onRestart,
  onHome,
  onToggleSound,
  onToggleBgm,
  onToggleVibration,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-950/95 border border-purple-500/40 p-6 flex flex-col items-center shadow-[0_0_40px_rgba(168,85,247,0.3)]">
        {/* Title */}
        <h3 className="font-['Orbitron'] text-2xl font-black text-white tracking-wider uppercase mb-1">
          PAUSED
        </h3>
        <p className="text-xs font-['Rajdhani'] text-zinc-400 font-semibold tracking-widest uppercase mb-6">
          NEURAL LINK SUSPENDED
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={() => {
              sounds.playClick(stats.soundEnabled);
              onResume();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-['Orbitron'] font-bold text-sm tracking-wider text-white bg-gradient-to-r from-purple-600 to-cyan-600 shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 border border-purple-400/40"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME
          </button>

          <button
            onClick={() => {
              sounds.playClick(stats.soundEnabled);
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl font-['Orbitron'] font-semibold text-xs tracking-wider text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            RESTART MODE
          </button>

          <button
            onClick={() => {
              sounds.playClick(stats.soundEnabled);
              onHome();
            }}
            className="w-full py-3 px-4 rounded-xl font-['Orbitron'] font-semibold text-xs tracking-wider text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-purple-400" />
            MAIN MENU
          </button>
        </div>

        {/* Quick Audio & Haptic Toggles */}
        <div className="w-full pt-6 mt-4 border-t border-zinc-800 flex items-center justify-around">
          <button
            onClick={onToggleSound}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-[10px] font-mono transition-all ${
              stats.soundEnabled
                ? 'bg-purple-950/50 border-purple-500/50 text-purple-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            {stats.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>SFX</span>
          </button>

          <button
            onClick={onToggleBgm}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-[10px] font-mono transition-all ${
              stats.bgmEnabled
                ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>SYNTH</span>
          </button>

          <button
            onClick={onToggleVibration}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-[10px] font-mono transition-all ${
              stats.vibrationEnabled
                ? 'bg-pink-950/50 border-pink-500/50 text-pink-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>HAPTIC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
