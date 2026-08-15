import { GalleryItem } from '../types';
import { INITIAL_GALLERY } from '../data/initialData';

const DB_NAME = 'JovankaBirthdayDB_v4';
const DB_VERSION = 1;
const STORE_NAME = 'gallery_photos';
const LOCAL_STORAGE_KEY = 'jovanka_custom_gallery_v4';

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Compress / optimize images before saving to storage to prevent lag
export async function optimizeImageFile(file: File, maxDimension = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Try webp first, fallback to jpeg
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Load all gallery items from IndexedDB, fallback to localStorage or INITIAL_GALLERY
export async function loadGalleryFromDatabase(): Promise<GalleryItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as GalleryItem[];
        if (items && items.length > 0) {
          resolve(items);
        } else {
          // Fallback to localStorage or INITIAL_GALLERY
          const localData = getGalleryFromLocalStorage();
          if (localData && localData.length > 0) {
            // Seed to DB
            saveGalleryToDatabase(localData).catch(() => {});
            resolve(localData);
          } else {
            // Seed initial
            saveGalleryToDatabase(INITIAL_GALLERY).catch(() => {});
            resolve(INITIAL_GALLERY);
          }
        }
      };

      request.onerror = () => {
        resolve(getGalleryFromLocalStorage() || INITIAL_GALLERY);
      };
    });
  } catch (err) {
    console.warn('IndexedDB not accessible, using localStorage:', err);
    return getGalleryFromLocalStorage() || INITIAL_GALLERY;
  }
}

// Save entire gallery items to IndexedDB and backup to localStorage
export async function saveGalleryToDatabase(items: GalleryItem[]): Promise<void> {
  // 1. Backup to localStorage (try/catch in case quota exceeded)
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage quota exceeded, stored in IndexedDB only:', e);
  }

  // 2. Persist in IndexedDB
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Clear existing records in store to maintain exact array order
      store.clear();
      
      for (const item of items) {
        store.put(item);
      }

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (err) {
    console.error('Error saving to IndexedDB:', err);
  }
}

// Reset database back to default initial gallery
export async function resetGalleryDatabase(): Promise<GalleryItem[]> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });
  } catch (e) {
    console.warn('Error clearing DB store:', e);
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }

  await saveGalleryToDatabase(INITIAL_GALLERY);
  return INITIAL_GALLERY;
}

// Synchronous helper for initial hydration
export function getGalleryFromLocalStorage(): GalleryItem[] | null {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}
