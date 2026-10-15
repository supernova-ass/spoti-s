import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpotiS - Pemutar Musik & Kumpulan Sound Kane',
  description:
    'Aplikasi pemutar musik modern SpotiS dengan koleksi Kumpulan Sound Kane karya FZEDIT, lirik sinkron otomatis, mode offline, pencarian online, dan sinkronisasi playlist aman.',
  openGraph: {
    title: 'SpotiS - Pemutar Musik & Kumpulan Sound Kane',
    description:
      'Aplikasi pemutar musik modern SpotiS dengan koleksi Kumpulan Sound Kane karya FZEDIT, lirik sinkron otomatis, mode offline, pencarian online, dan sinkronisasi playlist aman.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpotiS - Pemutar Musik & Kumpulan Sound Kane',
    description:
      'Aplikasi pemutar musik modern SpotiS dengan koleksi Kumpulan Sound Kane karya FZEDIT, lirik sinkron otomatis, mode offline, pencarian online, dan sinkronisasi playlist aman.',
  },
};

export const viewport: Viewport = {
  themeColor: '#121212',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark bg-black" suppressHydrationWarning>
      <body
        className="bg-black text-neutral-100 antialiased selection:bg-[#1DB954] selection:text-black min-h-screen"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
