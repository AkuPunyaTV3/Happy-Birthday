import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  RotateCcw,
  Sparkles,
  Database,
  Type,
  FileText,
  Gift,
  Heart,
  MessageSquare,
  Upload,
  Copy,
  Download,
  Code,
  Image as ImageIcon,
} from 'lucide-react';
import { SiteContent } from '../types';
import { DEFAULT_SITE_CONTENT } from '../data/initialData';
import { saveSiteContentToDb } from '../services/firestoreService';
import { optimizeImageFile } from '../utils/storageDb';
import { playSparkleSound, playPopSound } from '../utils/audio';
import { fireHeartConfetti } from '../utils/confetti';

interface SiteTextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteContent: SiteContent;
  onSaveSuccess?: () => void;
}

export function SiteTextEditorModal({
  isOpen,
  onClose,
  siteContent,
  onSaveSuccess,
}: SiteTextEditorModalProps) {
  const [form, setForm] = useState<SiteContent>(siteContent);
  const [activeTab, setActiveTab] = useState<'hero' | 'cake' | 'sections' | 'finale' | 'export'>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm(siteContent);
  }, [siteContent, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof SiteContent, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleHeroPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const dataUrl = await optimizeImageFile(file, 1000, 0.88);
      setForm((prev) => ({ ...prev, heroPhotoUrl: dataUrl }));
      playSparkleSound();
    } catch (err) {
      console.error('Error optimizing photo:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSiteContentToDb(form);
      playSparkleSound();
      fireHeartConfetti();
      setSavedSuccess(true);
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save site text:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan semua teks website ke pengaturan teks awal?')) {
      playPopSound();
      setForm(DEFAULT_SITE_CONTENT);
    }
  };

  const generateTypeScriptCode = () => {
    return `// Simpan atau replace file ini di: src/data/initialData.ts
// Semua teks dan konfigurasi langsung tertanam di codingan untuk GitHub!

export const DEFAULT_SITE_CONTENT: SiteContent = ${JSON.stringify(form, null, 2)};
`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateTypeScriptCode());
    setCopiedCode(true);
    playSparkleSound();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generateTypeScriptCode()], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'initialData-siteContent.ts';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playSparkleSound();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl border-2 border-pink-300 relative my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-pink-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg font-['Playfair_Display',serif]">
                Edit Semua Teks & Foto Website ✨
              </h3>
              <p className="text-[11px] text-pink-600 font-medium flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-500" />
                <span>Tersimpan di Browser & Cloud (Bisa Di-Export ke Codingan GitHub)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-pink-50 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'hero' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
            }`}
          >
            🌸 Hero & Foto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cake')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'cake' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
            }`}
          >
            🎂 Kue & Lilin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'sections' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
            }`}
          >
            💖 Judul Bagian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('finale')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'finale' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
            }`}
          >
            👑 Penutup & Footer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'export' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900 bg-slate-200/60'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
            <span>💻 Export Codingan</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-1 space-y-4 text-left">
          {activeTab === 'hero' && (
            <div className="space-y-3.5">
              {/* Photo Avatar Upload */}
              <div className="p-3.5 bg-pink-50/70 rounded-2xl border border-pink-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-pink-400 to-amber-300 shadow-md">
                    <img
                      src={form.heroPhotoUrl || DEFAULT_SITE_CONTENT.heroPhotoUrl}
                      alt="Jovanka"
                      className="w-full h-full object-cover rounded-full border-2 border-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold cursor-pointer"
                  >
                    Ganti Foto
                  </button>
                </div>

                <div className="flex-1 w-full text-center sm:text-left space-y-1.5">
                  <label className="block text-xs font-bold text-pink-950">
                    👑 Foto Profil Utama Jovanka (Hero Avatar)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Foto ini akan tampil di bagian atas halaman dengan mahkota dan bingkai berkilau.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeroPhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? 'Memproses...' : 'Upload Foto Baru 📸'}</span>
                    </button>
                    {form.heroPhotoUrl !== DEFAULT_SITE_CONTENT.heroPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('heroPhotoUrl', DEFAULT_SITE_CONTENT.heroPhotoUrl || '')}
                        className="text-[11px] text-slate-500 hover:text-rose-600 underline cursor-pointer"
                      >
                        Reset Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teks Badge / Pill Teratas:
                </label>
                <input
                  type="text"
                  value={form.heroCelebrationPill}
                  onChange={(e) => handleChange('heroCelebrationPill', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  placeholder="Hari Bahagia Sedunia: Jovanka Day! 🎉🎂"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Awalan Salam Ucapan:
                  </label>
                  <input
                    type="text"
                    value={form.heroGreetingPrefix}
                    onChange={(e) => handleChange('heroGreetingPrefix', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                    placeholder="Selamat Ulang Tahun,"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama yang Berulang Tahun:
                  </label>
                  <input
                    type="text"
                    value={form.heroName}
                    onChange={(e) => handleChange('heroName', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-bold text-pink-700 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                    placeholder="Jovanka ✨💖"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Label Badge Foto (di bawah avatar):
                </label>
                <input
                  type="text"
                  value={form.heroPhotoBadge || ''}
                  onChange={(e) => handleChange('heroPhotoBadge', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  placeholder="Queen Jovanka ✨"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kalimat Kutipan / Doa di Kotak Hero:
                </label>
                <textarea
                  value={form.heroQuote}
                  onChange={(e) => handleChange('heroQuote', e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden resize-none"
                  placeholder="Semoga harimu penuh senyum dan keajaiban :)"
                />
              </div>
            </div>
          )}

          {activeTab === 'cake' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Bagian Kue Ulang Tahun:
                </label>
                <input
                  type="text"
                  value={form.cakeTitle}
                  onChange={(e) => handleChange('cakeTitle', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  placeholder="Kue Ulang Tahun Spesial Jovanka 🎂🍓"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Petunjuk Tiup Lilin & Harapan:
                </label>
                <textarea
                  value={form.cakeSubtitle}
                  onChange={(e) => handleChange('cakeSubtitle', e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden resize-none"
                  placeholder="Sebelum tiup lilin, pejamkan mata, tulis harapan terbaikmu..."
                />
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100">
                <label className="block text-xs font-bold text-pink-900 mb-1">
                  Bagian 1: Kenapa Spesial (Reasons Section)
                </label>
                <input
                  type="text"
                  value={form.reasonsTitle}
                  onChange={(e) => handleChange('reasonsTitle', e.target.value)}
                  className="w-full p-2 rounded-lg border border-pink-200 text-xs mb-2 bg-white"
                  placeholder="Judul Kenapa Spesial..."
                />
                <input
                  type="text"
                  value={form.reasonsSubtitle}
                  onChange={(e) => handleChange('reasonsSubtitle', e.target.value)}
                  className="w-full p-2 rounded-lg border border-pink-200 text-xs bg-white"
                  placeholder="Sub-judul..."
                />
              </div>

              <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100">
                <label className="block text-xs font-bold text-pink-900 mb-1">
                  Bagian 2: Kado Virtual (Gifts Section)
                </label>
                <input
                  type="text"
                  value={form.giftsTitle}
                  onChange={(e) => handleChange('giftsTitle', e.target.value)}
                  className="w-full p-2 rounded-lg border border-pink-200 text-xs mb-2 bg-white"
                  placeholder="Judul Kado Virtual..."
                />
                <input
                  type="text"
                  value={form.giftsSubtitle}
                  onChange={(e) => handleChange('giftsSubtitle', e.target.value)}
                  className="w-full p-2 rounded-lg border border-pink-200 text-xs bg-white"
                  placeholder="Sub-judul..."
                />
              </div>

              <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100">
                <label className="block text-xs font-bold text-pink-900 mb-1">
                  Bagian 3: Mood Booster & Kata Penyemangat
                </label>
                <input
                  type="text"
                  value={form.complimentsTitle}
                  onChange={(e) => handleChange('complimentsTitle', e.target.value)}
                  className="w-full p-2 rounded-lg border border-pink-200 text-xs mb-2 bg-white"
                  placeholder="Judul Mood Booster..."
                />
                <input
                  type="text"
                  value={form.complimentsSubtitle}
                  onChange={(e) => handleChange('complimentsSubtitle', e.target.value)}
                  className="w-full p-2 rounded-lg border border-pink-200 text-xs bg-white"
                  placeholder="Sub-judul..."
                />
              </div>

              <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100">
                <label className="block text-xs font-bold text-pink-900 mb-1">
                  Bagian 4: Galeri & Meme Wall
                </label>
                <input
                  type="text"
                  value={form.galleryTitle || ''}
                  onChange={(e) => handleChange('galleryTitle', e.target.value)}
                  className="w-full p-2 rounded-lg border border-pink-200 text-xs mb-2 bg-white"
                  placeholder="Judul Galeri & Meme..."
                />
                <input
                  type="text"
                  value={form.gallerySubtitle || ''}
                  onChange={(e) => handleChange('gallerySubtitle', e.target.value)}
                  className="w-full p-2 rounded-lg border border-pink-200 text-xs bg-white"
                  placeholder="Sub-judul..."
                />
              </div>

              <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100">
                <label className="block text-xs font-bold text-pink-900 mb-1">
                  Bagian 5: Dinding Doa & Ucapan (Wish Wall)
                </label>
                <input
                  type="text"
                  value={form.wishesTitle}
                  onChange={(e) => handleChange('wishesTitle', e.target.value)}
                  className="w-full p-2 rounded-lg border border-pink-200 text-xs mb-2 bg-white"
                  placeholder="Judul Wish Wall..."
                />
                <input
                  type="text"
                  value={form.wishesSubtitle}
                  onChange={(e) => handleChange('wishesSubtitle', e.target.value)}
                  className="w-full p-2 rounded-lg border border-pink-200 text-xs bg-white"
                  placeholder="Sub-judul..."
                />
              </div>
            </div>
          )}

          {activeTab === 'finale' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Penutup (Grand Finale):
                </label>
                <input
                  type="text"
                  value={form.grandFinaleTitle}
                  onChange={(e) => handleChange('grandFinaleTitle', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  placeholder="Sekali Lagi, Selamat Ulang Tahun Jovanka! ✨"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pesan Manis Penutup (Quote):
                </label>
                <textarea
                  value={form.grandFinaleQuote}
                  onChange={(e) => handleChange('grandFinaleQuote', e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden resize-none"
                  placeholder="Semoga tahun ini membawa ribuan alasan baru untuk tersenyum..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teks Tombol Kembang Api Pesta:
                </label>
                <input
                  type="text"
                  value={form.grandFinaleButtonText}
                  onChange={(e) => handleChange('grandFinaleButtonText', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  placeholder="Rayakan Pesta Kembang Api Terbesar! 🎆🎉"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Footer:
                  </label>
                  <input
                    type="text"
                    value={form.footerTitle}
                    onChange={(e) => handleChange('footerTitle', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sub-teks Footer:
                  </label>
                  <input
                    type="text"
                    value={form.footerSubtitle}
                    onChange={(e) => handleChange('footerSubtitle', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Code className="w-4 h-4" />
                    <span>Kode TypeScript Langsung untuk GitHub</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode ? 'Disalin! ✅' : 'Salin Kode'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadCode}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .ts</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Kamu bisa menyalin kode ini langsung ke file <code className="text-pink-300">src/data/initialData.ts</code> sehingga ketika di-push ke GitHub atau di-host di mana pun, seluruh teks & foto sudah otomatis permanen tanpa perlu setup database apa pun!
                </p>
                <pre className="text-[10px] font-mono bg-black/60 p-3 rounded-xl overflow-x-auto max-h-56 text-pink-200">
                  {generateTypeScriptCode()}
                </pre>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-pink-100 mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Teks Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{savedSuccess ? 'Tersimpan! 💾' : 'Simpan Perubahan ✨'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
