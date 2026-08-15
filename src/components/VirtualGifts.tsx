import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Heart, Check, RefreshCw, Plus, Edit2, Trash2, RotateCcw, X } from 'lucide-react';
import { VIRTUAL_GIFTS } from '../data/initialData';
import { VirtualGift } from '../types';
import {
  subscribeVirtualGifts,
  saveVirtualGiftToDb,
  deleteVirtualGiftFromDb,
  resetVirtualGiftsInDb,
} from '../services/firestoreService';
import { playSparkleSound, playPopSound, playFanfareSound } from '../utils/audio';
import { fireConfettiCannon, fireHeartConfetti } from '../utils/confetti';

const BOX_COLOR_OPTIONS = [
  { label: 'Rose Pink', val: 'from-pink-500 to-rose-600', ribbon: 'bg-amber-300' },
  { label: 'Purple Lavender', val: 'from-purple-500 to-indigo-600', ribbon: 'bg-pink-300' },
  { label: 'Emerald Mint', val: 'from-emerald-400 to-teal-600', ribbon: 'bg-amber-300' },
  { label: 'Amber Sun', val: 'from-amber-400 to-orange-500', ribbon: 'bg-rose-500' },
  { label: 'Sky Blue', val: 'from-sky-400 to-blue-600', ribbon: 'bg-amber-300' },
];

const GIFT_ICON_OPTIONS = ['💍', '👑', '🎫', '🍰', '💐', '✈️', '🌸', '🎁', '🧸', '💌', '🐱'];

export function VirtualGifts() {
  const [gifts, setGifts] = useState<VirtualGift[]>(VIRTUAL_GIFTS);
  const [editingGift, setEditingGift] = useState<VirtualGift | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('Kado Misterius ✨');
  const [formGiftTitle, setFormGiftTitle] = useState('');
  const [formGiftContent, setFormGiftContent] = useState('');
  const [formGiftIcon, setFormGiftIcon] = useState('🎁');
  const [formColorIdx, setFormColorIdx] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeVirtualGifts((updated) => {
      if (updated && updated.length > 0) {
        setGifts(updated);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenGift = (id: string) => {
    const target = gifts.find((g) => g.id === id);
    if (!target) return;

    if (!target.opened) {
      playPopSound();
      setTimeout(() => {
        playFanfareSound();
        fireConfettiCannon();
      }, 200);

      setGifts((prev) =>
        prev.map((g) => (g.id === id ? { ...g, opened: true } : g))
      );
    }
  };

  const handleResetGifts = () => {
    playSparkleSound();
    setGifts((prev) => prev.map((g) => ({ ...g, opened: false })));
  };

  const handleAddNewGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGiftTitle.trim()) return;

    setIsSaving(true);
    playSparkleSound();
    fireHeartConfetti();

    const selectedColor = BOX_COLOR_OPTIONS[formColorIdx];
    const newGift: VirtualGift = {
      id: `gift-${Date.now()}`,
      title: formTitle.trim() || 'Kado Rahasia 🎁',
      boxColor: selectedColor.val,
      ribbonColor: selectedColor.ribbon,
      giftIcon: formGiftIcon,
      giftTitle: formGiftTitle.trim(),
      giftContent: formGiftContent.trim(),
      opened: true,
    };

    setGifts((prev) => [...prev, newGift]);
    setIsAddingNew(false);
    setFormGiftTitle('');
    setFormGiftContent('');

    try {
      await saveVirtualGiftToDb(newGift);
    } catch (err) {
      console.error('Failed to create new gift:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGift || !editingGift.giftTitle.trim()) return;

    setIsSaving(true);
    playSparkleSound();

    const updated = { ...editingGift };
    setGifts((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setEditingGift(null);

    try {
      await saveVirtualGiftToDb(updated);
    } catch (err) {
      console.error('Failed to update gift:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGift = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus kotak kado ini?')) {
      playPopSound();
      setGifts((prev) => prev.filter((g) => g.id !== id));
      try {
        await deleteVirtualGiftFromDb(id);
      } catch (err) {
        console.error('Failed to delete gift:', err);
      }
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Kembalikan 3 kado virtual ke pengaturan default?')) {
      playPopSound();
      setGifts(VIRTUAL_GIFTS);
      try {
        await resetVirtualGiftsInDb();
      } catch (err) {
        console.error('Failed to reset gifts:', err);
      }
    }
  };

  return (
    <section id="section-gifts" className="py-16 px-4 bg-gradient-to-b from-pink-50/70 to-pink-100/50 relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
          <Gift className="w-3.5 h-3.5 text-purple-600" />
          <span>Kotak Kejutan Spesial</span>
        </div>
        <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-['Playfair_Display',serif] mb-2">
          Buka Kado Virtual Jovanka 🎁✨
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto font-medium mb-5">
          Ada kado-kado misterius yang sudah disiapkan khusus buat hari ulang tahunmu. Buka satu per satu ya!
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => {
              setIsAddingNew(!isAddingNew);
              playPopSound();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kado Baru</span>
          </button>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-purple-200 text-slate-600 hover:text-purple-700 text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Kado Awal</span>
          </button>
        </div>

        {/* Form Tambah Kado Baru */}
        {isAddingNew && (
          <form
            onSubmit={handleAddNewGift}
            className="mb-8 p-6 rounded-3xl bg-white border-2 border-purple-300 max-w-lg mx-auto animate-fadeIn text-left space-y-3.5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-purple-100 pb-2">
              <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5 font-['Playfair_Display',serif]">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Buat Kotak Kado Kejutan Baru:</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Ikon Kado:</label>
              <div className="flex flex-wrap gap-1.5">
                {GIFT_ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setFormGiftIcon(ic)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer ${
                      formGiftIcon === ic
                        ? 'bg-purple-600 text-white scale-110 shadow-xs ring-2 ring-purple-300'
                        : 'bg-purple-50/50 border border-purple-100 hover:bg-purple-100'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Warna Kotak Kado:</label>
              <div className="flex flex-wrap gap-2">
                {BOX_COLOR_OPTIONS.map((c, i) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setFormColorIdx(i)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formColorIdx === i
                        ? 'bg-gradient-to-r ' + c.val + ' text-white ring-2 ring-purple-400 shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Label Luar Kotak:</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Contoh: Kado #4: Tiket Bioskop 🎬"
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Hadiah di Dalam:</label>
              <input
                type="text"
                value={formGiftTitle}
                onChange={(e) => setFormGiftTitle(e.target.value)}
                placeholder="Contoh: Voucher Nonton & Traktir Boba Sepuasnya!"
                required
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Pesan / Detail Hadiah:</label>
              <textarea
                value={formGiftContent}
                onChange={(e) => setFormGiftContent(e.target.value)}
                rows={2}
                placeholder="Tuliskan kata manis atau syarat klaim kadonya..."
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-purple-100">
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
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Kado Baru</span>
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-6">
          {gifts.map((gift) => (
            <div
              key={gift.id}
              onClick={() => handleOpenGift(gift.id)}
              className={`rounded-3xl p-6 transition-all duration-500 cursor-pointer relative overflow-hidden border shadow-md flex flex-col justify-between min-h-[300px] group ${
                gift.opened
                  ? 'bg-white border-pink-300 shadow-xl scale-102'
                  : `bg-gradient-to-br ${gift.boxColor} border-white/40 text-white hover:scale-105 hover:shadow-2xl`
              }`}
            >
              {/* Floating Action Buttons */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingGift(gift);
                    playPopSound();
                  }}
                  className={`p-1.5 rounded-full shadow-xs cursor-pointer transition-transform hover:scale-110 ${
                    gift.opened ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-white/80 text-purple-900 hover:bg-white'
                  }`}
                  title="Edit Kado Ini"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteGift(gift.id, e)}
                  className={`p-1.5 rounded-full shadow-xs cursor-pointer transition-transform hover:scale-110 ${
                    gift.opened ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-white/80 text-rose-700 hover:bg-white'
                  }`}
                  title="Hapus Kado Ini"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {!gift.opened ? (
                /* Wrapped Box State */
                <div className="flex flex-col items-center justify-center flex-1 py-8 relative">
                  {/* Ribbon cross */}
                  <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 ${gift.ribbonColor} shadow-inner opacity-90`} />
                  <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-5 ${gift.ribbonColor} shadow-inner opacity-90`} />

                  {/* Ribbon Bow */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-amber-300 text-amber-900 flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-white mb-4 animate-bounce">
                    🎀
                  </div>
                  <span className="relative z-10 font-extrabold text-lg drop-shadow-sm font-['Playfair_Display',serif]">
                    {gift.title}
                  </span>
                  <span className="relative z-10 text-xs font-semibold mt-1 bg-black/20 px-3 py-1 rounded-full backdrop-blur-2xs">
                    Klik untuk Buka! 🔓
                  </span>
                </div>
              ) : (
                /* Unboxed Content State */
                <div className="flex flex-col items-center text-center animate-fadeIn py-2 flex-1 justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-3xl mb-3 shadow-inner">
                      {gift.giftIcon}
                    </div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Kado Terbuka 🎉
                    </div>
                    <h4 className="font-bold text-slate-800 text-base mb-2 font-['Playfair_Display',serif]">
                      {gift.giftTitle}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                      {gift.giftContent}
                    </p>
                  </div>
                  <div className="mt-auto w-full pt-3 border-t border-pink-100 flex items-center justify-center gap-1 text-[11px] font-bold text-pink-600">
                    <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                    <span>Spesial Buat Jovanka</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {gifts.some((g) => g.opened) && (
          <button
            onClick={handleResetGifts}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-pink-200 text-slate-600 hover:text-pink-600 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Bungkus Ulang Semua Kado 🎁</span>
          </button>
        )}

        {/* Modal Edit Gift */}
        {editingGift && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setEditingGift(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-purple-300 text-left space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <h4 className="font-bold text-slate-800 text-base font-['Playfair_Display',serif] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-purple-600" />
                  <span>Edit Kado Virtual</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingGift(null)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Ikon:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GIFT_ICON_OPTIONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setEditingGift({ ...editingGift, giftIcon: ic })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer ${
                          editingGift.giftIcon === ic
                            ? 'bg-purple-600 text-white scale-110 shadow-xs ring-2 ring-purple-300'
                            : 'bg-slate-50 border border-purple-100 hover:bg-purple-50'
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Label Depan Kotak:</label>
                  <input
                    type="text"
                    value={editingGift.title}
                    onChange={(e) => setEditingGift({ ...editingGift, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Hadiah Isi Kado:</label>
                  <input
                    type="text"
                    value={editingGift.giftTitle}
                    onChange={(e) => setEditingGift({ ...editingGift, giftTitle: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detail / Pesan Hadiah:</label>
                  <textarea
                    value={editingGift.giftContent}
                    onChange={(e) => setEditingGift({ ...editingGift, giftContent: e.target.value })}
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-hidden resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
                  <button
                    type="button"
                    onClick={() => setEditingGift(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Kado ✨</span>
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

