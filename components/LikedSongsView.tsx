'use client';

import React from 'react';
import { Play, Pause, Heart, Music } from 'lucide-react';
import { Song, Playlist } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { TrackTable } from './TrackTable';

interface LikedSongsViewProps {
  likedSongs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayAll: () => void;
  likedSongIds: string[];
  onToggleLike: (songId: string) => void;
  playlists: Playlist[];
  onAddToPlaylist: (song: Song, playlistId: string) => void;
  offlineDownloadedIds: string[];
  onDownloadLyricsOffline: (song: Song) => void;
  lang: Language;
}

export function LikedSongsView({
  likedSongs,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayAll,
  likedSongIds,
  onToggleLike,
  playlists,
  onAddToPlaylist,
  offlineDownloadedIds,
  onDownloadLyricsOffline,
  lang,
}: LikedSongsViewProps) {
  const t = translations[lang];

  const totalDuration = likedSongs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const minutes = Math.floor(totalDuration / 60);

  return (
    <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar">
      {/* Hero Header with Heart Gradient */}
      <div className="relative p-6 md:p-8 bg-gradient-to-b from-indigo-900 via-purple-950 to-neutral-900 border-b border-neutral-800">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 max-w-6xl mx-auto">
          <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center shadow-2xl shrink-0">
            <Heart className="w-24 h-24 fill-white text-white shadow-lg" />
          </div>

          <div className="flex-1 text-center sm:text-left overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              {t.yourLibrary}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-1 mb-2 tracking-tight">
              {t.likedSongs}
            </h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-medium text-neutral-300">
              <span className="font-bold text-white">SpotiS</span>
              <span>·</span>
              <span>{likedSongs.length} {lang === 'en' ? 'songs' : 'lagu'}</span>
              <span>·</span>
              <span>{minutes} {lang === 'en' ? 'mins' : 'menit'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Play All Button */}
      <div className="p-6 md:px-8 max-w-6xl mx-auto flex items-center gap-4">
        <button
          onClick={onPlayAll}
          disabled={likedSongs.length === 0}
          className="w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#1DB954]/20 disabled:opacity-50"
          title={t.play}
        >
          {isPlaying && likedSongs.some((s) => s.id === currentSong?.id) ? (
            <Pause className="w-6 h-6 fill-black stroke-black" />
          ) : (
            <Play className="w-6 h-6 fill-black stroke-black ml-1" />
          )}
        </button>
      </div>

      {/* Track List */}
      <div className="px-6 md:px-8 max-w-6xl mx-auto">
        {likedSongs.length > 0 ? (
          <TrackTable
            tracks={likedSongs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={onPlaySong}
            likedSongIds={likedSongIds}
            onToggleLike={onToggleLike}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
            offlineDownloadedIds={offlineDownloadedIds}
            onDownloadLyricsOffline={onDownloadLyricsOffline}
            lang={lang}
          />
        ) : (
          <div className="py-20 text-center text-neutral-400">
            <Music className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
            <p className="text-base font-semibold text-white">
              {lang === 'en' ? 'No liked songs yet' : 'Belum ada lagu yang disukai'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {lang === 'en'
                ? 'Click the heart icon on any track to add it to your collection.'
                : 'Klik ikon hati pada lagu apa pun untuk menambahkannya ke koleksi ini.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
