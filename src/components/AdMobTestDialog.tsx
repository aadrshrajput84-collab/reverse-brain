import React, { useEffect, useState } from 'react';
import { Tv, Sparkles, CheckCircle2, X } from 'lucide-react';
import { sounds } from '../utils/audio';

interface AdMobTestDialogProps {
  onComplete: () => void;
  onClose: () => void;
}

export const AdMobTestDialog: React.FC<AdMobTestDialogProps> = ({ onComplete, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isRewarded, setIsRewarded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRewarded(true);
          sounds.playLevelUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-amber-500/50 p-6 flex flex-col items-center text-center shadow-[0_0_40px_rgba(245,158,11,0.3)]">
        {/* Top Badges */}
        <div className="flex items-center justify-between w-full mb-3">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
            GOOGLE ADMOB TEST ENVIRONMENT
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              if (isRewarded) onComplete();
              else onClose();
            }}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ad Video Preview Simulator */}
        <div className="w-full h-44 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center my-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/30 to-amber-950/30 pointer-events-none" />

          <Tv className="w-12 h-12 text-amber-400 mb-2 animate-pulse" />
          <span className="font-['Orbitron'] text-xs font-bold text-white tracking-wider">
            REWARDED VIDEO AD TEST
          </span>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 max-w-[200px] truncate">
            Unit: ca-app-pub-3940256099942544/5224354917
          </span>

          {/* Progress bar */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-800">
            <div
              className="h-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Status text */}
        <div className="mt-3">
          {isRewarded ? (
            <div className="flex items-center justify-center gap-1.5 text-xs font-['Orbitron'] font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              REWARD UNLOCKED: +50 VIRTUAL COINS!
            </div>
          ) : (
            <div className="text-xs font-mono text-zinc-400">
              Reward granted in <strong className="text-amber-400">{secondsLeft}s</strong>...
            </div>
          )}
        </div>

        {/* Claim button */}
        <button
          onClick={() => {
            sounds.playClick();
            if (isRewarded) onComplete();
            else onClose();
          }}
          disabled={!isRewarded}
          className={`w-full mt-4 py-3 rounded-xl font-['Orbitron'] font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 border ${
            isRewarded
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95'
              : 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isRewarded ? 'CLAIM +50 VIRTUAL COINS' : `WAIT (${secondsLeft}s)`}
        </button>
      </div>
    </div>
  );
};
