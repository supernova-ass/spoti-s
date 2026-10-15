'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Music, Sparkles } from 'lucide-react';
import { UserAccount } from '@/lib/types';

interface WelcomeIntroAnimationProps {
  user: UserAccount;
  genres: string[];
  onFinish: () => void;
}

export function WelcomeIntroAnimation({ user, genres, onFinish }: WelcomeIntroAnimationProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(onFinish, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      onClick={onFinish}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 select-none cursor-pointer overflow-hidden"
    >
      {/* Background radial pulses */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[600px] h-[600px] rounded-full bg-[#1DB954]/20 blur-[150px] pointer-events-none"
      />

      {/* Center glowing logo */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative mb-6"
      >
        {/* Pulsing rings */}
        <motion.div
          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-3xl bg-[#1DB954]/40 blur-md pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
          transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-3xl bg-emerald-400/30 blur-sm pointer-events-none"
        />

        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#1DB954] to-emerald-300 flex items-center justify-center text-black shadow-2xl shadow-[#1DB954]/40 relative z-10">
          <Music className="w-12 h-12 fill-black stroke-black" />
        </div>
      </motion.div>

      {/* Brand title */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center mb-4"
      >
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-1">
          Spoti<span className="text-[#1DB954]">S</span>
        </h1>
        <p className="text-sm font-semibold tracking-wide text-neutral-400 mt-1 uppercase">
          Pemutar Musik & Kumpulan Sound Kane Modern
        </p>
      </motion.div>

      {/* Personalized Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="max-w-md w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 text-center backdrop-blur-xl shadow-2xl mb-8"
      >
        <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Selamat Datang</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
          {user.name}
          {user.role === 'developer' && (
            <span className="ml-2 text-xs font-black bg-[#1DB954] text-black px-2 py-0.5 rounded-full inline-block align-middle">
              DEVELOPER
            </span>
          )}
        </h2>

        {/* Selected genres display */}
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
            {genres.map((g) => (
              <span
                key={g}
                className="text-[11px] font-medium bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-full border border-neutral-700/60"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Simulated Equalizer Sound Waves */}
        <div className="flex items-end justify-center gap-1.5 h-8 mb-4">
          {[40, 75, 55, 90, 65, 80, 45, 95, 60, 85, 50, 70].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h * 0.2}%`, `${h}%`, `${h * 0.4}%`] }}
              transition={{
                duration: 0.7 + (i % 3) * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: 'mirror',
              }}
              className="w-1.5 bg-[#1DB954] rounded-full"
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="bg-[#1DB954] h-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
        <div className="text-[11px] text-neutral-500 mt-2 flex items-center justify-between">
          <span>Menyiapkan audio & koleksi musik...</span>
          <span className="font-mono text-neutral-400">{progress}%</span>
        </div>
      </motion.div>

      {/* Skip button hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        Klik di mana saja untuk langsung masuk ke SpotiS →
      </motion.p>
    </motion.div>
  );
}
