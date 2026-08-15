import React, { useState, useEffect } from 'react';
import {
  Heart,
  Edit3,
  Check,
  RotateCcw,
  Copy,
  Share2,
  Sparkles,
  Printer,
  Feather,
  BookOpen,
  Volume2,
  Database,
} from 'lucide-react';
import { PoemData } from '../types';
import { INITIAL_POEMS } from '../data/initialData';
import { subscribePoems, savePoemToDb, resetPoemsInDb } from '../services/firestoreService';
import { playSparkleSound, playPopSound } from '../utils/audio';
import { fireHeartConfetti } from '../utils/confetti';

interface PoemAndLetterProps {
  isEditorOpenExternally?: boolean;
  onToggleExternalEditor?: () => void;
}

const ACTIVE_POEM_INDEX_KEY = 'jovanka_active_poem_idx_v5';

export function PoemAndLetter({
  isEditorOpenExternally,
  onToggleExternalEditor,
}: PoemAndLetterProps) {
  const [poems, setPoems] = useState<PoemData[]>(INITIAL_POEMS);

  const [activeIdx, setActiveIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_POEM_INDEX_KEY);
      if (saved !== null) {
        const idx = Number(saved);
        if (idx >= 0 && idx < 3) return idx;
      }
    } catch {
      // fallback
    }
    return 0;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editAuthorNote, setEditAuthorNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [useHandwritingFont, setUseHandwritingFont] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastSaved, setToastSaved] = useState(false);

  // Subscribe to real-time Firestore poems
  useEffect(() => {
    const unsubscribe = subscribePoems((updatedPoems) => {
      if (updatedPoems && updatedPoems.length > 0) {
        setPoems(updatedPoems);
      }
    });
    return () => unsubscribe();
  }, []);

  const currentPoem = poems[activeIdx] || poems[0] || INITIAL_POEMS[0];

  useEffect(() => {
    if (isEditorOpenExternally) {
      startEditing();
    }
  }, [isEditorOpenExternally]);

  const handleSelectTemplate = (idx: number) => {
    playPopSound();
    setActiveIdx(idx);
    try {
      localStorage.setItem(ACTIVE_POEM_INDEX_KEY, String(idx));
    } catch {
      // ignore
    }
    if (isEditing) {
      const p = poems[idx] || INITIAL_POEMS[idx];
      setEditTitle(p.title);
      setEditContent(p.content);
      setEditAuthorNote(p.authorNote || '');
    }
  };

  const startEditing = () => {
    playSparkleSound();
    setEditTitle(currentPoem.title);
    setEditContent(currentPoem.content);
    setEditAuthorNote(currentPoem.authorNote || '');
    setIsEditing(true);
  };

  const saveEdits = async () => {
    setIsSaving(true);
    playSparkleSound();
    fireHeartConfetti();
    const updatedPoem: PoemData = {
      ...currentPoem,
      title: editTitle.trim() || currentPoem.title,
      content: editContent.trim() || currentPoem.content,
      authorNote: editAuthorNote.trim(),
    };

    const updated = poems.map((p, idx) => (idx === activeIdx ? updatedPoem : p));
    setPoems(updated);
    setIsEditing(false);

    try {
      await savePoemToDb(updatedPoem);
      setToastSaved(true);
      setTimeout(() => setToastSaved(false), 2500);
    } catch (err) {
      console.error('Error saving poem to DB:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const resetToDefault = async () => {
    if (window.confirm('Kembalikan ucapan dan puisi ke teks awal bawaan di database?')) {
      playPopSound();
      setPoems(INITIAL_POEMS);
      setIsEditing(false);
      await resetPoemsInDb();
      setToastSaved(true);
      setTimeout(() => setToastSaved(false), 2500);
    }
  };

  const handleCopy = () => {
    playSparkleSound();
    const textToCopy = `✨ ${currentPoem.title} ✨\n\n${currentPoem.content}\n\n${currentPoem.authorNote || ''}\n\n🎂 Selamat Ulang Tahun Jovanka! 🌸`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getTabInfo = (p: PoemData, idx: number) => {
    if (p.id === 'poem-tears' || p.category === 'crying' || idx === 0) {
      return {
        label: '🥺 Versi Bikin Haru',
        badge: 'Haru & Emosional 🥺',
      };
    }
    if (p.id === 'poem-gratitude' || p.category === 'heartfelt' || idx === 1) {
      return {
        label: '🌸 Versi Doa & Syukur',
        badge: 'Doa Tulus 🌸',
      };
    }
    return {
      label: '👑 Versi Ratu & Lucu',
      badge: 'Ratu Sehari 👑',
    };
  };

  return (
    <section id="section-poem" className="py-16 px-4 bg-gradient-to-b from-white via-pink-50/50 to-pink-100/60 relative overflow-hidden">
      {/* Toast Notification */}
      {toastSaved && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-pink-400/50 flex items-center gap-2 animate-bounce text-xs font-bold">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Puisi Berhasil Disimpan ke Cloud Database! 💾✨</span>
        </div>
      )}

      {/* Decorative blurred background elements */}
      <div className="absolute top-10 left-5 w-48 h-48 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-5 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold mb-3">
            <Feather className="w-3.5 h-3.5 text-rose-500" />
            <span>Untaian Kata Dari Lubuk Hati Terdalam</span>
            <span className="bg-white/80 px-2 py-0.5 rounded-full text-[10px] text-pink-700 font-bold ml-1">
              💾 Cloud DB
            </span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-['Playfair_Display',serif] mb-2">
            Surat & Puisi Spesial untuk Jovanka 💌🥺
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto font-medium">
            Bukan sekadar kata-kata biasa, ini adalah ungkapan tulus tentang betapa berharganya sosok Jovanka.
            Kamu bisa <strong className="text-pink-600">mengedit seluruh isi puisi ini sesukamu (tersimpan di database)!</strong>
          </p>
        </div>

        {/* Template switcher tabs & Editor toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-2xl bg-white/80 border border-pink-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {poems.map((p, idx) => {
              const tab = getTabInfo(p, idx);
              return (
                <button
                  key={p.id || idx}
                  onClick={() => handleSelectTemplate(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeIdx === idx
                      ? 'bg-pink-500 text-white shadow-xs scale-102'
                      : 'text-slate-600 hover:bg-pink-50 hover:text-pink-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                id="btn-edit-poem"
                onClick={startEditing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-300 text-xs font-bold shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-pink-600" />
                <span>Edit Ucapan Ini ✏️</span>
              </button>
            ) : (
              <button
                onClick={resetToDefault}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-all cursor-pointer"
                title="Reset kembali ke bawaan awal di database"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Letter Card Sheet */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#fffdf9] via-[#fff9f4] to-[#fdf2f4] border-2 border-pink-200/80 shadow-xl p-6 sm:p-10 md:p-12 overflow-hidden print:border-none print:shadow-none">
          {/* Aesthetic Stamp & Postal Seal */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 opacity-90 select-none pointer-events-none">
            <div className="w-12 h-14 sm:w-14 sm:h-16 border-2 border-dashed border-rose-400 bg-rose-50/80 rounded-md flex flex-col items-center justify-center p-1 text-center rotate-3 shadow-xs">
              <span className="text-base sm:text-lg">👑</span>
              <span className="text-[9px] font-bold text-rose-700 uppercase tracking-tighter leading-none">
                VIP JOVANKA
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-pink-400/80 flex items-center justify-center -rotate-12 text-[10px] font-bold text-pink-700 uppercase">
              ★ HBD ★
            </div>
          </div>

          {/* Letter Content or Live Editor */}
          {!isEditing ? (
            <div className="relative z-10">
              {/* Title */}
              <div className="mb-6 pr-20">
                <h4 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-pink-950 font-['Playfair_Display',serif] leading-snug">
                  {currentPoem.title}
                </h4>
                <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mt-2" />
              </div>

              {/* Poem lines */}
              <div
                className={`text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line mb-8 font-medium ${
                  useHandwritingFont ? "font-['Caveat',cursive] text-xl sm:text-2xl" : "font-['Quicksand',sans-serif]"
                }`}
              >
                {currentPoem.content}
              </div>

              {/* Author closing note */}
              {currentPoem.authorNote && (
                <div className="border-t border-pink-200/80 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-pink-800 font-semibold text-sm sm:text-base font-['Caveat',cursive] text-lg sm:text-xl">
                  <span>{currentPoem.authorNote}</span>
                  <span className="text-xs font-sans text-pink-500 font-normal">
                    Selalu dalam doa terbaik 🌸
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Live Editor Interface */
            <div className="relative z-10 flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-pink-200 pb-3">
                <div className="flex items-center gap-2 text-pink-900 font-bold text-sm sm:text-base">
                  <Edit3 className="w-4 h-4 text-pink-600" />
                  <span>Mode Edit Pesan (Tersimpan ke Cloud Database)</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>Cloud Sync</span>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Puisi / Ucapan:
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-pink-300 bg-white font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-400 text-sm sm:text-base shadow-2xs"
                  placeholder="Judul ucapan spesial..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Isi Surat & Puisi:
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full p-4 rounded-xl border border-pink-300 bg-white text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-pink-400 text-sm sm:text-base font-sans resize-y shadow-2xs"
                  placeholder="Tuliskan ucapan yang paling menyentuh hati di sini..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Penutup / Nama Pengirim:
                </label>
                <input
                  type="text"
                  value={editAuthorNote}
                  onChange={(e) => setEditAuthorNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-pink-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-400 text-xs sm:text-sm shadow-2xs"
                  placeholder="Contoh: — Dari seseorang yang selalu menyayangimu dan mengagumi ketulusanmu ❤️"
                />
              </div>

              {/* Action save / cancel buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-pink-200">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-save-poem"
                  onClick={saveEdits}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Simpan ke Database 💾</span>
                </button>
              </div>
            </div>
          )}

          {/* Letter Bottom Interactive Controls */}
          {!isEditing && (
            <div className="mt-8 pt-4 border-t border-pink-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUseHandwritingFont(!useHandwritingFont)}
                  className="px-3 py-1.5 rounded-lg bg-pink-100/80 hover:bg-pink-200 text-pink-800 font-medium transition-colors cursor-pointer"
                >
                  {useHandwritingFont ? 'Ganti Font Normal' : 'Ganti Font Tulisan Tangan 🖋️'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-copy-poem"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-pink-300 text-pink-700 hover:bg-pink-50 font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin ke Clipboard! 📋' : 'Salin Pesan WA/IG'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-pink-300 text-slate-700 hover:bg-pink-50 font-medium shadow-2xs active:scale-95 transition-all cursor-pointer"
                  title="Cetak atau Simpan sebagai PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Cetak Kartu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
