'use client';

import React, { useState } from 'react';
import { X, Music } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, coverUrl: string) => void;
  lang: Language;
}

const DEFAULT_COVERS = [
  '/images/pop_sunda.jpg',
  '/images/sunda_degung.jpg',
  '/images/mojang_priangan.jpg',
  '/images/manuk_dadali.jpg',
];

export function CreatePlaylistModal({
  isOpen,
  onClose,
  onCreate,
  lang,
}: CreatePlaylistModalProps) {
  const t = translations[lang];
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedCover, setSelectedCover] = useState(DEFAULT_COVERS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), desc.trim(), selectedCover);
    setTitle('');
    setDesc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <h3 className="text-lg font-bold">{t.createPlaylist}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              {t.customPlaylistName}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Conto: Karesep Peuting, Degung Kulawarga..."
              required
              autoFocus
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#1DB954]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              {t.customPlaylistDesc}
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Katerangan ngeunaan daptar puter ieu..."
              rows={2}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#1DB954] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-2">
              Pilih Gambar Sampul Albeum
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_COVERS.map((cov, i) => (
                <img
                  key={i}
                  src={cov}
                  alt={`Sampul ${i}`}
                  onClick={() => setSelectedCover(cov)}
                  className={`w-full h-18 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                    selectedCover === cov
                      ? 'border-[#1DB954] scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-400 hover:text-white"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#1DB954] hover:bg-[#1ed760] text-black disabled:opacity-50 transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
