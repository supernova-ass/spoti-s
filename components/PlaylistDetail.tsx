'use client';

import React from 'react';
import {
  Play,
  Pause,
  Shuffle,
  Trash2,
  CheckCircle2,
  Music,
} from 'lucide-react';
import { Playlist, Song } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { TrackTable } from './TrackTable';

interface PlaylistDetailProps {
  playlist: Playlist;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayAll: (playlist: Playlist) => void;
  likedSongIds: string[];
  onToggleLike: (songId: string) => void;
  playlists: Playlist[];
  onAddToPlaylist: (song: Song, playlistId: string) => void;
  offlineDownloadedIds: string[];
  onDownloadLyricsOffline: (song: Song) => void;
  onDeletePlaylist?: (playlistId: string) => void;
  lang: Language;
}

export function PlaylistDetail({
  playlist,
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
  onDeletePlaylist,
  lang,
}: PlaylistDetailProps) {
  const t = translations[lang];

  const totalDurationSec = playlist.tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalDurationSec / 60);

  const isCurrentPlaylistPlaying =
    isPlaying && playlist.tracks.some((t) => t.id === currentSong?.id);

  return (
    <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar">
      {/* Hero Header with Spotify dynamic gradient backdrop */}
      <div className="relative p-6 md:p-8 bg-gradient-to-b from-neutral-800 to-neutral-900 border-b border-neutral-800">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 max-w-6xl mx-auto">
          {/* Cover Artwork */}
          <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl overflow-hidden shadow-2xl shrink-0 bg-neutral-800 border border-neutral-700/50">
            <img
              src={playlist.coverUrl}
              alt={playlist.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
              }}
            />
          </div>

          {/* Metadata */}
          <div className="flex-1 text-center sm:text-left overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Daptar Puter
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mt-1 mb-2 tracking-tight line-clamp-2">
              {playlist.title}
            </h1>
            <p className="text-sm text-neutral-400 line-clamp-2 mb-3 max-w-2xl">
              {playlist.description}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-medium text-neutral-300">
              <span className="font-bold text-white">Spotify Sunda</span>
              <span>·</span>
              <span>{playlist.tracks.length} lagu</span>
              <span>·</span>
              <span>Kinten {totalMinutes} menit</span>
              <span>·</span>
              <span className="text-[#1DB954] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Disinkronkeun ka Awan</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="p-6 md:px-8 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onPlayAll(playlist)}
            disabled={playlist.tracks.length === 0}
            className="w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#1DB954]/20 disabled:opacity-50"
            title={isCurrentPlaylistPlaying ? t.pause : t.play}
          >
            {isCurrentPlaylistPlaying ? (
              <Pause className="w-6 h-6 fill-black stroke-black" />
            ) : (
              <Play className="w-6 h-6 fill-black stroke-black ml-1" />
            )}
          </button>

          {playlist.isCustom && onDeletePlaylist && (
            <button
              onClick={() => onDeletePlaylist(playlist.id)}
              className="p-3 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
              title="Hapus daptar puter"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Track List */}
      <div className="px-6 md:px-8 max-w-6xl mx-auto">
        {playlist.tracks.length > 0 ? (
          <TrackTable
            tracks={playlist.tracks}
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
          <div className="py-16 text-center text-neutral-400">
            <Music className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
            <p className="text-base font-semibold text-white">Daptar puter masih kosong</p>
            <p className="text-xs text-neutral-500 mt-1">
              Pilari lagu dina kaca Palurukan atawa tambihan lagu Sunda asli.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
