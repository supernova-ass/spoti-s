'use client';

import React, { useState } from 'react';
import {
  Globe,
  User,
  RefreshCw,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { Song, UserAccount } from '@/lib/types';
import { DynamicIsland } from './DynamicIsland';

interface TopNavProps {
  currentView: string;
  lang: Language;
  onToggleLang: () => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export function TopNav({
  currentView,
  lang,
  onToggleLang,
  isSyncing,
  onTriggerSync,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  currentUser,
  onLogout,
}: TopNavProps) {
  const t = translations[lang];
  const [showUserMenu, setShowUserMenu] = useState(false);

  const displayAvatar =
    currentUser?.avatar || (currentUser?.role === 'developer' ? '/images/profile-dev.jpeg' : undefined);

  return (
    <header className="sticky top-0 z-30 h-16 bg-neutral-900/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between border-b border-neutral-800/60">
      {/* Left zone: Dynamic Island (Never shifted or broken) */}
      <div className="flex items-center gap-3 shrink-0">
        <DynamicIsland
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrevious={onPrevious}
          onSeek={onSeek}
        />
      </div>

      {/* Right zone: Cloud Sync, Language Switcher (ID / EN), User Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Cloud sync status badge button */}
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors border border-neutral-700/50"
          title={t.cloudBackupDesc}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#1DB954] ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="whitespace-nowrap">{isSyncing ? t.syncing : t.cloudSync}</span>
        </button>

        {/* Language Switcher: ID / EN */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white transition-colors border border-neutral-700/50"
          title={lang === 'en' ? 'Ganti Bahasa: Indonesia' : 'Switch Language: English'}
        >
          <Globe className="w-3.5 h-3.5 text-[#1DB954]" />
          <span className="uppercase text-[11px] font-bold tracking-wider">{lang === 'en' ? 'EN' : 'ID'}</span>
        </button>

        {/* User Profile & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 transition-colors"
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={currentUser?.name || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/profile-dev.jpeg';
                }}
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1DB954] to-emerald-400 text-black flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
            )}
            <span className="text-xs font-bold text-neutral-200 hidden md:inline max-w-[100px] truncate">
              {currentUser?.name || (lang === 'en' ? 'User' : 'Pengguna')}
            </span>
            {currentUser?.role === 'developer' && (
              <span className="hidden sm:inline bg-[#1DB954] text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                DEV
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-neutral-800 mb-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <span>{currentUser?.name || 'Pengguna SpotiS'}</span>
                  {currentUser?.role === 'developer' && (
                    <span className="bg-[#1DB954] text-black text-[9px] font-black px-1.5 py-0.5 rounded">
                      DEV
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-neutral-400 truncate">
                  {currentUser?.email || 'user@spotis.com'}
                </div>
                {currentUser?.birthDate && (
                  <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                    <span>{lang === 'en' ? 'Birthdate:' : 'Kelahiran:'}</span>
                    <span className="font-mono text-neutral-200">{currentUser.birthDate}</span>
                  </div>
                )}
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-950/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Log Out' : 'Keluar dari Akun'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
