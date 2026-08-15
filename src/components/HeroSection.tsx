import { useState } from 'react';
import { Sparkles, Heart, Gift, Cake, BookOpen, Image as ImageIcon, Pencil, Stars, Music } from 'lucide-react';
import { SiteContent } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/initialData';
import { playPopSound, playSparkleSound, playCuteMeow } from '../utils/audio';
import { fireConfettiCannon, fireHeartConfetti } from '../utils/confetti';

interface Balloon {
  id: number;
  color: string;
  label: string;
  left: string;
  delay: string;
  popped: boolean;
}

interface HeroSectionProps {
  siteContent?: SiteContent;
  onOpenEditModal?: () => void;
  onScrollToCake: () => void;
  onScrollToPoem: () => void;
  onScrollToGallery: () => void;
  onScrollToGifts: () => void;
}

const INITIAL_BALLOONS: Balloon[] = [
  { id: 1, color: 'bg-pink-400', label: '🌸 Cantik', left: '8%', delay: '0s', popped: false },
  { id: 2, color: 'bg-rose-400', label: '💖 Tulus', left: '22%', delay: '1.2s', popped: false },
  { id: 3, color: 'bg-amber-300', label: '✨ Kuat', left: '38%', delay: '0.6s', popped: false },
  { id: 4, color: 'bg-purple-300', label: '👑 Ratu', left: '60%', delay: '1.8s', popped: false },
  { id: 5, color: 'bg-pink-300', label: '🌟 Istimewa', left: '76%', delay: '0.3s', popped: false },
  { id: 6, color: 'bg-rose-300', label: '🐱 Gemoy', left: '88%', delay: '1.5s', popped: false },
];

export function HeroSection({
  siteContent = DEFAULT_SITE_CONTENT,
  onOpenEditModal,
  onScrollToCake,
  onScrollToPoem,
  onScrollToGallery,
  onScrollToGifts,
}: HeroSectionProps) {
  const [balloons, setBalloons] = useState<Balloon[]>(INITIAL_BALLOONS);
  const [popCount, setPopCount] = useState(0);

  const handlePopBalloon = (id: number) => {
    playPopSound();
    fireConfettiCannon();
    setBalloons((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );
    setPopCount((c) => c + 1);
  };

  const handleResetBalloons = () => {
    playSparkleSound();
    setBalloons((prev) => prev.map((b) => ({ ...b, popped: false })));
  };

  const handleSpecialLoveClick = () => {
    playCuteMeow();
    fireHeartConfetti();
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 px-4 bg-gradient-to-b from-pink-100 via-pink-50 to-white">
      {/* Poppable floating balloons in background */}
      <div className="absolute inset-x-0 top-0 h-48 pointer-events-none overflow-hidden max-w-6xl mx-auto">
        {balloons.map((balloon) =>
          !balloon.popped ? (
            <div
              key={balloon.id}
              style={{ left: balloon.left, animationDelay: balloon.delay }}
              className="absolute top-2 pointer-events-auto cursor-pointer animate-bounce group transition-transform hover:scale-110"
              onClick={() => handlePopBalloon(balloon.id)}
              title="Klik untuk meletuskan balon! 💥"
            >
              <div
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-full ${balloon.color} shadow-md flex items-center justify-center text-[10px] sm:text-xs font-bold text-white relative group-hover:brightness-105`}
              >
                {/* Light glare */}
                <div className="absolute top-1.5 left-2 w-2.5 h-3.5 bg-white/40 rounded-full rotate-[-30deg]" />
                <span className="drop-shadow-xs px-1 text-center leading-tight">
                  {balloon.label}
                </span>
                {/* Balloon knot and string */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-xs rotate-45 bg-current opacity-80" />
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-pink-300/80" />
              </div>
            </div>
          ) : null
        )}
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10 pt-8 sm:pt-12">
        {/* Top celebratory pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-200/80 text-pink-800 text-xs sm:text-sm font-semibold border border-pink-300 shadow-xs mb-4 animate-pulse group relative">
          <Sparkles className="w-4 h-4 text-pink-600 animate-spin" />
          <span>{siteContent.heroCelebrationPill}</span>
          <Stars className="w-4 h-4 text-amber-500" />
          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="opacity-0 group-hover:opacity-100 ml-1.5 p-1 bg-white/80 rounded-full hover:bg-white text-pink-700 transition-opacity cursor-pointer"
              title="Edit teks sambutan"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Profile Avatar / Photo Frame */}
        {siteContent.heroPhotoUrl && (
          <div className="flex justify-center mb-5">
            <div className="relative group cursor-pointer" onClick={onOpenEditModal}>
              {/* Crown on top */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl sm:text-4xl filter drop-shadow-md animate-bounce z-20">
                👑
              </div>
              {/* Glowing ring */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-pink-400 via-rose-400 to-amber-300 shadow-xl shadow-pink-300/50 relative">
                <img
                  src={siteContent.heroPhotoUrl}
                  alt={siteContent.heroName}
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-inner group-hover:scale-105 transition-transform duration-300"
                />
                {/* Floating sparkles */}
                <div className="absolute -bottom-2 right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-md border border-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{siteContent.heroPhotoBadge || 'Queen Jovanka ✨'}</span>
                </div>
              </div>
              {/* Hover quick edit button */}
              {onOpenEditModal && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold gap-1 backdrop-blur-xs">
                  <Pencil className="w-4 h-4" />
                  <span>Ganti Foto</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Big title */}
        <div className="relative group inline-block">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-800 font-['Playfair_Display',serif] tracking-tight leading-tight mb-4">
            {siteContent.heroGreetingPrefix} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 drop-shadow-xs font-['Dancing_Script',cursive] text-4xl sm:text-6xl md:text-7xl">
              {siteContent.heroName}
            </span>
          </h2>
          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-6 p-1.5 bg-white rounded-full shadow-md border border-pink-300 text-pink-600 hover:scale-110 transition-all cursor-pointer"
              title="Edit Nama & Judul Ulang Tahun"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Deep sincere subtitle */}
        <div className="max-w-2xl mx-auto mb-6">
          <div
            onClick={handleSpecialLoveClick}
            className="p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-pink-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          >
            {onOpenEditModal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditModal();
                }}
                className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1.5 bg-pink-100 rounded-full text-pink-700 hover:bg-pink-200 transition-opacity cursor-pointer z-10"
                title="Edit Kutipan Kata Sambutan"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="absolute -right-4 -bottom-4 text-5xl opacity-10 group-hover:scale-125 transition-transform">
              🌸
            </div>
            <p className="text-sm sm:text-base text-pink-900 font-medium leading-relaxed font-['Caveat',cursive] text-lg sm:text-xl">
              &ldquo;{siteContent.heroQuote}&rdquo;
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-rose-500">
              <Heart className="w-4 h-4 fill-rose-400 animate-ping" />
              <span>(Klik kotak ini untuk mengirimkan sejuta doa & cinta kasih!)</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center">
            <button
              onClick={() => {
                const btn = document.getElementById('btn-yt-play-toggle');
                if (btn) btn.click();
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer border border-pink-300/40"
            >
              <Music className="w-4 h-4 animate-bounce" />
              <span>Putar Lagu Spesial Jovanka (Mulai di 0:19) 🎵</span>
            </button>
          </div>
        </div>

        {/* Popped balloons counter notice */}
        {popCount > 0 && (
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="text-xs font-medium text-pink-600 bg-pink-100 px-3 py-1 rounded-full border border-pink-200">
              🎈 Kamu sudah meletuskan {popCount} balon kejutan!
            </span>
            {balloons.every((b) => b.popped) && (
              <button
                onClick={handleResetBalloons}
                className="text-xs font-bold text-pink-700 underline hover:text-pink-900 cursor-pointer"
              >
                Tiup Ulang Balon 🔄
              </button>
            )}
          </div>
        )}

        {/* Quick action grid buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <button
            id="btn-nav-cake"
            onClick={onScrollToCake}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white border border-pink-200 hover:border-pink-400 hover:bg-pink-50/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform mb-2">
              <Cake className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">Tiup Lilin</span>
            <span className="text-[10px] text-pink-500 font-medium">Make a wish 🕯️</span>
          </button>

          <button
            id="btn-nav-poem"
            onClick={onScrollToPoem}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white border border-pink-200 hover:border-pink-400 hover:bg-pink-50/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">Surat & Puisi</span>
            <span className="text-[10px] text-rose-500 font-medium">Bikin haru & doa 💌</span>
          </button>

          <button
            id="btn-nav-gallery"
            onClick={onScrollToGallery}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white border border-pink-200 hover:border-pink-400 hover:bg-pink-50/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform mb-2">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">Galeri & Meme</span>
            <span className="text-[10px] text-amber-600 font-medium">Foto & Meme 📸</span>
          </button>

          <button
            id="btn-nav-gifts"
            onClick={onScrollToGifts}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white border border-pink-200 hover:border-pink-400 hover:bg-pink-50/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform mb-2">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">Buka Kado</span>
            <span className="text-[10px] text-purple-600 font-medium">3 Kejutan manis 🎁</span>
          </button>
        </div>
      </div>
    </section>
  );
}
