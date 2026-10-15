'use client';

import React, { useState } from 'react';
import {
  Music,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { UserAccount } from '@/lib/types';

interface GenreSelectionScreenProps {
  user: UserAccount;
  onComplete: (genres: string[]) => void;
}

interface GenreItem {
  id: string;
  name: string;
  description: string;
  gradient: string;
  icon: string;
}

const AVAILABLE_GENRES: GenreItem[] = [
  { id: 'pop', name: 'Pop Hits', description: 'Melodi viral & tangga lagu terpopuler', gradient: 'from-blue-600 to-indigo-900', icon: '🎵' },
  { id: 'dj', name: 'DJ & Remix', description: 'Bass mantap jedag-jedug & beat kane', gradient: 'from-fuchsia-600 to-purple-950', icon: '🎧' },
  { id: 'rock', name: 'Rock & Metal', description: 'Gitar distorsi & riff berenergi tinggi', gradient: 'from-red-600 to-amber-950', icon: '🎸' },
  { id: 'hiphop', name: 'Hip-Hop & Rap', description: 'Rima tajam & beat hip-hop modern', gradient: 'from-amber-600 to-orange-950', icon: '🎤' },
  { id: 'rnb', name: 'R&B & Soul', description: 'Irama santai & vokal penuh penghayatan', gradient: 'from-rose-600 to-pink-950', icon: '✨' },
  { id: 'kpop', name: 'K-Pop', description: 'Lagu idol hits & beat enerjik', gradient: 'from-pink-500 to-purple-900', icon: '🇰🇷' },
  { id: 'edm', name: 'EDM & Club', description: 'Drop listrik & festival dance beat', gradient: 'from-cyan-500 to-blue-950', icon: '⚡' },
  { id: 'dangdut', name: 'Dangdut Koplo', description: 'Kendang rampak & tempo goyang asyik', gradient: 'from-emerald-600 to-teal-950', icon: '🎹' },
  { id: 'akustik', name: 'Akustik & Santai', description: 'Petikan gitar lembut & suasana tenang', gradient: 'from-lime-600 to-emerald-950', icon: '☕' },
  { id: 'indie', name: 'Indie & Folk', description: 'Lirik puitis & aransemen orisinal', gradient: 'from-teal-600 to-cyan-950', icon: '🌿' },
  { id: 'lofi', name: 'Lo-Fi Chill Beats', description: 'Teman belajar, kerja & relaksasi', gradient: 'from-violet-600 to-indigo-950', icon: '🌙' },
  { id: 'jazz', name: 'Jazz & Blues', description: 'Harmoni piano & tiupan saksofon', gradient: 'from-yellow-600 to-stone-900', icon: '🎷' },
  { id: 'jpop', name: 'J-Pop & Anime', description: 'Original soundtrack & anime vibes', gradient: 'from-sky-500 to-indigo-950', icon: '🗾' },
  { id: 'nusantara', name: 'Nusantara & Etnik', description: 'Kekayaan melodi klasik nusantara', gradient: 'from-emerald-500 to-stone-950', icon: '🎋' },
  { id: 'klasik', name: 'Melodi Klasik', description: 'Aransemen orkestra & instrumen megah', gradient: 'from-stone-600 to-neutral-900', icon: '🎻' },
  { id: 'reggae', name: 'Reggae & Ska', description: 'Irama santai pantai & iringan asoy', gradient: 'from-green-600 to-yellow-950', icon: '🌴' },
];

export function GenreSelectionScreen({ user, onComplete }: GenreSelectionScreenProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    user.favoriteGenres && user.favoriteGenres.length > 0 ? user.favoriteGenres.slice(0, 5) : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleGenre = (genreName: string) => {
    if (selectedGenres.includes(genreName)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genreName));
    } else {
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genreName]);
      } else {
        // Shift oldest
        setSelectedGenres([...selectedGenres.slice(1), genreName]);
      }
    }
  };

  const handleProceed = async () => {
    if (selectedGenres.length < 5) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-genres',
          email: user.email,
          favoriteGenres: selectedGenres,
        }),
      });
    } catch (e) {
      console.warn('Genre update backend error:', e);
    }
    onComplete(selectedGenres);
  };

  const isReady = selectedGenres.length === 5;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-4 sm:p-8 relative select-none overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#1DB954]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header section */}
      <div className="max-w-4xl mx-auto w-full pt-4 sm:pt-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" />
          <span>Selamat datang, <strong className="text-white">{user.name}</strong></span>
          {user.role === 'developer' && (
            <span className="bg-[#1DB954] text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full">DEV</span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          Pilih 5 Genre Musik Favorit Anda
        </h1>
        <p className="text-sm text-neutral-400 max-w-lg mx-auto">
          SpotiS akan menyesuaikan rekomendasi lagu dan sound kane terbaik sesuai selera yang Anda sukai.
        </p>

        {/* Selected Counter Pill */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/90 border border-neutral-800 backdrop-blur-md">
          <span className="text-xs text-neutral-400">Status pilihan:</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isReady
                ? 'bg-[#1DB954] text-black shadow-md shadow-[#1DB954]/20'
                : 'bg-neutral-800 text-neutral-300'
            }`}
          >
            {selectedGenres.length} / 5 genre dipilih
          </span>
          {isReady && <span className="text-xs text-[#1DB954] font-medium">· Sempurna!</span>}
        </div>
      </div>

      {/* Genre Grid */}
      <div className="max-w-4xl mx-auto w-full py-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {AVAILABLE_GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre.name);
            return (
              <div
                key={genre.id}
                onClick={() => toggleGenre(genre.name)}
                className={`relative p-4 rounded-2xl cursor-pointer transition-all border duration-200 group overflow-hidden ${
                  isSelected
                    ? 'bg-neutral-850 border-[#1DB954] ring-2 ring-[#1DB954]/40 shadow-lg shadow-[#1DB954]/20 scale-[1.02]'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                {/* Background gradient hint */}
                <div
                  className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${genre.gradient} opacity-30 group-hover:opacity-40 blur-xl transition-opacity pointer-events-none`}
                />

                <div className="flex items-start justify-between mb-3 relative z-10">
                  <span className="text-2xl">{genre.icon}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#1DB954] text-black'
                        : 'border border-neutral-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className={`font-bold text-sm tracking-tight ${isSelected ? 'text-white' : 'text-neutral-200'}`}>
                    {genre.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1 leading-snug">
                    {genre.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="max-w-4xl mx-auto w-full pb-4 sm:pb-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-2xl">
          <div className="text-xs text-neutral-400 text-center sm:text-left">
            {isReady ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#1DB954]" />
                5 genre sudah dipilih lengkap! Tekan Selanjutnya untuk mulai mendengarkan di SpotiS.
              </span>
            ) : (
              <span>
                Pilih <strong className="text-white">{5 - selectedGenres.length}</strong> genre lagi untuk melengkapi pilihan 5 genre Anda.
              </span>
            )}
          </div>

          <button
            onClick={handleProceed}
            disabled={!isReady || isSubmitting}
            className={`w-full sm:w-auto px-8 py-3 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
              isReady
                ? 'bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 text-black shadow-lg shadow-[#1DB954]/30 cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
            }`}
          >
            <span>{isSubmitting ? 'Menyiapkan...' : 'Selanjutnya'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
