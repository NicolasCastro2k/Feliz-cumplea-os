import React, { useState } from 'react';
import { AppConfig } from '../types';
import { audioManager } from '../services/synthAudio';
import { Heart, Music, Sparkles, Volume2, VolumeX, Mail, MailOpen, RotateCcw, ArrowRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface Screen8FriendLetterProps {
  config: AppConfig;
  isPlaying: boolean;
  activeTrackId: string | null;
  onNext?: () => void;
  onRestart?: () => void;
}

export const Screen8FriendLetter: React.FC<Screen8FriendLetterProps> = ({
  config,
  isPlaying,
  activeTrackId,
  onNext,
  onRestart,
}) => {
  // Stages: 'prompt' -> 'envelope' -> 'opened' -> 'photo'
  const [stage, setStage] = useState<'prompt' | 'envelope' | 'opened' | 'photo'>('prompt');

  const songId = 'friend-song-special';
  const songTitle = config.friendLetterSongTitle || 'Cancion Especial';
  const songUrl = config.friendLetterSongUrl || 'michel.mp3';
  const isThisSongPlaying = isPlaying && activeTrackId === songId;

  const handlePlaySpecialSong = () => {
    if (isThisSongPlaying) {
      audioManager.togglePlayPause();
    } else {
      audioManager.playTrack(songId, songTitle, songUrl);
    }
  };

  const handleFirstClick = () => {
    setStage('envelope');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fb7185', '#fda4af', '#ffffff'],
    });
  };

  const handleSecondClick = () => {
    setStage('opened');
    confetti({
      particleCount: 90,
      spread: 90,
      origin: { y: 0.45 },
      colors: ['#ec4899', '#f43f5e', '#fbbf24', '#fbcfe8', '#ffffff'],
    });
  };

  const handleShowPhoto = () => {
    setStage('photo');
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f472b6', '#fbcfe8', '#fda4af', '#ffffff'],
    });
  };

  const letterParagraphs = (config.friendLetterText || '')
    .split('\n\n')
    .filter((p) => p.trim().length > 0);

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-gradient-to-b from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8] text-rose-950 flex flex-col items-center justify-between pt-14 pb-20 sm:pb-8 px-3 sm:px-6 select-none overflow-y-auto">
      {/* Decorative Floating Bokeh / Petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-pink-300/30 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute -bottom-10 right-1/4 w-80 h-80 rounded-full bg-pink-400/20 blur-3xl" />
      </div>

      {/* Top Left: Yin and Yang Symbol in the corner */}
      <div
        className="absolute top-14 sm:top-16 left-3 sm:left-6 z-30 flex items-center gap-2"
        title="Yin & Yang - Amistad y Equilibrio"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full shadow-lg border-2 border-rose-300/80 bg-white flex items-center justify-center p-0.5"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Outer Circle */}
            <circle cx="50" cy="50" r="49" fill="#ffffff" stroke="#e11d48" strokeWidth="2" />
            {/* Dark/Rose Half */}
            <path d="M 50,1 A 49,49 0 0,1 50,99 A 24.5,24.5 0 0,1 50,50 A 24.5,24.5 0 0,0 50,1 Z" fill="#e11d48" />
            {/* Upper Small Circle (White) */}
            <circle cx="50" cy="25.5" r="7" fill="#ffffff" />
            {/* Lower Small Circle (Rose) */}
            <circle cx="50" cy="74.5" r="7" fill="#e11d48" />
          </svg>
        </motion.div>
        <div className="hidden xs:flex flex-col">
          <span className="text-[10px] sm:text-xs font-serif-classic font-bold text-rose-900 tracking-wider uppercase">
            Yin & Yang
          </span>
          <span className="text-[9px] text-rose-700/80 font-sans-body leading-tight">
            Amistad eterna
          </span>
        </div>
      </div>

      {/* Main Interactive Stage Container */}
      <div className="relative z-20 flex-1 w-full max-w-2xl flex flex-col items-center justify-center my-auto py-6">
        <AnimatePresence mode="wait">
          {/* STAGE 0: Initial Prompt */}
          {stage === 'prompt' && (
            <motion.div
              key="prompt-stage"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full text-center space-y-6 max-w-lg px-2"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-200/70 border border-rose-300 text-rose-800 text-xs font-serif-classic uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
                <span>Mensaje Especial</span>
              </div>

              {/* User-requested exact phrase */}
              <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-rose-200/90 shadow-xl space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-200 border-2 border-rose-300 mx-auto flex items-center justify-center shadow-inner">
                  <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600 animate-bounce" />
                </div>

                <p className="font-serif-classic text-lg sm:text-2xl text-rose-900 leading-relaxed font-medium">
                  "{config.friendLetterPrompt || 'tienes una carta de tu amiga, a la que le falta una ferreteria entera de tornillos'}"
                </p>

                <p className="text-xs sm:text-sm text-rose-600 font-sans-body italic">
                  (Toca el botón abajo o pulsa aquí para ver la carta)
                </p>
              </div>

              {/* Action Trigger Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFirstClick}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-serif-classic font-semibold text-sm sm:text-base shadow-[0_4px_20px_rgba(244,63,94,0.35)] flex items-center justify-center gap-2.5 mx-auto transition-all"
              >
                <Mail className="w-5 h-5" />
                <span>Ver la Carta</span>
              </motion.button>
            </motion.div>
          )}

          {/* STAGE 1: Envelope Shown in Front (Must click again to open) */}
          {stage === 'envelope' && (
            <motion.div
              key="envelope-stage"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full text-center space-y-6 max-w-md px-2"
            >
              <div className="space-y-1">
                <span className="text-xs font-serif-classic uppercase tracking-widest text-rose-700 font-bold">
                  💌 Carta Sellada
                </span>
                <h3 className="text-xl sm:text-2xl font-serif-classic text-rose-900 font-semibold">
                  Toca la carta para abrirla
                </h3>
              </div>

              {/* Interactive Closed Envelope */}
              <motion.div
                whileHover={{ scale: 1.03, rotate: 0.5 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSecondClick}
                className="relative w-full max-w-sm mx-auto aspect-[4/3] bg-gradient-to-b from-rose-50 to-pink-100 rounded-2xl border-2 border-rose-300 shadow-2xl p-6 flex flex-col items-center justify-between cursor-pointer overflow-hidden group transition-all"
              >
                {/* Envelope Flap Lines */}
                <div className="absolute inset-x-0 top-0 h-1/2 border-b-2 border-rose-200/80 bg-gradient-to-b from-rose-100/70 to-transparent transform origin-top" />
                <div className="absolute top-0 left-0 w-0 h-0 border-l-[140px] sm:border-l-[180px] border-l-transparent border-t-[80px] sm:border-t-[100px] border-t-rose-200/50" />
                <div className="absolute top-0 right-0 w-0 h-0 border-r-[140px] sm:border-r-[180px] border-r-transparent border-t-[80px] sm:border-t-[100px] border-t-rose-200/50" />

                {/* Top header on envelope */}
                <div className="relative z-10 text-[11px] font-serif-classic uppercase tracking-wider text-rose-600/90 font-semibold">
                  Para: Mi Mejor Amiga ♥
                </div>

                {/* Wax Heart Seal in Center */}
                <div className="relative z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 border-2 border-rose-200 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white animate-pulse" />
                  <span className="absolute -bottom-5 text-[10px] font-sans-body uppercase tracking-wider text-rose-700 bg-white/90 px-2 py-0.5 rounded-full shadow-sm font-bold">
                    Abrir
                  </span>
                </div>

                {/* Bottom subtitle */}
                <div className="relative z-10 text-xs font-serif-classic italic text-rose-800">
                  "Un pedacito de mi corazón para ti..."
                </div>
              </motion.div>

              <button
                onClick={handleSecondClick}
                className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-serif-classic font-semibold shadow-md transition-all flex items-center gap-2 mx-auto"
              >
                <MailOpen className="w-4 h-4" />
                <span>Abrir la Carta</span>
              </button>
            </motion.div>
          )}

          {/* STAGE 2: Opened Letter with Full Message */}
          {stage === 'opened' && (
            <motion.div
              key="opened-stage"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-rose-200 shadow-[0_10px_40px_rgba(244,63,94,0.2)] space-y-6 text-rose-950 max-h-[72vh] overflow-y-auto"
            >
              {/* Letter Header */}
              <div className="text-center space-y-2 border-b border-rose-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-200 mx-auto flex items-center justify-center text-rose-600 shadow-sm">
                  <MailOpen className="w-6 h-6" />
                </div>
                <h3 className="font-serif-classic text-xl sm:text-2xl font-bold text-rose-900">
                  Para mi amiga inolvidable
                </h3>
                <p className="text-xs text-rose-600 font-sans-body italic">
                  De tu amiga, a la que le falta una ferretería entera de tornillos 💕
                </p>
              </div>

              {/* Exact Letter Body Content */}
              <div className="space-y-4 font-serif-classic text-sm sm:text-base text-rose-950/90 leading-relaxed text-justify px-1">
                {letterParagraphs.map((paragraph, pIdx) => (
                  <p key={pIdx} className="indent-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Letter Footer Signature */}
              <div className="border-t border-rose-100 pt-4 flex items-center justify-between text-xs sm:text-sm font-serif-classic text-rose-700">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Amistad infinita</span>
                </div>
                <span className="font-bold text-rose-900">Por siempre juntas ♥</span>
              </div>

              {/* Interactive buttons within letter */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handlePlaySpecialSong}
                  className={`px-4 py-2 rounded-full text-xs font-serif-classic font-semibold flex items-center gap-1.5 transition-all ${
                    isThisSongPlaying
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>{isThisSongPlaying ? 'Pausar Canción 🎶' : 'Escuchar Canción 🎵'}</span>
                </button>

                <button
                  onClick={() => setStage('envelope')}
                  className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-serif-classic transition-colors"
                >
                  Volver a doblar
                </button>
              </div>

              {/* Primary CTA to reveal the photo after reading */}
              <div className="pt-1 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShowPhoto}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-serif-classic font-semibold text-sm shadow-[0_4px_20px_rgba(244,63,94,0.35)] flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ver la Foto 📷</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: Photo reveal after reading the letter */}
          {stage === 'photo' && (
            <motion.div
              key="photo-stage"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg text-center space-y-5 px-2"
            >
              <div className="space-y-1">
                <span className="text-xs font-serif-classic uppercase tracking-widest text-rose-700 font-bold">
                  📷 Un Recuerdo Nuestro
                </span>
                <h3 className="text-xl sm:text-2xl font-serif-classic text-rose-900 font-semibold">
                  Para que nunca lo olvides
                </h3>
              </div>

              <div className="relative w-full rounded-3xl overflow-hidden border-4 border-white shadow-[0_10px_40px_rgba(244,63,94,0.25)] bg-white">
                <img
                  src="/carta-foto.jpg"
                  alt="Un recuerdo especial"
                  className="w-full h-auto max-h-[60vh] object-cover"
                  onError={(e) => {
                    // Fallback placeholder if the photo hasn't been added yet
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent && !parent.querySelector('.photo-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className =
                        'photo-fallback w-full aspect-[4/3] flex flex-col items-center justify-center gap-2 text-rose-400 bg-rose-50';
                      fallback.innerHTML =
                        '<span style="font-size:2rem">📷</span><span style="font-size:0.75rem">Coloca tu foto en public/carta-foto.jpg</span>';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>

              <p className="text-xs sm:text-sm text-rose-600 font-sans-body italic">
                "Un pedacito de mi corazón para ti..." 💕
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-20 mt-4 flex flex-wrap items-center justify-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-rose-200 shadow-md">
        {onRestart && (
          <button
            onClick={onRestart}
            className="px-4 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-serif-classic flex items-center gap-1.5 transition-colors"
            title="Volver al inicio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>
        )}

        {onNext && stage === 'photo' && (
          <button
            onClick={onNext}
            className="px-5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-serif-classic font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            title="Siguiente"
          >
            <span>Continuar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
