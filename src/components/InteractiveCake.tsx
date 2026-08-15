import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Mic, MicOff, RefreshCw, Heart, Award, Pencil } from 'lucide-react';
import { SiteContent } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/initialData';
import { playBlowSound, playFanfareSound, playSparkleSound, playHappyBirthdayTune } from '../utils/audio';
import { fireConfettiCannon, fireFireworks } from '../utils/confetti';

interface InteractiveCakeProps {
  siteContent?: SiteContent;
  onOpenEditModal?: () => void;
  onWishCompleted?: (wish: string) => void;
}

export function InteractiveCake({
  siteContent = DEFAULT_SITE_CONTENT,
  onOpenEditModal,
  onWishCompleted,
}: InteractiveCakeProps) {
  const [candlesLit, setCandlesLit] = useState(true);
  const [isBlowing, setIsBlowing] = useState(false);
  const [userWish, setUserWish] = useState('');
  const [wishSaved, setWishSaved] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const audioStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const candleCount = 5;

  const handleBlowCandles = () => {
    if (!candlesLit) return;
    setIsBlowing(true);
    playBlowSound();

    setTimeout(() => {
      setCandlesLit(false);
      setIsBlowing(false);
      playFanfareSound();
      playHappyBirthdayTune();
      fireConfettiCannon();
      fireFireworks();
      if (userWish.trim()) {
        setWishSaved(true);
        if (onWishCompleted) {
          onWishCompleted(userWish);
        }
      }
    }, 400);
  };

  const handleRelight = () => {
    playSparkleSound();
    setCandlesLit(true);
    setWishSaved(false);
  };

  // Microphone detection for real candle blowing!
  const toggleMic = async () => {
    if (micActive) {
      // Turn off
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
        audioStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setMicActive(false);
      return;
    }

    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setMicActive(true);

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;

        // If high volume detected (blow puff into mic)
        if (avg > 45 && candlesLit) {
          handleBlowCandles();
        } else {
          animFrameRef.current = requestAnimationFrame(checkVolume);
        }
      };

      checkVolume();
    } catch {
      setMicError('Akses mikrofon tidak diizinkan. Gunakan tombol klik di bawah.');
      setMicActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <section id="section-cake" className="py-12 px-4 bg-white relative overflow-hidden border-y border-pink-100">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Title */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Ritual Tiup Lilin Virtual</span>
        </div>
        <div className="relative group inline-block max-w-full">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-['Playfair_Display',serif] mb-2">
            {siteContent.cakeTitle}
          </h3>
          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-6 p-1 bg-pink-100 hover:bg-pink-200 rounded-full text-pink-700 transition-opacity cursor-pointer"
              title="Edit Teks Kue"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-slate-600 text-sm max-w-lg mx-auto mb-8 font-medium">
          {siteContent.cakeSubtitle}
        </p>

        <div className="grid md:grid-cols-12 gap-8 items-center max-w-3xl mx-auto">
          {/* Left / Center: Interactive Cake Graphics */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-64 h-72 sm:w-72 sm:h-80 flex flex-col items-center justify-end pb-4 select-none">
              {/* Candles layer */}
              <div className="flex items-end justify-center gap-3 sm:gap-4 mb-0 z-20">
                {Array.from({ length: candleCount }).map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center relative">
                    {/* Flame or smoke */}
                    {candlesLit ? (
                      <div className="relative">
                        {/* Outer glow */}
                        <div className="absolute -inset-1 bg-amber-400/40 rounded-full blur-xs animate-ping" />
                        {/* Flame */}
                        <div
                          className={`w-3.5 h-5 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-md ${
                            isBlowing ? 'scale-50 opacity-40 translate-x-1' : 'animate-bounce'
                          }`}
                          style={{ animationDuration: `${0.4 + idx * 0.15}s` }}
                        />
                        <div className="w-1.5 h-2 bg-blue-300/80 rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
                      </div>
                    ) : (
                      <div className="h-6 flex flex-col items-center">
                        <div className="text-[10px] text-slate-400 animate-pulse">💨</div>
                        <div className="w-1 h-3 bg-slate-300 rounded-full opacity-60" />
                      </div>
                    )}
                    {/* Wick & Candle stick */}
                    <div className="w-0.5 h-1.5 bg-slate-800" />
                    <div
                      className={`w-3 h-10 sm:h-12 rounded-t-sm shadow-xs ${
                        idx % 2 === 0
                          ? 'bg-gradient-to-b from-pink-300 via-pink-400 to-rose-400'
                          : 'bg-gradient-to-b from-purple-300 via-pink-300 to-pink-400'
                      }`}
                    >
                      {/* Candle stripes */}
                      <div className="w-full h-1 bg-white/50 mt-1" />
                      <div className="w-full h-1 bg-white/50 mt-2" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Cake Top Tier */}
              <div className="w-40 sm:w-44 h-16 bg-gradient-to-b from-pink-200 via-pink-300 to-pink-400 rounded-t-2xl relative shadow-md flex items-center justify-center border-t-4 border-white z-10">
                {/* Frosting drips */}
                <div className="absolute top-0 inset-x-0 flex justify-between px-2">
                  <span className="text-base -mt-3">🍓</span>
                  <span className="text-base -mt-3">🍒</span>
                  <span className="text-base -mt-3">🍓</span>
                </div>
                <span className="text-white font-bold text-xs tracking-wider uppercase font-['Dancing_Script',cursive] text-base drop-shadow-xs">
                  Jovanka Day
                </span>
              </div>

              {/* Cake Middle Tier */}
              <div className="w-52 sm:w-56 h-20 bg-gradient-to-b from-rose-200 via-rose-300 to-pink-400 rounded-t-xl relative shadow-lg flex items-center justify-center border-t-4 border-pink-100 z-0 -mt-2">
                {/* Decorative creamy pearls */}
                <div className="absolute top-1 inset-x-2 flex justify-around">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-white shadow-xs" />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-white font-bold text-xs bg-pink-600/30 px-3 py-0.5 rounded-full">
                  <Heart className="w-3 h-3 fill-pink-200 text-pink-200" />
                  <span>Forever Special</span>
                </div>
              </div>

              {/* Cake Base Tier */}
              <div className="w-64 sm:w-70 h-22 bg-gradient-to-b from-pink-300 via-rose-300 to-rose-400 rounded-t-lg relative shadow-xl flex items-center justify-center border-t-4 border-white -mt-2">
                {/* Sprinkles decoration */}
                <div className="absolute inset-2 flex flex-wrap gap-2 justify-center opacity-75">
                  <span className="text-xs">✨</span>
                  <span className="text-xs">🌸</span>
                  <span className="text-xs">💖</span>
                  <span className="text-xs">🌸</span>
                  <span className="text-xs">✨</span>
                </div>
              </div>

              {/* Cake Plate Stand */}
              <div className="w-72 sm:w-80 h-4 bg-slate-200 rounded-full shadow-lg -mt-1 border-t-2 border-white" />
              <div className="w-28 h-5 bg-slate-300 rounded-b-md shadow-xs" />
            </div>

            {/* Blow and Controls buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {candlesLit ? (
                <>
                  <button
                    id="btn-blow-candles"
                    onClick={handleBlowCandles}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer text-sm sm:text-base animate-pulse"
                  >
                    <span>Tiup Lilin Sekarang! 💨</span>
                  </button>

                  <button
                    id="btn-toggle-mic"
                    onClick={toggleMic}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                      micActive
                        ? 'bg-rose-50 border-rose-400 text-rose-700 animate-pulse'
                        : 'bg-white border-pink-300 text-pink-700 hover:bg-pink-50'
                    }`}
                    title="Gunakan mikrofon untuk tiup sungguhan"
                  >
                    {micActive ? <Mic className="w-4 h-4 text-rose-500" /> : <MicOff className="w-4 h-4 text-slate-400" />}
                    <span>{micActive ? 'Mic Aktif (Tiup Layar)' : 'Tiup Pakai Mic 🎙️'}</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-sm bg-rose-50 px-4 py-2 rounded-full border border-rose-200 animate-bounce">
                    <Sparkles className="w-4 h-4" />
                    <span>Lilin Berhasil Ditiup! Selamat Ulang Tahun Jovanka! 🎉</span>
                  </div>
                  <button
                    id="btn-relight"
                    onClick={handleRelight}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-pink-300 text-pink-700 hover:bg-pink-50 text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Nyalakan Lilin Lagi 🔥</span>
                  </button>
                </div>
              )}
            </div>

            {micError && (
              <p className="text-xs text-rose-500 mt-2 font-medium">{micError}</p>
            )}
          </div>

          {/* Right: Make a Wish Card */}
          <div className="md:col-span-5 text-left">
            <div className="bg-pink-50/80 rounded-2xl p-5 border border-pink-200 shadow-xs relative">
              <div className="flex items-center gap-2 text-pink-900 font-bold text-base mb-2">
                <Award className="w-4 h-4 text-pink-500" />
                <span>Harapan & Doa Jovanka ✨</span>
              </div>
              <p className="text-xs text-pink-700 mb-3 leading-relaxed">
                Tuliskan apa saja impian atau hal yang paling kamu inginkan di umur baru ini:
              </p>

              <textarea
                value={userWish}
                onChange={(e) => setUserWish(e.target.value)}
                placeholder="Contoh: Semoga selalu bahagia, dilancarkan rezekinya, sehat selalu, dan selalu dikelilingi orang-orang yang tulus menyayangiku..."
                className="w-full h-24 p-3 text-xs sm:text-sm rounded-xl border border-pink-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-400 resize-none mb-3 shadow-2xs"
              />

              {wishSaved && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-medium mb-3 flex items-start gap-2 animate-fadeIn">
                  <span className="text-sm">💌</span>
                  <div>
                    <span className="font-bold block">Harapan tersimpan di semesta!</span>
                    Semoga segala doa baikmu dikabulkan Tuhan dengan cara yang paling indah.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-pink-500 font-medium">
                <span>🔒 Harapanmu suci & berharga</span>
                <span>🍰 Dibuat dengan cinta</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
