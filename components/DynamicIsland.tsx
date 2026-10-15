'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Disc3,
  X,
  Volume2,
} from 'lucide-react';
import { Song } from '@/lib/types';

interface DynamicIslandProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function DynamicIsland({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-neutral-800 text-neutral-400 text-xs shadow-md select-none">
        <Disc3 className="w-4 h-4 text-[#1DB954]" />
        <span className="font-semibold text-[11px] text-neutral-300">SpotiS</span>
      </div>
    );
  }

  return (
    <>
      {/* 1. Compact Dynamic Island (Docked on the Left in Header) */}
      <motion.button
        type="button"
        onClick={() => setIsExpanded(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="group relative flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/95 hover:bg-neutral-900 border border-neutral-800 hover:border-[#1DB954]/50 shadow-xl text-left select-none transition-colors"
        title="Buka pemutar Dynamic Island"
      >
        {/* Left end: Rotating Cassette / Vinyl Disc */}
        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0 shadow-inner">
          <motion.img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-full h-full object-cover rounded-full"
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={
              isPlaying
                ? { repeat: Infinity, duration: 4, ease: 'linear' }
                : { duration: 0.3 }
            }
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/sound_kane_cover.jpg';
            }}
          />
          {/* Vinyl center hole and groove shimmer */}
          <div className="absolute inset-0 rounded-full border border-black/30 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black border border-white/40 pointer-events-none" />
        </div>

        {/* Center: Title & Mini status */}
        <div className="max-w-[85px] sm:max-w-[130px] overflow-hidden">
          <span className="block text-[11px] font-bold text-white truncate leading-tight group-hover:text-[#1DB954] transition-colors">
            {currentSong.title}
          </span>
          <span className="block text-[9px] text-neutral-400 truncate leading-tight font-medium">
            {currentSong.artist}
          </span>
        </div>

        {/* Right end: Soundwave Pulse Equalizer */}
        <div className="flex items-end gap-0.5 h-3.5 pl-0.5 shrink-0">
          <span
            className={`w-0.5 rounded-full bg-[#1DB954] transition-all duration-200 ${
              isPlaying ? 'h-3 animate-pulse' : 'h-1.5 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-[#1DB954] transition-all duration-200 ${
              isPlaying ? 'h-3.5 animate-pulse delay-75' : 'h-2 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-[#1DB954] transition-all duration-200 ${
              isPlaying ? 'h-2 animate-pulse delay-150' : 'h-1 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-[#1DB954] transition-all duration-200 ${
              isPlaying ? 'h-3 animate-pulse delay-100' : 'h-1.5 opacity-40'
            }`}
          />
        </div>
      </motion.button>

      {/* 2. Expanded Dynamic Island (Animated Morph to Center of Header) */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-3 sm:pt-4 px-4">
            {/* Click-anywhere backdrop to collapse back to left */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Expanded Center Island Card with rotation & square expansion animation */}
            <motion.div
              initial={{ scale: 0.4, rotate: -12, y: -40, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, y: 0, opacity: 1 }}
              exit={{ scale: 0.4, rotate: -12, y: -40, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 26,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-sm sm:max-w-md bg-neutral-950/95 border border-neutral-700/80 rounded-3xl p-5 shadow-2xl shadow-black/80 backdrop-blur-2xl text-white select-none overflow-hidden"
            >
              {/* Top Row: Rotating Vinyl, Track Info & Close Button */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Cassette / Vinyl Disc with continuous rotation when playing */}
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-900 border-2 border-neutral-700 shrink-0 shadow-xl">
                    <motion.img
                      src={currentSong.coverUrl}
                      alt={currentSong.title}
                      className="w-full h-full object-cover rounded-full"
                      animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                      transition={
                        isPlaying
                          ? { repeat: Infinity, duration: 4, ease: 'linear' }
                          : { duration: 0.3 }
                      }
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/sound_kane_cover.jpg';
                      }}
                    />
                    <div className="absolute inset-0 rounded-full border border-black/40 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-black border border-white/50 pointer-events-none" />
                  </div>

                  {/* Title & Artist */}
                  <div className="overflow-hidden min-w-0 pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1DB954] block">
                      Pemutar Dynamic Island
                    </span>
                    <h3 className="text-base font-bold text-white truncate tracking-tight">
                      {currentSong.title}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate">
                      {currentSong.artist} · {currentSong.album}
                    </p>
                  </div>
                </div>

                {/* Close Button to return to left island */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Middle Row: Progress Bar & Seek */}
              <div className="mb-4">
                <div
                  className="w-full h-2.5 flex items-center group cursor-pointer relative"
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
                <div className="flex justify-between text-[11px] font-mono text-neutral-400 tabular-nums mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Bottom Row: Playback Controls (Resume, Pause, Skip) & Soundwave Pulse */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                {/* Equalizer Pulse Visualizer */}
                <div className="flex items-end gap-1 h-4">
                  <span
                    className={`w-1 rounded-full bg-[#1DB954] transition-all duration-200 ${
                      isPlaying ? 'h-4 animate-pulse' : 'h-1.5 opacity-30'
                    }`}
                  />
                  <span
                    className={`w-1 rounded-full bg-[#1DB954] transition-all duration-200 ${
                      isPlaying ? 'h-3 animate-pulse delay-75' : 'h-2 opacity-30'
                    }`}
                  />
                  <span
                    className={`w-1 rounded-full bg-[#1DB954] transition-all duration-200 ${
                      isPlaying ? 'h-4.5 animate-pulse delay-150' : 'h-1 opacity-30'
                    }`}
                  />
                  <span
                    className={`w-1 rounded-full bg-[#1DB954] transition-all duration-200 ${
                      isPlaying ? 'h-2.5 animate-pulse delay-100' : 'h-1.5 opacity-30'
                    }`}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={onPrevious}
                    className="p-2 text-neutral-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
                    title="Lagu Saméméhna"
                  >
                    <SkipBack className="w-5 h-5 fill-current" />
                  </button>

                  <button
                    type="button"
                    onClick={onPlayPause}
                    className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                    title={isPlaying ? 'Reureuh' : 'Setel'}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-black stroke-black" />
                    ) : (
                      <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onNext}
                    className="p-2 text-neutral-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
                    title="Lagu Saterusna"
                  >
                    <SkipForward className="w-5 h-5 fill-current" />
                  </button>
                </div>

                {/* Click outside hint */}
                <span className="text-[10px] text-neutral-500 font-medium hidden sm:inline">
                  Pencét di mana waé pikeun nutup
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
