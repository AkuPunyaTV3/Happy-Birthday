export interface SiteContent {
  id?: string;
  heroCelebrationPill: string;
  heroGreetingPrefix: string;
  heroName: string;
  heroPhotoUrl?: string;
  heroPhotoBadge?: string;
  heroQuote: string;
  cakeTitle: string;
  cakeSubtitle: string;
  galleryTitle?: string;
  gallerySubtitle?: string;
  reasonsTitle: string;
  reasonsSubtitle: string;
  giftsTitle: string;
  giftsSubtitle: string;
  complimentsTitle: string;
  complimentsSubtitle: string;
  wishesTitle: string;
  wishesSubtitle: string;
  grandFinaleTitle: string;
  grandFinaleQuote: string;
  grandFinaleButtonText: string;
  footerTitle: string;
  footerSubtitle: string;
  updatedAt?: string;
}

export interface PoemData {
  id: string;
  title: string;
  category: 'crying' | 'heartfelt' | 'funny_sweet' | 'prayers';
  content: string;
  authorNote?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  category: 'meme' | 'cute' | 'special';
  badge?: string;
  rotation?: number;
  order?: number;
  updatedAt?: string;
}

export interface SpecialReason {
  id: number;
  title: string;
  emoji: string;
  description: string;
  revealed?: boolean;
  updatedAt?: string;
}

export interface VirtualGift {
  id: string;
  title: string;
  boxColor: string;
  ribbonColor: string;
  giftIcon: string;
  giftTitle: string;
  giftContent: string;
  opened: boolean;
  updatedAt?: string;
}

export interface UserWish {
  id: string;
  name: string;
  message: string;
  date: string;
  avatar: string;
  likes: number;
  createdAt?: string;
}

