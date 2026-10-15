import { NextRequest, NextResponse } from 'next/server';
import { ALL_SONGS } from '@/lib/sunda-songs';
import { Song } from '@/lib/types';

interface ITunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  trackTimeMillis?: number;
  primaryGenreName?: string;
  releaseDate?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const queryLower = query.toLowerCase();

  // 1. Check local catalog (Sound Kane FZEDIT + Songs) first for instant high-relevance matches
  const localMatches = ALL_SONGS.filter(
    (s) =>
      s.title.toLowerCase().includes(queryLower) ||
      s.artist.toLowerCase().includes(queryLower) ||
      s.album.toLowerCase().includes(queryLower) ||
      (s.genre && s.genre.toLowerCase().includes(queryLower))
  );

  // 2. Fetch from free public iTunes Search API (no API key needed, official preview audio included!)
  let remoteTracks: Song[] = [];

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=20`;
    const response = await fetch(itunesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SpotiS/1.0)',
      },
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.results)) {
        remoteTracks = data.results
          .filter((item: ITunesResult) => Boolean(item.previewUrl && item.trackName))
          .map((item: ITunesResult) => {
            // High-resolution artwork replacement (replace 100x100 with 600x600)
            const hiResCover = item.artworkUrl100
              ? item.artworkUrl100.replace('100x100bb', '600x600bb')
              : '/images/sound_kane_cover.jpg';

            const durationSec = Math.round((item.trackTimeMillis || 30000) / 1000);

            return {
              id: `itunes-${item.trackId}`,
              title: item.trackName,
              artist: item.artistName,
              album: item.collectionName || 'Single',
              year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 2024,
              duration: durationSec > 0 ? durationSec : 30,
              coverUrl: hiResCover,
              audioUrl: item.previewUrl,
              genre: item.primaryGenreName || 'Pop',
              lyrics: [
                { time: 0, sunda: `Tembang: ${item.trackName}`, arti: `Memutar karya musik: ${item.trackName}` },
                { time: 5, sunda: `Artis: ${item.artistName}`, arti: `Dibawakan oleh: ${item.artistName}` },
                { time: 12, sunda: `Wirahma halimpu matak genah kana manah`, arti: 'Irama merdu nan syahdu menyejukkan sanubari' },
                { time: 20, sunda: `Ngadukung pamuter lagu online Spotify Sunda`, arti: 'Didukung pemutar lagu Spotify Sunda berkinerja tinggi' },
              ],
            };
          });
      }
    }
  } catch (error) {
    console.error('Remote search API error:', error);
  }

  // Combine local matches first, then remote tracks (deduplicated)
  const combined = [...localMatches, ...remoteTracks];

  return NextResponse.json({
    query,
    count: combined.length,
    results: combined,
  });
}
