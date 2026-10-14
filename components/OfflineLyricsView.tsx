'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Trash2,
  Play,
  Languages,
  CheckCircle2,
  Search,
  WifiOff,
} from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import {
  SavedOfflineLyric,
  removeOfflineLyric,
  triggerFileDownload,
} from '@/lib/lyrics-storage';
import { Song } from '@/lib/types';
import { SUNDA_SONGS } from '@/lib/sunda-songs';

interface OfflineLyricsViewProps {
  offlineLyrics: SavedOfflineLyric[];
  onRefreshOfflineList: () => void;
  onPlaySong: (song: Song) => void;
  onOpenLyricsModal: (song: Song) => void;
  lang: Language;
}

export function OfflineLyricsView({
  offlineLyrics,
  onRefreshOfflineList,
  onPlaySong,
  onOpenLyricsModal,
  lang,
}: OfflineLyricsViewProps) {
  const t = translations[lang];
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedLyric, setSelectedLyric] = useState<SavedOfflineLyric | null>(
    offlineLyrics[0] || null
  );
  const [showTranslation, setShowTranslation] = useState(true);

  const filtered = offlineLyrics.filter(
    (item) =>
      item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.artist.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleRemove = (songId: string) => {
    removeOfflineLyric(songId);
    onRefreshOfflineList();
    if (selectedLyric?.songId === songId) {
      const remaining = offlineLyrics.filter((x) => x.songId !== songId);
      setSelectedLyric(remaining[0] || null);
    }
  };

  const handleExportLrc = (item: SavedOfflineLyric) => {
    const filename = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_lirik_sunda.lrc`;
    triggerFileDownload(filename, item.lrcContent);
  };

  const handlePlayFromOffline = (item: SavedOfflineLyric) => {
    // Find matching song in catalog or build from offline lyric data
    const matched = SUNDA_SONGS.find((s) => s.id === item.songId);
    if (matched) {
      onPlaySong(matched);
    } else {
      const syntheticSong: Song = {
        id: item.songId,
        title: item.title,
        artist: item.artist,
        album: item.album,
        coverUrl: item.coverUrl,
        duration: 100,
        isSundaNative: true,
        lyrics: item.lines,
      };
      onPlaySong(syntheticSong);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 pb-28 custom-scrollbar">
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-neutral-900 border border-emerald-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#1DB954] text-black flex items-center justify-center font-black shadow-lg shadow-[#1DB954]/20 shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {t.offlineLyricsTitle}
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#1DB954] border border-emerald-500/30 flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  <span>Mode Offline</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                {t.offlineLyricsDesc}
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <span className="text-xs text-neutral-400">
              <strong className="text-white text-base">{offlineLyrics.length}</strong> lirik kasimpen
            </span>
          </div>
        </div>
      </div>

      {offlineLyrics.length === 0 ? (
        <div className="max-w-6xl mx-auto py-20 text-center text-neutral-400 border border-dashed border-neutral-800 rounded-2xl p-8">
          <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
          <h3 className="text-lg font-bold text-white">Can aya lirik anu diunduh offline</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
            Buka lagu Sunda naon waé, pencét tombol &quot;Unduh Lirik (Offline)&quot; atanapi ikon unduh dina pamuter musik pikeun nyimpen lirik di dieu.
          </p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: List of Downloaded Lyrics */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Saring lirik offline..."
                className="w-full bg-neutral-900 text-white placeholder-neutral-500 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-neutral-800 focus:border-[#1DB954] focus:outline-none"
              />
            </div>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {filtered.map((item) => {
                const isSelected = selectedLyric?.songId === item.songId;
                return (
                  <div
                    key={item.songId}
                    onClick={() => setSelectedLyric(item)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-neutral-800/90 border-[#1DB954] text-white shadow-md'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800/40 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
                        }}
                      />
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm truncate text-white">{item.title}</h4>
                        <p className="text-xs text-neutral-400 truncate">{item.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayFromOffline(item);
                        }}
                        className="p-1.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black transition-transform hover:scale-105"
                        title={t.play}
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.songId);
                        }}
                        className="p-1.5 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-red-400 transition-colors"
                        title="Hapus lirik offline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Reader for the Selected Lyric */}
          <div className="lg:col-span-7">
            {selectedLyric ? (
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col h-[550px]">
                {/* Header of Reader */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedLyric.title}</h3>
                    <p className="text-xs text-neutral-400">{selectedLyric.artist} · {selectedLyric.album}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        showTranslation
                          ? 'bg-neutral-800 border-neutral-600 text-white'
                          : 'bg-transparent border-neutral-700 text-neutral-400'
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5 text-[#1DB954]" />
                      <span>{showTranslation ? 'Tarjamah Hurung' : 'Tarjamah Pareum'}</span>
                    </button>
                    <button
                      onClick={() => handleExportLrc(selectedLyric)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700"
                      title="Unduh file .LRC ka HP/Komputer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>File .LRC</span>
                    </button>
                  </div>
                </div>

                {/* Lyrics Content with Sundanese & Indonesian translation */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar">
                  {selectedLyric.lines && selectedLyric.lines.length > 0 ? (
                    selectedLyric.lines.map((line, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-neutral-950/40 hover:bg-neutral-950 border border-neutral-800/40 transition-colors"
                      >
                        <p className="text-base font-bold text-white tracking-tight">
                          {line.sunda}
                        </p>
                        {showTranslation && line.arti && (
                          <p className="text-xs text-emerald-400/90 mt-0.5">
                            {line.arti}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap">
                      {selectedLyric.lrcContent}
                    </pre>
                  )}
                </div>

                {/* Bottom Footer Info */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1 text-[#1DB954]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Diunduh: {new Date(selectedLyric.downloadedAt).toLocaleDateString()}</span>
                  </span>
                  <button
                    onClick={() => handlePlayFromOffline(selectedLyric)}
                    className="font-bold text-white hover:text-[#1DB954] transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Setel Lagu Ieu</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">
                Pilih lirik ti daptar gigir pikeun maca.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
