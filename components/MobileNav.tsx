'use client';

import React from 'react';
import {
  Home,
  Search,
  Library,
  FileText,
  Play,
  Pause,
  Heart,
  Mic2,
} from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { Song } from '@/lib/types';

interface MobileNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onOpenLyrics: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
  onExpandNowPlaying: () => void;
  lang: Language;
}

export function MobileNav({
  currentView,
  setCurrentView,
  currentSong,
  isPlaying,
  onPlayPause,
  onOpenLyrics,
  isLiked,
  onToggleLike,
  onExpandNowPlaying,
  lang,
}: MobileNavProps) {
  const t = translations[lang];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 select-none">
      {/* Floating Mini Player Widget (shown if song is active) */}
      {currentSong && (
        <div
          onClick={onExpandNowPlaying}
          className="mx-2 mb-2 p-2 rounded-xl bg-neutral-900/95 backdrop-blur-md border border-neutral-800 shadow-2xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-10 h-10 rounded-md object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
              }}
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{currentSong.title}</h4>
              <p className="text-[11px] text-neutral-400 truncate">{currentSong.artist}</p>
            </div>
          </div>

          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onOpenLyrics}
              className="p-2 text-neutral-400 hover:text-[#1DB954]"
              title={t.lyrics}
            >
              <Mic2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleLike}
              className="p-2 text-neutral-400 hover:text-[#1DB954]"
              title="Pikaresep"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#1DB954] text-[#1DB954]' : ''}`} />
            </button>
            <button
              onClick={onPlayPause}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-md ml-1"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black stroke-black" />
              ) : (
                <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="h-14 bg-black/95 backdrop-blur-xl border-t border-neutral-900 grid grid-cols-4 items-center px-2">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'home' ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">{t.home}</span>
        </button>

        <button
          onClick={() => setCurrentView('search')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'search' ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">{t.search}</span>
        </button>

        <button
          onClick={() => setCurrentView('offline-lyrics')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'offline-lyrics' ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Lirik Offline</span>
        </button>

        <button
          onClick={() => setCurrentView('liked')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'liked' ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">{t.yourLibrary}</span>
        </button>
      </nav>
    </div>
  );
}
