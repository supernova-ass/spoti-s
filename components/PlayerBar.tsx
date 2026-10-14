'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  Mic2,
  ListMusic,
  Maximize2,
  Download,
  FileCheck,
} from 'lucide-react';
import { Song } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface PlayerBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
  isLyricsOpen: boolean;
  onToggleLyrics: () => void;
  isQueueOpen: boolean;
  onToggleQueue: () => void;
  isOfflineLyricDownloaded: boolean;
  onDownloadLyricsOffline: () => void;
  onExpandNowPlaying?: () => void;
  lang: Language;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function PlayerBar({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  volume,
  onVolumeChange,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
  isLiked,
  onToggleLike,
  isLyricsOpen,
  onToggleLyrics,
  isQueueOpen,
  onToggleQueue,
  isOfflineLyricDownloaded,
  onDownloadLyricsOffline,
  onExpandNowPlaying,
  lang,
}: PlayerBarProps) {
  const t = translations[lang];

  if (!currentSong) {
    return (
      <footer className="h-20 bg-neutral-950 border-t border-neutral-900 px-4 flex items-center justify-between text-neutral-500 text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-neutral-900" />
          <span>Pilih lagu Sunda atawa palurukan online pikeun ngamimitian musik...</span>
        </div>
      </footer>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="h-22 bg-black border-t border-neutral-900 px-4 md:px-6 flex items-center justify-between z-40 select-none text-white relative">
      {/* Left zone: Current Track Info */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[180px] max-w-[300px]">
        <div
          onClick={onExpandNowPlaying}
          className="relative group cursor-pointer shrink-0"
          title="Tembongkeun albeum"
        >
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-14 h-14 rounded-md object-cover shadow-md bg-neutral-900 group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
            }}
          />
        </div>
        <div className="overflow-hidden min-w-0 pr-1">
          <div
            onClick={onExpandNowPlaying}
            className="font-bold text-sm text-white truncate hover:underline cursor-pointer tracking-tight"
          >
            {currentSong.title}
          </div>
          <div className="text-xs text-neutral-400 truncate hover:text-white cursor-pointer transition-colors">
            {currentSong.artist}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleLike}
            title={isLiked ? 'Hapus ti lagu dipikaresep' : 'Pikaresep lagu'}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? 'fill-[#1DB954] text-[#1DB954]' : 'hover:scale-110 transition-transform'
              }`}
            />
          </button>

          {/* Quick lyric offline badge / download trigger */}
          <button
            onClick={onDownloadLyricsOffline}
            title={
              isOfflineLyricDownloaded
                ? t.lyricsDownloaded
                : t.downloadLyrics
            }
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            {isOfflineLyricDownloaded ? (
              <FileCheck className="w-4 h-4 text-[#1DB954]" />
            ) : (
              <Download className="w-4 h-4 hover:text-[#1DB954] transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Center zone: Controls & Seekbar */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-2">
        {/* Buttons */}
        <div className="flex items-center gap-4 sm:gap-6 mb-1.5">
          <button
            onClick={onToggleShuffle}
            title={t.shuffle}
            className={`p-1.5 rounded-full hover:text-white transition-colors relative ${
              isShuffle ? 'text-[#1DB954]' : 'text-neutral-400'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span className="w-1 h-1 rounded-full bg-[#1DB954] absolute bottom-0 left-1/2 -translate-x-1/2" />
            )}
          </button>

          <button
            onClick={onPrevious}
            title={t.previous}
            className="p-1 rounded-full text-neutral-300 hover:text-white transition-colors hover:scale-105"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onPlayPause}
            title={isPlaying ? t.pause : t.play}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black stroke-black" />
            ) : (
              <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            title={t.next}
            className="p-1 rounded-full text-neutral-300 hover:text-white transition-colors hover:scale-105"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onToggleRepeat}
            title={t.repeat}
            className={`p-1.5 rounded-full hover:text-white transition-colors relative ${
              isRepeat ? 'text-[#1DB954]' : 'text-neutral-400'
            }`}
          >
            <Repeat className="w-4 h-4" />
            {isRepeat && (
              <span className="w-1 h-1 rounded-full bg-[#1DB954] absolute bottom-0 left-1/2 -translate-x-1/2" />
            )}
          </button>
        </div>

        {/* Progress scrub bar */}
        <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-neutral-400">
          <span className="w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div
            className="flex-1 h-2 relative flex items-center group cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onSeek(ratio * duration);
            }}
          >
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
              <div
                className="h-full bg-white group-hover:bg-[#1DB954] transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div
              className="w-3 h-3 rounded-full bg-white absolute opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1.5 shadow"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
          <span className="w-8 text-left tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right zone: Lyrics, Queue, Volume, Fullscreen */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        {/* Real-time Lyrics button */}
        <button
          onClick={onToggleLyrics}
          title={t.lyrics}
          className={`p-2 rounded-full transition-colors relative ${
            isLyricsOpen ? 'text-[#1DB954] bg-neutral-800' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Mic2 className="w-4 h-4" />
          {isLyricsOpen && (
            <span className="w-1 h-1 rounded-full bg-[#1DB954] absolute bottom-1 left-1/2 -translate-x-1/2" />
          )}
        </button>

        {/* Queue button */}
        <button
          onClick={onToggleQueue}
          title={t.queue}
          className={`p-2 rounded-full transition-colors ${
            isQueueOpen ? 'text-[#1DB954] bg-neutral-800' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume slider & mute */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
            className="text-neutral-400 hover:text-white p-1"
            title={volume === 0 ? t.unmute : t.mute}
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div
            className="w-20 h-2 flex items-center group cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onVolumeChange(ratio);
            }}
          >
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
              <div
                className="h-full bg-white group-hover:bg-[#1DB954] transition-colors"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
            <div
              className="w-2.5 h-2.5 rounded-full bg-white absolute opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 shadow"
              style={{ left: `${volume * 100}%` }}
            />
          </div>
        </div>

        {/* Expand / Maximize button */}
        {onExpandNowPlaying && (
          <button
            onClick={onExpandNowPlaying}
            title={t.nowPlayingSheet}
            className="p-2 rounded-full text-neutral-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </footer>
  );
}
