'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  X,
  Languages,
  Check,
  Type,
  Music2,
  Sparkles,
} from 'lucide-react';
import { LyricLine, Song } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { formatAsLRC, triggerFileDownload } from '@/lib/lyrics-storage';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  currentTime: number;
  onSeek: (time: number) => void;
  isOfflineLyricDownloaded: boolean;
  onSaveOffline: () => void;
  lang: Language;
}

export function LyricsModal({
  isOpen,
  onClose,
  currentSong,
  currentTime,
  onSeek,
  isOfflineLyricDownloaded,
  onSaveOffline,
  lang,
}: LyricsModalProps) {
  const t = translations[lang];
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Find active line index based on current playback time
  const activeIndex = currentSong?.lyrics
    ? currentSong.lyrics.reduce((acc, line, idx) => {
        if (currentTime >= line.time) return idx;
        return acc;
      }, 0)
    : -1;

  // Auto-scroll to center the active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current && isOpen) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isOpen]);

  if (!isOpen || !currentSong) return null;

  const handleDownloadOffline = () => {
    onSaveOffline();
    // Also trigger .lrc file download to disk
    const lrcContent = formatAsLRC(currentSong);
    const sanitizedTitle = currentSong.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    triggerFileDownload(`${sanitizedTitle}_lirik_sunda.lrc`, lrcContent);
    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 3000);
  };

  const fontSizeClasses = {
    sm: 'text-lg md:text-xl py-2',
    md: 'text-2xl md:text-3xl py-3',
    lg: 'text-3xl md:text-4xl py-4 font-extrabold',
  }[fontSize];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col text-white animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="h-18 px-6 md:px-10 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-900/50">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-11 h-11 rounded-lg object-cover shadow-lg shrink-0 border border-neutral-700/50"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
            }}
          />
          <div className="overflow-hidden">
            <h2 className="text-base font-bold text-white truncate flex items-center gap-2">
              <span>{currentSong.title}</span>
              {isOfflineLyricDownloaded && (
                <span className="text-[11px] font-semibold text-[#1DB954] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {t.lyricsDownloaded}
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-400 truncate">{currentSong.artist} · {currentSong.album}</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Download offline button */}
          <button
            onClick={handleDownloadOffline}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md ${
              isOfflineLyricDownloaded
                ? 'bg-neutral-800 text-[#1DB954] border border-emerald-500/30'
                : 'bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold'
            }`}
            title={t.downloadLyrics}
          >
            {isOfflineLyricDownloaded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.lyricsDownloaded}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.downloadLyrics}</span>
              </>
            )}
          </button>

          {/* Toggle Translation Subtitles */}
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              showTranslation
                ? 'bg-neutral-800 border-neutral-600 text-white'
                : 'bg-transparent border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Tembongkeun / Sumputkeun Tarjamah"
          >
            <Languages className="w-3.5 h-3.5 text-[#1DB954]" />
            <span className="hidden md:inline">
              {showTranslation ? t.hideTranslation : t.showTranslation}
            </span>
          </button>

          {/* Font size picker */}
          <div className="hidden sm:flex items-center bg-neutral-800/80 rounded-full p-1 border border-neutral-700/60">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 text-xs rounded-full font-bold transition-colors ${
                fontSize === 'sm' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-0.5 text-xs rounded-full font-bold transition-colors ${
                fontSize === 'md' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 text-xs rounded-full font-bold transition-colors ${
                fontSize === 'lg' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              A+
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="bg-[#1DB954] text-black text-xs font-bold py-2 px-4 text-center transition-all animate-in slide-in-from-top flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          <span>{t.downloadSuccess} (File .LRC diunduh & kasimpen offline)</span>
        </div>
      )}

      {/* Main Karaoke Lyrics Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 md:px-20 py-16 scroll-smooth select-none text-left max-w-4xl mx-auto w-full custom-scrollbar"
      >
        {currentSong.lyrics && currentSong.lyrics.length > 0 ? (
          currentSong.lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPassed = idx < activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek(line.time)}
                className={`transition-all duration-300 cursor-pointer rounded-xl px-4 my-1.5 ${fontSizeClasses} ${
                  isActive
                    ? 'text-white font-extrabold scale-[1.02] bg-neutral-900/60 shadow-lg border-l-4 border-[#1DB954]'
                    : isPassed
                    ? 'text-neutral-400 font-semibold opacity-70 hover:opacity-100 hover:text-neutral-200'
                    : 'text-neutral-500 font-semibold opacity-40 hover:opacity-80 hover:text-neutral-300'
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className={isActive ? 'text-[#1DB954] font-black' : 'text-transparent'}>
                    •
                  </span>
                  <div>
                    <p className="leading-snug tracking-tight">{line.sunda}</p>
                    {showTranslation && line.arti && (
                      <p
                        className={`text-sm md:text-base font-normal mt-1 tracking-normal ${
                          isActive
                            ? 'text-emerald-300/90'
                            : 'text-neutral-500/80'
                        }`}
                      >
                        {line.arti}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-3">
            <Music2 className="w-12 h-12 text-neutral-600" />
            <p className="text-base font-semibold">Lirik keur lagu ieu can sayagi.</p>
          </div>
        )}
      </div>

      {/* Bottom Footer hint */}
      <div className="h-12 bg-neutral-950/80 border-t border-neutral-900 px-6 flex items-center justify-between text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" />
          <span>Pencét larik lirik mana waé pikeun langsung ngaluncatan pamuter musik</span>
        </span>
        <span className="font-mono">{currentSong.genre || 'Sunda Pop'}</span>
      </div>
    </div>
  );
}
