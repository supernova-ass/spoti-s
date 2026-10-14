import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpotiS - Pamuter Musik & Lirik Lokal',
  description:
    'Aplikasi streaming musik SpotiS kalayan antarmuka Basa Sunda, lirik otomatis anu tiasa diunduh sacara offline, pamuter lagu, mode poek (dark mode), palurukan lagu online, sareng sinkronisasi daptar puter ka awan.',
  openGraph: {
    title: 'SpotiS - Pamuter Musik & Lirik Lokal',
    description:
      'Aplikasi streaming musik SpotiS kalayan antarmuka Basa Sunda, lirik otomatis anu tiasa diunduh sacara offline, pamuter lagu, mode poek (dark mode), palurukan lagu online, sareng sinkronisasi daptar puter ka awan.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpotiS - Pamuter Musik & Lirik Lokal',
    description:
      'Aplikasi streaming musik SpotiS kalayan antarmuka Basa Sunda, lirik otomatis anu tiasa diunduh sacara offline, pamuter lagu, mode poek (dark mode), palurukan lagu online, sareng sinkronisasi daptar puter ka awan.',
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
    <html lang="su" className="dark bg-black" suppressHydrationWarning>
      <body
        className="bg-black text-neutral-100 antialiased selection:bg-[#1DB954] selection:text-black min-h-screen"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
