import { Song } from './types';

const OFFLINE_LYRICS_KEY = 'spotify_sunda_offline_lyrics';

export interface SavedOfflineLyric {
  songId: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  downloadedAt: string;
  lrcContent: string;
  lines: {
    time: number;
    sunda: string;
    arti: string;
  }[];
}

export function formatAsLRC(song: Song): string {
  const header = `[ti:${song.title}]\n[ar:${song.artist}]\n[al:${song.album}]\n[by:Spotify Sunda]\n\n`;
  const body = song.lyrics
    .map((l) => {
      const minutes = Math.floor(l.time / 60);
      const seconds = Math.floor(l.time % 60);
      const timeTag = `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.00]`;
      return `${timeTag} ${l.sunda} // (Tarjamah: ${l.arti})`;
    })
    .join('\n');
  return header + body;
}

export function saveLyricsOffline(song: Song): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const existingRaw = localStorage.getItem(OFFLINE_LYRICS_KEY);
    const existing: SavedOfflineLyric[] = existingRaw ? JSON.parse(existingRaw) : [];

    const index = existing.findIndex((item) => item.songId === song.id);
    const itemData: SavedOfflineLyric = {
      songId: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      coverUrl: song.coverUrl,
      downloadedAt: new Date().toISOString(),
      lrcContent: formatAsLRC(song),
      lines: song.lyrics,
    };

    if (index >= 0) {
      existing[index] = itemData;
    } else {
      existing.unshift(itemData);
    }

    localStorage.setItem(OFFLINE_LYRICS_KEY, JSON.stringify(existing));
    return true;
  } catch (err) {
    console.error('Failed to save offline lyrics:', err);
    return false;
  }
}

export function getOfflineLyrics(): SavedOfflineLyric[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_LYRICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isLyricSavedOffline(songId: string): boolean {
  if (typeof window === 'undefined') return false;
  const list = getOfflineLyrics();
  return list.some((item) => item.songId === songId);
}

export function removeOfflineLyric(songId: string): void {
  if (typeof window === 'undefined') return;
  const list = getOfflineLyrics().filter((item) => item.songId !== songId);
  localStorage.setItem(OFFLINE_LYRICS_KEY, JSON.stringify(list));
}

// Download .lrc file to device
export function triggerFileDownload(filename: string, content: string, mimeType = 'text/plain'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
