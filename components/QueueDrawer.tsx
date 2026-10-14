'use client';

import React from 'react';
import { X, Play, Music, ListMusic } from 'lucide-react';
import { Song } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  queue: Song[];
  onPlaySong: (song: Song) => void;
  onClearQueue: () => void;
  lang: Language;
}

export function QueueDrawer({
  isOpen,
  onClose,
  currentSong,
  queue,
  onPlaySong,
  onClearQueue,
  lang,
}: QueueDrawerProps) {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-0 bottom-22 w-80 bg-neutral-950/95 backdrop-blur-xl border-l border-neutral-800 z-40 p-5 flex flex-col shadow-2xl select-none text-white animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-[#1DB954]" />
          <h3 className="font-bold text-base">{t.queue}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-5 custom-scrollbar">
        {/* Currently playing */}
        {currentSong && (
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              Keur Disetel
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-11 h-11 rounded-lg object-cover shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
                }}
              />
              <div className="overflow-hidden min-w-0">
                <h4 className="text-sm font-bold text-[#1DB954] truncate">
                  {currentSong.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate">{currentSong.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Next up queue */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Antrian Saterusna ({queue.length})
            </span>
            {queue.length > 0 && (
              <button
                onClick={onClearQueue}
                className="text-[10px] text-neutral-400 hover:text-white"
              >
                Kosongkeun
              </button>
            )}
          </div>

          {queue.length > 0 ? (
            <div className="space-y-1.5">
              {queue.map((song, i) => (
                <div
                  key={`${song.id}-${i}`}
                  onClick={() => onPlaySong(song)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-900 cursor-pointer group transition-colors"
                >
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-9 h-9 rounded object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/pop_sunda.jpg';
                    }}
                  />
                  <div className="overflow-hidden flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-white truncate group-hover:text-[#1DB954]">
                      {song.title}
                    </h5>
                    <p className="text-[11px] text-neutral-400 truncate">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-4 text-center">
              Taya lagu dina antrian.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
