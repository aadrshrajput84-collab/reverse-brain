import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Music,
  Smartphone,
  Maximize2,
  RotateCcw,
  ShieldCheck,
  Code,
  Info,
} from 'lucide-react';
import { PlayerStats } from '../game/types';
import { sounds } from '../utils/audio';

interface SettingsViewProps {
  stats: PlayerStats;
  onUpdateStats: (partial: Partial<PlayerStats>) => void;
  onResetData: () => void;
  onBack: () => void;
  onOpenPackaging: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  stats,
  onUpdateStats,
  onResetData,
  onBack,
  onOpenPackaging,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

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
            SETTINGS
          </h2>

          <div className="w-8" />
        </div>

        {/* Toggles Group */}
        <div className="space-y-3 mt-4">
          {/* Sound SFX */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                {stats.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-['Orbitron'] text-xs font-bold text-zinc-200">
                  ARCADE SOUND FX
                </div>
                <div className="text-[11px] text-zinc-400">
                  Procedural Web Audio chimes & laser dings
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !stats.soundEnabled;
                sounds.playClick(next);
                onUpdateStats({ soundEnabled: next });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                stats.soundEnabled ? 'bg-purple-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  stats.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Synth Ambient BGM */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="font-['Orbitron'] text-xs font-bold text-zinc-200">
                  CYBER SYNTH DRONE
                </div>
                <div className="text-[11px] text-zinc-400">
                  Atmospheric low-frequency audio tone
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !stats.bgmEnabled;
                if (next) sounds.startAmbientBgm(true);
                else sounds.stopAmbientBgm();
                onUpdateStats({ bgmEnabled: next });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                stats.bgmEnabled ? 'bg-cyan-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  stats.bgmEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptic Vibration */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-['Orbitron'] text-xs font-bold text-zinc-200">
                  HAPTIC VIBRATION
                </div>
                <div className="text-[11px] text-zinc-400">
                  Tactile feedback on hits & combo pulses
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !stats.vibrationEnabled;
                sounds.triggerHaptic('light', next);
                onUpdateStats({ vibrationEnabled: next });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                stats.vibrationEnabled ? 'bg-pink-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  stats.vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Viewport Frame Mode */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-['Orbitron'] text-xs font-bold text-zinc-200">
                  PHONE BEZEL MOCKUP
                </div>
                <div className="text-[11px] text-zinc-400">
                  Display within a realistic mobile chassis on desktop
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick(stats.soundEnabled);
                onUpdateStats({ mobileFrameMode: !stats.mobileFrameMode });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                stats.mobileFrameMode ? 'bg-emerald-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  stats.mobileFrameMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Android Packaging & Architecture */}
        <div className="mt-4 p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-zinc-200">
                ANDROID APK BUILDER
              </div>
              <div className="text-[11px] text-zinc-400">
                Capacitor setup, Gradle & Google Play release
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick(stats.soundEnabled);
              onOpenPackaging();
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-cyan-300 font-bold border border-zinc-700 active:scale-95 transition-all"
          >
            VIEW
          </button>
        </div>
      </div>

      {/* Reset Data & Credits */}
      <div className="pt-4 space-y-3">
        {confirmReset ? (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 flex flex-col items-center text-center gap-2">
            <span className="text-xs font-['Orbitron'] font-bold text-red-400">
              RESET ALL HIGH SCORES & COINS?
            </span>
            <div className="flex gap-2 w-full mt-1">
              <button
                onClick={() => {
                  sounds.playClick(stats.soundEnabled);
                  onResetData();
                  setConfirmReset(false);
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                YES, RESET
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-red-400 text-xs font-mono border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET LOCAL PROGRESS
          </button>
        )}

        <div className="text-center text-[10px] text-zinc-500 font-mono">
          REVERSE BRAIN · 100% OFFLINE ARCADE · NO PAID APIS
        </div>
      </div>
    </div>
  );
};
