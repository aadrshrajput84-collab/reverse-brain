import React, { useEffect } from 'react';
import { NeonBrain3D } from './NeonBrain3D';
import { ThemeId } from '../game/types';
import { Zap, Play, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

interface SplashViewProps {
  themeId: ThemeId;
  onStart: () => void;
  onOpenTutorial: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({
  themeId,
  onStart,
  onOpenTutorial,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sounds.playClick();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-4 py-8 max-w-md mx-auto text-center select-none relative z-10">
      {/* Top Tag & Version */}
      <div className="flex items-center justify-between w-full pt-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          NEON ARCADE 3D
        </span>
        <span className="text-[11px] font-mono text-zinc-400 tracking-widest">
          V1.0.0 · OFFLINE
        </span>
      </div>

      {/* Main Title Lockup */}
      <div className="my-auto w-full flex flex-col items-center">
        {/* Glowing 3D Brain Logo Showcase */}
        <div className="relative my-2">
          <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full scale-110 pointer-events-none" />
          <NeonBrain3D themeId={themeId} size="lg" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-['Orbitron'] uppercase mt-3">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.7)]">
            REVERSE
          </span>{' '}
          <span className="text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            BRAIN
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-sm sm:text-base font-bold tracking-[0.25em] text-cyan-300 font-['Rajdhani'] uppercase mt-2 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
          THINK OPPOSITE. REACT FASTER.
        </p>

        <p className="text-xs text-zinc-400 max-w-xs mt-3 leading-relaxed">
          When the arrow points <span className="text-purple-300 font-bold">LEFT</span>, press{' '}
          <span className="text-cyan-300 font-bold">RIGHT</span>. Rewire your cognitive reflexes.
        </p>
      </div>

      {/* Bottom Action Section */}
      <div className="w-full flex flex-col gap-3 pb-4">
        <button
          data-start="true"
          onClick={() => {
            sounds.playClick();
            onStart();
          }}
          className="w-full py-4 px-6 rounded-2xl font-['Orbitron'] font-bold text-base tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-purple-400/50"
        >
          <Play className="w-5 h-5 fill-current text-white" />
          ENTER THE MATRIX
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenTutorial();
            }}
            className="flex-1 py-3 px-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 border border-zinc-700/60 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            HOW TO PLAY
          </button>
          <div className="flex-1 py-3 px-3 rounded-xl bg-zinc-900/40 text-xs font-medium text-zinc-400 border border-zinc-800/60 flex items-center justify-center gap-1">
            <Award className="w-4 h-4 text-yellow-400" />
            6 MODES READY
          </div>
        </div>

        {/* Keyboard Hint */}
        <p className="text-[11px] text-zinc-500 font-mono tracking-wider pt-1">
          PRESS <span className="text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px]">SPACE</span> OR TAP TO PLAY
        </p>
      </div>
    </div>
  );
};
