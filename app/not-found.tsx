import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <h1 className="text-6xl font-black text-[#1DB954]">404</h1>
      <h2 className="mt-4 text-xl font-bold">Halaman Tidak Ditemukan</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-[#1DB954] px-6 py-3 text-sm font-semibold text-black transition hover:scale-105"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
