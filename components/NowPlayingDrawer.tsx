'use client';

import React from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Mic2,
  Download,
  FileCheck,
  Volume2,
} from 'lucide-react';
import { Song } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface NowPlayingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
  onOpenLyrics: () => void;
  isOfflineLyricDownloaded: boolean;
  onDownloadLyricsOffline: () => void;
  lang: Language;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function NowPlayingDrawer({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
  isLiked,
  onToggleLike,
  onOpenLyrics,
  isOfflineLyricDownloaded,
  onDownloadLyricsOffline,
  lang,
}: NowPlayingDrawerProps) {
  const t = translations[lang];

  if (!isOpen || !currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-6 flex flex-col justify-between text-white animate-in slide-in-from-bottom duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {t.playingNow}
          </span>
          <p className="text-xs font-semibold text-neutral-200">{currentSong.album}</p>
        </div>
        <div className="w-8" />
      </div>

      {/* Large Album Art & Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800/80 relative group">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
            }}
          />
          {isPlaying && (
            <div className="absolute bottom-3 right-3 flex items-end gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg">
              <span className="w-1 h-4 bg-[#1DB954] animate-pulse rounded-full" />
              <span className="w-1 h-6 bg-[#1DB954] animate-pulse delay-75 rounded-full" />
              <span className="w-1 h-3 bg-[#1DB954] animate-pulse delay-150 rounded-full" />
              <span className="w-1 h-5 bg-[#1DB954] animate-pulse rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Title, Artist, & Quick Actions */}
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="overflow-hidden pr-2">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
              {currentSong.title}
            </h2>
            <p className="text-sm font-medium text-neutral-400 truncate">
              {currentSong.artist}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onDownloadLyricsOffline}
              title={isOfflineLyricDownloaded ? t.lyricsDownloaded : t.downloadLyrics}
              className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              {isOfflineLyricDownloaded ? (
                <FileCheck className="w-5 h-5 text-[#1DB954]" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onToggleLike}
              className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <Heart
                className={`w-6 h-6 ${
                  isLiked ? 'fill-[#1DB954] text-[#1DB954]' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Seekbar */}
        <div className="mb-6">
          <div
            className="w-full h-3 flex items-center group cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onSeek(ratio * duration);
            }}
          >
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs font-mono text-neutral-400 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Playback Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onToggleShuffle}
            className={`p-2 transition-colors ${
              isShuffle ? 'text-[#1DB954]' : 'text-neutral-400'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={onPrevious}
            className="p-2 text-white hover:scale-105 transition-transform"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={onPlayPause}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black stroke-black" />
            ) : (
              <Play className="w-7 h-7 fill-black stroke-black ml-1" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 text-white hover:scale-105 transition-transform"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-2 transition-colors ${
              isRepeat ? 'text-[#1DB954]' : 'text-neutral-400'
            }`}
          >
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Lyrics Pill Button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              onClose();
              onOpenLyrics();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            <Mic2 className="w-4 h-4 text-[#1DB954]" />
            <span>{t.lyrics} & Karaoke Sinkron</span>
          </button>
        </div>
      </div>
    </div>
  );
}
