import React, { useState, useEffect } from 'react';
import { Heart, Send, MessageCircleHeart, Trash2, RotateCcw } from 'lucide-react';
import { INITIAL_WISHES } from '../data/initialData';
import { UserWish } from '../types';
import {
  subscribeWishes,
  addWishToDb,
  likeWishInDb,
  deleteWishFromDb,
  resetWishesInDb,
} from '../services/firestoreService';
import { playSparkleSound, playPopSound, playCuteMeow } from '../utils/audio';
import { fireConfettiCannon } from '../utils/confetti';

const AVATARS = ['🐱', '🌸', '👑', '💖', '🧽', '🍰', '✨', '🐾'];

export function WishWall() {
  const [wishes, setWishes] = useState<UserWish[]>(INITIAL_WISHES);
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('💖');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeWishes((updated) => {
      if (updated && updated.length > 0) {
        setWishes(updated);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    playSparkleSound();
    playCuteMeow();
    fireConfettiCannon();

    const newWish: UserWish = {
      id: `wish-${Date.now()}`,
      name: senderName.trim() || 'Teman / Pengagum Tulus 🌸',
      message: message.trim(),
      date: 'Baru saja',
      avatar: selectedAvatar,
      likes: 1,
    };

    setWishes((prev) => [newWish, ...prev]);
    setMessage('');
    setSenderName('');
    setIsSubmitting(true);

    try {
      await addWishToDb(newWish);
    } catch (err) {
      console.error('Error saving wish to database:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeWish = async (id: string) => {
    playPopSound();
    const target = wishes.find((w) => w.id === id);
    const currentLikes = target ? target.likes : 0;

    setWishes((prev) =>
      prev.map((w) => (w.id === id ? { ...w, likes: w.likes + 1 } : w))
    );

    try {
      await likeWishInDb(id, currentLikes);
    } catch (err) {
      console.error('Error updating likes:', err);
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (window.confirm('Hapus ucapan doa ini?')) {
      playPopSound();
      setWishes((prev) => prev.filter((w) => w.id !== id));
      try {
        await deleteWishFromDb(id);
      } catch (err) {
        console.error('Error deleting wish:', err);
      }
    }
  };

  const handleResetWishes = async () => {
    if (window.confirm('Kembalikan dinding doa ke pesan-pesan default?')) {
      playPopSound();
      setWishes(INITIAL_WISHES);
      try {
        await resetWishesInDb();
      } catch (err) {
        console.error('Error resetting wishes:', err);
      }
    }
  };

  return (
    <section id="section-wishes" className="py-16 px-4 bg-pink-50/50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold mb-3">
            <MessageCircleHeart className="w-3.5 h-3.5 text-pink-600" />
            <span>Dinding Doa & Kasih Sayang</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-['Playfair_Display',serif] mb-2">
            Wish Wall untuk Jovanka 💌
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto font-medium mb-3">
            Tinggalkan doa, harapan manis, dan pesan terbaikmu agar hari ulang tahun Jovanka semakin berkesan!
          </p>
          <button
            type="button"
            onClick={handleResetWishes}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Dinding Doa ke Default</span>
          </button>
        </div>

        {/* Input Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-pink-200 shadow-md mb-10">
          <h4 className="font-bold text-slate-800 text-base mb-4 font-['Playfair_Display',serif] flex items-center gap-2">
            <span>✍️ Tulis Doa & Ucapan Manismu</span>
          </h4>

          <form onSubmit={handleAddWish} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kamu / Panggilan:
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Contoh: Sahabat Sejati / Si Pengagum Rahasia"
                  className="w-full p-2.5 rounded-xl border border-pink-200 bg-pink-50/40 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Avatar Ikon:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-9 h-9 rounded-full text-lg flex items-center justify-center transition-all cursor-pointer ${
                        selectedAvatar === av
                          ? 'bg-pink-500 scale-110 shadow-sm ring-2 ring-pink-300'
                          : 'bg-pink-100 hover:bg-pink-200'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pesan & Doa untuk Jovanka:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan ucapan manismu di sini..."
                rows={3}
                required
                className="w-full p-3 rounded-xl border border-pink-200 bg-pink-50/40 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-400 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Ucapan Manis 💖</span>
              </button>
            </div>
          </form>
        </div>

        {/* Wishes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishes.map((w) => (
            <div
              key={w.id}
              className="bg-white p-5 rounded-2xl border border-pink-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group relative"
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleDeleteWish(w.id)}
                  className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                  title="Hapus Ucapan Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-lg shadow-2xs">
                      {w.avatar}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm font-['Playfair_Display',serif]">
                        {w.name}
                      </h4>
                      <span className="text-[10px] text-pink-400 font-medium">{w.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-['Caveat',cursive] text-base sm:text-lg mb-3">
                  &ldquo;{w.message}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-pink-50 flex items-center justify-between text-xs">
                <span className="text-[11px] text-pink-500 font-medium">Spesial untuk Jovanka 🌸</span>
                <button
                  onClick={() => handleLikeWish(w.id)}
                  className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-bold text-xs bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                >
                  <Heart className="w-3 h-3 fill-rose-500" />
                  <span>{w.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
