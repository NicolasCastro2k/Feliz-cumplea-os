import React, { useEffect, useState } from 'react';
import { AppConfig, ScreenId } from './types';
import { loadConfig, saveConfig, resetConfig } from './defaultConfig';
import { audioManager } from './services/synthAudio';

import { Navbar } from './components/Navbar';
import { MiniPlayer } from './components/MiniPlayer';
import { CustomizerModal } from './components/CustomizerModal';

import { Screen1Candles } from './components/Screen1Candles';
import { Screen2Turntable } from './components/Screen2Turntable';
import { Screen3Jellyfish } from './components/Screen3Jellyfish';
import { Screen4Lilies } from './components/Screen4Lilies';
import { Screen5Sunset } from './components/Screen5Sunset';
import { Screen6ChaosOrder } from './components/Screen6ChaosOrder';
import { Screen6Stars } from './components/Screen6Stars';
import { Screen8FriendLetter } from './components/Screen8FriendLetter';
import { Screen7Tesla } from './components/Screen7Tesla';

import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [config, setConfig] = useState<AppConfig>(() => loadConfig());
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('screen1');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);

  // Audio Manager State Subscription
  const [isPlaying, setIsPlaying] = useState<boolean>(audioManager.getIsPlaying());
  const [activeTrackId, setActiveTrackId] = useState<string | null>(audioManager.getActiveTrackId());
  const [trackTitle, setTrackTitle] = useState<string>(audioManager.getTrackTitle());
  const [volume, setVolume] = useState<number>(audioManager.getVolume());

  useEffect(() => {
    const unsubscribe = audioManager.subscribe(() => {
      setIsPlaying(audioManager.getIsPlaying());
      setActiveTrackId(audioManager.getActiveTrackId());
      setTrackTitle(audioManager.getTrackTitle());
      setVolume(audioManager.getVolume());
    });
    return () => unsubscribe();
  }, []);

  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleResetConfig = () => {
    const res = resetConfig();
    setConfig(res);
  };

  const handleNextScreen = () => {
    const screens: ScreenId[] = [
      'screen1',
      'screen2',
      'screen3',
      'screen4',
      'screen5',
      'screenChaos',
      'screen6',
      'screenFriendLetter',
      'screen7',
    ];
    const idx = screens.indexOf(currentScreen);
    if (idx >= 0 && idx < screens.length - 1) {
      setCurrentScreen(screens[idx + 1]);
    }
  };

  return (
    <div className="relative w-screen h-screen h-dvh overflow-hidden bg-black font-sans-body select-none">
      {/* Top Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={(screen) => setCurrentScreen(screen)}
        herName={config.herName}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        isPlaying={isPlaying}
        onToggleMusic={() => audioManager.togglePlayPause()}
        trackTitle={trackTitle}
      />

      {/* Screen Views with Framer Motion transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="w-full h-full"
        >
          {currentScreen === 'screen1' && (
            <Screen1Candles config={config} onNext={handleNextScreen} />
          )}

          {currentScreen === 'screen2' && (
            <Screen2Turntable
              config={config}
              isPlaying={isPlaying}
              activeTrackId={activeTrackId}
              onNext={handleNextScreen}
              onGoToTesla={() => setCurrentScreen('screen7')}
            />
          )}

          {currentScreen === 'screen3' && (
            <Screen3Jellyfish config={config} onNext={handleNextScreen} />
          )}

          {currentScreen === 'screen4' && (
            <Screen4Lilies config={config} onNext={handleNextScreen} />
          )}

          {currentScreen === 'screen5' && (
            <Screen5Sunset config={config} onNext={handleNextScreen} />
          )}

          {currentScreen === 'screenChaos' && (
            <Screen6ChaosOrder config={config} onNext={handleNextScreen} />
          )}

          {currentScreen === 'screen6' && (
            <Screen6Stars
              config={config}
              onRestart={() => setCurrentScreen('screen1')}
              onNext={handleNextScreen}
            />
          )}

          {currentScreen === 'screenFriendLetter' && (
            <Screen8FriendLetter
              config={config}
              isPlaying={isPlaying}
              activeTrackId={activeTrackId}
              onNext={handleNextScreen}
              onRestart={() => setCurrentScreen('screen1')}
            />
          )}

          {currentScreen === 'screen7' && (
            <Screen7Tesla
              config={config}
              isPlaying={isPlaying}
              activeTrackId={activeTrackId}
              onNext={() => setCurrentScreen('screen1')}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Persistent Mini Music Player */}
      {activeTrackId && currentScreen !== 'screen7' && currentScreen !== 'screenFriendLetter' && (
        <MiniPlayer
          isPlaying={isPlaying}
          trackTitle={trackTitle}
          onTogglePlay={() => audioManager.togglePlayPause()}
          volume={volume}
          onVolumeChange={(v) => audioManager.setVolume(v)}
        />
      )}

      {/* Gift Personalization Modal */}
      <CustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        onSave={handleSaveConfig}
        onReset={handleResetConfig}
      />
    </div>
  );
}
