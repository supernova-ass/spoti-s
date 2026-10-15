'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { PlayerBar } from '@/components/PlayerBar';
import { HomeFeed } from '@/components/HomeFeed';
import { SearchPage } from '@/components/SearchPage';
import { PlaylistDetail } from '@/components/PlaylistDetail';
import { LikedSongsView } from '@/components/LikedSongsView';
import { OfflineLyricsView } from '@/components/OfflineLyricsView';
import { LyricsModal } from '@/components/LyricsModal';
import { QueueDrawer } from '@/components/QueueDrawer';
import { NowPlayingDrawer } from '@/components/NowPlayingDrawer';
import { CreatePlaylistModal } from '@/components/CreatePlaylistModal';
import { ImportAudioModal } from '@/components/ImportAudioModal';
import { MobileNav } from '@/components/MobileNav';
import { AuthScreen } from '@/components/AuthScreen';
import { GenreSelectionScreen } from '@/components/GenreSelectionScreen';
import { WelcomeIntroAnimation } from '@/components/WelcomeIntroAnimation';
import { SUNDA_SONGS, SOUND_KANE_SONGS, ALL_SONGS, INITIAL_PLAYLISTS } from '@/lib/sunda-songs';
import { Song, Playlist, CloudSyncData, UserAccount } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { sundaAudio } from '@/lib/audio-synthesizer';
import {
  saveLyricsOffline,
  getOfflineLyrics,
  SavedOfflineLyric,
  formatAsLRC,
  triggerFileDownload,
} from '@/lib/lyrics-storage';
import {
  listCustomAudioSongIds,
  getCustomAudioUrl,
} from '@/lib/custom-audio-db';

export default function SpotifySundaApp() {
  const [lang, setLang] = useState<Language>('id');
  const t = translations[lang];

  // User Authentication & Onboarding state
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [showGenreScreen, setShowGenreScreen] = useState(false);
  const [showIntroAnimation, setShowIntroAnimation] = useState(false);

  // Load persistent user on mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedUser = localStorage.getItem('spotis_current_user');
        if (savedUser) {
          const parsed: UserAccount = JSON.parse(savedUser);
          if (parsed.email === 'fzpedia@dev.id') {
            parsed.birthDate = '2008-08-08';
            parsed.avatar = '/images/profile-dev.jpeg';
            localStorage.setItem('spotis_current_user', JSON.stringify(parsed));
          }
          setCurrentUser(parsed);
          if (!parsed.favoriteGenres || parsed.favoriteGenres.length < 5) {
            setShowGenreScreen(true);
          }
        }
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    });
  }, []);

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('spotis_current_user', JSON.stringify(user));
    setShowGenreScreen(true);
  };

  const handleGenresComplete = (genres: string[]) => {
    if (currentUser) {
      const updated = { ...currentUser, favoriteGenres: genres };
      setCurrentUser(updated);
      localStorage.setItem('spotis_current_user', JSON.stringify(updated));
    }
    setShowGenreScreen(false);
    setShowIntroAnimation(true);
  };

  const handleIntroFinish = () => {
    setShowIntroAnimation(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('spotis_current_user');
    setCurrentUser(null);
    setShowGenreScreen(false);
    setShowIntroAnimation(false);
  };

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('home');
  const [historyStack, setHistoryStack] = useState<string[]>(['home']);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Playlist & Library state
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [likedSongIds, setLikedSongIds] = useState<string[]>(['sunda-01', 'sunda-02', 'sunda-04']);
  const [offlineLyricsList, setOfflineLyricsList] = useState<SavedOfflineLyric[]>([]);
  const [offlineDownloadedIds, setOfflineDownloadedIds] = useState<string[]>([]);

  // Cloud Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Playback state
  const [currentSong, setCurrentSong] = useState<Song | null>(SOUND_KANE_SONGS[0] || SUNDA_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(SOUND_KANE_SONGS[0]?.duration || 23);
  const [volume, setVolume] = useState<number>(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [queue, setQueue] = useState<Song[]>(SOUND_KANE_SONGS.slice(1).concat(SUNDA_SONGS));

  // Modals & Drawers
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isImportAudioOpen, setIsImportAudioOpen] = useState(false);

  // Custom Full MP3 Audio mappings (songId -> Blob URL / remote URL)
  const [customAudioMap, setCustomAudioMap] = useState<Record<string, string>>({});
  const [customAudioIds, setCustomAudioIds] = useState<string[]>([]);

  // Native HTML Audio element for remote streams
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const handleNextTrackRef = useRef<() => void>(() => {});
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const shouldPlayRef = useRef<boolean>(false);

  // Load offline lyrics from localStorage on client mount to prevent hydration mismatch
  useEffect(() => {
    queueMicrotask(() => {
      const saved = getOfflineLyrics();
      if (saved.length === 0 && SUNDA_SONGS[0]) {
        saveLyricsOffline(SUNDA_SONGS[0]);
        const updated = getOfflineLyrics();
        setOfflineLyricsList(updated);
        setOfflineDownloadedIds(updated.map((x) => x.songId));
      } else {
        setOfflineLyricsList(saved);
        setOfflineDownloadedIds(saved.map((x) => x.songId));
      }
    });
  }, []);

  // Load Custom Full MP3 Audio tracks from IndexedDB
  useEffect(() => {
    listCustomAudioSongIds().then(async (ids) => {
      if (ids && ids.length > 0) {
        setCustomAudioIds(ids);
        const map: Record<string, string> = {};
        for (const id of ids) {
          const url = await getCustomAudioUrl(id);
          if (url) map[id] = url;
        }
        setCustomAudioMap(map);
      }
    }).catch((err) => console.error('Failed to load custom audio tracks:', err));
  }, []);

  // Fetch Initial Cloud Sync Data from /api/sync
  useEffect(() => {
    fetch('/api/sync?userId=default_user')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          const cloudData: CloudSyncData = json.data;
          if (cloudData.playlists && cloudData.playlists.length > 0) {
            setPlaylists(cloudData.playlists);
          }
          if (cloudData.likedSongIds) {
            setLikedSongIds(cloudData.likedSongIds);
          }
          if (cloudData.lastSyncedAt) {
            setLastSyncedTime(cloudData.lastSyncedAt);
          }
        }
      })
      .catch((err) => console.error('Cloud initial sync error:', err));
  }, []);

  // Audio element setup for remote MP3/AAC preview streams
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.preload = 'auto';
      audioRef.current = audio;

      const initialUrl = (currentSong && customAudioMap[currentSong.id]) || currentSong?.audioUrl;
      if (initialUrl) {
        audio.src = initialUrl;
      }

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      });

      audio.addEventListener('ended', () => {
        handleNextTrackRef.current();
      });

      audio.addEventListener('error', () => {
        console.warn('Audio element error:', audio.error?.message || audio.error?.code);
      });

      return () => {
        shouldPlayRef.current = false;
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              audio.pause();
              audio.src = '';
            })
            .catch(() => {});
        } else {
          audio.pause();
          audio.src = '';
        }
      };
    }
  }, []);

  // Listen to Web Audio synthesizer callbacks
  useEffect(() => {
    if (sundaAudio) {
      sundaAudio.onTimeUpdate((time) => {
        setCurrentTime(time);
      });
      sundaAudio.onEnded(() => {
        handleNextTrackRef.current();
      });
    }
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (sundaAudio) {
      sundaAudio.setVolume(volume);
    }
  }, [volume]);

  // Synchronize Cloud state automatically on playlist or like changes (debounced)
  const triggerCloudSync = useCallback(() => {
    setIsSyncing(true);
    const payload: CloudSyncData = {
      userId: 'default_user',
      lastSyncedAt: new Date().toISOString(),
      playlists,
      likedSongIds,
      recentlyPlayedIds: currentSong ? [currentSong.id] : [],
    };

    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLastSyncedTime(data.lastSyncedAt || new Date().toISOString());
        }
      })
      .catch((err) => console.error('Cloud auto-sync failed:', err))
      .finally(() => {
        setTimeout(() => setIsSyncing(false), 600);
      });
  }, [playlists, likedSongIds, currentSong]);

  useEffect(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      triggerCloudSync();
    }, 2000);
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [playlists, likedSongIds, triggerCloudSync]);

  // Safe Play helper preventing "The play() request was interrupted by a call to pause()."
  const safePlayAudio = () => {
    if (!audioRef.current) return;
    shouldPlayRef.current = true;
    const promise = audioRef.current.play();
    if (promise !== undefined) {
      playPromiseRef.current = promise;
      promise
        .then(() => {
          playPromiseRef.current = null;
          // If the user requested pause while the play promise was still resolving:
          if (!shouldPlayRef.current && audioRef.current) {
            audioRef.current.pause();
          }
        })
        .catch((err: unknown) => {
          playPromiseRef.current = null;
          // Benign error handling for quick pause or source switch
          const msg = err instanceof Error ? err.message : String(err);
          const isInterrupted =
            (err instanceof DOMException && (err.name === 'AbortError' || err.name === 'NotAllowedError')) ||
            msg.includes('interrupted by a call to pause') ||
            msg.includes('interrupted by a new load request');
          if (!isInterrupted) {
            console.warn('Audio playback notice:', err);
          }
        });
    }
  };

  // Safe Pause helper preventing interruption of in-flight play() promise
  const safePauseAudio = () => {
    shouldPlayRef.current = false;
    if (!audioRef.current) return;

    if (playPromiseRef.current) {
      // Wait for in-flight play() to resolve, then pause gracefully
      playPromiseRef.current
        .then(() => {
          if (!shouldPlayRef.current && audioRef.current) {
            audioRef.current.pause();
          }
        })
        .catch(() => {
          // Rejection handled in safePlayAudio catch
        });
    } else {
      audioRef.current.pause();
    }
  };

  // Play / Pause core router
  const handlePlaySong = (song: Song) => {
    const isSameSong = currentSong?.id === song.id;
    const targetAudioUrl = customAudioMap[song.id] || song.audioUrl;

    if (isSameSong) {
      if (isPlaying) {
        // Pause
        setIsPlaying(false);
        shouldPlayRef.current = false;
        if (targetAudioUrl && audioRef.current) {
          safePauseAudio();
        } else if (sundaAudio) {
          sundaAudio.pause();
        }
      } else {
        // Resume
        setIsPlaying(true);
        shouldPlayRef.current = true;
        if (targetAudioUrl && audioRef.current) {
          safePlayAudio();
        } else if (sundaAudio) {
          sundaAudio.resume();
        }
      }
      return;
    }

    // Switching to a new song
    safePauseAudio();
    if (sundaAudio) {
      sundaAudio.stop();
    }

    const updatedSong = targetAudioUrl ? { ...song, audioUrl: targetAudioUrl } : song;
    setCurrentSong(updatedSong);
    setCurrentTime(0);
    setDuration(song.duration || 100);
    setIsPlaying(true);
    shouldPlayRef.current = true;

    if (targetAudioUrl && audioRef.current) {
      const audio = audioRef.current;
      const startNewTrack = () => {
        try {
          audio.src = targetAudioUrl;
          audio.currentTime = 0;
          safePlayAudio();
        } catch {
          // ignore synchronous error
        }
      };

      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            if (shouldPlayRef.current) {
              startNewTrack();
            }
          })
          .catch(() => {
            if (shouldPlayRef.current) {
              startNewTrack();
            }
          });
      } else {
        startNewTrack();
      }
    } else if (sundaAudio) {
      const melodyKey = song.melodyKey || 'default';
      sundaAudio.playTrack(melodyKey, song.duration || 100, 0);
    }
  };

  const handlePlayPause = () => {
    if (!currentSong) return;
    handlePlaySong(currentSong);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    const activeAudioUrl = (currentSong && customAudioMap[currentSong.id]) || currentSong?.audioUrl;
    if (activeAudioUrl && audioRef.current) {
      audioRef.current.currentTime = time;
    } else if (sundaAudio) {
      sundaAudio.seek(time);
    }
  };

  const handleAudioUpdated = (songId: string, customUrl: string | null) => {
    if (customUrl) {
      setCustomAudioMap((prev) => ({ ...prev, [songId]: customUrl }));
      setCustomAudioIds((prev) => Array.from(new Set([...prev, songId])));
      if (currentSong?.id === songId) {
        handlePlaySong({ ...currentSong, audioUrl: customUrl });
      }
    } else {
      setCustomAudioMap((prev) => {
        const next = { ...prev };
        delete next[songId];
        return next;
      });
      setCustomAudioIds((prev) => prev.filter((id) => id !== songId));
      if (currentSong?.id === songId) {
        handlePlaySong({ ...currentSong, audioUrl: undefined });
      }
    }
  };

  const handleNextTrack = () => {
    if (isRepeat && currentSong) {
      handleSeek(0);
      if (currentSong.audioUrl && audioRef.current) {
        audioRef.current.currentTime = 0;
        safePlayAudio();
      } else if (sundaAudio) {
        sundaAudio.playTrack(currentSong.melodyKey || 'default', duration, 0);
      }
      return;
    }

    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue((prev) => prev.slice(1));
      handlePlaySong(nextSong);
    } else {
      // Loop over catalog
      const allTracks = ALL_SONGS;
      const currentIndex = allTracks.findIndex((s) => s.id === currentSong?.id);
      const nextIndex = (currentIndex + 1) % allTracks.length;
      handlePlaySong(allTracks[nextIndex]);
    }
  };

  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  });

  const handlePreviousTrack = () => {
    if (currentTime > 3) {
      handleSeek(0);
      return;
    }
    const allTracks = ALL_SONGS;
    const currentIndex = allTracks.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + allTracks.length) % allTracks.length;
    handlePlaySong(allTracks[prevIndex]);
  };

  const handleToggleLike = (songId: string) => {
    setLikedSongIds((prev) => {
      const exists = prev.includes(songId);
      if (exists) {
        return prev.filter((id) => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  const handleSaveLyricsOffline = (song: Song) => {
    saveLyricsOffline(song);
    const updated = getOfflineLyrics();
    setOfflineLyricsList(updated);
    setOfflineDownloadedIds(updated.map((x) => x.songId));
  };

  const handleDownloadLyricsAndFile = (song: Song) => {
    handleSaveLyricsOffline(song);
    const lrcContent = formatAsLRC(song);
    const sanitizedTitle = song.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    triggerFileDownload(`${sanitizedTitle}_lirik_sunda.lrc`, lrcContent);
  };

  // Playlist management
  const handleCreatePlaylist = (title: string, description: string, coverUrl: string) => {
    const newPl: Playlist = {
      id: `playlist-custom-${Date.now()}`,
      title,
      description,
      coverUrl,
      tracks: currentSong ? [currentSong] : [],
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    setPlaylists((prev) => [newPl, ...prev]);
    setSelectedPlaylistId(newPl.id);
    setCurrentView('playlist');
  };

  const handleAddToPlaylist = (song: Song, playlistId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          const exists = pl.tracks.some((t) => t.id === song.id);
          if (!exists) {
            return { ...pl, tracks: [...pl.tracks, song] };
          }
        }
        return pl;
      })
    );
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    setCurrentView('home');
    setSelectedPlaylistId(null);
  };

  const handlePlayAll = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      setQueue(playlist.tracks.slice(1));
      handlePlaySong(playlist.tracks[0]);
    }
  };

  // Navigation handlers
  const navigateTo = (view: string) => {
    setHistoryStack((prev) => [...prev, view]);
    setCurrentView(view);
  };

  const handleNavigateBack = () => {
    if (historyStack.length > 1) {
      const nextStack = [...historyStack];
      nextStack.pop();
      const prevView = nextStack[nextStack.length - 1];
      setHistoryStack(nextStack);
      setCurrentView(prevView);
    }
  };

  const handleSelectPlaylist = (id: string) => {
    setSelectedPlaylistId(id);
    navigateTo('playlist');
  };

  // Liked songs collection
  const allKnownSongs = [...ALL_SONGS, ...(currentSong ? [currentSong] : [])];
  const likedSongs = allKnownSongs.filter((s) => likedSongIds.includes(s.id));

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  if (!isMounted) {
    return <div className="min-h-screen bg-black" />;
  }

  if (!currentUser) {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  if (showGenreScreen) {
    return <GenreSelectionScreen user={currentUser} onComplete={handleGenresComplete} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white font-sans overflow-hidden relative">
      {/* Welcome Entrance Animation */}
      {showIntroAnimation && (
        <WelcomeIntroAnimation
          user={currentUser}
          genres={currentUser.favoriteGenres || []}
          onFinish={handleIntroFinish}
        />
      )}

      {/* Top Application Area (Sidebar + Center Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Spotify Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={(v) => {
            setSelectedPlaylistId(null);
            navigateTo(v);
          }}
          playlists={playlists}
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={handleSelectPlaylist}
          onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
          likedSongsCount={likedSongIds.length}
          offlineLyricsCount={offlineLyricsList.length}
          isSyncing={isSyncing}
          onTriggerSync={triggerCloudSync}
          lastSyncedTime={lastSyncedTime}
          lang={lang}
        />

        {/* Center Main Stage */}
        <main className="flex-1 flex flex-col bg-neutral-950 overflow-hidden relative">
          {/* Top Bar */}
          <TopNav
            currentView={currentView}
            lang={lang}
            onToggleLang={() => setLang(lang === 'id' ? 'en' : 'id')}
            isSyncing={isSyncing}
            onTriggerSync={triggerCloudSync}
            currentSong={currentSong}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onNext={handleNextTrack}
            onPrevious={handlePreviousTrack}
            onSeek={handleSeek}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          {/* View Routing */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {currentView === 'home' && (
              <HomeFeed
                playlists={playlists}
                onSelectPlaylist={handleSelectPlaylist}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                likedSongIds={likedSongIds}
                onSelectLikedSongs={() => navigateTo('liked')}
                onOpenOfflineLyrics={() => navigateTo('offline-lyrics')}
                lang={lang}
              />
            )}

            {currentView === 'search' && (
              <SearchPage
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                likedSongIds={likedSongIds}
                onToggleLike={handleToggleLike}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
                offlineDownloadedIds={offlineDownloadedIds}
                onDownloadLyricsOffline={handleDownloadLyricsAndFile}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                lang={lang}
              />
            )}

            {currentView === 'playlist' && selectedPlaylist && (
              <PlaylistDetail
                playlist={selectedPlaylist}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                onPlayAll={handlePlayAll}
                likedSongIds={likedSongIds}
                onToggleLike={handleToggleLike}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
                offlineDownloadedIds={offlineDownloadedIds}
                onDownloadLyricsOffline={handleDownloadLyricsAndFile}
                onDeletePlaylist={handleDeletePlaylist}
                lang={lang}
              />
            )}

            {currentView === 'liked' && (
              <LikedSongsView
                likedSongs={likedSongs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                onPlayAll={() => {
                  if (likedSongs.length > 0) {
                    setQueue(likedSongs.slice(1));
                    handlePlaySong(likedSongs[0]);
                  }
                }}
                likedSongIds={likedSongIds}
                onToggleLike={handleToggleLike}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
                offlineDownloadedIds={offlineDownloadedIds}
                onDownloadLyricsOffline={handleDownloadLyricsAndFile}
                lang={lang}
              />
            )}

            {currentView === 'offline-lyrics' && (
              <OfflineLyricsView
                offlineLyrics={offlineLyricsList}
                onRefreshOfflineList={() => {
                  const updated = getOfflineLyrics();
                  setOfflineLyricsList(updated);
                  setOfflineDownloadedIds(updated.map((x) => x.songId));
                }}
                onPlaySong={handlePlaySong}
                onOpenLyricsModal={(song) => {
                  setCurrentSong(song);
                  setIsLyricsOpen(true);
                }}
                lang={lang}
              />
            )}
          </div>
        </main>
      </div>

      {/* Spotify Bottom Player Bar (Desktop/Tablet) */}
      <PlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={handlePlayPause}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={setVolume}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        isRepeat={isRepeat}
        onToggleRepeat={() => setIsRepeat(!isRepeat)}
        isLiked={currentSong ? likedSongIds.includes(currentSong.id) : false}
        onToggleLike={() => currentSong && handleToggleLike(currentSong.id)}
        isLyricsOpen={isLyricsOpen}
        onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
        isQueueOpen={isQueueOpen}
        onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
        isOfflineLyricDownloaded={
          currentSong ? offlineDownloadedIds.includes(currentSong.id) : false
        }
        onDownloadLyricsOffline={() =>
          currentSong && handleDownloadLyricsAndFile(currentSong)
        }
        onExpandNowPlaying={() => setIsNowPlayingOpen(true)}
        lang={lang}
      />

      {/* Mobile Bottom Navigation & Mini Player */}
      <MobileNav
        currentView={currentView}
        setCurrentView={(v) => {
          setSelectedPlaylistId(null);
          navigateTo(v);
        }}
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onOpenLyrics={() => setIsLyricsOpen(true)}
        isLiked={currentSong ? likedSongIds.includes(currentSong.id) : false}
        onToggleLike={() => currentSong && handleToggleLike(currentSong.id)}
        onExpandNowPlaying={() => setIsNowPlayingOpen(true)}
        lang={lang}
      />

      {/* Interactive Modals & Drawers */}
      <LyricsModal
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        currentSong={currentSong}
        currentTime={currentTime}
        onSeek={handleSeek}
        isOfflineLyricDownloaded={
          currentSong ? offlineDownloadedIds.includes(currentSong.id) : false
        }
        onSaveOffline={() => currentSong && handleSaveLyricsOffline(currentSong)}
        lang={lang}
      />

      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentSong={currentSong}
        queue={queue}
        onPlaySong={handlePlaySong}
        onClearQueue={() => setQueue([])}
        lang={lang}
      />

      <NowPlayingDrawer
        isOpen={isNowPlayingOpen}
        onClose={() => setIsNowPlayingOpen(false)}
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={handlePlayPause}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        onSeek={handleSeek}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        isRepeat={isRepeat}
        onToggleRepeat={() => setIsRepeat(!isRepeat)}
        isLiked={currentSong ? likedSongIds.includes(currentSong.id) : false}
        onToggleLike={() => currentSong && handleToggleLike(currentSong.id)}
        onOpenLyrics={() => setIsLyricsOpen(true)}
        isOfflineLyricDownloaded={
          currentSong ? offlineDownloadedIds.includes(currentSong.id) : false
        }
        onDownloadLyricsOffline={() =>
          currentSong && handleDownloadLyricsAndFile(currentSong)
        }
        lang={lang}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreate={handleCreatePlaylist}
        lang={lang}
      />

      <ImportAudioModal
        isOpen={isImportAudioOpen}
        onClose={() => setIsImportAudioOpen(false)}
        songs={SUNDA_SONGS}
        customAudioIds={customAudioIds}
        onAudioUpdated={handleAudioUpdated}
        lang={lang}
      />
    </div>
  );
}
