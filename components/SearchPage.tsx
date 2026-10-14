'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Play,
  Pause,
  Music,
  Loader2,
} from 'lucide-react';
import { Song, Playlist } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { TrackTable } from './TrackTable';

interface SearchPageProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  likedSongIds: string[];
  onToggleLike: (songId: string) => void;
  playlists: Playlist[];
  onAddToPlaylist: (song: Song, playlistId: string) => void;
  offlineDownloadedIds: string[];
  onDownloadLyricsOffline: (song: Song) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lang: Language;
}

const GENRE_TAGS = [
  'Pop',
  'DJ Remix',
  'Hip-Hop',
  'Rock',
  'EDM',
  'R&B',
  'K-Pop',
  'Akustik',
  'Dangdut',
  'Lo-Fi',
];

const BROWSE_CATEGORIES = [
  { name: 'Pop Hits', color: 'from-blue-700 to-indigo-950', query: 'Pop' },
  { name: 'DJ & Remix', color: 'from-fuchsia-700 to-purple-950', query: 'DJ' },
  { name: 'Hip-Hop & Rap', color: 'from-amber-700 to-orange-950', query: 'Hip Hop' },
  { name: 'Rock & Metal', color: 'from-red-700 to-rose-950', query: 'Rock' },
  { name: 'EDM & Dance', color: 'from-cyan-700 to-blue-950', query: 'EDM' },
  { name: 'Lo-Fi & Chill', color: 'from-teal-700 to-cyan-950', query: 'Lo-Fi' },
];

export function SearchPage({
  currentSong,
  isPlaying,
  onPlaySong,
  likedSongIds,
  onToggleLike,
  playlists,
  onAddToPlaylist,
  offlineDownloadedIds,
  onDownloadLyricsOffline,
  searchQuery,
  onSearchChange,
  lang,
}: SearchPageProps) {
  const t = translations[lang];
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const topResult = results.length > 0 ? results[0] : null;

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 pb-28 custom-scrollbar">
      {/* Top Banner & Search Field */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="relative mb-4">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-neutral-800 text-white placeholder-neutral-400 text-base rounded-full pl-12 pr-10 py-3.5 border border-neutral-700 focus:border-[#1DB954] focus:outline-none transition-colors shadow-lg"
          />
          {loading && (
            <Loader2 className="w-5 h-5 text-[#1DB954] absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
          )}
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-neutral-400 font-semibold shrink-0">Populer:</span>
          {GENRE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                searchQuery === tag
                  ? 'bg-[#1DB954] text-black font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results or Browse Categories */}
      <div className="max-w-6xl mx-auto">
        {searchQuery.trim() ? (
          <div>
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
                <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin mb-3" />
                <p className="text-sm text-neutral-300 font-medium">Loading...</p>
              </div>
            ) : results.length > 0 ? (
              <div>
                {/* Top Result Card (Ala Spotify Desktop Search) */}
                {topResult && (
                  <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-bold text-white mb-3">Hasil Pangpayuna</h3>
                      <div className="p-5 rounded-2xl bg-neutral-900 hover:bg-neutral-800/80 transition-colors group relative border border-neutral-800 shadow-xl">
                        <img
                          src={topResult.coverUrl}
                          alt={topResult.title}
                          className="w-24 h-24 rounded-lg object-cover shadow-lg mb-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
                          }}
                        />
                        <h4 className="text-xl font-bold text-white tracking-tight truncate">
                          {topResult.title}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1 mb-3">
                          {topResult.artist} · Lagu
                        </p>
                        <button
                          onClick={() => onPlaySong(topResult)}
                          className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg shadow-[#1DB954]/30 hover:scale-105 active:scale-95 transition-all"
                          title={currentSong?.id === topResult.id && isPlaying ? t.pause : t.play}
                        >
                          {currentSong?.id === topResult.id && isPlaying ? (
                            <Pause className="w-5 h-5 fill-black stroke-black" />
                          ) : (
                            <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-white mb-3">Tembang Anu Kapendak</h3>
                      <div className="space-y-1">
                        {results.slice(0, 4).map((s) => {
                          const isCurrent = currentSong?.id === s.id;
                          return (
                            <div
                              key={s.id}
                              className={`flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800/60 group transition-colors ${
                                isCurrent ? 'bg-neutral-800/50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3 overflow-hidden flex-1">
                                <img
                                  src={s.coverUrl}
                                  alt={s.title}
                                  className="w-10 h-10 rounded object-cover shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
                                  }}
                                />
                                <div className="overflow-hidden">
                                  <div
                                    onClick={() => onPlaySong(s)}
                                    className={`font-semibold text-sm truncate cursor-pointer hover:underline ${
                                      isCurrent ? 'text-[#1DB954]' : 'text-white'
                                    }`}
                                  >
                                    {s.title}
                                  </div>
                                  <div className="text-xs text-neutral-400 truncate">
                                    {s.artist}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onPlaySong(s)}
                                  className="p-2 rounded-full bg-neutral-800 hover:bg-[#1DB954] hover:text-black text-white transition-colors"
                                >
                                  {isCurrent && isPlaying ? (
                                    <Pause className="w-4 h-4 fill-current" />
                                  ) : (
                                    <Play className="w-4 h-4 fill-current" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Full table of search results */}
                <h3 className="text-lg font-bold text-white mb-3">{t.onlineSearchResults}</h3>
                <TrackTable
                  tracks={results}
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
              </div>
            ) : (
              <div className="py-20 text-center text-neutral-400">
                <Music className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
                <p className="text-base font-semibold text-white">{t.noResults} pikeun &quot;{searchQuery}&quot;</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Cobi nganggo kecap konci sanés sapertos judul lagu atawa nami artis.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Jelajah Sadaya Kategori Musik</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {BROWSE_CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => onSearchChange(cat.query)}
                  className={`h-36 rounded-2xl p-4 bg-gradient-to-br ${cat.color} cursor-pointer hover:scale-[1.03] transition-transform shadow-lg relative overflow-hidden flex flex-col justify-between`}
                >
                  <h4 className="font-bold text-base text-white leading-tight">{cat.name}</h4>
                  <div className="self-end p-2 rounded-full bg-black/30 backdrop-blur-sm text-white">
                    <Music className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
