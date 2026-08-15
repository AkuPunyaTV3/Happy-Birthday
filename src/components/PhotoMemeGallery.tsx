import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Plus,
  Heart,
  X,
  Smile,
  Image as ImageIcon,
  Check,
  Trash2,
  Maximize2,
  RotateCcw,
  Pencil,
  FileImage,
  Database,
  Download,
  Code,
  Copy,
} from 'lucide-react';
import { GalleryItem, SiteContent } from '../types';
import { INITIAL_GALLERY, DEFAULT_SITE_CONTENT } from '../data/initialData';
import {
  subscribeGallery,
  saveGalleryItemToDb,
  deleteGalleryItemFromDb,
  resetGalleryInDb,
  saveAllGalleryItemsToDb,
} from '../services/firestoreService';
import {
  loadGalleryFromDatabase,
  saveGalleryToDatabase,
  optimizeImageFile,
  getGalleryFromLocalStorage,
} from '../utils/storageDb';
import { playSparkleSound, playPopSound, playCuteMeow } from '../utils/audio';
import { fireConfettiCannon, fireHeartConfetti } from '../utils/confetti';

interface PhotoMemeGalleryProps {
  siteContent?: SiteContent;
  onOpenEditSiteText?: () => void;
}

// Default blank placeholder SVG
const BLANK_PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" fill="%23FFF1F2"/><rect x="40" y="40" width="320" height="320" rx="20" stroke="%23FDA4AF" stroke-width="4" stroke-dasharray="10 10"/><circle cx="200" cy="180" r="50" fill="%23FFE4E6"/><path d="M185 170C185 161.716 191.716 155 200 155C208.284 155 215 161.716 215 170C215 178.284 208.284 185 200 185C191.716 185 185 178.284 185 170Z" fill="%23F43F5E"/><path d="M150 260C150 235 175 215 200 215C225 215 250 235 250 260" stroke="%23FB7185" stroke-width="8" stroke-linecap="round"/><text x="200" y="305" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23E11D48" text-anchor="middle">Klik untuk Pasang Foto 📸</text></svg>';

export function PhotoMemeGallery({
  siteContent = DEFAULT_SITE_CONTENT,
  onOpenEditSiteText,
}: PhotoMemeGalleryProps) {
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    return getGalleryFromLocalStorage() || INITIAL_GALLERY;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavedToastVisible, setIsSavedToastVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'meme' | 'cute' | 'special'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  // Modal states: 'add' | 'edit' | null
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formCategory, setFormCategory] = useState<'meme' | 'cute' | 'special'>('special');
  const [formBadge, setFormBadge] = useState('Spesial ✨');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to real-time Firestore database
  useEffect(() => {
    const unsubscribe = subscribeGallery((items) => {
      if (items && items.length > 0) {
        setGallery(items);
        // Also sync to local indexedDB as cache
        saveGalleryToDatabase(items).catch(() => {});
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const triggerSavedToast = () => {
    setIsSavedToastVisible(true);
    setTimeout(() => {
      setIsSavedToastVisible(false);
    }, 2500);
  };

  const saveAndSync = async (updated: GalleryItem[]) => {
    setGallery(updated);
    await saveGalleryToDatabase(updated);
    await saveAllGalleryItemsToDb(updated);
    triggerSavedToast();
  };

  const filteredItems = gallery.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingPhotoId(null);
    setFormTitle('');
    setFormCaption('');
    setFormCategory('special');
    setFormBadge('Spesial ✨');
    setFormImageUrl('');
  };

  const handleOpenEditModal = (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalMode('edit');
    setEditingPhotoId(item.id);
    setFormTitle(item.title);
    setFormCaption(item.caption);
    setFormCategory(item.category);
    setFormBadge(item.badge || 'Spesial ✨');
    setFormImageUrl(item.imageUrl);
  };

  const handleAddBlankPhotoSlot = async () => {
    playSparkleSound();
    fireConfettiCannon();
    const blankItem: GalleryItem = {
      id: `blank-slot-${Date.now()}`,
      title: 'Slot Foto Baru Jovanka 🌸',
      caption: 'Klik tombol edit (✏️) untuk memasukkan foto spesialmu di sini!',
      imageUrl: BLANK_PLACEHOLDER_IMAGE,
      category: activeCategory === 'all' ? 'special' : activeCategory,
      badge: 'Foto Baru 🖼️',
      rotation: Math.floor(Math.random() * 6) - 3,
    };

    const updated = [blankItem, ...gallery];
    await saveAndSync(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      const optimizedDataUrl = await optimizeImageFile(file, 1200, 0.85);
      setFormImageUrl(optimizedDataUrl);
    } catch (err) {
      console.error('Error optimizing image:', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = formImageUrl.trim() || BLANK_PLACEHOLDER_IMAGE;

    playSparkleSound();
    fireConfettiCannon();

    if (modalMode === 'edit' && editingPhotoId) {
      // Edit existing photo
      const updated = gallery.map((item) => {
        if (item.id === editingPhotoId) {
          return {
            ...item,
            title: formTitle.trim() || 'Momen Spesial Jovanka 🌸',
            caption: formCaption.trim() || 'Foto kenangan manis yang selalu bikin senyum!',
            imageUrl: finalImage,
            category: formCategory,
            badge: formBadge.trim() || 'Spesial ✨',
          };
        }
        return item;
      });

      await saveAndSync(updated);

      if (selectedPhoto && selectedPhoto.id === editingPhotoId) {
        setSelectedPhoto({
          ...selectedPhoto,
          title: formTitle.trim() || 'Momen Spesial Jovanka 🌸',
          caption: formCaption.trim() || 'Foto kenangan manis yang selalu bikin senyum!',
          imageUrl: finalImage,
          category: formCategory,
          badge: formBadge.trim() || 'Spesial ✨',
        });
      }
    } else {
      // Add new photo
      const newItem: GalleryItem = {
        id: `custom-gal-${Date.now()}`,
        title: formTitle.trim() || 'Momen Spesial Jovanka 🌸',
        caption: formCaption.trim() || 'Foto kenangan manis yang selalu bikin senyum!',
        imageUrl: finalImage,
        category: formCategory,
        badge: formBadge.trim() || 'Spesial ✨',
        rotation: Math.floor(Math.random() * 6) - 3,
      };

      const updated = [newItem, ...gallery];
      await saveAndSync(updated);
    }

    setModalMode(null);
    setEditingPhotoId(null);
  };

  const handleDeletePhoto = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (window.confirm('Hapus foto ini dari galeri kenangan?')) {
      playPopSound();
      const updated = gallery.filter((item) => item.id !== id);
      await saveAndSync(updated);
      if (selectedPhoto?.id === id) {
        setSelectedPhoto(null);
      }
    }
  };

  const handleClearAllPhotos = async () => {
    if (
      window.confirm(
        'Kosongkan semua foto dari galeri? (Kamu bisa menambahkan foto baru atau mereset ke foto awal kapan saja).'
      )
    ) {
      playPopSound();
      await saveAndSync([]);
      setSelectedPhoto(null);
    }
  };

  const handleResetDefaultPhotos = async () => {
    if (window.confirm('Kembalikan semua foto & meme bawaan semula di cloud database?')) {
      playSparkleSound();
      await resetGalleryInDb();
      setGallery(INITIAL_GALLERY);
      await saveGalleryToDatabase(INITIAL_GALLERY);
      triggerSavedToast();
    }
  };

  const handlePhotoClick = (item: GalleryItem) => {
    if (item.imageUrl === BLANK_PLACEHOLDER_IMAGE) {
      handleOpenEditModal(item);
      return;
    }

    playSparkleSound();
    if (item.category === 'cute') {
      playCuteMeow();
    }
    setSelectedPhoto(item);
  };

  const handleSendHeartToPhoto = () => {
    playCuteMeow();
    fireHeartConfetti();
  };

  return (
    <section id="section-gallery" className="py-16 px-4 bg-pink-50/60 relative overflow-hidden">
      {/* Toast Notification when saved to Database */}
      {isSavedToastVisible && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-pink-400/50 flex items-center gap-2 animate-bounce text-xs font-bold">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Foto & Galeri Berhasil Disimpan Permanen di Database! 💾✨</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-200/80 text-pink-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            <span>VIP Photo Wall & Gallery Studio</span>
            <span className="bg-white/80 px-2 py-0.5 rounded-full text-[10px] text-pink-700 font-bold ml-1">
              💾 Auto-Saved in Cloud DB
            </span>
          </div>
          <div className="relative group inline-block max-w-full">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-['Playfair_Display',serif] mb-2">
              {siteContent.galleryTitle}
            </h3>
            {onOpenEditSiteText && (
              <button
                onClick={onOpenEditSiteText}
                className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-6 p-1 bg-pink-100 hover:bg-pink-200 rounded-full text-pink-700 transition-opacity cursor-pointer"
                title="Edit Judul Galeri"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto font-medium">
            {siteContent.gallerySubtitle}
          </p>
        </div>

        {/* Filter buttons & Action Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-pink-200 hover:bg-pink-100'
              }`}
            >
              Semua Foto ({gallery.length})
            </button>
            <button
              onClick={() => setActiveCategory('meme')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'meme'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-pink-200 hover:bg-pink-100'
              }`}
            >
              👑 Meme & Lucu
            </button>
            <button
              onClick={() => setActiveCategory('cute')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'cute'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-pink-200 hover:bg-pink-100'
              }`}
            >
              🐱 Kucing & Gemoy
            </button>
            <button
              onClick={() => setActiveCategory('special')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'special'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-pink-200 hover:bg-pink-100'
              }`}
            >
              🌸 Foto Cantik & Manis
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Export to GitHub Code Button */}
            <button
              id="btn-export-gallery-code"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Export foto & galeri langsung ke codingan GitHub (Zero Database Required)"
            >
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Codingan 💻</span>
            </button>

            {/* Add Blank Photo Button */}
            <button
              id="btn-add-blank-photo"
              onClick={handleAddBlankPhotoSlot}
              className="flex items-center gap-1 px-3.5 py-2 rounded-full bg-white hover:bg-pink-100 text-pink-700 text-xs font-bold border border-pink-300 shadow-2xs active:scale-95 transition-all cursor-pointer"
              title="Tambahkan slot bingkai foto kosong baru"
            >
              <FileImage className="w-3.5 h-3.5 text-pink-500" />
              <span>+ Slot Foto Kosong 🖼️</span>
            </button>

            {/* Add Custom Photo Button */}
            <button
              id="btn-add-photo-trigger"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Foto Baru 📸</span>
            </button>

            {/* Reset Defaults */}
            <button
              onClick={handleResetDefaultPhotos}
              className="p-2 rounded-full bg-white hover:bg-pink-100 text-slate-600 hover:text-pink-700 border border-pink-200 shadow-2xs transition-all cursor-pointer"
              title="Kembalikan semua foto bawaan awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Clear All */}
            {gallery.length > 0 && (
              <button
                onClick={handleClearAllPhotos}
                className="p-2 rounded-full bg-white hover:bg-rose-100 text-slate-400 hover:text-rose-600 border border-pink-200 shadow-2xs transition-all cursor-pointer"
                title="Hapus / Kosongkan semua foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Polaroid Grid Display */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/80 rounded-3xl border-2 border-dashed border-pink-300 max-w-md mx-auto shadow-sm">
            <div className="text-5xl mb-3 animate-bounce">🖼️✨</div>
            <h4 className="font-bold text-slate-800 text-base mb-1">Galeri Masih Kosong</h4>
            <p className="text-xs text-slate-600 mb-5 max-w-xs mx-auto">
              Semua foto telah dihapus. Kamu bisa mengupload foto custom dari perangkatmu atau mengembalikan foto bawaan!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-full bg-pink-600 text-white text-xs font-bold shadow-xs hover:bg-pink-700 cursor-pointer"
              >
                Upload Foto Baru 📸
              </button>
              <button
                onClick={handleAddBlankPhotoSlot}
                className="px-4 py-2 rounded-full bg-pink-100 text-pink-800 text-xs font-bold hover:bg-pink-200 cursor-pointer"
              >
                + Slot Foto Kosong 🖼️
              </button>
              <button
                onClick={handleResetDefaultPhotos}
                className="px-4 py-2 rounded-full bg-white border border-pink-200 text-slate-600 text-xs font-bold hover:bg-pink-50 cursor-pointer"
              >
                Reset Foto Bawaan 🔄
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {filteredItems.map((item) => {
              const isBlank = item.imageUrl === BLANK_PLACEHOLDER_IMAGE;
              return (
                <div
                  key={item.id}
                  onClick={() => handlePhotoClick(item)}
                  style={{
                    transform: `rotate(${item.rotation || 0}deg)`,
                  }}
                  className={`bg-white p-4 pb-5 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 hover:rotate-0 transition-all duration-300 border ${
                    isBlank ? 'border-2 border-dashed border-pink-300 bg-pink-50/40' : 'border-pink-100'
                  } group cursor-pointer relative`}
                >
                  {/* Tape sticker visual */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-pink-200/70 backdrop-blur-2xs rounded-xs rotate-[-2deg] z-10 shadow-2xs border border-pink-300/40" />

                  {/* Badge */}
                  {item.badge && (
                    <div className="absolute top-6 right-6 z-10 bg-pink-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {item.badge}
                    </div>
                  )}

                  {/* Card Quick Action Buttons: EDIT (✏️) & DELETE (🗑️) */}
                  <div className="absolute top-6 left-6 z-20 flex items-center gap-1">
                    {/* Edit button */}
                    <button
                      onClick={(e) => handleOpenEditModal(item, e)}
                      className="p-1.5 rounded-full bg-white/95 hover:bg-pink-600 text-slate-600 hover:text-white text-xs shadow-md border border-pink-200 transition-all cursor-pointer"
                      title="Edit Judul, Caption, atau Ganti Foto"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeletePhoto(item.id, e)}
                      className="p-1.5 rounded-full bg-white/95 hover:bg-rose-600 text-slate-400 hover:text-white text-xs shadow-md border border-pink-200 transition-all cursor-pointer"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Photo Frame */}
                  <div className="w-full aspect-square bg-pink-50 rounded-xl overflow-hidden mb-3 relative group-hover:brightness-105">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-white/95 text-pink-600 flex items-center justify-center shadow-md">
                        {isBlank ? <Pencil className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Caption & Title */}
                  <div className="text-center">
                    <h4 className="font-bold text-slate-800 text-sm font-['Playfair_Display',serif] mb-1 group-hover:text-pink-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-['Caveat',cursive] text-base leading-snug line-clamp-2">
                      &ldquo;{item.caption}&rdquo;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Lightbox for Full Photo Preview */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-4 border-pink-200 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold transition-all cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full max-h-80 aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-inner flex items-center justify-center">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-center">
                <div className="inline-block px-3 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
                  {selectedPhoto.badge || 'VIP Jovanka ✨'}
                </div>
                <h4 className="text-xl font-bold text-slate-800 font-['Playfair_Display',serif] mb-2">
                  {selectedPhoto.title}
                </h4>
                <p className="text-sm text-slate-700 font-['Caveat',cursive] text-xl leading-relaxed mb-4">
                  {selectedPhoto.caption}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {/* Send Heart */}
                  <button
                    onClick={handleSendHeartToPhoto}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Kirim Love 💖</span>
                  </button>

                  {/* Edit Photo Button in Preview */}
                  <button
                    onClick={() => {
                      const photoToEdit = selectedPhoto;
                      setSelectedPhoto(null);
                      handleOpenEditModal(photoToEdit);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold text-xs border border-pink-300 shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-pink-600" />
                    <span>Edit Foto / Teks ✏️</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeletePhoto(selectedPhoto.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 shadow-2xs active:scale-95 transition-all cursor-pointer"
                    title="Hapus foto ini dari galeri"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hapus 🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Adding or Editing Photo */}
        {modalMode && (
          <div
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
            onClick={() => setModalMode(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-pink-200 relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setModalMode(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-pink-900 font-bold text-lg mb-4">
                {modalMode === 'edit' ? (
                  <>
                    <Pencil className="w-5 h-5 text-pink-600" />
                    <span>Edit Foto & Teks Kenangan</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 text-pink-600" />
                    <span>Tambah Foto / Kenangan Baru</span>
                  </>
                )}
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                {/* Quick Asset / Meme Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Atau Pilih Template Meme / Foto Bawaan:</span>
                    <span className="text-[10px] text-pink-600 font-normal">1-klik terapkan ✨</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-pink-50/50 rounded-xl border border-pink-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl(INITIAL_GALLERY[0].imageUrl);
                        setFormTitle('Sujud Sembah Kanjeng Ratu Jovanka 👑🧽');
                        setFormCaption('SpongeBob langsung sujud hormat di depan Kanjeng Ratu Jovanka!');
                        setFormCategory('meme');
                        setFormBadge('Meme Legend 👑');
                        playSparkleSound();
                      }}
                      className="p-1.5 rounded-lg bg-white border border-pink-200 text-left hover:border-pink-500 hover:bg-pink-100/50 transition-all text-[10px] font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <span className="text-base">👑</span>
                      <span className="truncate">SpongeBob Sujud</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl(INITIAL_GALLERY[1]?.imageUrl || INITIAL_GALLERY[0].imageUrl);
                        setFormTitle('Patrick Bawa Spanduk Fans Berat 🌟🎂');
                        setFormCaption("Patrick: 'HAPPY BIRTHDAY JOVANKA! Fans nomor satu sedunia!'");
                        setFormCategory('meme');
                        setFormBadge('Fans Club 🌟');
                        playSparkleSound();
                      }}
                      className="p-1.5 rounded-lg bg-white border border-pink-200 text-left hover:border-pink-500 hover:bg-pink-100/50 transition-all text-[10px] font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <span className="text-base">🌟</span>
                      <span className="truncate">Patrick Fans</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl(INITIAL_GALLERY[2]?.imageUrl || INITIAL_GALLERY[0].imageUrl);
                        setFormTitle('Sistem Radar Anti-Cowok Red Flag 🛡️⚡');
                        setFormCaption('Radar aktif: Cowok red flag dilarang mendekat ke Jovanka!');
                        setFormCategory('meme');
                        setFormBadge('100% Aman 🚨');
                        playSparkleSound();
                      }}
                      className="p-1.5 rounded-lg bg-white border border-pink-200 text-left hover:border-pink-500 hover:bg-pink-100/50 transition-all text-[10px] font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <span className="text-base">🛡️</span>
                      <span className="truncate">Radar Red-Flag</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80');
                        setFormTitle('Kucing Mahkota Bunga 🌸🐱');
                        setFormCaption('Mode gemoy Jovanka: siap dapet traktiran kue!');
                        setFormCategory('cute');
                        setFormBadge('Cute Queen 🐾');
                        playCuteMeow();
                      }}
                      className="p-1.5 rounded-lg bg-white border border-pink-200 text-left hover:border-pink-500 hover:bg-pink-100/50 transition-all text-[10px] font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <span className="text-base">🌸</span>
                      <span className="truncate">Kucing Bunga</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl('https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80');
                        setFormTitle('Buket Bunga dari Empus 💐🐾');
                        setFormCaption('Kado bunga wangi spesial buat hari ulang tahunmu!');
                        setFormCategory('cute');
                        setFormBadge('Buket Cinta 💖');
                        playCuteMeow();
                      }}
                      className="p-1.5 rounded-lg bg-white border border-pink-200 text-left hover:border-pink-500 hover:bg-pink-100/50 transition-all text-[10px] font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <span className="text-base">💐</span>
                      <span className="truncate">Buket Empus</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl('https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80');
                        setFormTitle('Mode Bos Senggol Bacok 🕶️😼');
                        setFormCaption('Anti cowok red flag, langsung luluh kalau diajak boba!');
                        setFormCategory('meme');
                        setFormBadge('Boss Mode 😎');
                        playSparkleSound();
                      }}
                      className="p-1.5 rounded-lg bg-white border border-pink-200 text-left hover:border-pink-500 hover:bg-pink-100/50 transition-all text-[10px] font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <span className="text-base">🕶️</span>
                      <span className="truncate">Bos Kacamata</span>
                    </button>
                  </div>
                </div>

                {/* Upload Section */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Atau Upload Foto dari HP / Laptop:
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        try {
                          setIsProcessingImage(true);
                          const optimizedDataUrl = await optimizeImageFile(file, 1200, 0.85);
                          setFormImageUrl(optimizedDataUrl);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsProcessingImage(false);
                        }
                      }
                    }}
                    className="border-2 border-dashed border-pink-300 rounded-2xl p-4 text-center hover:bg-pink-50/50 cursor-pointer transition-colors bg-pink-50/20"
                  >
                    {isProcessingImage ? (
                      <div className="py-4 text-pink-600 font-bold text-xs flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                        <span>Mengompres & Menyiapkan Foto...</span>
                      </div>
                    ) : formImageUrl && formImageUrl !== BLANK_PLACEHOLDER_IMAGE ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-28 h-28 mx-auto rounded-xl overflow-hidden border-2 border-pink-300 shadow-sm">
                          <img
                            src={formImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-pink-600 hover:underline">
                          Klik / Tarik file untuk ganti foto 🔄
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 text-pink-600 py-3">
                        <Upload className="w-7 h-7 animate-bounce" />
                        <span className="text-xs font-bold">Klik atau Drag & Drop foto ke sini (JPG / PNG)</span>
                        <span className="text-[10px] text-slate-400">Tersimpan di browser & database 💾</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-px bg-pink-200 flex-1" />
                  <span className="text-[11px] text-slate-400 font-semibold">ATAU LINK URL</span>
                  <div className="h-px bg-pink-200 flex-1" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Link / URL Foto Online:
                  </label>
                  <input
                    type="url"
                    value={formImageUrl.startsWith('data:') ? '' : formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... atau link foto"
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Foto:
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Senyuman Paling Menyilaukan ✨"
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Caption Lucu / Manis:
                  </label>
                  <textarea
                    value={formCaption}
                    onChange={(e) => setFormCaption(e.target.value)}
                    placeholder="Contoh: Jangan sering-sering cemberut ya, nanti cantiknya berkurang!"
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-pink-200 text-xs text-slate-800 focus:ring-2 focus:ring-pink-400 focus:outline-hidden resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kategori:
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as 'meme' | 'cute' | 'special')}
                      className="w-full p-2 rounded-xl border border-pink-200 text-xs text-slate-800 bg-white"
                    >
                      <option value="special">🌸 Cantik & Manis</option>
                      <option value="meme">👑 Meme & Lucu</option>
                      <option value="cute">🐱 Kucing & Gemoy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Badge Stiker:
                    </label>
                    <input
                      type="text"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="Contoh: Ratu Gemoy 👑"
                      className="w-full p-2 rounded-xl border border-pink-200 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{modalMode === 'edit' ? 'Simpan Perubahan 💾' : 'Upload & Simpan 📸'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Export to TypeScript Codingan Modal */}
        {isExportModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
            onClick={() => setIsExportModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl border-2 border-pink-300 relative my-6 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-pink-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-amber-400">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base sm:text-lg font-['Playfair_Display',serif]">
                      Export Data Galeri ke Codingan GitHub 💻
                    </h3>
                    <p className="text-[11px] text-pink-600 font-medium">
                      Salin data ini ke <code>src/data/initialData.ts</code> agar foto & teks tertanam permanen tanpa database!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Code className="w-4 h-4" />
                    <span>export const INITIAL_GALLERY: GalleryItem[] = ...</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const code = `export const INITIAL_GALLERY: GalleryItem[] = ${JSON.stringify(gallery, null, 2)};\n`;
                        navigator.clipboard.writeText(code);
                        setCopiedCode(true);
                        playSparkleSound();
                        setTimeout(() => setCopiedCode(false), 2500);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode ? 'Disalin! ✅' : 'Salin Kode Galeri'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const code = `export const INITIAL_GALLERY: GalleryItem[] = ${JSON.stringify(gallery, null, 2)};\n`;
                        const blob = new Blob([code], { type: 'text/typescript;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'initialGallery.ts';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        playSparkleSound();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .ts</span>
                    </button>
                  </div>
                </div>
                <pre className="text-[10px] font-mono bg-black/60 p-3 rounded-xl overflow-x-auto max-h-60 text-pink-200">
                  {`export const INITIAL_GALLERY: GalleryItem[] = ${JSON.stringify(gallery, null, 2)};`}
                </pre>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
