import React, { useState, useEffect } from 'react';
import { Heart, RefreshCw, Smile, Plus, Check, Edit2, Trash2, RotateCcw, X } from 'lucide-react';
import { COMPLIMENTS } from '../data/initialData';
import {
  subscribeCompliments,
  addComplimentToDb,
  saveAllComplimentsToDb,
  resetComplimentsInDb,
} from '../services/firestoreService';
import { playSparkleSound, playCuteMeow, playPopSound } from '../utils/audio';
import { fireHeartConfetti } from '../utils/confetti';

export function ComplimentGenerator() {
  const [complimentsList, setComplimentsList] = useState<string[]>(COMPLIMENTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customText, setCustomText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeCompliments((updated) => {
      if (updated && updated.length > 0) {
        setComplimentsList(updated);
      }
    });
    return () => unsubscribe();
  }, []);

  const currentCompliment = complimentsList[currentIndex] || complimentsList[0] || COMPLIMENTS[0];

  const handleNextCompliment = () => {
    playSparkleSound();
    playCuteMeow();
    fireHeartConfetti();
    let nextIdx = Math.floor(Math.random() * complimentsList.length);
    if (nextIdx === currentIndex && complimentsList.length > 1) {
      nextIdx = (currentIndex + 1) % complimentsList.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setIsSaving(true);
    playSparkleSound();
    fireHeartConfetti();
    const newText = customText.trim();
    const updated = [newText, ...complimentsList];
    setComplimentsList(updated);
    setCurrentIndex(0);
    setCustomText('');
    setIsAdding(false);

    try {
      await addComplimentToDb(newText);
    } catch (err) {
      console.error('Error saving compliment to DB:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIdx === null || !editText.trim()) return;

    setIsSaving(true);
    playSparkleSound();
    const updated = [...complimentsList];
    updated[editingIdx] = editText.trim();
    setComplimentsList(updated);
    setEditingIdx(null);
    setEditText('');

    try {
      await saveAllComplimentsToDb(updated);
    } catch (err) {
      console.error('Error updating compliment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCurrent = async () => {
    if (complimentsList.length <= 1) {
      alert('Minimal harus ada 1 kata penyemangat!');
      return;
    }
    if (window.confirm(`Hapus kata penyemangat: "${currentCompliment}"?`)) {
      playPopSound();
      const updated = complimentsList.filter((_, idx) => idx !== currentIndex);
      setComplimentsList(updated);
      setCurrentIndex(0);
      try {
        await saveAllComplimentsToDb(updated);
      } catch (err) {
        console.error('Error deleting compliment:', err);
      }
    }
  };

  const handleResetCompliments = async () => {
    if (window.confirm('Kembalikan semua kata penyemangat ke daftar bawaan?')) {
      playPopSound();
      setComplimentsList(COMPLIMENTS);
      setCurrentIndex(0);
      try {
        await resetComplimentsInDb();
      } catch (err) {
        console.error('Error resetting compliments:', err);
      }
    }
  };

  return (
    <section className="py-14 px-4 bg-white relative overflow-hidden border-t border-pink-100">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-3">
          <Smile className="w-3.5 h-3.5 text-amber-600" />
          <span>Mood Booster 24/7</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-['Playfair_Display',serif] mb-2">
          Mesin Penyemangat & Pengingat Kamu Berharga 🌸
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto font-medium mb-6">
          Kapan pun kamu lagi capek atau butuh asupan semangat, tekan tombol di bawah ini!
        </p>

        {/* Compliment Card */}
        <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50 border-2 border-pink-200 shadow-md mb-6 transition-all duration-300 group">
          {/* Quick Edit/Delete controls for active quote */}
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => {
                setEditingIdx(currentIndex);
                setEditText(currentCompliment);
                playPopSound();
              }}
              className="p-1.5 rounded-full bg-white/80 hover:bg-white text-pink-700 shadow-xs cursor-pointer transition-transform hover:scale-110"
              title="Edit Kata Ini"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDeleteCurrent}
              className="p-1.5 rounded-full bg-white/80 hover:bg-white text-rose-700 shadow-xs cursor-pointer transition-transform hover:scale-110"
              title="Hapus Kata Ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-4xl sm:text-5xl mb-4 animate-bounce">💖</div>
          <p className="text-lg sm:text-2xl font-bold text-pink-950 font-['Caveat',cursive] leading-relaxed mb-4">
            &ldquo;{currentCompliment}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-500">
            <span>✨ Khusus buat Jovanka ✨</span>
            <span className="text-[11px] text-pink-400 font-normal">
              ({currentIndex + 1} dari {complimentsList.length})
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="btn-next-compliment"
            onClick={handleNextCompliment}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Tarik Semangat Baru! 💌</span>
          </button>

          <button
            onClick={() => {
              setIsAdding(!isAdding);
              playPopSound();
            }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-white border border-pink-300 text-pink-700 hover:bg-pink-50 font-bold text-xs shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kata Manis</span>
          </button>

          <button
            type="button"
            onClick={handleResetCompliments}
            className="inline-flex items-center gap-1 px-3 py-3 rounded-full text-slate-400 hover:text-rose-600 text-xs font-medium cursor-pointer"
            title="Reset ke Daftar Awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Add Input Drawer */}
        {isAdding && (
          <form
            onSubmit={handleAddCustom}
            className="mt-6 p-4 rounded-2xl bg-pink-50 border border-pink-200 text-left max-w-md mx-auto animate-fadeIn"
          >
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tulis Kata Penyemangat / Pujian Baru:
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Contoh: Jovanka, jangan lupa tersenyum ya, hari ini milikmu! 🌸"
              rows={2}
              required
              className="w-full p-2.5 rounded-xl border border-pink-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden mb-2"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan ke Database</span>
              </button>
            </div>
          </form>
        )}

        {/* Edit Modal */}
        {editingIdx !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setEditingIdx(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-pink-300 text-left space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <h4 className="font-bold text-slate-800 text-base font-['Playfair_Display',serif] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-pink-600" />
                  <span>Edit Kata Penyemangat</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingIdx(null)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teks Penyemangat:</label>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    required
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={() => setEditingIdx(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Perubahan ✨</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
