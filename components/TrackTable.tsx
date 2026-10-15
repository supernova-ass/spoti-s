'use client';

import React from 'react';
import {
  Play,
  Pause,
  Heart,
  Clock,
  Plus,
  Download,
  FileCheck,
  Music,
} from 'lucide-react';
import { Song, Playlist } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface TrackTableProps {
  tracks: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  likedSongIds: string[];
  onToggleLike: (songId: string) => void;
  playlists: Playlist[];
  onAddToPlaylist: (song: Song, playlistId: string) => void;
  offlineDownloadedIds: string[];
  onDownloadLyricsOffline: (song: Song) => void;
  lang: Language;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function TrackTable({
  tracks,
  currentSong,
  isPlaying,
  onPlaySong,
  likedSongIds,
  onToggleLike,
  playlists,
  onAddToPlaylist,
  offlineDownloadedIds,
  onDownloadLyricsOffline,
  lang,
}: TrackTableProps) {
  const t = translations[lang];

  return (
    <div className="w-full text-left text-neutral-400 select-none">
      {/* Table Header */}
      <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        <div className="text-center">#</div>
        <div>{t.titleCol}</div>
        <div className="hidden sm:block">{t.albumCol}</div>
        <div className="flex items-center justify-end pr-2">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-transparent mt-1">
        {tracks.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;
          const isRowPlaying = isCurrent && isPlaying;
          const isLiked = likedSongIds.includes(song.id);
          const isOfflineSaved = offlineDownloadedIds.includes(song.id);

          return (
            <div
              key={`${song.id}-${index}`}
              className={`grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2.5 rounded-lg items-center group transition-colors hover:bg-neutral-800/60 ${
                isCurrent ? 'bg-neutral-800/40 text-white' : 'text-neutral-300'
              }`}
            >
              {/* Col 1: Index or Play/Pause Button */}
              <div className="flex items-center justify-center text-sm font-mono text-neutral-500">
                <span className="group-hover:hidden group-focus:hidden">
                  {isRowPlaying ? (
                    <div className="w-3.5 h-3.5 flex items-end gap-0.5 justify-center">
                      <span className="w-0.5 h-full bg-[#1DB954] animate-pulse" />
                      <span className="w-0.5 h-2/3 bg-[#1DB954] animate-pulse" />
                      <span className="w-0.5 h-4/5 bg-[#1DB954] animate-pulse" />
                    </div>
                  ) : (
                    index + 1
                  )}
                </span>
                <button
                  onClick={() => onPlaySong(song)}
                  className="hidden group-hover:flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  {isRowPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                </button>
              </div>

              {/* Col 2: Title, Artist, Thumbnail */}
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-10 h-10 rounded-md object-cover shrink-0 bg-neutral-900 border border-neutral-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/sound_kane_cover.jpg';
                  }}
                />
                <div className="overflow-hidden">
                  <div
                    onClick={() => onPlaySong(song)}
                    className={`font-semibold text-sm truncate cursor-pointer hover:underline ${
                      isCurrent ? 'text-[#1DB954]' : 'text-white'
                    }`}
                  >
                    {song.title}
                  </div>
                  <div className="text-xs text-neutral-400 truncate flex items-center gap-2">
                    <span>{song.artist}</span>
                    {song.genre && (
                      <span className="text-[10px] text-neutral-500 hidden md:inline">
                        · {song.genre}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Col 3: Album */}
              <div className="hidden sm:block text-xs text-neutral-400 truncate">
                {song.album}
              </div>

              {/* Col 4: Actions & Duration */}
              <div className="flex items-center justify-end gap-2 text-xs">
                {/* Download Lyrics for offline button */}
                <button
                  onClick={() => onDownloadLyricsOffline(song)}
                  title={
                    isOfflineSaved
                      ? t.lyricsDownloaded
                      : t.downloadLyrics
                  }
                  className={`p-1.5 rounded-full transition-opacity ${
                    isOfflineSaved
                      ? 'text-[#1DB954] opacity-100'
                      : 'text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-white'
                  }`}
                >
                  {isOfflineSaved ? (
                    <FileCheck className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>

                {/* Like Button */}
                <button
                  onClick={() => onToggleLike(song.id)}
                  title={isLiked ? (lang === 'en' ? 'Unlike' : 'Hapus dari disukai') : (lang === 'en' ? 'Like' : 'Sukai')}
                  className={`p-1.5 rounded-full transition-opacity ${
                    isLiked
                      ? 'text-[#1DB954] opacity-100'
                      : 'text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-white'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked ? 'fill-[#1DB954]' : ''}`}
                  />
                </button>

                {/* Add to Playlist button (with simple quick menu) */}
                {playlists.length > 0 && (
                  <div className="relative group/menu opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700/50"
                      title={t.addToPlaylist}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {/* Hover dropdown for playlists */}
                    <div className="hidden group-hover/menu:block absolute right-0 bottom-full mb-1 w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl py-1 z-30">
                      <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                        {t.addToPlaylist}
                      </div>
                      <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={() => onAddToPlaylist(song, pl.id)}
                            className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 truncate"
                          >
                            + {pl.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <span className="w-10 text-right font-mono text-neutral-400 tabular-nums">
                  {formatDuration(song.duration)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
