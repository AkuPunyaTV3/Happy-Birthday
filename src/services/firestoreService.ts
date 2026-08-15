import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  SiteContent,
  PoemData,
  SpecialReason,
  VirtualGift,
  GalleryItem,
  UserWish,
} from '../types';
import {
  DEFAULT_SITE_CONTENT,
  INITIAL_POEMS,
  INITIAL_GALLERY,
  SPECIAL_REASONS,
  VIRTUAL_GIFTS,
  COMPLIMENTS,
  INITIAL_WISHES,
} from '../data/initialData';

// -------------------------------------------------------------
// 1. SITE CONTENT (Hero titles, quotes, headings, footer)
// -------------------------------------------------------------
const SITE_CONTENT_PATH = 'site_content';
const SITE_CONTENT_DOC = 'main';
const LOCAL_KEY_SITE_CONTENT = 'jovanka_db_site_content_v5';

export function subscribeSiteContent(
  onUpdate: (content: SiteContent) => void
): () => void {
  const docRef = doc(db, SITE_CONTENT_PATH, SITE_CONTENT_DOC);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteContent;
        const merged = { ...DEFAULT_SITE_CONTENT, ...data };
        localStorage.setItem(LOCAL_KEY_SITE_CONTENT, JSON.stringify(merged));
        onUpdate(merged);
      } else {
        // Initialize doc in Firestore
        setDoc(docRef, {
          ...DEFAULT_SITE_CONTENT,
          updatedAt: new Date().toISOString(),
        }).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, SITE_CONTENT_PATH);
        });
        onUpdate(DEFAULT_SITE_CONTENT);
      }
    },
    (error) => {
      console.warn('Firestore site_content subscription error:', error);
      try {
        const saved = localStorage.getItem(LOCAL_KEY_SITE_CONTENT);
        if (saved) onUpdate(JSON.parse(saved));
      } catch {
        onUpdate(DEFAULT_SITE_CONTENT);
      }
    }
  );
}

export async function saveSiteContentToDb(content: Partial<SiteContent>): Promise<void> {
  const docRef = doc(db, SITE_CONTENT_PATH, SITE_CONTENT_DOC);
  try {
    const payload = {
      ...content,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    const saved = localStorage.getItem(LOCAL_KEY_SITE_CONTENT);
    const existing = saved ? JSON.parse(saved) : DEFAULT_SITE_CONTENT;
    localStorage.setItem(LOCAL_KEY_SITE_CONTENT, JSON.stringify({ ...existing, ...payload }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SITE_CONTENT_PATH}/${SITE_CONTENT_DOC}`);
  }
}

export function getCachedSiteContent(): SiteContent {
  try {
    const saved = localStorage.getItem(LOCAL_KEY_SITE_CONTENT);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return DEFAULT_SITE_CONTENT;
}

// -------------------------------------------------------------
// 2. POEMS & LETTERS
// -------------------------------------------------------------
const POEMS_COLLECTION = 'poems';
const LOCAL_KEY_POEMS = 'jovanka_db_poems_v5';

export function subscribePoems(
  onUpdate: (poems: PoemData[]) => void
): () => void {
  const colRef = collection(db, POEMS_COLLECTION);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (!snapshot.empty) {
        const list: PoemData[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<PoemData, 'id'>) });
        });
        const ordered = [
          list.find((p) => p.id === 'poem-tears' || p.category === 'crying') || INITIAL_POEMS[0],
          list.find((p) => p.id === 'poem-gratitude' || p.category === 'heartfelt') || INITIAL_POEMS[1],
          list.find((p) => p.id === 'poem-funny' || p.category === 'funny_sweet') || INITIAL_POEMS[2],
        ].filter(Boolean) as PoemData[];

        localStorage.setItem(LOCAL_KEY_POEMS, JSON.stringify(ordered));
        onUpdate(ordered);
      } else {
        try {
          for (const poem of INITIAL_POEMS) {
            await setDoc(doc(db, POEMS_COLLECTION, poem.id), {
              title: poem.title,
              category: poem.category,
              content: poem.content,
              authorNote: poem.authorNote || '',
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, POEMS_COLLECTION);
        }
        onUpdate(INITIAL_POEMS);
      }
    },
    (error) => {
      console.warn('Firestore poems subscription error:', error);
      try {
        const saved = localStorage.getItem(LOCAL_KEY_POEMS);
        if (saved) onUpdate(JSON.parse(saved));
      } catch {
        onUpdate(INITIAL_POEMS);
      }
    }
  );
}

export async function savePoemToDb(poem: PoemData): Promise<void> {
  const docRef = doc(db, POEMS_COLLECTION, poem.id);
  try {
    await setDoc(
      docRef,
      {
        title: poem.title,
        category: poem.category,
        content: poem.content,
        authorNote: poem.authorNote || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${POEMS_COLLECTION}/${poem.id}`);
  }
}

export async function resetPoemsInDb(): Promise<void> {
  try {
    for (const p of INITIAL_POEMS) {
      await setDoc(doc(db, POEMS_COLLECTION, p.id), {
        title: p.title,
        category: p.category,
        content: p.content,
        authorNote: p.authorNote || '',
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.removeItem(LOCAL_KEY_POEMS);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, POEMS_COLLECTION);
  }
}

// -------------------------------------------------------------
// 3. SPECIAL REASONS WHY JOVANKA IS SPECIAL
// -------------------------------------------------------------
const REASONS_COLLECTION = 'reasons';
const LOCAL_KEY_REASONS = 'jovanka_db_reasons_v5';

export function subscribeSpecialReasons(
  onUpdate: (reasons: SpecialReason[]) => void
): () => void {
  const colRef = collection(db, REASONS_COLLECTION);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (!snapshot.empty) {
        const list: SpecialReason[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: Number(d.id.replace('reason-', '')) || (data.order ?? 1),
            title: data.title || '',
            emoji: data.emoji || '💖',
            description: data.description || '',
            revealed: data.revealed ?? false,
          });
        });
        list.sort((a, b) => a.id - b.id);
        localStorage.setItem(LOCAL_KEY_REASONS, JSON.stringify(list));
        onUpdate(list);
      } else {
        // Check if user has initialized or if first time
        const local = localStorage.getItem(LOCAL_KEY_REASONS);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            onUpdate(parsed);
            return;
          } catch {
            // ignore
          }
        }
        // First-time seed
        try {
          for (const r of SPECIAL_REASONS) {
            await setDoc(doc(db, REASONS_COLLECTION, `reason-${r.id}`), {
              order: r.id,
              emoji: r.emoji,
              title: r.title,
              description: r.description,
              revealed: false,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, REASONS_COLLECTION);
        }
        onUpdate(SPECIAL_REASONS);
      }
    },
    (error) => {
      console.warn('Firestore reasons subscription error:', error);
      try {
        const saved = localStorage.getItem(LOCAL_KEY_REASONS);
        if (saved) onUpdate(JSON.parse(saved));
      } catch {
        onUpdate(SPECIAL_REASONS);
      }
    }
  );
}

export async function saveSpecialReasonToDb(reason: SpecialReason): Promise<void> {
  const docRef = doc(db, REASONS_COLLECTION, `reason-${reason.id}`);
  try {
    await setDoc(
      docRef,
      {
        order: reason.id,
        emoji: reason.emoji,
        title: reason.title,
        description: reason.description,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    // Update local cache
    const saved = localStorage.getItem(LOCAL_KEY_REASONS);
    if (saved) {
      const list: SpecialReason[] = JSON.parse(saved);
      const updated = list.some((r) => r.id === reason.id)
        ? list.map((r) => (r.id === reason.id ? reason : r))
        : [...list, reason];
      localStorage.setItem(LOCAL_KEY_REASONS, JSON.stringify(updated));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${REASONS_COLLECTION}/reason-${reason.id}`);
  }
}

export async function saveAllSpecialReasonsToDb(reasons: SpecialReason[]): Promise<void> {
  try {
    for (let i = 0; i < reasons.length; i++) {
      const r = reasons[i];
      await setDoc(
        doc(db, REASONS_COLLECTION, `reason-${r.id}`),
        {
          order: r.id,
          emoji: r.emoji,
          title: r.title,
          description: r.description,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    localStorage.setItem(LOCAL_KEY_REASONS, JSON.stringify(reasons));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, REASONS_COLLECTION);
  }
}

export async function deleteSpecialReasonFromDb(id: number | string): Promise<void> {
  try {
    await deleteDoc(doc(db, REASONS_COLLECTION, `reason-${id}`));
    // Also try direct id doc if different
    await deleteDoc(doc(db, REASONS_COLLECTION, String(id))).catch(() => {});

    // Update localStorage
    const saved = localStorage.getItem(LOCAL_KEY_REASONS);
    if (saved) {
      const list: SpecialReason[] = JSON.parse(saved);
      const filtered = list.filter((r) => r.id !== Number(id) && String(r.id) !== String(id));
      localStorage.setItem(LOCAL_KEY_REASONS, JSON.stringify(filtered));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${REASONS_COLLECTION}/reason-${id}`);
  }
}

export async function resetSpecialReasonsInDb(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, REASONS_COLLECTION));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
    for (const r of SPECIAL_REASONS) {
      await setDoc(doc(db, REASONS_COLLECTION, `reason-${r.id}`), {
        order: r.id,
        emoji: r.emoji,
        title: r.title,
        description: r.description,
        revealed: false,
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(LOCAL_KEY_REASONS, JSON.stringify(SPECIAL_REASONS));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, REASONS_COLLECTION);
  }
}

// -------------------------------------------------------------
// 4. VIRTUAL GIFTS
// -------------------------------------------------------------
const GIFTS_COLLECTION = 'gifts';
const LOCAL_KEY_GIFTS = 'jovanka_db_gifts_v5';

export function subscribeVirtualGifts(
  onUpdate: (gifts: VirtualGift[]) => void
): () => void {
  const colRef = collection(db, GIFTS_COLLECTION);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (!snapshot.empty) {
        const list: VirtualGift[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<VirtualGift, 'id'>) });
        });
        list.sort((a, b) => a.id.localeCompare(b.id));
        localStorage.setItem(LOCAL_KEY_GIFTS, JSON.stringify(list));
        onUpdate(list);
      } else {
        const local = localStorage.getItem(LOCAL_KEY_GIFTS);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            onUpdate(parsed);
            return;
          } catch {
            // ignore
          }
        }
        try {
          for (const g of VIRTUAL_GIFTS) {
            await setDoc(doc(db, GIFTS_COLLECTION, g.id), {
              title: g.title,
              boxColor: g.boxColor,
              ribbonColor: g.ribbonColor,
              giftIcon: g.giftIcon,
              giftTitle: g.giftTitle,
              giftContent: g.giftContent,
              opened: false,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, GIFTS_COLLECTION);
        }
        onUpdate(VIRTUAL_GIFTS);
      }
    },
    (error) => {
      console.warn('Firestore gifts subscription error:', error);
      try {
        const saved = localStorage.getItem(LOCAL_KEY_GIFTS);
        if (saved) onUpdate(JSON.parse(saved));
      } catch {
        onUpdate(VIRTUAL_GIFTS);
      }
    }
  );
}

export async function saveVirtualGiftToDb(gift: VirtualGift): Promise<void> {
  const docRef = doc(db, GIFTS_COLLECTION, gift.id);
  try {
    await setDoc(
      docRef,
      {
        title: gift.title,
        boxColor: gift.boxColor,
        ribbonColor: gift.ribbonColor,
        giftIcon: gift.giftIcon,
        giftTitle: gift.giftTitle,
        giftContent: gift.giftContent,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    const saved = localStorage.getItem(LOCAL_KEY_GIFTS);
    if (saved) {
      const list: VirtualGift[] = JSON.parse(saved);
      const updated = list.some((g) => g.id === gift.id)
        ? list.map((g) => (g.id === gift.id ? gift : g))
        : [...list, gift];
      localStorage.setItem(LOCAL_KEY_GIFTS, JSON.stringify(updated));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${GIFTS_COLLECTION}/${gift.id}`);
  }
}

export async function deleteVirtualGiftFromDb(id: string): Promise<void> {
  const docRef = doc(db, GIFTS_COLLECTION, id);
  try {
    await deleteDoc(docRef);
    const saved = localStorage.getItem(LOCAL_KEY_GIFTS);
    if (saved) {
      const list: VirtualGift[] = JSON.parse(saved);
      const filtered = list.filter((g) => g.id !== id);
      localStorage.setItem(LOCAL_KEY_GIFTS, JSON.stringify(filtered));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${GIFTS_COLLECTION}/${id}`);
  }
}

export async function resetVirtualGiftsInDb(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, GIFTS_COLLECTION));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
    for (const g of VIRTUAL_GIFTS) {
      await setDoc(doc(db, GIFTS_COLLECTION, g.id), {
        title: g.title,
        boxColor: g.boxColor,
        ribbonColor: g.ribbonColor,
        giftIcon: g.giftIcon,
        giftTitle: g.giftTitle,
        giftContent: g.giftContent,
        opened: false,
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(LOCAL_KEY_GIFTS, JSON.stringify(VIRTUAL_GIFTS));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GIFTS_COLLECTION);
  }
}

// -------------------------------------------------------------
// 5. GALLERY & MEME PHOTOS
// -------------------------------------------------------------
const GALLERY_COLLECTION = 'gallery';
const LOCAL_KEY_GALLERY = 'jovanka_db_gallery_v5';

export function subscribeGalleryItems(
  onUpdate: (items: GalleryItem[]) => void
): () => void {
  const colRef = collection(db, GALLERY_COLLECTION);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (!snapshot.empty) {
        const list: GalleryItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            title: data.title || '',
            caption: data.caption || '',
            imageUrl: data.imageUrl || '',
            category: data.category || 'special',
            badge: data.badge || '',
            rotation: data.rotation ?? 0,
            order: data.order ?? 0,
          });
        });
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        localStorage.setItem(LOCAL_KEY_GALLERY, JSON.stringify(list));
        onUpdate(list);
      } else {
        const local = localStorage.getItem(LOCAL_KEY_GALLERY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            onUpdate(parsed);
            return;
          } catch {
            // ignore
          }
        }
        // First-time seed
        try {
          let idx = 0;
          for (const item of INITIAL_GALLERY) {
            await setDoc(doc(db, GALLERY_COLLECTION, item.id), {
              title: item.title,
              caption: item.caption,
              imageUrl: item.imageUrl,
              category: item.category,
              badge: item.badge || '',
              rotation: item.rotation ?? 0,
              order: idx++,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, GALLERY_COLLECTION);
        }
        onUpdate(INITIAL_GALLERY);
      }
    },
    (error) => {
      console.warn('Firestore gallery subscription error:', error);
      try {
        const saved = localStorage.getItem(LOCAL_KEY_GALLERY);
        if (saved) onUpdate(JSON.parse(saved));
      } catch {
        onUpdate(INITIAL_GALLERY);
      }
    }
  );
}

export async function saveGalleryItemToDb(item: GalleryItem, orderIndex?: number): Promise<void> {
  const docRef = doc(db, GALLERY_COLLECTION, item.id);
  try {
    await setDoc(
      docRef,
      {
        title: item.title,
        caption: item.caption,
        imageUrl: item.imageUrl,
        category: item.category,
        badge: item.badge || '',
        rotation: item.rotation ?? 0,
        order: orderIndex ?? item.order ?? 0,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${GALLERY_COLLECTION}/${item.id}`);
  }
}

export async function saveAllGalleryItemsToDb(items: GalleryItem[]): Promise<void> {
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await setDoc(
        doc(db, GALLERY_COLLECTION, item.id),
        {
          title: item.title,
          caption: item.caption,
          imageUrl: item.imageUrl,
          category: item.category,
          badge: item.badge || '',
          rotation: item.rotation ?? 0,
          order: i,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    localStorage.setItem(LOCAL_KEY_GALLERY, JSON.stringify(items));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GALLERY_COLLECTION);
  }
}

export async function deleteGalleryItemFromDb(id: string): Promise<void> {
  const docRef = doc(db, GALLERY_COLLECTION, id);
  try {
    await deleteDoc(docRef);
    const saved = localStorage.getItem(LOCAL_KEY_GALLERY);
    if (saved) {
      const list: GalleryItem[] = JSON.parse(saved);
      const filtered = list.filter((item) => item.id !== id);
      localStorage.setItem(LOCAL_KEY_GALLERY, JSON.stringify(filtered));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${GALLERY_COLLECTION}/${id}`);
  }
}

export async function clearAllGalleryItemsInDb(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, GALLERY_COLLECTION));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
    localStorage.setItem(LOCAL_KEY_GALLERY, JSON.stringify([]));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, GALLERY_COLLECTION);
  }
}

export async function resetGalleryInDb(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, GALLERY_COLLECTION));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
    let idx = 0;
    for (const item of INITIAL_GALLERY) {
      await setDoc(doc(db, GALLERY_COLLECTION, item.id), {
        title: item.title,
        caption: item.caption,
        imageUrl: item.imageUrl,
        category: item.category,
        badge: item.badge || '',
        rotation: item.rotation ?? 0,
        order: idx++,
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(LOCAL_KEY_GALLERY, JSON.stringify(INITIAL_GALLERY));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GALLERY_COLLECTION);
  }
}

// -------------------------------------------------------------
// 6. COMPLIMENTS & MOOD BOOSTERS (Single Document Array for Atomic CRUD)
// -------------------------------------------------------------
const COMPLIMENTS_DOC_PATH = 'site_content';
const COMPLIMENTS_DOC_ID = 'compliments_list';
const LOCAL_KEY_COMPLIMENTS = 'jovanka_db_compliments_v5';

export function subscribeCompliments(
  onUpdate: (compliments: string[]) => void
): () => void {
  const docRef = doc(db, COMPLIMENTS_DOC_PATH, COMPLIMENTS_DOC_ID);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data?.items)) {
          localStorage.setItem(LOCAL_KEY_COMPLIMENTS, JSON.stringify(data.items));
          onUpdate(data.items);
          return;
        }
      }
      // Check local cache
      const saved = localStorage.getItem(LOCAL_KEY_COMPLIMENTS);
      if (saved) {
        try {
          const list = JSON.parse(saved);
          onUpdate(list);
          return;
        } catch {
          // ignore
        }
      }
      // Seed doc
      setDoc(docRef, {
        items: COMPLIMENTS,
        updatedAt: new Date().toISOString(),
      }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, COMPLIMENTS_DOC_PATH);
      });
      onUpdate(COMPLIMENTS);
    },
    (error) => {
      console.warn('Firestore compliments subscription error:', error);
      try {
        const saved = localStorage.getItem(LOCAL_KEY_COMPLIMENTS);
        if (saved) onUpdate(JSON.parse(saved));
      } catch {
        onUpdate(COMPLIMENTS);
      }
    }
  );
}

export async function addComplimentToDb(text: string): Promise<void> {
  const docRef = doc(db, COMPLIMENTS_DOC_PATH, COMPLIMENTS_DOC_ID);
  try {
    let currentList = COMPLIMENTS;
    const saved = localStorage.getItem(LOCAL_KEY_COMPLIMENTS);
    if (saved) {
      try {
        currentList = JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    const updated = [text, ...currentList];
    await setDoc(docRef, { items: updated, updatedAt: new Date().toISOString() });
    localStorage.setItem(LOCAL_KEY_COMPLIMENTS, JSON.stringify(updated));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COMPLIMENTS_DOC_PATH}/${COMPLIMENTS_DOC_ID}`);
  }
}

export async function saveAllComplimentsToDb(compliments: string[]): Promise<void> {
  const docRef = doc(db, COMPLIMENTS_DOC_PATH, COMPLIMENTS_DOC_ID);
  try {
    await setDoc(docRef, {
      items: compliments,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_KEY_COMPLIMENTS, JSON.stringify(compliments));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COMPLIMENTS_DOC_PATH}/${COMPLIMENTS_DOC_ID}`);
  }
}

export async function resetComplimentsInDb(): Promise<void> {
  const docRef = doc(db, COMPLIMENTS_DOC_PATH, COMPLIMENTS_DOC_ID);
  try {
    await setDoc(docRef, {
      items: COMPLIMENTS,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_KEY_COMPLIMENTS, JSON.stringify(COMPLIMENTS));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COMPLIMENTS_DOC_PATH}/${COMPLIMENTS_DOC_ID}`);
  }
}

// -------------------------------------------------------------
// 7. GUESTBOOK WISHES & MESSAGES
// -------------------------------------------------------------
const WISHES_COLLECTION = 'wishes';
const LOCAL_KEY_WISHES = 'jovanka_db_wishes_v5';

export function subscribeWishes(
  onUpdate: (wishes: UserWish[]) => void
): () => void {
  const colRef = collection(db, WISHES_COLLECTION);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (!snapshot.empty) {
        const list: UserWish[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            name: data.name || '',
            message: data.message || '',
            date: data.date || 'Hari Ini',
            avatar: data.avatar || '💖',
            likes: data.likes || 0,
            createdAt: data.createdAt,
          });
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        localStorage.setItem(LOCAL_KEY_WISHES, JSON.stringify(list));
        onUpdate(list);
      } else {
        const local = localStorage.getItem(LOCAL_KEY_WISHES);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            onUpdate(parsed);
            return;
          } catch {
            // ignore
          }
        }
        try {
          for (const w of INITIAL_WISHES) {
            await setDoc(doc(db, WISHES_COLLECTION, w.id), {
              name: w.name,
              message: w.message,
              date: w.date,
              avatar: w.avatar,
              likes: w.likes,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, WISHES_COLLECTION);
        }
        onUpdate(INITIAL_WISHES);
      }
    },
    (error) => {
      console.warn('Firestore wishes subscription error:', error);
      try {
        const saved = localStorage.getItem(LOCAL_KEY_WISHES);
        if (saved) onUpdate(JSON.parse(saved));
      } catch {
        onUpdate(INITIAL_WISHES);
      }
    }
  );
}

export async function addWishToDb(wish: Omit<UserWish, 'id'>): Promise<void> {
  const docId = `wish-${Date.now()}`;
  try {
    await setDoc(doc(db, WISHES_COLLECTION, docId), {
      name: wish.name,
      message: wish.message,
      date: wish.date,
      avatar: wish.avatar,
      likes: wish.likes || 0,
      createdAt: new Date().toISOString(),
    });
    const saved = localStorage.getItem(LOCAL_KEY_WISHES);
    if (saved) {
      const list: UserWish[] = JSON.parse(saved);
      const updated = [{ id: docId, ...wish }, ...list];
      localStorage.setItem(LOCAL_KEY_WISHES, JSON.stringify(updated));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${WISHES_COLLECTION}/${docId}`);
  }
}

export async function likeWishInDb(id: string, currentLikes?: number): Promise<void> {
  const docRef = doc(db, WISHES_COLLECTION, id);
  try {
    if (typeof currentLikes === 'number') {
      await updateDoc(docRef, {
        likes: currentLikes + 1,
      });
    } else {
      await updateDoc(docRef, {
        likes: increment(1),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${WISHES_COLLECTION}/${id}`);
  }
}

export async function deleteWishFromDb(id: string): Promise<void> {
  const docRef = doc(db, WISHES_COLLECTION, id);
  try {
    await deleteDoc(docRef);
    const saved = localStorage.getItem(LOCAL_KEY_WISHES);
    if (saved) {
      const list: UserWish[] = JSON.parse(saved);
      const filtered = list.filter((w) => w.id !== id);
      localStorage.setItem(LOCAL_KEY_WISHES, JSON.stringify(filtered));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${WISHES_COLLECTION}/${id}`);
  }
}

export async function resetWishesInDb(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, WISHES_COLLECTION));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
    for (const w of INITIAL_WISHES) {
      await setDoc(doc(db, WISHES_COLLECTION, w.id), {
        name: w.name,
        message: w.message,
        date: w.date,
        avatar: w.avatar,
        likes: w.likes,
        createdAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(LOCAL_KEY_WISHES, JSON.stringify(INITIAL_WISHES));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, WISHES_COLLECTION);
  }
}
