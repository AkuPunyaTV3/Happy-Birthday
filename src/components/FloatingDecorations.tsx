import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { playCuteMeow, playSparkleSound } from '../utils/audio';
import { fireHeartConfetti } from '../utils/confetti';

const CAT_MESSAGES = [
  'Selamat ulang tahun Kak Jovanka!🌸',
  'Semoga Jovanka auranya makin bersinar! ✨',
  'Makin Dewasa & Makin Cantik',
  'Semoga semua cita-cita tercapai! 💖',
];

export function FloatingDecorations() {
  const [bubbleText, setBubbleText] = useState('Klik aku! ~ 🌸');
  const [messageIdx, setMessageIdx] = useState(0);

  const handleCatClick = () => {
    playCuteMeow();
    playSparkleSound();
    fireHeartConfetti();
    const nextIdx = (messageIdx + 1) % CAT_MESSAGES.length;
    setMessageIdx(nextIdx);
    setBubbleText(CAT_MESSAGES[nextIdx]);
  };

  return (
    <>
      {/* Interactive Mascot Cat in bottom right corner */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end pointer-events-auto select-none">
        {/* Speech Bubble */}
        <div
          onClick={handleCatClick}
          className="bg-white border-2 border-pink-300 px-3 py-1.5 rounded-2xl rounded-br-xs shadow-lg text-xs font-bold text-pink-900 mb-1 max-w-[200px] text-center animate-bounce cursor-pointer hover:bg-pink-50"
        >
          {bubbleText}
        </div>

        {/* Cat Avatar Button */}
        <button
          id="btn-cat-mascot"
          onClick={handleCatClick}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-pink-300 via-rose-300 to-pink-200 border-2 border-white shadow-xl flex items-center justify-center text-2xl sm:text-3xl hover:scale-110 active:scale-95 transition-transform cursor-pointer relative group"
          title="Klik si Empus untuk meow & ucapan! 🐾"
        >
          <span className="group-hover:rotate-12 transition-transform">🐱</span>
          <span className="absolute -top-1 -right-1 text-sm animate-ping">🌸</span>
          <span className="absolute -bottom-1 -left-1 text-xs">👑</span>
        </button>
      </div>

      {/* Floating subtle ambient particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-10 text-pink-400 text-xl animate-pulse">🌸</div>
        <div className="absolute top-2/3 left-1/5 text-pink-300 text-lg animate-pulse" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute top-1/3 right-12 text-rose-400 text-2xl animate-pulse" style={{ animationDelay: '1.5s' }}>💖</div>
        <div className="absolute top-3/4 right-1/4 text-pink-300 text-sm animate-pulse" style={{ animationDelay: '2s' }}>🎀</div>
      </div>
    </>
  );
}
