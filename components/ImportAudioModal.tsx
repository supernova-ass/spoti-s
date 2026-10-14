'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Music,
  Trash2,
  FileAudio,
} from 'lucide-react';
import { Song } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import {
  saveCustomAudioTrack,
  deleteCustomAudioTrack,
} from '@/lib/custom-audio-db';

interface ImportAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  customAudioIds: string[];
  onAudioUpdated: (songId: string, customUrl: string | null) => void;
  lang: Language;
}

export function ImportAudioModal({
  isOpen,
  onClose,
  songs,
  customAudioIds,
  onAudioUpdated,
  lang,
}: ImportAudioModalProps) {
  const t = translations[lang];
  const [selectedSongId, setSelectedSongId] = useState<string>(songs[0]?.id || '');
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentSong = songs.find((s) => s.id === selectedSongId) || songs[0];
  const hasCustomAudio = customAudioIds.includes(selectedSongId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSongId) return;

    setIsSaving(true);
    try {
      if (mode === 'file' && selectedFile) {
        await saveCustomAudioTrack(selectedSongId, selectedFile);
        const objUrl = URL.createObjectURL(selectedFile);
        onAudioUpdated(selectedSongId, objUrl);
        setSuccessMsg(`Berkas MP3 asli "${selectedFile.name}" hasil diaktipkeun pikeun ${currentSong?.title}!`);
      } else if (mode === 'url' && urlInput.trim()) {
        // Direct URL
        onAudioUpdated(selectedSongId, urlInput.trim());
        setSuccessMsg(`Tautan audio full album hasil diaktipkeun pikeun ${currentSong?.title}!`);
      }
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!selectedSongId) return;
    await deleteCustomAudioTrack(selectedSongId);
    onAudioUpdated(selectedSongId, null);
    setSuccessMsg(`Dibalikkeun kana wirahma bawaan.`);
    setTimeout(() => setSuccessMsg(''), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1DB954] text-black flex items-center justify-center">
              <FileAudio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Impor Lagu Asli (MP3 Full Album)
              </h3>
              <p className="text-xs text-neutral-400">
                Gentos lagu kalayan rekaman audio asli atanapi tautan streaming
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="my-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[#1DB954] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Step 1: Select Song Target */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              1. Pilih Lagu Sunda Anu Bade Digentos Ku Lagu Asli:
            </label>
            <select
              value={selectedSongId}
              onChange={(e) => setSelectedSongId(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1DB954]"
            >
              {songs.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title} - {song.artist} ({customAudioIds.includes(song.id) ? '✓ Audio Asli Aktip' : 'Bawaan'})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Tabs: Upload File vs Direct URL */}
          <div>
            <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 mb-3">
              <button
                type="button"
                onClick={() => setMode('file')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'file'
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Berkas MP3 ti HP / PC</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'url'
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Tautan Audio / CDN URL</span>
              </button>
            </div>

            {mode === 'file' ? (
              <div className="p-4 rounded-xl border-2 border-dashed border-neutral-700 hover:border-[#1DB954] transition-colors text-center bg-neutral-950/40 cursor-pointer relative">
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/aac,audio/m4a,audio/flac"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileAudio className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-bold text-[#1DB954] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Klik pikeun ngaganti
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Pencét atawa séréd berkas MP3/WAV/FLAC ka dieu
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Berkas bakal disimpen sacara lokal dina browser (IndexedDB) & tiasa diputer offline.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://conto.com/audio/manuk_dadali_original.mp3"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1DB954]"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Masukkan tautan langsung (.mp3, .m4a, atau stream audio CDN).
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
            {hasCustomAudio ? (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Balikkeun ka Bawaan</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-400 hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isSaving || (mode === 'file' && !selectedFile) || (mode === 'url' && !urlInput.trim())}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1DB954] hover:bg-[#1ed760] text-black disabled:opacity-50 transition-colors shadow-md shadow-[#1DB954]/20"
              >
                {isSaving ? 'Keur Nyimpen...' : 'Larapkeun Lagu Asli'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
