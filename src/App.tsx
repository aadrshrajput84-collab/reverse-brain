import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameModeId,
  PlayerStats,
  ThemeId,
} from './game/types';
import {
  loadPlayerStats,
  savePlayerStats,
  updateHighScore,
  addCoins,
  unlockTheme,
  equipTheme,
  completeDailyChallenge,
  resetPlayerStats,
} from './utils/storage';
import { THEMES } from './game/themes';
import { sounds } from './utils/audio';
import { SplashView } from './components/SplashView';
import { HomeView } from './components/HomeView';
import { ModeSelectView } from './components/ModeSelectView';
import { TutorialView } from './components/TutorialView';
import { GameplayView } from './components/GameplayView';
import { DailyChallengeView } from './components/DailyChallengeView';
import { ThemeShopView } from './components/ThemeShopView';
import { SettingsView } from './components/SettingsView';
import { PackagingAndPrivacyView } from './components/PackagingAndPrivacyView';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { AdMobTestDialog } from './components/AdMobTestDialog';
import { getTodayDateString } from './game/rules';

type ScreenView =
  | 'splash'
  | 'home'
  | 'modes'
  | 'tutorial'
  | 'gameplay'
  | 'daily'
  | 'shop'
  | 'settings'
  | 'packaging';

interface GameOverState {
  score: number;
  coinsEarned: number;
  accuracy: number;
  maxCombo: number;
  isNewRecord: boolean;
  isDailyVictory?: boolean;
}

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ScreenView>('splash');
  const [activeMode, setActiveMode] = useState<GameModeId>('classic');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameOverData, setGameOverData] = useState<GameOverState | null>(null);
  const [showAdMobDialog, setShowAdMobDialog] = useState<boolean>(false);
  const [gameKey, setGameKey] = useState<number>(0); // bump to force remount on restart

  // Initial startup screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Auto-start query parameter check (?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setActiveMode('classic');
      setCurrentView('gameplay');
    }
  }, []);

  // Sync document.body.dataset.state for ultra-mode verification
  useEffect(() => {
    if (gameOverData) {
      document.body.dataset.state = 'gameover';
    } else if (isPaused) {
      document.body.dataset.state = 'paused';
    } else if (currentView === 'gameplay') {
      document.body.dataset.state = 'playing';
    } else {
      document.body.dataset.state = 'title';
    }
  }, [currentView, isPaused, gameOverData]);

  // Handle ambient BGM
  useEffect(() => {
    if (stats.bgmEnabled && currentView === 'gameplay' && !isPaused) {
      sounds.startAmbientBgm(true);
    } else {
      sounds.stopAmbientBgm();
    }
    return () => {
      sounds.stopAmbientBgm();
    };
  }, [stats.bgmEnabled, currentView, isPaused]);

  // Start Playing Mode
  const launchMode = (mode: GameModeId) => {
    setActiveMode(mode);
    setGameOverData(null);
    setIsPaused(false);
    setGameKey((k) => k + 1);
    setCurrentView('gameplay');
  };

  // Game Over Handler
  const handleGameOver = useCallback(
    (result: {
      score: number;
      coinsEarned: number;
      accuracy: number;
      maxCombo: number;
      isDailyVictory?: boolean;
    }) => {
      let nextStats = stats;
      let isNewRec = false;

      // Update High Score if not daily victory
      if (!result.isDailyVictory) {
        const hsRes = updateHighScore(nextStats, activeMode, result.score);
        nextStats = hsRes.stats;
        isNewRec = hsRes.isNewRecord;
      }

      // Add coins earned
      nextStats = addCoins(nextStats, result.coinsEarned);

      // Total games played and correct counts
      nextStats = {
        ...nextStats,
        gamesPlayed: nextStats.gamesPlayed + 1,
        bestCombo: Math.max(nextStats.bestCombo, result.maxCombo),
      };

      // Daily victory handling
      let dailyCoinsBonus = 0;
      if (result.isDailyVictory) {
        const todayStr = getTodayDateString();
        const dailyRes = completeDailyChallenge(nextStats, todayStr, 100);
        nextStats = dailyRes.stats;
        dailyCoinsBonus = dailyRes.coinsAwarded;
      }

      savePlayerStats(nextStats);
      setStats(nextStats);

      setGameOverData({
        score: result.score,
        coinsEarned: result.coinsEarned + dailyCoinsBonus,
        accuracy: result.accuracy,
        maxCombo: result.maxCombo,
        isNewRecord: isNewRec,
        isDailyVictory: result.isDailyVictory,
      });
    },
    [activeMode, stats]
  );

  // Restart Active Mode
  const handleRestart = () => {
    setIsPaused(false);
    setGameOverData(null);
    setGameKey((k) => k + 1);
  };

  // Theme purchases
  const handleUnlockTheme = (themeId: ThemeId) => {
    const res = unlockTheme(stats, themeId);
    if (res.success) {
      sounds.playLevelUp(stats.soundEnabled);
      setStats(res.stats);
    } else {
      sounds.playWrong(stats.soundEnabled);
    }
  };

  const handleEquipTheme = (themeId: ThemeId) => {
    const next = equipTheme(stats, themeId);
    setStats(next);
  };

  const handleUpdateStats = (partial: Partial<PlayerStats>) => {
    const next = { ...stats, ...partial };
    savePlayerStats(next);
    setStats(next);
  };

  const handleResetData = () => {
    const fresh = resetPlayerStats();
    setStats(fresh);
  };

  const currentThemeConfig = THEMES[stats.equippedTheme] || THEMES.violet;

  return (
    <div className="relative min-h-[100dvh] h-[100dvh] w-full bg-[#05050c] text-white flex items-center justify-center overflow-hidden font-['Space_Grotesk']">
      {/* Futuristic cyber background grid lines & glowing gradient horizon */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,50,220,0.25),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div
        className={`absolute inset-0 bg-gradient-to-b ${currentThemeConfig.bgGlow} opacity-70 pointer-events-none z-0 transition-colors duration-700`}
      />

      {/* Cyber Grid Horizon Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a3a_1px,transparent_1px),linear-gradient(to_bottom,#1f1a3a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0" />

      {/* Visible Startup Loader Screen */}
      {isInitializing ? (
        <div className="relative z-30 flex flex-col items-center justify-center p-6 text-center select-none animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/70 border border-purple-500/50 flex items-center justify-center text-3xl mb-4 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
            🧠
          </div>
          <h2 className="font-['Orbitron'] font-bold text-sm tracking-widest text-cyan-300 uppercase mb-2">
            INITIALIZING NEURAL CORE
          </h2>
          <div className="w-48 h-1.5 rounded-full bg-zinc-900 overflow-hidden border border-purple-500/30">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 animate-[pulse_0.8s_ease-in-out_infinite] w-full" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-wider mt-3">
            REVERSE BRAIN · V1.0.0
          </span>
        </div>
      ) : (
        /* Mobile Chassis Container: Wraps the app in portrait frame or full viewport */
        <div
          className={`relative z-10 w-full min-h-[100dvh] h-[100dvh] flex flex-col transition-all overflow-hidden ${
            stats.mobileFrameMode
              ? 'max-w-md h-[92vh] max-h-[880px] my-auto rounded-[3rem] border-4 border-zinc-800 bg-[#070712] shadow-[0_0_50px_rgba(168,85,247,0.3)]'
              : 'max-w-md mx-auto'
          }`}
        >
        {/* Screen Switcher */}
        {currentView === 'splash' && (
          <SplashView
            themeId={stats.equippedTheme}
            onStart={() => setCurrentView('home')}
            onOpenTutorial={() => setCurrentView('tutorial')}
          />
        )}

        {currentView === 'home' && (
          <HomeView
            stats={stats}
            onPlayMode={(mode) => launchMode(mode)}
            onOpenModes={() => setCurrentView('modes')}
            onOpenDaily={() => setCurrentView('daily')}
            onOpenThemes={() => setCurrentView('shop')}
            onOpenTutorial={() => setCurrentView('tutorial')}
            onOpenSettings={() => setCurrentView('settings')}
            onOpenPackaging={() => setCurrentView('packaging')}
            onToggleSound={() => handleUpdateStats({ soundEnabled: !stats.soundEnabled })}
            onOpenRewardedAdTest={() => setShowAdMobDialog(true)}
          />
        )}

        {currentView === 'modes' && (
          <ModeSelectView
            stats={stats}
            onSelectMode={(mode) => launchMode(mode)}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'tutorial' && (
          <TutorialView onBack={() => setCurrentView('home')} />
        )}

        {currentView === 'gameplay' && (
          <GameplayView
            key={gameKey}
            mode={activeMode}
            stats={stats}
            onGameOver={handleGameOver}
            onPause={() => setIsPaused(true)}
          />
        )}

        {currentView === 'daily' && (
          <DailyChallengeView
            stats={stats}
            onStartDaily={() => launchMode('daily')}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'shop' && (
          <ThemeShopView
            stats={stats}
            onEquipTheme={handleEquipTheme}
            onUnlockTheme={handleUnlockTheme}
            onBack={() => setCurrentView('home')}
            onOpenRewardedAdTest={() => setShowAdMobDialog(true)}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onResetData={handleResetData}
            onBack={() => setCurrentView('home')}
            onOpenPackaging={() => setCurrentView('packaging')}
          />
        )}

        {currentView === 'packaging' && (
          <PackagingAndPrivacyView onBack={() => setCurrentView('home')} />
        )}

        {/* Pause Modal Overlay */}
        {isPaused && (
          <PauseModal
            stats={stats}
            onResume={() => setIsPaused(false)}
            onRestart={handleRestart}
            onHome={() => {
              setIsPaused(false);
              setCurrentView('home');
            }}
            onToggleSound={() => handleUpdateStats({ soundEnabled: !stats.soundEnabled })}
            onToggleBgm={() => handleUpdateStats({ bgmEnabled: !stats.bgmEnabled })}
            onToggleVibration={() => handleUpdateStats({ vibrationEnabled: !stats.vibrationEnabled })}
          />
        )}

        {/* Game Over Modal Overlay */}
        {gameOverData && (
          <GameOverModal
            mode={activeMode}
            stats={stats}
            score={gameOverData.score}
            coinsEarned={gameOverData.coinsEarned}
            accuracy={gameOverData.accuracy}
            maxCombo={gameOverData.maxCombo}
            isNewRecord={gameOverData.isNewRecord}
            isDailyVictory={gameOverData.isDailyVictory}
            onPlayAgain={handleRestart}
            onSelectMode={() => {
              setGameOverData(null);
              setCurrentView('modes');
            }}
            onHome={() => {
              setGameOverData(null);
              setCurrentView('home');
            }}
            onWatchRewardAd={() => setShowAdMobDialog(true)}
          />
        )}

        {/* AdMob Test Rewarded Video Dialog */}
        {showAdMobDialog && (
          <AdMobTestDialog
            onComplete={() => {
              const updated = addCoins(stats, 50);
              setStats(updated);
              setShowAdMobDialog(false);
            }}
            onClose={() => setShowAdMobDialog(false)}
          />
        )}
      </div>
      )}
    </div>
  );
}
