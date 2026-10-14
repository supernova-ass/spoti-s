export interface LyricLine {
  time: number; // in seconds
  sunda: string;
  arti: string; // Indonesian translation
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  year?: number;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string; // external mp3/aac if available
  isSundaNative?: boolean; // if true, synthesizes authentic Sunda degung melody
  melodyKey?: string; // key for Web Audio synthesizer
  lyrics: LyricLine[];
  genre?: string;
  isOfflineLyricDownloaded?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  tracks: Song[];
  isCustom?: boolean;
  createdAt?: string;
}

export interface CloudSyncData {
  userId: string;
  lastSyncedAt: string;
  playlists: Playlist[];
  likedSongIds: string[];
  recentlyPlayedIds: string[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  birthDate?: string;
  role: 'developer' | 'user';
  avatar?: string;
  favoriteGenres?: string[];
  createdAt: string;
}

