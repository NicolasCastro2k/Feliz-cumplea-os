import React, { useState } from 'react';
import { AppConfig, SongConfig } from '../types';
import { audioManager, extractYouTubeId } from '../services/synthAudio';
import {
  X,
  Heart,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  Music,
  Upload,
  Play,
  Square,
  Youtube,
} from 'lucide-react';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
  onReset: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onReset,
}) => {
  const [formConfig, setFormConfig] = useState<AppConfig>(config);
  const [previewingSongId, setPreviewingSongId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTogglePreview = (songId: string, audioFile: string) => {
    if (previewingSongId === songId) {
      audioManager.stop();
      setPreviewingSongId(null);
    } else {
      if (!audioFile) {
        alert('Por favor selecciona, sube un MP3 o pega un enlace de YouTube.');
        return;
      }
      const song = formConfig.songs.find((s) => s.id === songId);
      audioManager.playTrack(songId, song?.title || 'Vista previa', audioFile);
      setPreviewingSongId(songId);
    }
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
        const updatedSongs = [...formConfig.songs];
        const currentSong = updatedSongs[index];
        updatedSongs[index] = {
          ...currentSong,
          title: currentSong.title === 'Nueva Canción' || !currentSong.title ? cleanTitle : currentSong.title,
          file: result,
          artist: currentSong.artist || 'Canción Personalizada MP3',
        };
        setFormConfig((prev) => ({ ...prev, songs: updatedSongs }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSongChange = (index: number, updatedSong: SongConfig) => {
    const updated = [...formConfig.songs];
    updated[index] = updatedSong;
    setFormConfig((prev) => ({ ...prev, songs: updated }));
  };

  const handleAddSong = () => {
    const newSong: SongConfig = {
      id: `song-${Date.now()}`,
      title: 'Nueva Canción',
      file: 'synth:romantic-piano',
      artist: 'Artista Especial',
    };
    setFormConfig((prev) => ({ ...prev, songs: [...prev.songs, newSong] }));
  };

  const handleRemoveSong = (index: number) => {
    if (formConfig.songs.length <= 1) return;
    const updated = formConfig.songs.filter((_, i) => i !== index);
    setFormConfig((prev) => ({ ...prev, songs: updated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-lg">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(232,168,96,0.15)] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-500/30" />
            <h2 className="font-serif-classic text-xl sm:text-2xl font-semibold text-amber-200">
              Agregar Canciones
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="space-y-4">
                {/* Info banner */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs leading-relaxed space-y-1.5">
                  <p className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <Youtube className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Personaliza tus Canciones y Música</span>
                  </p>
                  <p className="text-amber-200/80">
                    Sube canciones o pega enlaces de YouTube. ⚡ Marca una canción como secreta para la Bobina de Tesla especialmente preparada.
                  </p>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-amber-300/80 font-sans-body uppercase tracking-wider font-semibold">
                    Lista de Canciones ({formConfig.songs.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSong}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs flex items-center gap-1 hover:bg-amber-500/30 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Canción
                  </button>
                </div>

                {formConfig.songs.map((song, sIdx) => {
                  const ytId = extractYouTubeId(song.file);
                  const isCustomMp3 = !song.file.startsWith('synth:');
                  const isPreviewing = previewingSongId === song.id;

                  return (
                    <div
                      key={song.id}
                      className={`p-4 rounded-xl bg-slate-950/70 border flex flex-col gap-3 transition-colors ${
                        song.isSecret
                          ? 'border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-950/20'
                          : 'border-white/10 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="flex-1 flex items-center gap-2">
                          {song.isSecret ? (
                            <span className="p-1.5 rounded-lg bg-amber-500/30 text-amber-300 border border-amber-400/50 shrink-0" title="⚡ Canción Secreta de Tesla">
                              ⚡
                            </span>
                          ) : ytId ? (
                            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0" title="Canción de YouTube">
                              <Youtube className="w-4 h-4" />
                            </span>
                          ) : isCustomMp3 ? (
                            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0" title="Canción MP3 / Audio">
                              <Music className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0" title="Melodía Sintética">
                              <Sparkles className="w-4 h-4" />
                            </span>
                          )}
                          <input
                            type="text"
                            value={song.title}
                            onChange={(e) => handleSongChange(sIdx, { ...song, title: e.target.value })}
                            placeholder="Título de la canción"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-sm text-slate-200 focus:border-amber-400 outline-none font-serif-classic"
                          />
                        </div>
                        <input
                          type="text"
                          value={song.artist || ''}
                          onChange={(e) => handleSongChange(sIdx, { ...song, artist: e.target.value })}
                          placeholder="Artista / Dedicatoria"
                          className="w-full sm:w-44 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 focus:border-amber-400 outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                        <select
                          value={isCustomMp3 ? 'custom' : song.file}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleSongChange(sIdx, {
                              ...song,
                              file: val === 'custom' ? '' : val,
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 outline-none focus:border-amber-400"
                        >
                          <option value="synth:romantic-piano">🎹 Piano Romántico (Synth)</option>
                          <option value="synth:guitar-sunset">🎸 Guitarra de Atardecer (Synth)</option>
                          <option value="synth:ambient-stars">✨ Sinfonía Estelar (Synth)</option>
                          <option value="synth:dream-chords">🌙 Acordes Dulces (Synth)</option>
                          <option value="custom">🔴 Enlace de YouTube / MP3 Personalizado</option>
                        </select>

                        {isCustomMp3 && (
                          <div className="flex-1 flex items-center gap-2 min-w-[220px]">
                            <label className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
                              <Upload className="w-3.5 h-3.5 text-amber-300" />
                              <span>Subir MP3</span>
                              <input
                                type="file"
                                accept="audio/*,audio/mp3"
                                onChange={(e) => handleFileUpload(sIdx, e)}
                                className="hidden"
                              />
                            </label>

                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={song.file.startsWith('data:') ? '✅ Archivo MP3 local cargado' : song.file}
                                onChange={(e) => handleSongChange(sIdx, { ...song, file: e.target.value })}
                                placeholder="Pega link de YouTube o URL MP3"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 focus:border-amber-400 outline-none truncate pr-8"
                              />
                              {ytId && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-400/30 px-1.5 py-0.5 rounded font-mono">
                                  YT
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Secret Song Checkbox */}
                        <label
                          className={`px-2.5 py-1 rounded-lg text-xs font-sans-body border flex items-center gap-1.5 cursor-pointer transition-colors ${
                            song.isSecret
                              ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-semibold'
                              : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200'
                          }`}
                          title="Si está marcada, al reproducirse en el tocadiscos se activará la Bobina de Tesla"
                        >
                          <input
                            type="checkbox"
                            checked={!!song.isSecret}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              // Ensure only one song is marked secret or update this song
                              const updatedSongs = formConfig.songs.map((s, i) => ({
                                ...s,
                                isSecret: i === sIdx ? checked : checked ? false : s.isSecret,
                              }));
                              setFormConfig((prev) => ({ ...prev, songs: updatedSongs }));
                            }}
                            className="accent-amber-400 cursor-pointer"
                          />
                          <span>⚡ Canción Secreta (Tesla)</span>
                        </label>

                        {/* Preview Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePreview(song.id, song.file)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-serif-classic border flex items-center gap-1 transition-all ${
                            isPreviewing
                              ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                              : 'bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-300'
                          }`}
                          title="Probar sonido de la canción"
                        >
                          {isPreviewing ? (
                            <>
                              <Square className="w-3.5 h-3.5 text-rose-300 fill-rose-300" /> Stop
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Escuchar
                            </>
                          )}
                        </button>

                        {/* Remove Song Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSong(sIdx)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors ml-auto"
                          title="Eliminar canción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onReset();
                onClose();
              }}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-serif-classic flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restablecer Canciones
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-serif-classic transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif-classic font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(232,168,96,0.4)] transition-all"
              >
                <Save className="w-3.5 h-3.5" /> Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
