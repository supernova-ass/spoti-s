'use client';

import React from 'react';
import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  FileText,
  RefreshCw,
  Music,
  CheckCircle2,
} from 'lucide-react';
import { Playlist } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (id: string) => void;
  onOpenCreatePlaylist: () => void;
  likedSongsCount: number;
  offlineLyricsCount: number;
  isSyncing: boolean;
  onTriggerSync: () => void;
  lastSyncedTime: string | null;
  lang: Language;
}

export function Sidebar({
  currentView,
  setCurrentView,
  playlists,
  selectedPlaylistId,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  likedSongsCount,
  offlineLyricsCount,
  isSyncing,
  onTriggerSync,
  lastSyncedTime,
  lang,
}: SidebarProps) {
  const t = translations[lang];

  return (
    <aside className="w-64 bg-black text-neutral-300 flex flex-col h-full select-none border-r border-neutral-900 shrink-0 hidden md:flex">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2.5 text-white">
          <div className="w-9 h-9 rounded-full bg-[#1DB954] flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[#1DB954]/20">
            <Music className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-xl leading-none block text-white">
              Spoti<span className="text-[#1DB954]">S</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              {lang === 'en' ? 'Music Player' : 'Pemutar Musik'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav Links */}
      <nav className="px-3 py-2 space-y-1">
        <button
          onClick={() => {
            setCurrentView('home');
          }}
          className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            currentView === 'home' && !selectedPlaylistId
              ? 'text-white bg-neutral-900'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <Home className={`w-5 h-5 ${currentView === 'home' && !selectedPlaylistId ? 'text-[#1DB954]' : ''}`} />
          <span>{t.home}</span>
        </button>

        <button
          onClick={() => {
            setCurrentView('search');
          }}
          className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            currentView === 'search'
              ? 'text-white bg-neutral-900'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <Search className={`w-5 h-5 ${currentView === 'search' ? 'text-[#1DB954]' : ''}`} />
          <span>{t.search}</span>
        </button>

        <button
          onClick={() => {
            setCurrentView('offline-lyrics');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            currentView === 'offline-lyrics'
              ? 'text-white bg-neutral-900'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <FileText className={`w-5 h-5 ${currentView === 'offline-lyrics' ? 'text-[#1DB954]' : ''}`} />
            <span>{t.offlineLyrics}</span>
          </div>
          {offlineLyricsCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#1DB954]">
              {offlineLyricsCount}
            </span>
          )}
        </button>
      </nav>

      {/* Library Section */}
      <div className="mt-4 flex-1 flex flex-col px-3 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 text-neutral-400 hover:text-white transition-colors">
          <div className="flex items-center gap-3">
            <Library className="w-5 h-5" />
            <span className="text-sm font-bold">{t.yourLibrary}</span>
          </div>
          <button
            onClick={onOpenCreatePlaylist}
            title={t.createPlaylist}
            className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Liked songs quick card */}
        <div className="my-2 px-1">
          <button
            onClick={() => setCurrentView('liked')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
              currentView === 'liked' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-900/50 text-neutral-300'
            }`}
          >
            <div className="w-11 h-11 rounded-md bg-gradient-to-br from-indigo-700 via-purple-600 to-emerald-500 flex items-center justify-center shrink-0 shadow-md">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-sm truncate text-white">{t.likedSongs}</div>
              <div className="text-xs text-neutral-400 truncate">
                {likedSongsCount} {lang === 'en' ? 'songs' : 'lagu'}
              </div>
            </div>
          </button>
        </div>

        {/* Scrollable Playlist List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {playlists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.id && currentView === 'playlist';
            return (
              <button
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                  isSelected ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-900/70 text-neutral-300'
                }`}
              >
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-10 h-10 rounded-md object-cover shrink-0 bg-neutral-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/sound_kane_cover.jpg';
                  }}
                />
                <div className="overflow-hidden flex-1">
                  <div className={`font-semibold text-sm truncate ${isSelected ? 'text-[#1DB954]' : 'text-neutral-200'}`}>
                    {pl.title}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">
                    {pl.isCustom ? (lang === 'en' ? 'Your Playlist' : 'Playlist Anda') : 'Playlist'} · {pl.tracks.length} {lang === 'en' ? 'songs' : 'lagu'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cloud Sync Status Indicator Box */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 font-medium text-neutral-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1DB954]" />
            <span>{t.cloudSync}</span>
          </div>
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            title={t.syncNow}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#1DB954]' : ''}`} />
          </button>
        </div>
        <p className="text-[11px] text-neutral-500 leading-tight">
          {isSyncing ? t.syncing : t.synced}
        </p>
        {lastSyncedTime && !isSyncing && (
          <div suppressHydrationWarning className="text-[10px] text-neutral-600 mt-1 font-mono">
            {new Date(lastSyncedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
      </div>
    </aside>
  );
}
