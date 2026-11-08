import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Home,
  Share2,
  Coins,
  CheckCircle2,
  Tv,
  Zap,
  Target,
  Layers,
  Sparkles,
  Award,
  Crown,
  Flame,
  X,
  Copy,
} from 'lucide-react';
import { GameModeId, PlayerStats } from '../game/types';
import { getCognitiveRank, CognitiveRank } from '../game/rules';
import { sounds } from '../utils/audio';
import { NeonBrain3D } from './NeonBrain3D';

interface GameOverModalProps {
  mode: GameModeId;
  stats: PlayerStats;
  score: number;
  coinsEarned: number;
  accuracy: number;
  maxCombo: number;
  isNewRecord: boolean;
  isDailyVictory?: boolean;
  onPlayAgain: () => void;
  onSelectMode: () => void;
  onHome: () => void;
  onWatchRewardAd: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  mode,
  stats,
  score,
  coinsEarned,
  accuracy,
  maxCombo,
  isNewRecord,
  isDailyVictory = false,
  onPlayAgain,
  onSelectMode,
  onHome,
  onWatchRewardAd,
}) => {
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [animatedCoins, setAnimatedCoins] = useState<number>(0);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [flyingCoins, setFlyingCoins] = useState<number[]>([]);

  const previousBest = stats.highScores[mode] || 0;
  const rank: CognitiveRank = getCognitiveRank(accuracy, maxCombo);

  // Sound and Confetti trigger
  useEffect(() => {
    sounds.playGameOver(stats.soundEnabled);

    if (isNewRecord || isDailyVictory) {
      // First wave
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#06b6d4', '#f43f5e', '#eab308'],
      });
      // Second wave for spectacular celebration
      const t = setTimeout(() => {
        sounds.playLevelUp(stats.soundEnabled);
        confetti({
          particleCount: 75,
          spread: 100,
          origin: { y: 0.4 },
          colors: ['#22d3ee', '#facc15', '#ec4899', '#a855f7'],
        });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isNewRecord, isDailyVictory, stats.soundEnabled]);

  // Animated Score Counting
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; // 1 second rolling count

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setAnimatedScore(score);
      }
    };

    const anim = requestAnimationFrame(step);
    return () => cancelAnimationFrame(anim);
  }, [score]);

  // Animated Coin Collection
  useEffect(() => {
    const t = setTimeout(() => {
      let startTimestamp: number | null = null;
      const duration = 800;

      // Spawn flying coin particles
      setFlyingCoins([1, 2, 3, 4, 5]);

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setAnimatedCoins(Math.round(progress * coinsEarned));

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setAnimatedCoins(coinsEarned);
        }
      };

      requestAnimationFrame(step);
    }, 450);

    return () => clearTimeout(t);
  }, [coinsEarned]);

  const handleShare = async () => {
    sounds.playClick(stats.soundEnabled);
    const text = `🧠 REVERSE BRAIN: I scored ${score} in ${mode.toUpperCase()} mode!
Cognitive Rank: ${rank.rank} (${rank.title})
Max Combo: ${maxCombo}x | Accuracy: ${accuracy}%
Can your brain think opposite? Play now!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Reverse Brain Challenge',
          text,
          url: window.location.href,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-md rounded-[2rem] bg-zinc-950/95 border-2 border-purple-500/50 p-4 sm:p-5 flex flex-col items-center shadow-[0_0_50px_rgba(168,85,247,0.35)] my-auto animate-holo-glow">
        {/* Floating Animated Coin Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {flyingCoins.map((coinId, idx) => (
            <div
              key={coinId}
              className="absolute left-1/2 bottom-44 text-lg animate-coin-float"
              style={{
                marginLeft: `${(idx - 2) * 28}px`,
                animationDelay: `${idx * 120}ms`,
              }}
            >
              🪙
            </div>
          ))}
        </div>

        {/* Top Celebration Badge / Personal Best Banner */}
        <div className="w-full flex justify-center mb-1">
          {isDailyVictory ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-['Orbitron'] font-bold tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              DAILY DRILL CONQUERED!
            </div>
          ) : isNewRecord ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/30 via-purple-500/30 to-cyan-500/30 border-2 border-yellow-400/80 text-yellow-300 text-xs font-['Orbitron'] font-black tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-pulse">
              <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>NEW PERSONAL BEST RECORD!</span>
              <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.2 rounded font-sans font-extrabold">
                +{score - previousBest} PTS
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/60 text-zinc-400 text-[11px] font-['Orbitron'] font-semibold tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-zinc-500" />
              <span>RUN COMPLETE</span>
            </div>
          )}
        </div>

        {/* 3D / 2D Neon Brain Victory Celebration Crown (Scaled compact) */}
        {(isNewRecord || isDailyVictory) && (
          <div className="relative my-0.5">
            <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full scale-125 pointer-events-none" />
            <NeonBrain3D
              themeId={stats.equippedTheme}
              pulseTrigger={1}
              lastAnswerCorrect={true}
              size="sm"
              interactive={false}
            />
          </div>
        )}

        {/* Animated Final Score Display */}
        <div className="flex flex-col items-center my-1">
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            FINAL SCORE
          </span>
          <div className="font-['Orbitron'] text-5xl sm:text-6xl font-black text-white tracking-tight drop-shadow-[0_0_25px_rgba(6,182,212,0.8)] font-variant-numeric tabular-nums">
            {animatedScore}
          </div>

          {/* Personal Best Record Indicator */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-zinc-400">
              BEST: <strong className="text-yellow-400 font-bold">{Math.max(previousBest, score)}</strong>
            </span>
            {isNewRecord && (
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 font-bold">
                BROKEN!
              </span>
            )}
          </div>
        </div>

        {/* Cognitive Performance Rank Badge */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 my-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div
              className={`px-2 py-0.5 rounded-lg border font-['Orbitron'] font-black text-xs ${rank.badgeTw}`}
            >
              RANK {rank.rank}
            </div>
            <span className="font-['Orbitron'] text-xs font-bold text-zinc-200">
              {rank.title}
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {mode.toUpperCase()}
          </span>
        </div>

        {/* Detailed 3 Metrics HUD Grid */}
        <div className="grid grid-cols-3 gap-2 w-full my-2">
          {/* Coins Earned with animation */}
          <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-yellow-500/30 flex flex-col items-center text-center relative overflow-hidden">
            <div className="flex items-center gap-1 text-yellow-400 mb-0.5">
              <Coins className="w-3.5 h-3.5 fill-yellow-400/30" />
              <span className="text-[10px] font-mono tracking-wider">COINS</span>
            </div>
            <span className="font-['Rajdhani'] font-black text-lg text-yellow-300 tabular-nums">
              +{animatedCoins}
            </span>
            <span className="text-[9px] font-mono text-yellow-500/80">
              Total: {stats.coins}
            </span>
          </div>

          {/* Accuracy with Visual Circular Ring */}
          <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-cyan-500/30 flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-cyan-400 mb-0.5">
              <Target className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono tracking-wider">ACCURACY</span>
            </div>
            <div className="relative flex items-center justify-center my-0.5">
              <span className="font-['Rajdhani'] font-black text-lg text-cyan-300">
                {accuracy}%
              </span>
            </div>
            <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-700"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>

          {/* Max Combo with Flame Badge */}
          <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-purple-500/30 flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-purple-400 mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-purple-400/40" />
              <span className="text-[10px] font-mono tracking-wider">MAX COMBO</span>
            </div>
            <span className="font-['Rajdhani'] font-black text-lg text-purple-300">
              {maxCombo}x
            </span>
            <span className="text-[9px] font-mono text-purple-400/80">
              {maxCombo >= 5 ? 'ULTRA STREAK' : 'STREAK'}
            </span>
          </div>
        </div>

        {/* AdMob Rewarded Video Integration Point */}
        <div className="w-full mb-2.5">
          <button
            onClick={() => {
              if (rewardClaimed) return;
              sounds.playClick(stats.soundEnabled);
              setRewardClaimed(true);
              onWatchRewardAd();
            }}
            disabled={rewardClaimed}
            className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between transition-all ${
              rewardClaimed
                ? 'bg-zinc-900/40 border-zinc-800 opacity-60'
                : 'bg-gradient-to-r from-amber-950/40 to-zinc-900 border-amber-500/50 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] active:scale-95'
            }`}
          >
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-xs font-['Orbitron'] font-bold text-amber-300">
                  {rewardClaimed ? 'BONUS CLAIMED' : 'DOUBLE COINS: WATCH TEST AD'}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {rewardClaimed ? '+50 Virtual Coins added' : 'AdMob Test Rewarded Unit (+50 Coins)'}
                </div>
              </div>
            </div>
            {!rewardClaimed && (
              <span className="text-[10px] font-mono font-bold bg-amber-500 text-black px-2 py-0.5 rounded">
                +50
              </span>
            )}
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="w-full space-y-2">
          {/* Play Again (Attractive Neon Gradient Button) */}
          <button
            data-start="true"
            onClick={() => {
              sounds.playClick(stats.soundEnabled);
              onPlayAgain();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-['Orbitron'] font-bold text-sm tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] active:scale-95 transition-all flex items-center justify-center gap-2 border border-purple-400/50"
          >
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN
          </button>

          {/* Secondary Buttons: Share Score & All Modes */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sounds.playClick(stats.soundEnabled);
                setShowShareModal(true);
              }}
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/40 hover:border-cyan-400 font-semibold text-xs text-cyan-300 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              SHARE CARD
            </button>

            <button
              onClick={() => {
                sounds.playClick(stats.soundEnabled);
                onSelectMode();
              }}
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 font-semibold text-xs text-zinc-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              ALL MODES
            </button>
          </div>

          {/* Return Home Button */}
          <button
            onClick={() => {
              sounds.playClick(stats.soundEnabled);
              onHome();
            }}
            className="w-full py-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-mono transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            RETURN TO HOME
          </button>
        </div>
      </div>

      {/* Shareable Score Card Modal Overlay */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-60 flex items-center justify-center p-4 select-none animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border-2 border-cyan-400/80 p-5 flex flex-col items-center text-center shadow-[0_0_50px_rgba(6,182,212,0.5)] relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase mb-2">
              HOLOGRAPHIC SCORE CARD
            </span>

            {/* The Visual Score Card Frame */}
            <div className="w-full p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 via-zinc-900 to-black border border-purple-500/40 flex flex-col items-center my-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <div className="text-xl font-black font-['Orbitron'] text-white">
                REVERSE <span className="text-cyan-400">BRAIN</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">
                {mode.toUpperCase()} PROTOCOL
              </div>

              <div className="my-3 font-['Orbitron'] text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                {score}
              </div>

              <div className={`px-2.5 py-1 rounded-full text-xs font-['Orbitron'] font-bold border ${rank.badgeTw} mb-3`}>
                RANK {rank.rank} · {rank.title}
              </div>

              <div className="grid grid-cols-2 gap-2 w-full text-xs font-mono border-t border-zinc-800/80 pt-2 text-zinc-300">
                <div>ACCURACY: <strong className="text-cyan-300">{accuracy}%</strong></div>
                <div>MAX COMBO: <strong className="text-purple-300">{maxCombo}x</strong></div>
              </div>

              <div className="mt-3 text-[10px] font-mono text-zinc-500">
                Think opposite. React faster. Can you beat my score?
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 w-full mt-3">
              <button
                onClick={handleShare}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-['Orbitron'] font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? 'COPIED TO CLIPBOARD!' : 'COPY / SHARE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
