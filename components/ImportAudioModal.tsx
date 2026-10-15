'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
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
        setSuccessMsg(
          lang === 'en'
            ? `Audio file "${selectedFile.name}" activated for ${currentSong?.title}!`
            : `Berkas audio "${selectedFile.name}" berhasil diaktifkan untuk ${currentSong?.title}!`
        );
      } else if (mode === 'url' && urlInput.trim()) {
        onAudioUpdated(selectedSongId, urlInput.trim());
        setSuccessMsg(
          lang === 'en'
            ? `Audio URL activated for ${currentSong?.title}!`
            : `Tautan streaming audio berhasil diaktifkan untuk ${currentSong?.title}!`
        );
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
    setSuccessMsg(lang === 'en' ? 'Reset to default audio.' : 'Dikembalikan ke audio bawaan.');
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
                {lang === 'en' ? 'Import Audio Track (MP3)' : 'Impor Lagu Audio (MP3)'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'en'
                  ? 'Replace track audio with custom MP3 file or streaming link'
                  : 'Ganti lagu dengan rekaman audio MP3 atau tautan streaming'}
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
              {lang === 'en' ? '1. Select Target Track:' : '1. Pilih Lagu yang Ingin Diganti:'}
            </label>
            <select
              value={selectedSongId}
              onChange={(e) => setSelectedSongId(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1DB954]"
            >
              {songs.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title} - {song.artist} ({customAudioIds.includes(song.id) ? '✓ Audio Kustom' : 'Standar'})
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
                <span>{lang === 'en' ? 'Upload MP3 File' : 'Unggah File MP3'}</span>
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
                <span>{lang === 'en' ? 'Direct Audio URL' : 'Tautan URL Audio'}</span>
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
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {lang === 'en' ? 'Click to change' : 'Klik untuk ganti file'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {lang === 'en' ? 'Click or drag an MP3/WAV/FLAC file here' : 'Klik atau seret file audio MP3/WAV/FLAC ke sini'}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      {lang === 'en'
                        ? 'Files are stored locally in the browser (IndexedDB) for offline playback.'
                        : 'File disimpan secara lokal di browser (IndexedDB) dan bisa diputar offline.'}
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
                  placeholder="https://example.com/audio/track.mp3"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1DB954]"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  {lang === 'en' ? 'Direct link to an audio stream or file (.mp3, .m4a).' : 'Tautan langsung ke file atau stream audio (.mp3, .m4a).'}
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
                <span>{lang === 'en' ? 'Reset to Default' : 'Kembalikan ke Bawaan'}</span>
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
                {isSaving
                  ? (lang === 'en' ? 'Saving...' : 'Menyimpan...')
                  : (lang === 'en' ? 'Apply Audio' : 'Terapkan Audio')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
