import React, { useState, useEffect } from 'react';
import { Heart, Plus, Edit2, Trash2, RotateCcw, Check, X, Sparkles } from 'lucide-react';
import { SPECIAL_REASONS } from '../data/initialData';
import { SpecialReason } from '../types';
import {
  subscribeSpecialReasons,
  saveSpecialReasonToDb,
  deleteSpecialReasonFromDb,
  resetSpecialReasonsInDb,
} from '../services/firestoreService';
import { playSparkleSound, playPopSound } from '../utils/audio';
import { fireConfettiCannon } from '../utils/confetti';

const EMOJI_OPTIONS = ['❤️', '✨', '💪', '😄', '👑', '🌟', '🌸', '🍰', '💐', '🦋', '🧸', '🥰'];

export function WhySpecialCards() {
  const [reasons, setReasons] = useState<SpecialReason[]>(SPECIAL_REASONS);
  const [editingItem, setEditingItem] = useState<SpecialReason | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmoji, setNewEmoji] = useState('💖');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSpecialReasons((updated) => {
      if (updated && updated.length > 0) {
        setReasons(updated);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleReveal = (id: number) => {
    playPopSound();
    setReasons((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, revealed: !r.revealed } : r));
      if (next.every((r) => r.revealed)) {
        playSparkleSound();
        fireConfettiCannon();
      }
      return next;
    });
  };

  const allRevealed = reasons.every((r) => r.revealed);

  const toggleAll = () => {
    if (allRevealed) {
      setReasons((prev) => prev.map((r) => ({ ...r, revealed: false })));
    } else {
      playSparkleSound();
      fireConfettiCannon();
      setReasons((prev) => prev.map((r) => ({ ...r, revealed: true })));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title.trim()) return;

    setIsSaving(true);
    playSparkleSound();
    const updated = {
      ...editingItem,
      title: editingItem.title.trim(),
      description: editingItem.description.trim(),
    };

    setReasons((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingItem(null);

    try {
      await saveSpecialReasonToDb(updated);
    } catch (err) {
      console.error('Failed to update reason in DB:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSaving(true);
    playSparkleSound();
    fireConfettiCannon();

    const maxId = reasons.length > 0 ? Math.max(...reasons.map((r) => r.id)) : 0;
    const newItem: SpecialReason = {
      id: maxId + 1,
      emoji: newEmoji,
      title: newTitle.trim(),
      description: newDescription.trim(),
      revealed: true,
    };

    setReasons((prev) => [...prev, newItem]);
    setNewTitle('');
    setNewDescription('');
    setIsAddingNew(false);

    try {
      await saveSpecialReasonToDb(newItem);
    } catch (err) {
      console.error('Failed to create new reason in DB:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus alasan spesial ini?')) {
      playPopSound();
      setReasons((prev) => prev.filter((r) => r.id !== id));
      try {
        await deleteSpecialReasonFromDb(id);
      } catch (err) {
        console.error('Failed to delete reason:', err);
      }
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Kembalikan semua alasan spesial ke default 6 kartu awal?')) {
      playPopSound();
      setReasons(SPECIAL_REASONS);
      try {
        await resetSpecialReasonsInDb();
      } catch (err) {
        console.error('Failed to reset reasons:', err);
      }
    }
  };

  return (
    <section className="py-14 px-4 bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold mb-3">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
            <span>Fakta Tak Terbantahkan</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-['Playfair_Display',serif] mb-2">
            Kenapa Jovanka Perempuan Paling Spesial? ✨
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto font-medium mb-3.5">
            Klik kartu-kartu di bawah ini untuk membuka alasan jujur kenapa kamu begitu berharga dan gak tergantikan!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-bold text-pink-600 hover:text-pink-800 underline cursor-pointer"
            >
              {allRevealed ? 'Tutup Semua Kartu 🔄' : 'Buka Semua Kartu Sekaligus 🎁'}
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(!isAddingNew);
                playPopSound();
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Alasan Baru</span>
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-slate-400 hover:text-rose-600 text-[11px] font-medium cursor-pointer"
              title="Reset ke Default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Form Tambah Baru */}
        {isAddingNew && (
          <form
            onSubmit={handleAddNew}
            className="mb-8 p-5 rounded-3xl bg-pink-50/80 border-2 border-pink-200 max-w-xl mx-auto animate-fadeIn text-left space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>Tambah Kartu Alasan Spesial Baru:</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Emoji:</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setNewEmoji(em)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer ${
                      newEmoji === em
                        ? 'bg-pink-500 text-white scale-110 shadow-xs ring-2 ring-pink-300'
                        : 'bg-white border border-pink-100 hover:bg-pink-100/50'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Judul Alasan:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Contoh: Senyumnya Bikin Adem Seisi Ruangan"
                required
                className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Deskripsi / Penjelasan:</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Tuliskan alasan jujur kenapa hal ini begitu spesial..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-pink-400 focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Alasan Baru</span>
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reasons.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleReveal(item.id)}
              className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden min-h-[175px] flex flex-col justify-center group ${
                item.revealed
                  ? 'bg-white border-pink-300 shadow-xs justify-between'
                  : 'bg-pink-50/40 border-dashed border-pink-300 hover:border-pink-400 hover:bg-pink-50/60'
              }`}
            >
              {/* Floating Action Bar for Edit/Delete */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingItem(item);
                    playPopSound();
                  }}
                  className="p-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 shadow-xs cursor-pointer transition-transform hover:scale-110"
                  title="Edit Kartu Ini"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 shadow-xs cursor-pointer transition-transform hover:scale-110"
                  title="Hapus Kartu Ini"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {!item.revealed ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-pink-100 flex items-center justify-center text-2xl mb-2.5">
                    🎁
                  </div>
                  <span className="font-bold text-slate-800 text-sm mb-1">
                    Alasan Rahasia #{item.id}
                  </span>
                  <span className="text-xs text-pink-600 font-semibold">Klik untuk buka! 👆</span>
                </div>
              ) : (
                <div className="animate-fadeIn text-left h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{item.emoji}</span>
                      <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2.5 py-0.5 rounded-full">
                        Terbuka #{item.id}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base mb-1.5 font-['Playfair_Display',serif]">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Edit Card */}
        {editingItem && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setEditingItem(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-pink-300 text-left space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <h4 className="font-bold text-slate-800 text-base font-['Playfair_Display',serif] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-pink-600" />
                  <span>Edit Alasan Spesial #{editingItem.id}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Emoji:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, emoji: em })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer ${
                          editingItem.emoji === em
                            ? 'bg-pink-500 text-white scale-110 shadow-xs ring-2 ring-pink-300'
                            : 'bg-slate-50 border border-pink-100 hover:bg-pink-50'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Alasan:</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Penjelasan:</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
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

