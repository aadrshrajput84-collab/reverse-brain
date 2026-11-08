import React, { useState } from 'react';
import { ArrowLeft, Coins, Check, Lock, Sparkles } from 'lucide-react';
import { PlayerStats, ThemeId } from '../game/types';
import { THEMES } from '../game/themes';
import { NeonBrain3D } from './NeonBrain3D';
import { sounds } from '../utils/audio';

interface ThemeShopViewProps {
  stats: PlayerStats;
  onEquipTheme: (themeId: ThemeId) => void;
  onUnlockTheme: (themeId: ThemeId) => void;
  onBack: () => void;
  onOpenRewardedAdTest: () => void;
}

export const ThemeShopView: React.FC<ThemeShopViewProps> = ({
  stats,
  onEquipTheme,
  onUnlockTheme,
  onBack,
  onOpenRewardedAdTest,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<ThemeId>(stats.equippedTheme);
  const themeList = Object.values(THEMES);
  const activePreviewConfig = THEMES[selectedPreview];

  const handleAction = (themeId: ThemeId) => {
    sounds.playClick(stats.soundEnabled);
    const isUnlocked = stats.unlockedThemes.includes(themeId);
    if (isUnlocked) {
      onEquipTheme(themeId);
    } else {
      onUnlockTheme(themeId);
    }
  };

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
            NEON THEME SHOP
          </h2>

          {/* Wallet */}
          <button
            onClick={() => {
              sounds.playClick(stats.soundEnabled);
              onOpenRewardedAdTest();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-yellow-500/40 text-yellow-300 font-['Rajdhani'] font-bold text-xs"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span>{stats.coins}</span>
            <span className="text-[9px] bg-yellow-400/20 px-1 rounded text-yellow-400 font-bold">+</span>
          </button>
        </div>

        {/* Live 3D Brain Preview of Selected Theme */}
        <div className="my-3 p-4 rounded-3xl bg-zinc-950/80 border border-zinc-800 flex flex-col items-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 blur-3xl pointer-events-none"
            style={{ backgroundColor: activePreviewConfig.accent }}
          />

          <NeonBrain3D themeId={selectedPreview} size="md" />

          <div className="font-['Orbitron'] text-base font-bold text-white mt-1">
            {activePreviewConfig.name}
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {stats.equippedTheme === selectedPreview
              ? 'CURRENTLY EQUIPPED'
              : stats.unlockedThemes.includes(selectedPreview)
              ? 'UNLOCKED'
              : `LOCKED · ${activePreviewConfig.price} COINS`}
          </span>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {themeList.map((t) => {
            const isEquipped = stats.equippedTheme === t.id;
            const isUnlocked = stats.unlockedThemes.includes(t.id);
            const isSelected = selectedPreview === t.id;
            const canAfford = stats.coins >= t.price;

            return (
              <div
                key={t.id}
                onClick={() => {
                  sounds.playClick(stats.soundEnabled);
                  setSelectedPreview(t.id);
                }}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all active:scale-95 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: t.accent }}
                  />
                  {isEquipped ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      ACTIVE
                    </span>
                  ) : !isUnlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-yellow-400">
                      <Lock className="w-3 h-3" />
                      {t.price}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-zinc-400">OWNED</span>
                  )}
                </div>

                <div className="mt-2">
                  <div className="font-['Orbitron'] text-xs font-bold text-zinc-200 truncate">
                    {t.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action for Selected Preview */}
      <div className="pt-4">
        {stats.equippedTheme === selectedPreview ? (
          <button
            disabled
            className="w-full py-3.5 rounded-xl bg-zinc-800 text-zinc-400 font-['Orbitron'] text-xs font-bold tracking-wider cursor-default flex items-center justify-center gap-2 border border-zinc-700"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            EQUIPPED AND ACTIVE
          </button>
        ) : stats.unlockedThemes.includes(selectedPreview) ? (
          <button
            onClick={() => handleAction(selectedPreview)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-['Orbitron'] text-xs font-bold tracking-wider active:scale-95 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            EQUIP {activePreviewConfig.name.toUpperCase()}
          </button>
        ) : (
          <button
            onClick={() => handleAction(selectedPreview)}
            disabled={stats.coins < activePreviewConfig.price}
            className={`w-full py-3.5 rounded-xl font-['Orbitron'] text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 border ${
              stats.coins >= activePreviewConfig.price
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95'
                : 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Coins className="w-4 h-4 text-yellow-300" />
            UNLOCK FOR {activePreviewConfig.price} COINS
          </button>
        )}
      </div>
    </div>
  );
};
