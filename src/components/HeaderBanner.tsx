import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Heart, Edit3, Music } from 'lucide-react';
import {
  setSoundMuted,
  getSoundMuted,
  startBackgroundMelody,
  stopBackgroundMelody,
  isBgmActive,
  playSparkleSound,
} from '../utils/audio';
import { fireConfettiCannon } from '../utils/confetti';

interface HeaderBannerProps {
  onOpenEditor: () => void;
  onOpenSiteTextEditor?: () => void;
}

export function HeaderBanner({ onOpenEditor, onOpenSiteTextEditor }: HeaderBannerProps) {
  const [muted, setMuted] = useState(false);
  const [bgmOn, setBgmOn] = useState(false);

  useEffect(() => {
    setMuted(getSoundMuted());
  }, []);

  const toggleMute = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    setSoundMuted(nextMute);
    if (nextMute) {
      setBgmOn(false);
    }
  };

  const toggleBgm = () => {
    // Check if YouTube play button exists and trigger it for seamless experience
    const ytPlayBtn = document.getElementById('btn-yt-play-toggle');
    if (ytPlayBtn) {
      ytPlayBtn.click();
      setBgmOn(!bgmOn);
      return;
    }

    if (muted) {
      setMuted(false);
      setSoundMuted(false);
    }
    if (isBgmActive()) {
      stopBackgroundMelody();
      setBgmOn(false);
    } else {
      startBackgroundMelody();
      setBgmOn(true);
      playSparkleSound();
    }
  };

  const handleConfetti = () => {
    playSparkleSound();
    fireConfettiCannon();
  };

  return (
    <header className="sticky top-0 z-40 bg-pink-100/95 backdrop-blur-md border-b border-pink-200 shadow-sm py-2.5 px-4 transition-all">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left branding / tag */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-500 text-white shadow-sm animate-bounce text-sm">
            👑
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-pink-900 tracking-tight font-['Playfair_Display',serif]">
                Jovanka&apos;s Birthday Celebration ✨
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloud DB Sync
              </span>
            </div>
            <p className="text-xs text-pink-600 font-medium hidden sm:block">
              Spesial untuk perempuan luar biasa & paling berharga
            </p>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          {/* Confetti button */}
          <button
            id="btn-header-confetti"
            onClick={handleConfetti}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-semibold shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
            title="Tembakkan Konfeti!"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Rayakan! 🎉</span>
          </button>

          {/* Edit All Site Texts */}
          {onOpenSiteTextEditor && (
            <button
              id="btn-header-site-text-editor"
              onClick={onOpenSiteTextEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-pink-50 text-pink-700 border border-pink-300 text-xs font-bold shadow-xs hover:shadow active:scale-95 transition-all cursor-pointer"
              title="Edit Semua Teks Website (Hero, Judul, Doa, Footer)"
            >
              <Edit3 className="w-3.5 h-3.5 text-pink-500" />
              <span>✏️ Edit Teks Web</span>
            </button>
          )}

          {/* Edit Poem & Ucapan shortcut */}
          <button
            id="btn-header-editor"
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 text-xs font-semibold shadow-xs hover:shadow active:scale-95 transition-all cursor-pointer"
            title="Edit Puisi & Surat"
          >
            <Heart className="w-3.5 h-3.5 text-pink-500" />
            <span className="hidden sm:inline">Surat/Puisi</span>
          </button>

          {/* Music Play / Stop */}
          <button
            id="btn-header-bgm"
            onClick={toggleBgm}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-xs transition-all cursor-pointer ${
              bgmOn
                ? 'bg-pink-600 text-white border-pink-600 animate-pulse'
                : 'bg-white text-pink-700 border-pink-300 hover:bg-pink-50'
            }`}
            title="Musik Lagu Ulang Tahun"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{bgmOn ? 'Lagu Aktif 🎶' : 'Putar Lagu 🎵'}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="btn-header-sound"
            onClick={toggleMute}
            className="p-1.5 rounded-full bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 active:scale-95 transition-all cursor-pointer"
            title={muted ? 'Suara Dinonaktifkan' : 'Suara Aktif'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-pink-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
