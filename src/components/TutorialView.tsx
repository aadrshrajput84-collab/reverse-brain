import React, { useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowLeft as ArrowL, ArrowRight, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Direction, ColorId } from '../game/types';
import { getReverseDirection, COLOR_DEFS, getOppositeColor, getOppositeNumber } from '../game/rules';
import { sounds } from '../utils/audio';

interface TutorialViewProps {
  onBack: () => void;
}

export const TutorialView: React.FC<TutorialViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'arrows' | 'colors' | 'numbers' | 'memory'>('arrows');

  // Interactive sandbox states
  // 1. Arrows
  const [sandboxArrow, setSandboxArrow] = useState<Direction>('LEFT');
  const [arrowFeedback, setArrowFeedback] = useState<'correct' | 'wrong' | null>(null);

  // 2. Colors
  const [sandboxColor, setSandboxColor] = useState<ColorId>('cyan');
  const [colorFeedback, setColorFeedback] = useState<'correct' | 'wrong' | null>(null);

  // 3. Numbers
  const [sandboxNumber, setSandboxNumber] = useState<number>(3);
  const [numberFeedback, setNumberFeedback] = useState<'correct' | 'wrong' | null>(null);

  const testArrow = (pressed: Direction) => {
    const isCorrect = pressed === getReverseDirection(sandboxArrow);
    if (isCorrect) {
      sounds.playCorrect(1);
      setArrowFeedback('correct');
      setTimeout(() => {
        const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(d => d !== sandboxArrow) as Direction[];
        setSandboxArrow(dirs[Math.floor(Math.random() * dirs.length)]);
        setArrowFeedback(null);
      }, 700);
    } else {
      sounds.playWrong();
      setArrowFeedback('wrong');
    }
  };

  const testColor = (chosen: ColorId) => {
    const isCorrect = chosen === getOppositeColor(sandboxColor);
    if (isCorrect) {
      sounds.playCorrect(1);
      setColorFeedback('correct');
      setTimeout(() => {
        const pool: ColorId[] = (['cyan', 'magenta', 'yellow', 'blue'] as ColorId[]).filter(c => c !== sandboxColor);
        setSandboxColor(pool[Math.floor(Math.random() * pool.length)]);
        setColorFeedback(null);
      }, 700);
    } else {
      sounds.playWrong();
      setColorFeedback('wrong');
    }
  };

  const testNumber = (chosen: number) => {
    const isCorrect = chosen === getOppositeNumber(sandboxNumber);
    if (isCorrect) {
      sounds.playCorrect(1);
      setNumberFeedback('correct');
      setTimeout(() => {
        const next = Math.floor(Math.random() * 9) + 1;
        setSandboxNumber(next);
        setNumberFeedback(null);
      }, 700);
    } else {
      sounds.playWrong();
      setNumberFeedback('wrong');
    }
  };

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
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">BACK</span>
        </button>

        <h2 className="text-sm font-['Orbitron'] font-bold tracking-wider uppercase text-zinc-100">
          RULES & TRAINING
        </h2>

        <div className="w-8" />
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 pt-3 pb-2">
        {(['arrows', 'colors', 'numbers', 'memory'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              sounds.playClick();
              setActiveTab(tab);
            }}
            className={`py-2 text-[11px] font-['Orbitron'] font-bold rounded-xl transition-all uppercase ${
              activeTab === tab
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto py-2 flex flex-col justify-between">
        {activeTab === 'arrows' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-purple-500/30 text-left w-full">
              <h3 className="font-['Orbitron'] text-xs font-bold text-purple-300 uppercase">
                Core Arrow Rule
              </h3>
              <p className="text-xs text-zinc-300 mt-1">
                Your brain naturally wants to follow the arrow. Resist it! Always choose the <strong>exact opposite</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono text-cyan-300">
                <div className="bg-black/40 p-1.5 rounded border border-zinc-800">LEFT ➔ PRESS RIGHT</div>
                <div className="bg-black/40 p-1.5 rounded border border-zinc-800">RIGHT ➔ PRESS LEFT</div>
                <div className="bg-black/40 p-1.5 rounded border border-zinc-800">UP ➔ PRESS DOWN</div>
                <div className="bg-black/40 p-1.5 rounded border border-zinc-800">DOWN ➔ PRESS UP</div>
              </div>
            </div>

            {/* Interactive Sandbox */}
            <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center">
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 mb-2">
                PRACTICE SANDBOX: PRESS THE OPPOSITE
              </span>

              {/* Display Arrow */}
              <div className="w-24 h-24 rounded-2xl bg-black/60 border-2 border-purple-500/60 flex items-center justify-center my-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                {sandboxArrow === 'UP' && <ArrowUp className="w-12 h-12 text-purple-400 animate-pulse" />}
                {sandboxArrow === 'DOWN' && <ArrowDown className="w-12 h-12 text-purple-400 animate-pulse" />}
                {sandboxArrow === 'LEFT' && <ArrowL className="w-12 h-12 text-purple-400 animate-pulse" />}
                {sandboxArrow === 'RIGHT' && <ArrowRight className="w-12 h-12 text-purple-400 animate-pulse" />}
              </div>

              {/* Feedback indicator */}
              <div className="h-6 flex items-center text-xs font-bold">
                {arrowFeedback === 'correct' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> CORRECT! You thought opposite.
                  </span>
                )}
                {arrowFeedback === 'wrong' && (
                  <span className="text-red-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> WRONG! That was the same direction.
                  </span>
                )}
                {!arrowFeedback && (
                  <span className="text-zinc-500">Tap the opposite direction below</span>
                )}
              </div>

              {/* Interactive Pad */}
              <div className="grid grid-cols-3 gap-2 w-48 mt-3">
                <div />
                <button
                  onClick={() => testArrow('UP')}
                  className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 border border-zinc-700 flex justify-center text-white"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
                <div />
                <button
                  onClick={() => testArrow('LEFT')}
                  className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 border border-zinc-700 flex justify-center text-white"
                >
                  <ArrowL className="w-6 h-6" />
                </button>
                <button
                  onClick={() => testArrow('DOWN')}
                  className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 border border-zinc-700 flex justify-center text-white"
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
                <button
                  onClick={() => testArrow('RIGHT')}
                  className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 border border-zinc-700 flex justify-center text-white"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-cyan-500/30 text-left w-full">
              <h3 className="font-['Orbitron'] text-xs font-bold text-cyan-300 uppercase">
                Color Pairs Table
              </h3>
              <p className="text-xs text-zinc-300 mt-1">
                Colors are bound in two electric complementary pairs:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded bg-black/50 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 flex items-center justify-between">
                  <span>CYAN</span> ↔ <span className="text-pink-400">MAGENTA</span>
                </div>
                <div className="p-2 rounded bg-black/50 border border-yellow-500/40 text-[11px] font-bold text-yellow-300 flex items-center justify-between">
                  <span>YELLOW</span> ↔ <span className="text-blue-400">BLUE</span>
                </div>
              </div>
            </div>

            {/* Interactive Color Sandbox */}
            <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center">
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 mb-2">
                PRACTICE SANDBOX: TAP INVERSE COLOR
              </span>

              {/* Display Color */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center my-2 shadow-[0_0_25px] transition-all border-2 border-white/40"
                style={{
                  backgroundColor: COLOR_DEFS[sandboxColor].hex,
                  boxShadow: `0 0 25px ${COLOR_DEFS[sandboxColor].hex}`,
                }}
              >
                <span className="font-['Orbitron'] font-extrabold text-xs text-black uppercase drop-shadow">
                  {COLOR_DEFS[sandboxColor].name.split(' ')[1] || sandboxColor}
                </span>
              </div>

              {/* Feedback indicator */}
              <div className="h-6 flex items-center text-xs font-bold">
                {colorFeedback === 'correct' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Perfect complement pair!
                  </span>
                )}
                {colorFeedback === 'wrong' && (
                  <span className="text-red-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Incorrect! Check the pair table above.
                  </span>
                )}
                {!colorFeedback && (
                  <span className="text-zinc-500">Select opposite pair color</span>
                )}
              </div>

              {/* Interactive Color Options */}
              <div className="grid grid-cols-2 gap-2.5 w-full mt-3">
                {(['cyan', 'magenta', 'yellow', 'blue'] as ColorId[]).map((cid) => (
                  <button
                    key={cid}
                    onClick={() => testColor(cid)}
                    className={`py-3 px-2 rounded-xl font-['Orbitron'] text-xs font-bold border active:scale-95 transition-all text-white ${
                      cid === 'cyan'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : cid === 'magenta'
                        ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                        : cid === 'yellow'
                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                        : 'bg-blue-500/20 border-blue-400 text-blue-300'
                    }`}
                  >
                    {COLOR_DEFS[cid].name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'numbers' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-emerald-500/30 text-left w-full">
              <h3 className="font-['Orbitron'] text-xs font-bold text-emerald-300 uppercase">
                Number Reverse: Sums to 10
              </h3>
              <p className="text-xs text-zinc-300 mt-1">
                Numbers pair up by what completes them to 10.
              </p>
              <div className="grid grid-cols-3 gap-1.5 mt-2 text-center text-xs font-mono">
                <div className="p-1 bg-black/40 rounded border border-zinc-800 text-emerald-300">1 ↔ 9</div>
                <div className="p-1 bg-black/40 rounded border border-zinc-800 text-emerald-300">2 ↔ 8</div>
                <div className="p-1 bg-black/40 rounded border border-zinc-800 text-emerald-300">3 ↔ 7</div>
                <div className="p-1 bg-black/40 rounded border border-zinc-800 text-emerald-300">4 ↔ 6</div>
                <div className="p-1 bg-black/40 rounded border border-zinc-800 text-emerald-300">5 ↔ 5</div>
              </div>
            </div>

            {/* Interactive Number Sandbox */}
            <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center">
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 mb-2">
                PRACTICE SANDBOX: SELECT SUM-TO-10 PAIR
              </span>

              <div className="w-20 h-20 rounded-2xl bg-black/70 border-2 border-emerald-400/80 flex items-center justify-center my-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <span className="font-['Orbitron'] text-4xl font-black text-emerald-300">
                  {sandboxNumber}
                </span>
              </div>

              {/* Feedback indicator */}
              <div className="h-6 flex items-center text-xs font-bold">
                {numberFeedback === 'correct' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Exactly! {sandboxNumber} + {getOppositeNumber(sandboxNumber)} = 10
                  </span>
                )}
                {numberFeedback === 'wrong' && (
                  <span className="text-red-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Not quite. Remember: sum must equal 10.
                  </span>
                )}
                {!numberFeedback && (
                  <span className="text-zinc-500">Pick the 10-complement</span>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-4 gap-2 w-full mt-3">
                {[
                  getOppositeNumber(sandboxNumber),
                  ((sandboxNumber + 2) % 9) + 1,
                  ((sandboxNumber + 4) % 9) + 1,
                  ((sandboxNumber + 6) % 9) + 1,
                ]
                  .sort(() => 0.5 - Math.random())
                  .map((num, i) => (
                    <button
                      key={i}
                      onClick={() => testNumber(num)}
                      className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-emerald-500/30 font-['Orbitron'] font-bold text-lg text-emerald-300 active:scale-95 transition-all"
                    >
                      {num}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-pink-500/30 text-left w-full">
              <h3 className="font-['Orbitron'] text-xs font-bold text-pink-300 uppercase">
                Memory Reverse Protocol
              </h3>
              <p className="text-xs text-zinc-300 mt-1">
                You will see a sequence of arrows flash on screen (e.g., 3 arrows).
              </p>
              <div className="p-2 bg-black/40 rounded border border-zinc-800 text-xs font-mono text-pink-300 mt-2">
                Example: UP ➔ RIGHT ➔ DOWN<br />
                Your Input: <strong>DOWN ➔ RIGHT ➔ UP</strong> (Reverse Order!)
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Each round adds one more arrow to challenge your working memory capacity.
              </p>
            </div>

            <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
              <span className="text-xs font-semibold text-zinc-300">
                Tip: Mentally recite the arrows in reverse as you watch them appear!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Done button */}
      <div className="pt-3">
        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-['Orbitron'] font-bold text-sm tracking-wider active:scale-95 transition-all border border-purple-400/40"
        >
          READY TO PLAY
        </button>
      </div>
    </div>
  );
};
