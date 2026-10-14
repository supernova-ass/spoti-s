'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Heart,
  FileText,
  CloudCheck,
  Disc3,
  Flame,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { Song, Playlist } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { SUNDA_SONGS } from '@/lib/sunda-songs';

interface HomeFeedProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlistId: string) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  likedSongIds: string[];
  onSelectLikedSongs: () => void;
  onOpenOfflineLyrics: () => void;
  lang: Language;
}

export function HomeFeed({
  playlists,
  onSelectPlaylist,
  currentSong,
  isPlaying,
  onPlaySong,
  likedSongIds,
  onSelectLikedSongs,
  onOpenOfflineLyrics,
  lang,
}: HomeFeedProps) {
  const t = translations[lang];

  // Stable greeting for SSR and client initial hydration
  const [greeting, setGreeting] = useState<string>(
    lang === 'su' ? 'Wilujeng Sumping, Baraya!' : 'Selamat Datang!'
  );

  useEffect(() => {
    queueMicrotask(() => {
      const hour = new Date().getHours();
      if (lang === 'su') {
        if (hour < 11) setGreeting('Wilujeng Énjing, Baraya!');
        else if (hour < 15) setGreeting('Wilujeng Siang, Baraya!');
        else if (hour < 18) setGreeting('Wilujeng Sonten, Baraya!');
        else setGreeting('Wilujeng Wengi, Baraya!');
      } else {
        if (hour < 11) setGreeting('Selamat Pagi!');
        else if (hour < 15) setGreeting('Selamat Siang!');
        else if (hour < 18) setGreeting('Selamat Sore!');
        else setGreeting('Selamat Malam!');
      }
    });
  }, [lang]);

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 pb-28 custom-scrollbar">
      {/* Top Hero Banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 suppressHydrationWarning className="text-2xl md:text-3xl font-black text-white tracking-tight mb-5">
          {greeting}
        </h1>

        {/* 6 Quick-Access Cards Grid (Iconic Spotify desktop feature) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {/* Liked Songs Quick Card */}
          <div
            onClick={onSelectLikedSongs}
            className="group flex items-center bg-neutral-800/60 hover:bg-neutral-800 rounded-lg overflow-hidden cursor-pointer transition-all border border-neutral-800 shadow-md relative"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-700 via-purple-600 to-emerald-500 flex items-center justify-center shrink-0">
              <Heart className="w-7 h-7 fill-white text-white" />
            </div>
            <div className="px-3.5 flex-1 min-w-0">
              <span className="font-bold text-sm text-white truncate block">
                {t.likedSongs}
              </span>
              <span className="text-xs text-neutral-400">
                {likedSongIds.length} lagu karesep
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectLikedSongs();
              }}
              className="mr-3 w-10 h-10 rounded-full bg-[#1DB954] text-black opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg hover:scale-105 transition-all"
            >
              <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
            </button>
          </div>

          {/* Offline Lyrics Quick Card */}
          <div
            onClick={onOpenOfflineLyrics}
            className="group flex items-center bg-neutral-800/60 hover:bg-neutral-800 rounded-lg overflow-hidden cursor-pointer transition-all border border-neutral-800 shadow-md relative"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div className="px-3.5 flex-1 min-w-0">
              <span className="font-bold text-sm text-white truncate block">
                {t.offlineLyrics}
              </span>
              <span className="text-xs text-neutral-400">
                Mode Offline & Karaoke
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenOfflineLyrics();
              }}
              className="mr-3 w-10 h-10 rounded-full bg-[#1DB954] text-black opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg hover:scale-105 transition-all"
            >
              <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
            </button>
          </div>

          {/* First 4 Playlists */}
          {playlists.slice(0, 4).map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group flex items-center bg-neutral-800/60 hover:bg-neutral-800 rounded-lg overflow-hidden cursor-pointer transition-all border border-neutral-800 shadow-md relative"
            >
              <img
                src={pl.coverUrl}
                alt={pl.title}
                className="w-16 h-16 object-cover shrink-0 bg-neutral-900"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
                }}
              />
              <div className="px-3.5 flex-1 min-w-0">
                <span className="font-bold text-sm text-white truncate block">
                  {pl.title}
                </span>
                <span className="text-xs text-neutral-400">
                  {pl.tracks.length} lagu
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPlaylist(pl.id);
                }}
                className="mr-3 w-10 h-10 rounded-full bg-[#1DB954] text-black opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Section 1: Featured Tracks */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {t.featuredSundanese}
              </h2>
              <p className="text-xs text-neutral-400">
                Pencét langsung pikeun muter kalayan lirik otomatis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {SUNDA_SONGS.slice(0, 5).map((song) => {
              const isCurrent = currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className="group p-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800/80 shadow-lg relative flex flex-col justify-between"
                >
                  <div className="relative mb-3 aspect-square rounded-lg overflow-hidden bg-neutral-950">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
                      }}
                    />
                    {/* Hover Floating Play Button */}
                    <div
                      className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl transition-all ${
                        isSongPlaying
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                      }`}
                    >
                      {isSongPlaying ? (
                        <Pause className="w-4 h-4 fill-black stroke-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3
                      className={`font-bold text-sm truncate tracking-tight ${
                        isCurrent ? 'text-[#1DB954]' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Playlists */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Daptar Puter Pilihan
              </h2>
              <p className="text-xs text-neutral-400">
                Kumpulan daptar puter anu cocog pikeun sagala suasana.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className="group p-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800/80 shadow-lg relative flex flex-col justify-between"
              >
                <div className="relative mb-3 aspect-square rounded-lg overflow-hidden bg-neutral-950">
                  <img
                    src={pl.coverUrl}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
                    }}
                  />
                  <div className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-[#1DB954] text-black opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 flex items-center justify-center shadow-xl transition-all">
                    <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white truncate tracking-tight">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-snug">
                    {pl.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: More Tracks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Koleksi Tembang Lainna
              </h2>
              <p className="text-xs text-neutral-400">
                Lagu-lagu pilihan pikeun antrian anjeun.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {SUNDA_SONGS.slice(5).map((song) => {
              const isCurrent = currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className="group p-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800/80 shadow-lg relative flex flex-col justify-between"
                >
                  <div className="relative mb-3 aspect-square rounded-lg overflow-hidden bg-neutral-950">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
                      }}
                    />
                    <div
                      className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl transition-all ${
                        isSongPlaying
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                      }`}
                    >
                      {isSongPlaying ? (
                        <Pause className="w-4 h-4 fill-black stroke-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3
                      className={`font-bold text-sm truncate tracking-tight ${
                        isCurrent ? 'text-[#1DB954]' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
