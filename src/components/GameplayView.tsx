import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Direction,
  GameModeId,
  ColorId,
  PlayerStats,
  DailyRoundQuestion,
} from '../game/types';
import {
  getReverseDirection,
  COLOR_DEFS,
  getOppositeColor,
  getOppositeNumber,
  calculateScore,
  getSpeedTimeLimit,
  generateMemorySequence,
  validateMemoryStep,
  generateDailyRound,
  getTodayDateString,
  COLOR_KEYS,
} from '../game/rules';
import { THEMES } from '../game/themes';
import { sounds } from '../utils/audio';
import { NeonBrain3D } from './NeonBrain3D';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowL,
  ArrowRight,
  Pause,
  Heart,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';

interface GameplayViewProps {
  mode: GameModeId;
  stats: PlayerStats;
  onGameOver: (result: {
    score: number;
    coinsEarned: number;
    accuracy: number;
    maxCombo: number;
    isDailyVictory?: boolean;
  }) => void;
  onPause: () => void;
}

interface FloatingText {
  id: number;
  text: string;
  isPositive: boolean;
}

export const GameplayView: React.FC<GameplayViewProps> = ({
  mode,
  stats,
  onGameOver,
  onPause,
}) => {
  // Game state
  const [countdown, setCountdown] = useState<number | null>(3); // 3, 2, 1, null
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);

  // Synchronized refs to avoid stale closure state and allow async finish
  const scoreRef = useRef<number>(0);
  const correctCountRef = useRef<number>(0);
  const totalAttemptsRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const isFinishedRef = useRef<boolean>(false);

  // Time management
  // For Classic, Color, Number: overall 60-second timer
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  // For Speed Challenge: per-question reaction timer (seconds)
  const [speedTimer, setSpeedTimer] = useState<number>(2.5);
  const speedMaxRef = useRef<number>(2.5);

  // 3D Brain reaction props
  const [pulseCount, setPulseCount] = useState<number>(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  // Visual screen flash & floating text
  const [screenFlash, setScreenFlash] = useState<'green' | 'red' | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const floatIdRef = useRef<number>(0);

  // Prevent rapid duplicate clicks
  const isProcessingRef = useRef<boolean>(false);

  // --- Specific Mode States ---
  // Mode 1 & 4 (Classic & Speed): Current Arrow Direction
  const [currentArrow, setCurrentArrow] = useState<Direction>('LEFT');

  // Mode 2 (Color): Current Target Color
  const [currentColor, setCurrentColor] = useState<ColorId>('cyan');

  // Mode 3 (Number): Current Number (1 to 9) and 4 options
  const [currentNumber, setCurrentNumber] = useState<number>(3);
  const [numberOptions, setNumberOptions] = useState<number[]>([7, 2, 5, 8]);

  // Mode 5 (Memory Reverse):
  const [memorySequence, setMemorySequence] = useState<Direction[]>([]);
  const [memoryStep, setMemoryStep] = useState<number>(0); // which arrow is displaying
  const [memoryPhase, setMemoryPhase] = useState<'showing' | 'inputting'>('showing');
  const [playerInputs, setPlayerInputs] = useState<Direction[]>([]);
  const [memoryLevel, setMemoryLevel] = useState<number>(3); // length starts at 3

  // Mode 6 (Daily Challenge):
  const [dailyRoundIdx, setDailyRoundIdx] = useState<number>(0);
  const [dailyQuestion, setDailyQuestion] = useState<DailyRoundQuestion | null>(null);

  const todayStr = useRef(getTodayDateString());

  // Setup initial question based on mode
  const setupNewQuestion = useCallback(
    (nextCorrectCount = correctCount) => {
      isProcessingRef.current = false;
      const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

      if (mode === 'classic' || mode === 'speed') {
        const nextDir = dirs[Math.floor(Math.random() * dirs.length)];
        setCurrentArrow(nextDir);
        if (mode === 'speed') {
          const limit = getSpeedTimeLimit(nextCorrectCount);
          speedMaxRef.current = limit;
          setSpeedTimer(limit);
        }
      } else if (mode === 'color') {
        const colorPool: ColorId[] = ['cyan', 'magenta', 'yellow', 'blue'];
        const nextColor = colorPool[Math.floor(Math.random() * colorPool.length)];
        setCurrentColor(nextColor);
      } else if (mode === 'number') {
        const n = Math.floor(Math.random() * 9) + 1;
        setCurrentNumber(n);
        const correct = getOppositeNumber(n);
        const opts = new Set<number>([correct]);
        while (opts.size < 4) {
          opts.add(Math.floor(Math.random() * 9) + 1);
        }
        setNumberOptions(Array.from(opts).sort(() => Math.random() - 0.5));
      } else if (mode === 'daily') {
        const q = generateDailyRound(dailyRoundIdx, todayStr.current);
        setDailyQuestion(q);
      }
    },
    [mode, correctCount, dailyRoundIdx]
  );

  // Setup initial memory sequence
  const startMemoryRound = useCallback((length: number) => {
    isProcessingRef.current = true;
    const seq = generateMemorySequence(length);
    setMemorySequence(seq);
    setMemoryPhase('showing');
    setMemoryStep(0);
    setPlayerInputs([]);

    // Flash each arrow sequentially
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < seq.length) {
        setMemoryStep(step);
        sounds.playClick(stats.soundEnabled);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setMemoryPhase('inputting');
          isProcessingRef.current = false;
        }, 500);
      }
    }, 700);
  }, [stats.soundEnabled]);

  // Initial countdown effect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      sounds.playCountdown(false, stats.soundEnabled);
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 900);
      return () => clearTimeout(timer);
    } else {
      sounds.playCountdown(true, stats.soundEnabled);
      const timer = setTimeout(() => {
        setCountdown(null);
        if (mode === 'memory') {
          startMemoryRound(memoryLevel);
        } else {
          setupNewQuestion(0);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [countdown, mode, memoryLevel, setupNewQuestion, startMemoryRound, stats.soundEnabled]);

  // Global 60s Timer for Classic, Color, Number
  useEffect(() => {
    if (countdown !== null) return;
    if (mode === 'speed' || mode === 'memory' || mode === 'daily') return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => finishGame(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, mode]);

  // Speed Challenge per-question timer
  useEffect(() => {
    if (countdown !== null || mode !== 'speed') return;

    const interval = setInterval(() => {
      setSpeedTimer((prev) => {
        if (prev <= 0.05) {
          handleWrong('TIME EXPIRED!');
          return speedMaxRef.current;
        }
        return prev - 0.05;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [countdown, mode]);

  // Trigger floating text feedback
  const addFloating = (text: string, isPositive: boolean) => {
    floatIdRef.current++;
    const newId = floatIdRef.current;
    setFloatingTexts((prev) => [...prev, { id: newId, text, isPositive }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== newId));
    }, 850);
  };

  // Trigger visual juice and audio
  const handleCorrect = (pointsGained = 10) => {
    isProcessingRef.current = true;
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    if (nextCombo > maxComboRef.current) {
      maxComboRef.current = nextCombo;
      setMaxCombo(nextCombo);
    }

    const earned = calculateScore(pointsGained, nextCombo);
    const nextScore = scoreRef.current + earned;
    scoreRef.current = nextScore;
    setScore(nextScore);

    const nextCorrect = correctCountRef.current + 1;
    correctCountRef.current = nextCorrect;
    setCorrectCount(nextCorrect);

    const nextAttempts = totalAttemptsRef.current + 1;
    totalAttemptsRef.current = nextAttempts;
    setTotalAttempts(nextAttempts);

    sounds.playCorrect(nextCombo, stats.soundEnabled);
    sounds.triggerHaptic('success', stats.vibrationEnabled);

    setLastCorrect(true);
    setPulseCount((c) => c + 1);
    setScreenFlash('green');
    addFloating(`+${earned} ${nextCombo >= 3 ? `x${1 + Math.floor(nextCombo / 3) * 0.5}` : ''}`, true);

    setTimeout(() => {
      setScreenFlash(null);
    }, 220);

    // Progression
    if (mode === 'daily') {
      const nextIdx = dailyRoundIdx + 1;
      if (nextIdx >= 20) {
        // Daily Challenge completed successfully!
        setTimeout(() => {
          onGameOver({
            score: nextScore,
            coinsEarned: 100,
            accuracy: Math.round((nextCorrect / nextAttempts) * 100),
            maxCombo: maxComboRef.current,
            isDailyVictory: true,
          });
        }, 500);
        return;
      }
      setDailyRoundIdx(nextIdx);
      setTimeout(() => {
        const q = generateDailyRound(nextIdx, todayStr.current);
        setDailyQuestion(q);
        isProcessingRef.current = false;
      }, 250);
    } else {
      setTimeout(() => {
        setupNewQuestion(nextCorrect);
      }, 150);
    }
  };

  const handleWrong = (reasonText = 'MISS!') => {
    isProcessingRef.current = true;
    setCombo(0);
    const nextAttempts = totalAttemptsRef.current + 1;
    totalAttemptsRef.current = nextAttempts;
    setTotalAttempts(nextAttempts);

    sounds.playWrong(stats.soundEnabled);
    sounds.triggerHaptic('error', stats.vibrationEnabled);

    setLastCorrect(false);
    setPulseCount((c) => c + 1);
    setScreenFlash('red');
    addFloating(reasonText, false);

    setTimeout(() => {
      setScreenFlash(null);
    }, 250);

    const nextLives = lives - 1;
    setLives(nextLives);

    if (nextLives <= 0) {
      setTimeout(() => {
        finishGame();
      }, 500);
    } else {
      setTimeout(() => {
        if (mode === 'memory') {
          // Restart same memory level
          startMemoryRound(memoryLevel);
        } else {
          setupNewQuestion(correctCountRef.current);
        }
      }, 350);
    }
  };

  const finishGame = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    const finalScore = scoreRef.current;
    const attempts = totalAttemptsRef.current;
    const correct = correctCountRef.current;
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    // Coins formula: base points / 15 + combo bonuses
    const earnedCoins = Math.max(5, Math.floor(finalScore / 15));
    onGameOver({
      score: finalScore,
      coinsEarned: earnedCoins,
      accuracy,
      maxCombo: maxComboRef.current,
      isDailyVictory: false,
    });
  };

  // Keyboard navigation for directional input
  useEffect(() => {
    if (countdown !== null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        sounds.playClick(stats.soundEnabled);
        onPause();
        return;
      }

      if (isProcessingRef.current) return;

      let pressedDir: Direction | null = null;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') pressedDir = 'UP';
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') pressedDir = 'DOWN';
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') pressedDir = 'LEFT';
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') pressedDir = 'RIGHT';

      if (pressedDir) {
        e.preventDefault();
        if (mode === 'classic' || mode === 'speed') {
          handleArrowInput(pressedDir);
        } else if (mode === 'memory' && memoryPhase === 'inputting') {
          handleMemoryInput(pressedDir);
        } else if (mode === 'daily' && dailyQuestion?.type === 'direction') {
          handleDailyDirectionInput(pressedDir);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [countdown, mode, memoryPhase, dailyQuestion, currentArrow, memorySequence, playerInputs]);

  // Input Handlers
  const handleArrowInput = (pressed: Direction) => {
    if (isProcessingRef.current) return;
    const expected = getReverseDirection(currentArrow);
    if (pressed === expected) {
      handleCorrect(10);
    } else {
      handleWrong('WRONG ARROW!');
    }
  };

  const handleColorInput = (chosen: ColorId) => {
    if (isProcessingRef.current) return;
    const expected = getOppositeColor(currentColor);
    if (chosen === expected) {
      handleCorrect(10);
    } else {
      handleWrong('WRONG COLOR PAIR!');
    }
  };

  const handleNumberInput = (chosen: number) => {
    if (isProcessingRef.current) return;
    const expected = getOppositeNumber(currentNumber);
    if (chosen === expected) {
      handleCorrect(10);
    } else {
      handleWrong('NOT SUM TO 10!');
    }
  };

  const handleMemoryInput = (pressed: Direction) => {
    if (isProcessingRef.current || memoryPhase !== 'inputting') return;
    const newInputs = [...playerInputs, pressed];
    setPlayerInputs(newInputs);

    const validation = validateMemoryStep(memorySequence, newInputs);
    if (!validation.isCorrectSoFar) {
      handleWrong('WRONG SEQUENCE!');
    } else if (validation.isCompleted) {
      sounds.playLevelUp(stats.soundEnabled);
      handleCorrect(20);
      const nextLevel = memoryLevel + 1;
      setMemoryLevel(nextLevel);
      setTimeout(() => {
        startMemoryRound(nextLevel);
      }, 700);
    } else {
      sounds.playClick(stats.soundEnabled);
    }
  };

  const handleDailyDirectionInput = (pressed: Direction) => {
    if (!dailyQuestion || dailyQuestion.type !== 'direction') return;
    if (pressed === dailyQuestion.correctAnswer) {
      handleCorrect(15);
    } else {
      handleWrong();
    }
  };

  const handleDailyColorInput = (chosen: ColorId) => {
    if (!dailyQuestion || dailyQuestion.type !== 'color') return;
    if (chosen === dailyQuestion.correctAnswer) {
      handleCorrect(15);
    } else {
      handleWrong();
    }
  };

  const handleDailyNumberInput = (chosen: number) => {
    if (!dailyQuestion || dailyQuestion.type !== 'number') return;
    if (chosen === dailyQuestion.correctAnswer) {
      handleCorrect(15);
    } else {
      handleWrong();
    }
  };

  return (
    <div
      className={`relative flex flex-col min-h-screen px-4 py-3 max-w-md mx-auto select-none overflow-hidden justify-between ${
        screenFlash === 'green'
          ? 'bg-emerald-950/40 transition-colors duration-150'
          : screenFlash === 'red'
          ? 'bg-red-950/40 transition-colors duration-150'
          : ''
      }`}
    >
      {/* 3D Neural Brain Ambient Reacting Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-35 pointer-events-none z-0">
        <NeonBrain3D
          themeId={stats.equippedTheme}
          pulseTrigger={pulseCount}
          lastAnswerCorrect={lastCorrect}
          size="lg"
          interactive={false}
        />
      </div>

      {/* Floating score text */}
      <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
        {floatingTexts.map((f) => (
          <div
            key={f.id}
            className={`font-['Orbitron'] font-black text-xl animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] ${
              f.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {f.text}
          </div>
        ))}
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase mb-2">
            PREPARE YOUR COGNITIVE REACTION
          </span>
          <div className="text-7xl font-black font-['Orbitron'] text-cyan-400 animate-ping">
            {countdown === 0 ? 'GO!' : countdown}
          </div>
          <span className="text-sm font-['Rajdhani'] font-bold tracking-[0.2em] text-purple-300 uppercase mt-4">
            THINK OPPOSITE!
          </span>
        </div>
      )}

      {/* Top HUD Cluster */}
      <div className="relative z-10 w-full flex items-center justify-between pb-2 border-b border-zinc-800/80">
        {/* Lives Battery */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-zinc-700/60">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-3 h-4 rounded-sm transition-all ${
                  num <= lives
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                    : 'bg-zinc-800 border border-zinc-700/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center Score & Combo */}
        <div className="flex flex-col items-center">
          <div className="font-['Orbitron'] font-black text-xl text-white tracking-wider flex items-center gap-1.5">
            <span className="text-zinc-500 text-xs font-mono">SCORE</span>
            <span>{score}</span>
          </div>
          {combo >= 2 && (
            <div className="text-[10px] font-['Orbitron'] font-bold text-yellow-400 tracking-wider flex items-center gap-1 animate-pulse">
              <Zap className="w-3 h-3 fill-yellow-400" />
              COMBO x{combo} {combo >= 5 ? '🔥 ULTRA' : ''}
            </div>
          )}
        </div>

        {/* Pause Button */}
        <button
          onClick={() => {
            sounds.playClick(stats.soundEnabled);
            onPause();
          }}
          className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 active:scale-95 transition-all"
          aria-label="Pause Game"
        >
          <Pause className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* Timer Bar */}
      <div className="relative z-10 w-full mt-1.5">
        {mode === 'speed' ? (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-yellow-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> REACTION WINDOW
              </span>
              <span>{speedTimer.toFixed(2)}s</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-yellow-500/30">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-75"
                style={{
                  width: `${Math.min(100, (speedTimer / speedMaxRef.current) * 100)}%`,
                }}
              />
            </div>
          </div>
        ) : mode === 'daily' ? (
          <div className="flex items-center justify-between text-xs font-mono text-orange-300 px-1 py-0.5 bg-orange-950/30 rounded-lg border border-orange-500/30">
            <span>DAILY ROUND</span>
            <span className="font-bold font-['Orbitron']">{dailyRoundIdx + 1} / 20</span>
          </div>
        ) : mode === 'memory' ? (
          <div className="flex items-center justify-between text-xs font-mono text-pink-300 px-1 py-0.5 bg-pink-950/30 rounded-lg border border-pink-500/30">
            <span>SEQUENCE LENGTH</span>
            <span className="font-bold font-['Orbitron']">{memoryLevel} ARROWS</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> TIME REMAINING
              </span>
              <span className={timeRemaining <= 10 ? 'text-red-400 font-bold animate-pulse' : 'text-zinc-200'}>
                {timeRemaining}s
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-700/50">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeRemaining <= 10
                    ? 'bg-red-500'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                }`}
                style={{ width: `${(timeRemaining / 60) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Central Stimulus Prompt Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-2">
        {/* MODE 1 & 4: CLASSIC / SPEED ARROWS */}
        {(mode === 'classic' || mode === 'speed') && (
          <div className="flex flex-col items-center">
            <div className="text-xs font-['Orbitron'] font-bold tracking-widest text-cyan-300 uppercase mb-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              PRESS THE OPPOSITE ARROW
            </div>

            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-zinc-950/90 border-2 border-purple-500/80 shadow-[0_0_35px_rgba(168,85,247,0.5)] flex items-center justify-center active:scale-95 transition-transform">
              {currentArrow === 'UP' && <ArrowUp className="w-24 h-24 text-purple-400" />}
              {currentArrow === 'DOWN' && <ArrowDown className="w-24 h-24 text-purple-400" />}
              {currentArrow === 'LEFT' && <ArrowL className="w-24 h-24 text-purple-400" />}
              {currentArrow === 'RIGHT' && <ArrowRight className="w-24 h-24 text-purple-400" />}
            </div>

            <span className="text-[11px] font-mono text-zinc-400 mt-3">
              Shown: <strong className="text-white">{currentArrow}</strong> ➔ React opposite!
            </span>
          </div>
        )}

        {/* MODE 2: COLOR REVERSE */}
        {mode === 'color' && (
          <div className="flex flex-col items-center">
            <div className="text-xs font-['Orbitron'] font-bold tracking-widest text-cyan-300 uppercase mb-2">
              TAP OPPOSITE COLOR PAIR
            </div>

            <div
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center shadow-[0_0_40px] border-4 border-white/60 transition-all duration-200"
              style={{
                backgroundColor: COLOR_DEFS[currentColor].hex,
                boxShadow: `0 0 35px ${COLOR_DEFS[currentColor].glowHex}`,
              }}
            >
              <span className="font-['Orbitron'] font-black text-sm text-black uppercase tracking-wider drop-shadow">
                {COLOR_DEFS[currentColor].name.split(' ')[1] || currentColor}
              </span>
            </div>

            <div className="text-[11px] font-mono text-zinc-400 mt-3 text-center">
              Pairs: <span className="text-cyan-400 font-bold">Cyan</span> ↔ <span className="text-pink-400 font-bold">Magenta</span> |{' '}
              <span className="text-yellow-400 font-bold">Yellow</span> ↔ <span className="text-blue-400 font-bold">Blue</span>
            </div>
          </div>
        )}

        {/* MODE 3: NUMBER REVERSE */}
        {mode === 'number' && (
          <div className="flex flex-col items-center">
            <div className="text-xs font-['Orbitron'] font-bold tracking-widest text-emerald-300 uppercase mb-2">
              COMPLEMENT SUMS TO 10
            </div>

            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-black/80 border-2 border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center justify-center">
              <span className="font-['Orbitron'] text-6xl font-black text-emerald-300 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]">
                {currentNumber}
              </span>
            </div>

            <span className="text-[11px] font-mono text-zinc-400 mt-3">
              What completes <strong className="text-emerald-300">{currentNumber}</strong> to 10?
            </span>
          </div>
        )}

        {/* MODE 5: MEMORY REVERSE */}
        {mode === 'memory' && (
          <div className="flex flex-col items-center w-full">
            <div className="text-xs font-['Orbitron'] font-bold tracking-widest text-pink-300 uppercase mb-2">
              {memoryPhase === 'showing' ? 'WATCH SEQUENCE' : 'ENTER IN REVERSE ORDER!'}
            </div>

            <div className="w-36 h-36 rounded-3xl bg-black/80 border-2 border-pink-500/80 shadow-[0_0_35px_rgba(236,72,153,0.5)] flex items-center justify-center my-2">
              {memoryPhase === 'showing' ? (
                <>
                  {memorySequence[memoryStep] === 'UP' && <ArrowUp className="w-20 h-20 text-pink-400 animate-pulse" />}
                  {memorySequence[memoryStep] === 'DOWN' && <ArrowDown className="w-20 h-20 text-pink-400 animate-pulse" />}
                  {memorySequence[memoryStep] === 'LEFT' && <ArrowL className="w-20 h-20 text-pink-400 animate-pulse" />}
                  {memorySequence[memoryStep] === 'RIGHT' && <ArrowRight className="w-20 h-20 text-pink-400 animate-pulse" />}
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <Sparkles className="w-10 h-10 text-cyan-400 animate-bounce" />
                  <span className="font-['Orbitron'] text-xs font-bold text-cyan-300 mt-2">
                    INPUT REVERSE
                  </span>
                </div>
              )}
            </div>

            {/* Step Progress Dots */}
            <div className="flex items-center gap-2 mt-2">
              {memorySequence.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    memoryPhase === 'showing'
                      ? idx === memoryStep
                        ? 'bg-pink-400 border-white shadow-[0_0_10px_#f472b6]'
                        : 'bg-zinc-800 border-zinc-700'
                      : idx < playerInputs.length
                      ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_8px_#22d3ee]'
                      : 'bg-zinc-800 border-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* MODE 6: DAILY CHALLENGE MIX */}
        {mode === 'daily' && dailyQuestion && (
          <div className="flex flex-col items-center">
            <div className="text-xs font-['Orbitron'] font-bold tracking-widest text-orange-300 uppercase mb-1">
              {dailyQuestion.prompt}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 mb-2">
              {dailyQuestion.subPrompt}
            </div>

            {dailyQuestion.type === 'direction' && (
              <div className="w-32 h-32 rounded-3xl bg-black/80 border-2 border-orange-500/80 shadow-[0_0_30px_rgba(249,115,22,0.5)] flex items-center justify-center">
                {dailyQuestion.displayValue === 'UP' && <ArrowUp className="w-20 h-20 text-orange-400" />}
                {dailyQuestion.displayValue === 'DOWN' && <ArrowDown className="w-20 h-20 text-orange-400" />}
                {dailyQuestion.displayValue === 'LEFT' && <ArrowL className="w-20 h-20 text-orange-400" />}
                {dailyQuestion.displayValue === 'RIGHT' && <ArrowRight className="w-20 h-20 text-orange-400" />}
              </div>
            )}

            {dailyQuestion.type === 'color' && (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_35px] border-4 border-white/60"
                style={{
                  backgroundColor: COLOR_DEFS[dailyQuestion.displayValue as ColorId].hex,
                  boxShadow: `0 0 35px ${COLOR_DEFS[dailyQuestion.displayValue as ColorId].glowHex}`,
                }}
              >
                <span className="font-['Orbitron'] font-black text-xs text-black uppercase">
                  {COLOR_DEFS[dailyQuestion.displayValue as ColorId].name.split(' ')[1]}
                </span>
              </div>
            )}

            {dailyQuestion.type === 'number' && (
              <div className="w-32 h-32 rounded-3xl bg-black/80 border-2 border-orange-500/80 shadow-[0_0_30px_rgba(249,115,22,0.5)] flex items-center justify-center">
                <span className="font-['Orbitron'] text-5xl font-black text-orange-300">
                  {dailyQuestion.displayValue}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Controls Stage */}
      <div className="relative z-10 w-full pt-2 pb-1">
        {/* ARROWS PAD (Classic, Speed, Memory, or Daily Direction) */}
        {(mode === 'classic' ||
          mode === 'speed' ||
          mode === 'memory' ||
          (mode === 'daily' && dailyQuestion?.type === 'direction')) && (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
              <div />
              <button
                onClick={() => {
                  if (mode === 'memory') handleMemoryInput('UP');
                  else if (mode === 'daily') handleDailyDirectionInput('UP');
                  else handleArrowInput('UP');
                }}
                disabled={mode === 'memory' && memoryPhase === 'showing'}
                className="h-16 rounded-2xl bg-zinc-900/90 border border-purple-500/60 hover:border-purple-400 active:scale-90 active:bg-purple-600 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-40"
                aria-label="UP"
              >
                <ArrowUp className="w-8 h-8 text-white" />
              </button>
              <div />

              <button
                onClick={() => {
                  if (mode === 'memory') handleMemoryInput('LEFT');
                  else if (mode === 'daily') handleDailyDirectionInput('LEFT');
                  else handleArrowInput('LEFT');
                }}
                disabled={mode === 'memory' && memoryPhase === 'showing'}
                className="h-16 rounded-2xl bg-zinc-900/90 border border-purple-500/60 hover:border-purple-400 active:scale-90 active:bg-purple-600 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-40"
                aria-label="LEFT"
              >
                <ArrowL className="w-8 h-8 text-white" />
              </button>

              <button
                onClick={() => {
                  if (mode === 'memory') handleMemoryInput('DOWN');
                  else if (mode === 'daily') handleDailyDirectionInput('DOWN');
                  else handleArrowInput('DOWN');
                }}
                disabled={mode === 'memory' && memoryPhase === 'showing'}
                className="h-16 rounded-2xl bg-zinc-900/90 border border-purple-500/60 hover:border-purple-400 active:scale-90 active:bg-purple-600 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-40"
                aria-label="DOWN"
              >
                <ArrowDown className="w-8 h-8 text-white" />
              </button>

              <button
                onClick={() => {
                  if (mode === 'memory') handleMemoryInput('RIGHT');
                  else if (mode === 'daily') handleDailyDirectionInput('RIGHT');
                  else handleArrowInput('RIGHT');
                }}
                disabled={mode === 'memory' && memoryPhase === 'showing'}
                className="h-16 rounded-2xl bg-zinc-900/90 border border-purple-500/60 hover:border-purple-400 active:scale-90 active:bg-purple-600 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-40"
                aria-label="RIGHT"
              >
                <ArrowRight className="w-8 h-8 text-white" />
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 font-mono tracking-wider mt-2">
              WASD / ARROW KEYS SUPPORTED
            </p>
          </div>
        )}

        {/* COLOR PAD (Mode 2 or Daily Color) */}
        {(mode === 'color' || (mode === 'daily' && dailyQuestion?.type === 'color')) && (
          <div className="grid grid-cols-2 gap-3 w-full">
            {COLOR_KEYS.map((cid) => (
              <button
                key={cid}
                onClick={() => {
                  if (mode === 'daily') handleDailyColorInput(cid);
                  else handleColorInput(cid);
                }}
                className={`py-4 px-3 rounded-2xl font-['Orbitron'] font-bold text-sm tracking-wider border active:scale-95 transition-all text-white shadow-lg ${
                  cid === 'cyan'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 hover:bg-cyan-500/30 shadow-cyan-500/20'
                    : cid === 'magenta'
                    ? 'bg-pink-500/20 border-pink-400 text-pink-200 hover:bg-pink-500/30 shadow-pink-500/20'
                    : cid === 'yellow'
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200 hover:bg-yellow-500/30 shadow-yellow-500/20'
                    : 'bg-blue-500/20 border-blue-400 text-blue-200 hover:bg-blue-500/30 shadow-blue-500/20'
                }`}
              >
                {COLOR_DEFS[cid].name.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* NUMBER PAD (Mode 3 or Daily Number) */}
        {(mode === 'number' || (mode === 'daily' && dailyQuestion?.type === 'number')) && (
          <div className="grid grid-cols-4 gap-2.5 w-full">
            {(mode === 'daily' ? dailyQuestion?.options || [] : numberOptions).map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  if (mode === 'daily') handleDailyNumberInput(opt);
                  else handleNumberInput(opt);
                }}
                className="py-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-['Orbitron'] font-bold text-2xl active:scale-90 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
