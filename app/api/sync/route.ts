import { NextRequest, NextResponse } from 'next/server';
import { CloudSyncData } from '@/lib/types';
import { INITIAL_PLAYLISTS } from '@/lib/sunda-songs';

// In-memory persistent store per server instance
let cloudStorage: Record<string, CloudSyncData> = {
  default_user: {
    userId: 'default_user',
    lastSyncedAt: new Date().toISOString(),
    playlists: INITIAL_PLAYLISTS,
    likedSongIds: ['sunda-01', 'sunda-02', 'sunda-04'],
    recentlyPlayedIds: ['sunda-01'],
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'default_user';

  const data = cloudStorage[userId] || {
    userId,
    lastSyncedAt: new Date().toISOString(),
    playlists: INITIAL_PLAYLISTS,
    likedSongIds: ['sunda-01', 'sunda-02'],
    recentlyPlayedIds: ['sunda-01'],
  };

  return NextResponse.json({
    success: true,
    data,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CloudSyncData;
    const userId = payload.userId || 'default_user';

    cloudStorage[userId] = {
      ...payload,
      userId,
      lastSyncedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Daptar puter hasil disingkronkeun ka server awan!',
      lastSyncedAt: cloudStorage[userId].lastSyncedAt,
      playlistCount: cloudStorage[userId].playlists.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal nyimpen data ka awan', error: String(error) },
      { status: 400 }
    );
  }
}
