'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Heart,
  FileText,
  Flame,
  Sparkles,
  Music2,
  Disc3,
} from 'lucide-react';
import { Song, Playlist } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { SOUND_KANE_SONGS, ALL_SONGS } from '@/lib/sunda-songs';

interface HomeFeedProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlistId: string) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue?: Song[]) => void;
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
    lang === 'en' ? 'Welcome to SpotiS!' : 'Selamat Datang di SpotiS!'
  );

  useEffect(() => {
    queueMicrotask(() => {
      const hour = new Date().getHours();
      if (lang === 'en') {
        if (hour < 12) setGreeting('Good Morning!');
        else if (hour < 18) setGreeting('Good Afternoon!');
        else setGreeting('Good Evening!');
      } else {
        if (hour < 11) setGreeting('Selamat Pagi!');
        else if (hour < 15) setGreeting('Selamat Siang!');
        else if (hour < 18) setGreeting('Selamat Sore!');
        else setGreeting('Selamat Malam!');
      }
    });
  }, [lang]);

  const soundKanePlaylist = playlists.find((p) => p.id === 'playlist-sound-kane');

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 pb-28 custom-scrollbar">
      <div className="max-w-6xl mx-auto mb-8">
        {/* Top Greeting */}
        <div className="flex items-center justify-between mb-5">
          <h1 suppressHydrationWarning className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {greeting}
          </h1>
        </div>

        {/* 6 Quick-Access Cards Grid */}
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
                {likedSongIds.length} {lang === 'en' ? 'favorite songs' : 'lagu favorit'}
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

          {/* Sound Kane Quick Card */}
          <div
            onClick={() => onSelectPlaylist('playlist-sound-kane')}
            className="group flex items-center bg-neutral-800/60 hover:bg-neutral-800 rounded-lg overflow-hidden cursor-pointer transition-all border border-emerald-500/30 shadow-md relative"
          >
            <img
              src="/images/sound_kane_cover.jpg"
              alt="Kumpulan Sound Kane"
              className="w-16 h-16 object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
              }}
            />
            <div className="px-3.5 flex-1 min-w-0">
              <span className="font-bold text-sm text-white truncate block flex items-center gap-1.5">
                <span>Kumpulan Sound Kane</span>
                <span className="text-[10px] bg-[#1DB954] text-black font-extrabold px-1.5 py-0.2 rounded">FZEDIT</span>
              </span>
              <span className="text-xs text-[#1DB954]">
                11 {lang === 'en' ? 'tracks by FZEDIT' : 'sound kane karya FZEDIT'}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (SOUND_KANE_SONGS.length > 0) {
                  onPlaySong(SOUND_KANE_SONGS[0]);
                }
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
                {lang === 'en' ? 'Offline Mode & Lyrics' : 'Mode Offline & Lirik'}
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

          {/* Playlists */}
          {playlists.slice(1, 4).map((pl) => (
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
                  (e.target as HTMLImageElement).src = '/images/sound_kane_cover.jpg';
                }}
              />
              <div className="px-3.5 flex-1 min-w-0">
                <span className="font-bold text-sm text-white truncate block">
                  {pl.title}
                </span>
                <span className="text-xs text-neutral-400">
                  {pl.tracks.length} {lang === 'en' ? 'tracks' : 'lagu'}
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

        {/* ============================================================== */}
        {/* KATEGORI KOTAK: KUMPULAN SOUND KANE (ARTIS: FZEDIT)            */}
        {/* ============================================================== */}
        <section className="mb-12 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-emerald-950/40 border border-emerald-500/30 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          {/* Neon ambient glow in background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#1DB954]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Kotak Sound Kane */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1DB954] to-emerald-400 text-black flex items-center justify-center font-black shadow-lg shadow-[#1DB954]/25 shrink-0">
                <Flame className="w-7 h-7 fill-black stroke-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-[#1DB954] text-black px-2 py-0.5 rounded-full">
                    Kategori Kotak
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Artis: <strong className="text-white">FZEDIT</strong>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  Kumpulan Sound Kane
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (SOUND_KANE_SONGS.length > 0) {
                    onPlaySong(SOUND_KANE_SONGS[0], SOUND_KANE_SONGS.slice(1));
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#1DB954]/30"
              >
                <Play className="w-4 h-4 fill-black stroke-black" />
                <span>{lang === 'en' ? 'Play All 11 Sounds' : 'Putar Semua 11 Sound'}</span>
              </button>
              <button
                onClick={() => onSelectPlaylist('playlist-sound-kane')}
                className="px-4 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-750 text-white font-semibold text-xs transition-colors border border-neutral-700/60"
              >
                {lang === 'en' ? 'View Album' : 'Buka Playlist'}
              </button>
            </div>
          </div>

          {/* Sound Kane Tracks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 relative z-10">
            {SOUND_KANE_SONGS.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={song.id}
                  onClick={() => {
                    const remaining = SOUND_KANE_SONGS.slice(idx + 1);
                    onPlaySong(song, remaining);
                  }}
                  className={`group p-3 rounded-2xl transition-all cursor-pointer border relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-neutral-800/90 border-[#1DB954] shadow-lg shadow-[#1DB954]/20'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                  }`}
                >
                  <div className="relative mb-2.5 aspect-square rounded-xl overflow-hidden bg-neutral-950">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/sound_kane_cover.jpg';
                      }}
                    />

                    {/* Track Index Badge */}
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center justify-center">
                      {idx + 1}
                    </div>

                    {/* Floating Play Button */}
                    <div
                      className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl transition-all ${
                        isSongPlaying
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                      }`}
                    >
                      {isSongPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-black stroke-black" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-black stroke-black ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3
                      className={`font-bold text-xs truncate tracking-tight ${
                        isCurrent ? 'text-[#1DB954]' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-0.5">
                      <span className="font-semibold text-emerald-400 truncate">FZEDIT</span>
                      <span className="font-mono text-[10px] text-neutral-500">{song.duration}s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 1: Lagu Pilihan Populer */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {t.featuredSundanese}
              </h2>
              <p className="text-xs text-neutral-400">
                {lang === 'en'
                  ? 'Click any track to listen instantly with synchronized lyrics.'
                  : 'Klik lagu mana saja untuk memutar langsung dengan lirik otomatis.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ALL_SONGS.slice(0, 5).map((song) => {
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
                        (e.target as HTMLImageElement).src = '/images/sound_kane_cover.jpg';
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

        {/* Section 2: Playlist Pilihan */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {lang === 'en' ? 'Featured Playlists' : 'Playlist Pilihan'}
              </h2>
              <p className="text-xs text-neutral-400">
                {lang === 'en'
                  ? 'Handpicked music collections curated for every mood.'
                  : 'Koleksi playlist pilihan untuk menemani setiap aktivitas Anda.'}
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
                      (e.target as HTMLImageElement).src = '/images/sound_kane_cover.jpg';
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
                {lang === 'en' ? 'More Tracks' : 'Koleksi Lagu Lainnya'}
              </h2>
              <p className="text-xs text-neutral-400">
                {lang === 'en' ? 'Explore more music in our catalog.' : 'Jelajahi lagu-lagu menarik lainnya.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ALL_SONGS.slice(5, 15).map((song) => {
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
                        (e.target as HTMLImageElement).src = '/images/sound_kane_cover.jpg';
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
