import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Disc3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tv,
  Music,
} from 'lucide-react';
import { fireHeartConfetti } from '../utils/confetti';

interface YouTubeMusicPlayerProps {
  videoId?: string;
  startSeconds?: number;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubeMusicPlayer({
  videoId = 'cE3JOynhufs',
  startSeconds = 19,
}: YouTubeMusicPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPromptBanner, setShowPromptBanner] = useState(true);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        try {
          playerRef.current = new window.YT.Player('youtube-audio-engine', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
              playsinline: 1,
              start: startSeconds,
              controls: 1,
              disablekb: 0,
              fs: 1,
              modestbranding: 1,
              rel: 0,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                setIsReady(true);
                try {
                  event.target.seekTo(startSeconds, true);
                } catch {
                  // ignore
                }
              },
              onStateChange: (event: any) => {
                // 1 = playing, 2 = paused, 0 = ended
                if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2 || event.data === 0) {
                  setIsPlaying(false);
                }
              },
            },
          });
        } catch (e) {
          console.warn('YouTube Player initialization:', e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      // Keep instance intact across renders
    };
  }, [videoId, startSeconds]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowPromptBanner(false);
    if (!playerRef.current || !isReady) {
      return;
    }

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        const currentTime = playerRef.current.getCurrentTime?.() || 0;
        if (currentTime < startSeconds || currentTime === 0) {
          playerRef.current.seekTo(startSeconds, true);
        }
        playerRef.current.playVideo();
        setIsPlaying(true);
        fireHeartConfetti();
      }
    } catch (err) {
      console.error('Error toggling YouTube player:', err);
    }
  };

  const handleRestartFromTimestamp = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!playerRef.current || !isReady) return;
    try {
      playerRef.current.seekTo(startSeconds, true);
      playerRef.current.playVideo();
      setIsPlaying(true);
      fireHeartConfetti();
    } catch (err) {
      console.error('Error seeking to timestamp:', err);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!playerRef.current || !isReady) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (err) {
      console.error('Error muting/unmuting:', err);
    }
  };

  const toggleVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsVideoVisible((prev) => !prev);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const handleMinimize = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMinimized(true);
  };

  const handleExpand = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMinimized(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 transition-all duration-300 font-sans select-none">
      {/* Floating Prompt Pill (if not playing yet and not minimized) */}
      {showPromptBanner && !isPlaying && !isMinimized && (
        <div className="mb-2 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce max-w-[300px] sm:max-w-xs border border-pink-300/60">
          <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
          <span className="flex-1 leading-tight text-[11px]">
            Ada lagu spesial Jovanka (Mulai di 0:19) 🎵
          </span>
          <button
            onClick={togglePlay}
            className="px-2.5 py-1 rounded-full bg-white text-pink-700 font-extrabold text-[11px] hover:bg-pink-100 active:scale-95 shadow-xs cursor-pointer shrink-0"
          >
            Putar ▶
          </button>
        </div>
      )}

      {/* MINIMIZED FLOATING PILL */}
      {isMinimized && (
        <div
          onClick={handleExpand}
          className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-pink-300 p-1.5 pr-3 hover:shadow-pink-200/50 hover:scale-105 transition-all cursor-pointer group animate-fadeIn"
          title="Klik untuk membuka pemutar musik penuh"
        >
          {/* Rotating Vinyl Icon */}
          <div
            onClick={togglePlay}
            className={`w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-sm shrink-0 ${
              isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
            }`}
            title={isPlaying ? 'Jeda Musik' : 'Putar Musik (0:19)'}
          >
            <Disc3 className="w-5 h-5" />
          </div>

          <div className="flex flex-col text-left pr-1">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 leading-tight">
              <span>Lagu Jovanka</span>
              {isPlaying && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              )}
            </span>
            <span className="text-[10px] text-pink-600 font-semibold">0:19 ⏱️</span>
          </div>

          {/* Quick Play/Pause on mini pill */}
          <button
            onClick={togglePlay}
            className="w-7 h-7 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Expand button */}
          <button
            onClick={handleExpand}
            className="p-1 rounded-full text-slate-400 hover:text-pink-600 transition-colors cursor-pointer"
            title="Buka Player Penuh"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FULL / EXPANDED FLOATING PLAYER */}
      <div
        className={`${
          isMinimized ? 'hidden' : 'block'
        } bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-pink-300 p-2.5 sm:p-3 w-[310px] sm:w-[360px] transition-all`}
      >
        {/* Top Header Bar: Title, Video Toggle, and Minimize Button */}
        <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-pink-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <p className="text-xs font-bold text-slate-800 truncate font-['Playfair_Display',serif]">
              Lagu Spesial Jovanka 🌸
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Toggle Video Button */}
            <button
              onClick={toggleVideo}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                isVideoVisible
                  ? 'bg-pink-600 text-white shadow-2xs'
                  : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
              }`}
              title={isVideoVisible ? 'Sembunyikan Tampilan Video' : 'Tampilkan Video YouTube'}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{isVideoVisible ? 'Tutup Video' : 'Putar Video'}</span>
            </button>

            {/* Minimize Music Player Button */}
            <button
              onClick={handleMinimize}
              className="p-1 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
              title="Minimize Music Player"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Frame (Never unmounted from DOM to preserve audio & player instance) */}
        <div
          className={`w-full overflow-hidden rounded-xl bg-slate-950 transition-all duration-300 ${
            isVideoVisible
              ? 'h-44 sm:h-48 mb-2.5 opacity-100 shadow-inner ring-1 ring-pink-200'
              : 'h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div id="youtube-audio-engine" className="w-full h-full" />
        </div>

        {/* Audio Controls Bar */}
        <div className="flex items-center gap-2.5">
          {/* Rotating Vinyl Icon */}
          <div
            onClick={togglePlay}
            className={`relative w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md cursor-pointer shrink-0 ${
              isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
            }`}
            title={isPlaying ? 'Jeda Musik' : 'Putar Musik (Detik 0:19)'}
          >
            <Disc3 className="w-5 h-5" />
            <div className="absolute inset-0 rounded-full border border-white/40" />
            <div className="w-2.5 h-2.5 bg-pink-100 rounded-full z-10" />
          </div>

          {/* Timings & Equalizer */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-pink-600 font-bold">
                Mulai: 0:19 ⏱️
              </span>
              {/* Equalizer animation when playing */}
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-1 bg-pink-500 rounded-full animate-[bounce_0.6s_infinite_100ms] h-2" />
                  <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.6s_infinite_250ms] h-3" />
                  <span className="w-1 bg-pink-400 rounded-full animate-[bounce_0.6s_infinite_400ms] h-1.5" />
                  <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_150ms] h-2.5" />
                </div>
              ) : (
                <span className="text-[10px] text-slate-400">Siap diputar</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Play/Pause Button */}
            <button
              id="btn-yt-play-toggle"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center shadow-sm active:scale-90 transition-all cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play dari 0:19'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Restart at 0:19 Button */}
            <button
              id="btn-yt-restart"
              onClick={handleRestartFromTimestamp}
              className="w-7 h-7 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title="Ulangi dari Detik 0:19"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              className="w-7 h-7 rounded-full bg-pink-50 hover:bg-pink-100 text-slate-600 hover:text-pink-600 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Open YouTube Direct Link */}
            <a
              href={`https://www.youtube.com/watch?v=${videoId}&t=${startSeconds}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-pink-50 hover:bg-pink-100 text-slate-400 hover:text-pink-600 flex items-center justify-center active:scale-90 transition-all"
              title="Buka di YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
