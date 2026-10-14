'use client';

import React, { useState } from 'react';
import {
  Music,
  CheckCircle2,
  Lock,
  User,
  Calendar,
  Sparkles,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { UserAccount } from '@/lib/types';

interface AuthScreenProps {
  onSuccess: (user: UserAccount) => void;
}

const MONTHS = [
  'Januari',
  'Pébruari',
  'Maret',
  'April',
  'Méi',
  'Juni',
  'Juli',
  'Agustus',
  'Séptémber',
  'Oktober',
  'Nopémber',
  'Désémber',
];

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'masuk' | 'daftar'>('masuk');

  // Form states - Masuk
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form states - Daftar
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Nested Cascading Date of Birth (Style Beranak)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 65 }, (_, i) => currentYear - 12 - i); // ages ~12 to 77
  const [birthYear, setBirthYear] = useState<number>(2000);
  const [birthMonth, setBirthMonth] = useState<number>(6); // 1-12
  const [birthDay, setBirthDay] = useState<number>(15);

  // Notification state
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate days in selected month/year
  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
  const daysList = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Handle Developer 1-click Login
  const handleDevLogin = async () => {
    setIsLoading(true);
    setAlertError(null);
    setAlertSuccess(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dev-login' }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('spotis_current_user', JSON.stringify(data.user));
        onSuccess(data.user);
      } else {
        setAlertError(data.error || 'Gagal lebet salaku developer.');
      }
    } catch {
      setAlertError('Aya gangguan sambungan. Mangga cobi deui.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Social Login (Google, Facebook, GitHub)
  const handleSocialLogin = async (provider: 'Google' | 'Facebook' | 'GitHub') => {
    setIsLoading(true);
    setAlertError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'social-login',
          provider,
          name: `Pamaké ${provider}`,
          email: `${provider.toLowerCase()}_user_${Math.floor(Math.random() * 8999 + 1000)}@spotis.com`,
          avatar:
            provider === 'Google'
              ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
              : provider === 'GitHub'
              ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('spotis_current_user', JSON.stringify(data.user));
        onSuccess(data.user);
      }
    } catch {
      setAlertError('Gagal lebet liwat akun sosial.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim()) {
      setAlertError('Mangga lebetkeun nami anjeun.');
      return;
    }
    if (!registerPassword || registerPassword.length < 3) {
      setAlertError('Kecap konci sahenteuna kedah 3 karakter.');
      return;
    }

    setIsLoading(true);
    setAlertError(null);
    setAlertSuccess(null);

    const formattedBirthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(
      birthDay
    ).padStart(2, '0')}`;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: registerName.trim(),
          password: registerPassword,
          birthDate: formattedBirthDate,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Show success notification & switch to login tab with prefilled values
        setAlertSuccess('Akun parantos hasil kadaptar! Mangga klik "Masuk" sarta lebetkeun nami sareng kecap konci.');
        setLoginIdentifier(registerName.trim());
        setLoginPassword(registerPassword);
        setActiveTab('masuk');
      } else {
        setAlertError(data.error || 'Gagal ngadaptar akun. Mangga cobi deui.');
      }
    } catch {
      setAlertError('Aya masalah sambungan ka server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Regular Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setAlertError('Mangga lebetkeun nami atawa email.');
      return;
    }

    setIsLoading(true);
    setAlertError(null);
    setAlertSuccess(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          name: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('spotis_current_user', JSON.stringify(data.user));
        onSuccess(data.user);
      } else {
        setAlertError(data.error || 'Nami atawa kecap konci lepat.');
      }
    } catch {
      setAlertError('Gagal ngahubungan server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#1DB954]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-700/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1DB954] to-emerald-400 text-black shadow-lg shadow-[#1DB954]/30 mb-3">
            <Music className="w-8 h-8 fill-black stroke-black" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            Spoti<span className="text-[#1DB954]">S</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Dangukeun musik favorit anjeun iraha waé dina Basa Sunda
          </p>
        </div>

        {/* Developer Account Fast Access Banner */}
        <div className="mb-6 p-3 rounded-2xl bg-neutral-800/80 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-[#1DB954] flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#1DB954] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Akun Dev Khusus
              </div>
              <div className="text-xs font-mono text-neutral-200 truncate">fzpedia@dev.id</div>
            </div>
          </div>
          <button
            onClick={handleDevLogin}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 text-black font-bold text-xs shrink-0 transition-all shadow-md shadow-[#1DB954]/20 flex items-center gap-1"
          >
            <span>Lebet Dev</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="flex bg-neutral-800/80 p-1 rounded-xl mb-6 border border-neutral-700/50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('masuk');
              setAlertError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'masuk'
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('daftar');
              setAlertError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'daftar'
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Success Alert */}
        {alertSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5" />
            <div>{alertSuccess}</div>
          </div>
        )}

        {/* Error Alert */}
        {alertError && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>{alertError}</div>
          </div>
        )}

        {/* TAB: MASUK */}
        {activeTab === 'masuk' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Nami Lengkap atawa Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Conto: fzpedia@dev.id atawa nami anjeun"
                  className="w-full bg-neutral-800 text-white placeholder-neutral-500 text-sm rounded-xl pl-10 pr-4 py-3 border border-neutral-700 focus:border-[#1DB954] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Kecap Konci (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Lebetkeun kecap konci"
                  className="w-full bg-neutral-800 text-white placeholder-neutral-500 text-sm rounded-xl pl-10 pr-10 py-3 border border-neutral-700 focus:border-[#1DB954] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-98 text-black font-extrabold text-sm transition-all shadow-lg shadow-[#1DB954]/25 flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLoading ? 'Keur mariksa...' : 'Lebet ka SpotiS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB: DAFTAR */}
        {activeTab === 'daftar' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Nami Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Lebetkeun nami anjeun"
                  className="w-full bg-neutral-800 text-white placeholder-neutral-500 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-neutral-700 focus:border-[#1DB954] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* STYLE BERANAK (CASCADING NESTED BIRTH DATE PICKER) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1DB954]" />
                  <span>Kelahiran (Pilihan Beranak)</span>
                </label>
                <span className="text-[11px] font-mono text-[#1DB954] bg-[#1DB954]/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {birthDay} {MONTHS[birthMonth - 1]} {birthYear}
                </span>
              </div>

              {/* Nested hierarchical cascading cards with connecting tree indicators */}
              <div className="bg-neutral-800/60 p-3 rounded-2xl border border-neutral-700/60 space-y-2.5">
                {/* 1. Cabang Taun (Induk) */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-neutral-700 text-[10px] font-bold text-neutral-300 flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] text-neutral-400 block mb-1">Taun Lahir:</span>
                    <select
                      value={birthYear}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBirthYear(val);
                        const maxD = new Date(val, birthMonth, 0).getDate();
                        if (birthDay > maxD) setBirthDay(maxD);
                      }}
                      className="w-full bg-neutral-800 text-white text-xs rounded-lg px-2.5 py-1.5 border border-neutral-700 focus:border-[#1DB954] focus:outline-none"
                    >
                      {years.map((y) => (
                        <option key={y} value={y} className="bg-neutral-900 text-white">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Connecting branch indicator */}
                <div className="pl-3 border-l-2 border-neutral-700 ml-3 space-y-2.5">
                  {/* 2. Cabang Sasih (Anak ke-1) */}
                  <div className="flex items-center gap-2 pl-2">
                    <div className="w-5 h-5 rounded-md bg-neutral-700 text-[10px] font-bold text-neutral-300 flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] text-neutral-400 block mb-1">Sasih (Bulan):</span>
                      <select
                        value={birthMonth}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBirthMonth(val);
                          const maxD = new Date(birthYear, val, 0).getDate();
                          if (birthDay > maxD) setBirthDay(maxD);
                        }}
                        className="w-full bg-neutral-800 text-white text-xs rounded-lg px-2.5 py-1.5 border border-neutral-700 focus:border-[#1DB954] focus:outline-none"
                      >
                        {MONTHS.map((m, idx) => (
                          <option key={m} value={idx + 1} className="bg-neutral-900 text-white">
                            {m} ({idx + 1})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 3. Cabang Tanggal (Cucu / Anak ke-2) */}
                  <div className="flex items-center gap-2 pl-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-[10px] font-bold text-[#1DB954] flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] text-neutral-400 block mb-1">Tanggal:</span>
                      <select
                        value={birthDay}
                        onChange={(e) => setBirthDay(Number(e.target.value))}
                        className="w-full bg-neutral-800 text-white text-xs rounded-lg px-2.5 py-1.5 border border-neutral-700 focus:border-[#1DB954] focus:outline-none"
                      >
                        {daysList.map((d) => (
                          <option key={d} value={d} className="bg-neutral-900 text-white">
                            Tanggal {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Kecap Konci (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Kecap konci akun anjeun"
                  className="w-full bg-neutral-800 text-white placeholder-neutral-500 text-sm rounded-xl pl-10 pr-10 py-2.5 border border-neutral-700 focus:border-[#1DB954] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-98 text-black font-extrabold text-sm transition-all shadow-lg shadow-[#1DB954]/25 flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLoading ? 'Keur ngadaftarkeun...' : 'Daftar Akun SpotiS'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Social Login Separator */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <span className="relative bg-neutral-900/90 px-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Atawa lebet nganggo
          </span>
        </div>

        {/* Social Login Buttons: Google, Facebook, GitHub */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 hover:border-neutral-600 border border-neutral-700/60 transition-all text-xs font-semibold text-neutral-300 hover:text-white group"
          >
            <svg className="w-5 h-5 mb-1 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
              />
            </svg>
            <span className="text-[11px]">Google</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Facebook')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 hover:border-neutral-600 border border-neutral-700/60 transition-all text-xs font-semibold text-neutral-300 hover:text-white group"
          >
            <svg
              className="w-5 h-5 mb-1 fill-[#1877F2] group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-[11px]">Facebook</span>
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleSocialLogin('GitHub')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 hover:border-neutral-600 border border-neutral-700/60 transition-all text-xs font-semibold text-neutral-300 hover:text-white group"
          >
            <svg
              className="w-5 h-5 mb-1 fill-white group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="text-[11px]">GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
}
