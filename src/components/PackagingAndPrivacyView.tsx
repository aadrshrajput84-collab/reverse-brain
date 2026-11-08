import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Smartphone, ShieldCheck, Terminal, FileCode, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PackagingAndPrivacyViewProps {
  onBack: () => void;
}

export const PackagingAndPrivacyView: React.FC<PackagingAndPrivacyViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'packaging' | 'privacy'>('packaging');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (text: string, index: number) => {
    sounds.playClick();
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const capacitorCommands = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Reverse Brain" "com.reversebrain.game" --web-dir dist
npm run build
npx cap add android
npx cap sync
npx cap open android`;

  const manifestSnippet = `<activity
    android:name=".MainActivity"
    android:label="@string/app_name"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:screenOrientation="sensorPortrait"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
<uses-permission android:name="android.permission.VIBRATE" />`;

  return (
    <div className="flex flex-col min-h-screen px-4 py-4 max-w-md mx-auto select-none relative z-10 justify-between">
      {/* Top Bar */}
      <div>
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
            ANDROID & PRIVACY
          </h2>

          <div className="w-8" />
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('packaging');
            }}
            className={`py-2 px-3 rounded-xl font-['Orbitron'] text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'packaging'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            ANDROID APK GUIDE
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('privacy');
            }}
            className={`py-2 px-3 rounded-xl font-['Orbitron'] text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            PRIVACY & ADMOB
          </button>
        </div>

        {/* Tab 1: Android Packaging */}
        {activeTab === 'packaging' && (
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="font-['Orbitron'] text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                <Terminal className="w-4 h-4 text-cyan-400" />
                1. BUILD NATIVE ANDROID APK WITH CAPACITOR
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This project is built with mobile-first viewport architecture and pure Web Audio/Three.js. Turn it into a native Google Play APK / AAB in 2 minutes:
              </p>

              <div className="relative mt-2">
                <pre className="p-3 rounded-xl bg-black/80 border border-zinc-800 font-mono text-[11px] text-purple-300 overflow-x-auto select-text">
                  {capacitorCommands}
                </pre>
                <button
                  onClick={() => copyCode(capacitorCommands, 1)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  title="Copy commands"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="font-['Orbitron'] text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                <FileCode className="w-4 h-4 text-purple-400" />
                2. ANDROIDMANIFEST.XML LOCKS (PORTRAIT ORIENTATION)
              </span>
              <div className="relative mt-2">
                <pre className="p-3 rounded-xl bg-black/80 border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto select-text">
                  {manifestSnippet}
                </pre>
                <button
                  onClick={() => copyCode(manifestSnippet, 2)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="font-['Orbitron'] text-xs font-bold text-emerald-300 mb-1 block">
                3. HARDWARE CAPABILITIES
              </span>
              <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                <li>Zero external API dependencies: 100% offline gameplay</li>
                <li>Hardware haptic vibration support via Android vibrator</li>
                <li>Optimized WebGL Three.js point-cloud engine runs smooth at 60 FPS on low-end devices</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Privacy Policy & AdMob Disclosure */}
        {activeTab === 'privacy' && (
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="font-['Orbitron'] text-xs font-bold text-white block mb-1">
                DATA PRIVACY & LOCAL STORAGE
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reverse Brain is built with an offline-first privacy model:
              </p>
              <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside mt-2">
                <li>No personal data or device identifiers are collected or transmitted.</li>
                <li>Player progress (high scores, coin wallet, unlocked themes, streaks) is saved exclusively on your local device storage.</li>
                <li>Progress persists across restarts and can be completely wiped anytime from Settings.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="font-['Orbitron'] text-xs font-bold text-amber-300 block mb-1">
                GOOGLE ADMOB INTEGRATION SPECIFICATION
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                In compliance with Google Play Store advertising policies:
              </p>
              <div className="mt-2 space-y-1.5 text-[11px] font-mono text-zinc-300 bg-black/60 p-2.5 rounded-xl border border-zinc-800">
                <div>Rewarded Test Unit: <span className="text-amber-400">ca-app-pub-3940256099942544/5224354917</span></div>
                <div>Interstitial Test Unit: <span className="text-amber-400">ca-app-pub-3940256099942544/1033173712</span></div>
                <div>Banner Test Unit: <span className="text-amber-400">ca-app-pub-3940256099942544/6300978111</span></div>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                * Note: Coins are virtual in-game cosmetic currency only. No real money, gambling, or paid entry is permitted.
              </p>
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
          className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-['Orbitron'] text-xs font-bold tracking-wider active:scale-95 transition-all"
        >
          RETURN
        </button>
      </div>
    </div>
  );
};
