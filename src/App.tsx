import React, { useState, useEffect } from 'react';
import { HeaderBanner } from './components/HeaderBanner';
import { HeroSection } from './components/HeroSection';
import { InteractiveCake } from './components/InteractiveCake';
import { PoemAndLetter } from './components/PoemAndLetter';
import { PhotoMemeGallery } from './components/PhotoMemeGallery';
import { WhySpecialCards } from './components/WhySpecialCards';
import { VirtualGifts } from './components/VirtualGifts';
import { ComplimentGenerator } from './components/ComplimentGenerator';
import { WishWall } from './components/WishWall';
import { FloatingDecorations } from './components/FloatingDecorations';
import { YouTubeMusicPlayer } from './components/YouTubeMusicPlayer';
import { SiteTextEditorModal } from './components/SiteTextEditorModal';
import { SiteContent } from './types';
import { DEFAULT_SITE_CONTENT } from './data/initialData';
import { subscribeSiteContent } from './services/firestoreService';
import { Heart, Sparkles, Stars, Cake, Pencil } from 'lucide-react';
import { fireConfettiCannon, fireFireworks } from './utils/confetti';
import { playSparkleSound, playFanfareSound } from './utils/audio';

export default function App() {
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSiteEditorOpen, setIsSiteEditorOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSiteContent((content) => {
      if (content) {
        setSiteContent(content);
      }
    });
    return () => unsubscribe();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenEditor = () => {
    setIsEditorOpen(true);
    scrollToSection('section-poem');
  };

  const handleGrandCelebration = () => {
    playFanfareSound();
    playSparkleSound();
    fireConfettiCannon();
    fireFireworks();
  };

  return (
    <div className="min-h-screen bg-pink-50 text-slate-800 flex flex-col selection:bg-pink-300 selection:text-pink-950 font-['Quicksand',sans-serif]">
      {/* Top sticky navigation bar */}
      <HeaderBanner
        onOpenEditor={handleOpenEditor}
        onOpenSiteTextEditor={() => setIsSiteEditorOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Celebration Banner & Poppable Balloons */}
        <HeroSection
          siteContent={siteContent}
          onOpenEditModal={() => setIsSiteEditorOpen(true)}
          onScrollToCake={() => scrollToSection('section-cake')}
          onScrollToPoem={() => scrollToSection('section-poem')}
          onScrollToGallery={() => scrollToSection('section-gallery')}
          onScrollToGifts={() => scrollToSection('section-gifts')}
        />

        {/* 2. Interactive Birthday Cake with Blowable Candles */}
        <InteractiveCake
          siteContent={siteContent}
          onOpenEditModal={() => setIsSiteEditorOpen(true)}
        />

        {/* 3. Central Touching Poem & Customizable Letter (Bisa Diedit & Sync Cloud) */}
        <PoemAndLetter
          isEditorOpenExternally={isEditorOpen}
          onToggleExternalEditor={() => setIsEditorOpen(false)}
        />

        {/* 4. Memes, Cute Cats & Photo Gallery */}
        <PhotoMemeGallery
          siteContent={siteContent}
          onOpenEditSiteText={() => setIsSiteEditorOpen(true)}
        />

        {/* 5. Reasons Why Jovanka is Special */}
        <WhySpecialCards />

        {/* 6. 3 Mysterious Virtual Gifts */}
        <VirtualGifts />

        {/* 7. Compliment & Mood Booster Dispenser */}
        <ComplimentGenerator />

        {/* 8. Wish Wall & Guestbook */}
        <WishWall />

        {/* Grand Finale Call to Action */}
        <section className="py-16 px-4 bg-gradient-to-t from-pink-200/80 via-pink-100 to-white text-center relative overflow-hidden group">
          <div className="max-w-3xl mx-auto relative">
            {/* Quick edit button for Grand Finale */}
            <button
              onClick={() => setIsSiteEditorOpen(true)}
              className="opacity-0 group-hover:opacity-100 absolute -top-4 right-2 p-1.5 bg-white/90 rounded-full shadow-md border border-pink-300 text-pink-700 hover:scale-110 transition-all cursor-pointer text-xs font-bold flex items-center gap-1"
              title="Edit Teks Penutup"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Penutup</span>
            </button>

            <div className="text-4xl sm:text-5xl mb-4">👑 🌸 🎂</div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-pink-950 font-['Playfair_Display',serif] mb-3">
              {siteContent.grandFinaleTitle}
            </h3>
            <p className="text-slate-700 text-sm sm:text-base max-w-xl mx-auto font-medium mb-6 font-['Caveat',cursive] text-xl sm:text-2xl leading-relaxed">
              &ldquo;{siteContent.grandFinaleQuote}&rdquo;
            </p>
            <button
              id="btn-grand-celebration"
              onClick={handleGrandCelebration}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-sm sm:text-base shadow-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <Sparkles className="w-5 h-5" />
              <span>{siteContent.grandFinaleButtonText}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Floating Interactive Cat Mascot & Sparkles */}
      <FloatingDecorations />

      {/* Special YouTube Music Player Starting at 0:19 */}
      <YouTubeMusicPlayer videoId="cE3JOynhufs" startSeconds={19} />

      {/* Site-wide Text Editor Modal */}
      <SiteTextEditorModal
        isOpen={isSiteEditorOpen}
        onClose={() => setIsSiteEditorOpen(false)}
        siteContent={siteContent}
      />

      {/* Footer */}
      <footer className="bg-pink-900 text-pink-100 py-8 px-4 text-center text-xs border-t border-pink-700 group relative">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🌸</span>
            <span className="font-bold font-['Playfair_Display',serif] text-sm">
              {siteContent.footerTitle}
            </span>
          </div>
          <div className="flex items-center gap-1 text-pink-200">
            <span>{siteContent.footerSubtitle}</span>
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 inline mx-0.5" />
            <button
              onClick={() => setIsSiteEditorOpen(true)}
              className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-[10px] bg-pink-800 hover:bg-pink-700 text-pink-200 rounded px-2 transition-opacity"
            >
              ✏️ Edit Teks
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

