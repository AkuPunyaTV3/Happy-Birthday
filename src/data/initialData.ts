import { PoemData, GalleryItem, SpecialReason, VirtualGift, UserWish, SiteContent } from '../types';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  heroCelebrationPill: 'Hari Bahagia Sedunia: Jovanka Day! 🎉🎂',
  heroGreetingPrefix: 'Selamat Ulang Tahun,',
  heroName: 'Jovanka ✨💖',
  heroPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  heroPhotoBadge: 'The Birthday Girl 👑✨',
  heroQuote: 'Semoga harimu penuh senyum dan keajaiban :)',
  cakeTitle: 'Kue Ulang Tahun Spesial Jovanka 🎂🍓',
  cakeSubtitle: 'Sebelum tiup lilin, pejamkan mata, tulis harapan terbaikmu di tahun ini, lalu tiup lilinnya sampai padam!',
  galleryTitle: 'Galeri Lucu, Meme & Foto Spesial Jovanka 📸',
  gallerySubtitle: 'Semua foto bebas kamu upload, ganti gambar, hapus, atau tambahkan slot foto baru. Tiap perubahan langsung tersimpan otomatis di database!',
  reasonsTitle: 'Kenapa Jovanka Perempuan Paling Spesial? ✨',
  reasonsSubtitle: 'Klik kartu-kartu di bawah ini untuk membuka alasan jujur kenapa kamu begitu berharga dan gak tergantikan!',
  giftsTitle: 'Buka 3 Kado Virtual Jovanka 🎁✨',
  giftsSubtitle: 'Ada 3 kado misterius yang sudah disiapkan khusus buat hari ulang tahunmu. Buka satu per satu ya!',
  complimentsTitle: 'Mesin Penyemangat & Pengingat Kamu Berharga 🌸',
  complimentsSubtitle: 'Kapan pun kamu lagi capek atau butuh asupan semangat, tekan tombol di bawah ini!',
  wishesTitle: 'Dinding Harapan Buat Jovanka 💌',
  wishesSubtitle: 'Tinggalkan pesan cinta, doa, dan kata-kata termanis untuk hari spesial Jovanka!',
  grandFinaleTitle: 'Sekali Lagi, Selamat Ulang Tahun Jovanka! ✨',
  grandFinaleQuote: 'Semoga tahun ini membawa ribuan alasan baru untuk tersenyum, hati yang selalu lapang, dan langkah yang selalu dipenuhi keberuntungan. Terima kasih sudah menjadi orang yang begitu luar biasa.',
  grandFinaleButtonText: 'Rayakan Pesta Kembang Api Terbesar! 🎆🎉',
  footerTitle: 'Spesial untuk Jovanka di Hari Ulang Tahunnya',
  footerSubtitle: 'Dibuat dengan ketulusan & kehangatan untuk Jovanka',
};

export const INITIAL_POEMS: PoemData[] = [
  {
    id: 'poem-tears',
    title: 'Untuk Kamu 🥺🌧️',
    category: 'crying',
    content: `Jovanka...

Ada hari-hari di mana dunia begitu bising dan melelahkan,
Terima kasih sudah selalu kuat melewati hari-hari yang mungkin tidak ada orang lain tahu betapa beratnya.
lelahmu yang sering kamu sembunyikan di balik senyum manismu...
aku selalu mendoakan agar semuanya digantikan dengan kebahagiaan.


Di dunia yang seringkali menuntutmu jadi sempurna,
ingatlah bahwa , kamu selalu istimewa apa adanya.
Selamat bertambah usia, perempuan hebat.`,
    authorNote: '— Dari seseorang yang selalu bangga dan bersyukur bisa mengenalmu ❤️',
  },
  {
    id: 'poem-gratitude',
    title: 'Terima Kasih Telah Lahir ke Dunia, Jovanka 🌸',
    category: 'heartfelt',
    content: `Jika ada yang bertanya kenapa hari ini begitu berharga,
jawabannya sederhana:
karena hari ini adalah hari di mana semesta menyambut jiwa yang sehangat kamu.

Kamu tidak perlu menjadi pacar untuk menjadi orang yang paling kupedulikan.
Melihatmu tersenyum lepas, meraih impianmu satu per satu,
dan hidup dalam damai serta bahagia...
itu sudah lebih dari cukup untuk membuatku tersenyum.

Semoga di usiamu yang baru:
Pintu-pintu kebaikan terbuka lebar untukmu.
Langkah kakimu selalu dipeluk rasa tenang.
Dan jika suatu saat kamu merasa sepi atau lelah,
ingatlah selalu, ada aku yang akan selalu siap mendengarkan dan mendukungmu tanpa syarat.`,
    authorNote: '— Semoga setiap doa baik berbalik berkali-kali lipat kepadamu ✨',
  },
  {
    id: 'poem-funny',
    title: 'Surat Resmi Penyembahan Ratu Sehari (Spesial Jovanka) 👑😹',
    category: 'funny_sweet',
    content: `Dekrit Kerajaan Ulang Tahun:
Diberitahukan kepada seluruh rakyat semesta,
bahwa hari ini Jovanka resmi bertambah umur, bertambah anggun,
dan bertambah hak untuk ditraktir serta dimanja seharian penuh!

Walaupun kadang suka random, kadang suka overthinking sendirian,
tapi pesonanya tetap nomor satu gak ada tandingannya.
Bahkan SpongeBob aja sujud hormat di depan fotomu!

Selamat ulang tahun ya Jovanka!
Semoga makin kaya raya, makin glowing tanpa skincare mahal,
dijauhkan dari cowok red flag, dan selalu dikelilingi orang-orang yang tulus sayang sama kamu!`,
    authorNote: '— Pengagum rahasia tapi gak rahasia-rahasia amat 🐱🍰',
  },
];

// SpongeBob Worshipping Meme Illustration SVG Data URL
const SPONGEBOB_MEME_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%237dd3fc"/><path d="M0 450L600 450L600 600L0 600Z" fill="%23854d0e"/><rect x="50" y="440" width="500" height="15" fill="%23a16207" rx="3"/><g transform="translate(180, 260)"><ellipse cx="120" cy="200" rx="90" ry="25" fill="%23475569" opacity="0.3"/><rect x="60" y="100" width="120" height="80" rx="8" fill="%23facc15" stroke="%23ca8a04" stroke-width="4"/><circle cx="85" cy="85" r="18" fill="white" stroke="%23334155" stroke-width="3"/><circle cx="85" cy="85" r="7" fill="%230284c7"/><circle cx="135" cy="85" r="18" fill="white" stroke="%23334155" stroke-width="3"/><circle cx="135" cy="85" r="7" fill="%230284c7"/><rect x="60" y="170" width="120" height="18" fill="white" stroke="%23334155" stroke-width="3"/><polygon points="110,172 130,172 120,198" fill="%23ef4444"/><rect x="60" y="188" width="120" height="20" fill="%2378350f" stroke="%23334155" stroke-width="3"/><rect x="30" y="140" width="35" height="14" rx="7" fill="%23facc15" transform="rotate(-30 30 140)"/><rect x="175" y="125" width="35" height="14" rx="7" fill="%23facc15" transform="rotate(30 175 125)"/><text x="120" y="40" font-family="sans-serif" font-weight="900" font-size="28" fill="%23e11d48" text-anchor="middle">👑 SUJUD KANJENG RATU! 👑</text></g><text x="300" y="550" font-family="sans-serif" font-weight="bold" font-size="20" fill="%23fef08a" text-anchor="middle">SpongeBob pun hormat pada Kanjeng Ratu Jovanka ✨</text></svg>';

// Patrick Star Birthday Fan Illustration
const PATRICK_MEME_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23fed7aa"/><circle cx="300" cy="300" r="280" fill="%23ffedd5"/><g transform="translate(160, 160)"><path d="M140 20 L210 240 L70 240 Z" fill="%23fb7185" stroke="%23e11d48" stroke-width="4"/><circle cx="120" cy="110" r="14" fill="white" stroke="%231e293b" stroke-width="3"/><circle cx="120" cy="110" r="5" fill="%230f172a"/><circle cx="160" cy="110" r="14" fill="white" stroke="%231e293b" stroke-width="3"/><circle cx="160" cy="110" r="5" fill="%230f172a"/><path d="M115 140 Q140 175 165 140 Z" fill="%23881337"/><polygon points="140,5 120,40 160,40" fill="%23facc15"/><rect x="80" y="220" width="120" height="40" rx="8" fill="%23a3e635" stroke="%2365a30d" stroke-width="3"/><text x="140" y="248" font-family="sans-serif" font-weight="900" font-size="14" fill="%234c1d95" text-anchor="middle">🌸 JOVANKA #1 🌸</text></g><text x="300" y="490" font-family="sans-serif" font-weight="900" font-size="24" fill="%23e11d48" text-anchor="middle">PATRICK: "HAPPY BIRTHDAY JOVANKA!" 🌟</text><text x="300" y="525" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23475569" text-anchor="middle">Semoga harimu penuh senyum dan traktiran boba!</text></svg>';

// Red Flag Radar Anti-Toxic Meme SVG
const RADAR_MEME_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%230f172a"/><circle cx="300" cy="300" r="220" stroke="%2322c55e" stroke-width="3" stroke-dasharray="8 8"/><circle cx="300" cy="300" r="150" stroke="%2322c55e" stroke-width="2"/><circle cx="300" cy="300" r="80" stroke="%2322c55e" stroke-width="2"/><line x1="80" y1="300" x2="520" y2="300" stroke="%2322c55e" stroke-width="1"/><line x1="300" y1="80" x2="300" y2="520" stroke="%2322c55e" stroke-width="1"/><path d="M300 300 L450 180 A220 220 0 0 0 300 80 Z" fill="%2322c55e" opacity="0.25"/><circle cx="420" cy="200" r="12" fill="%23ef4444"/><text x="440" y="205" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23f87171">🚨 COWOK RED FLAG DETECTED!</text><circle cx="300" cy="300" r="16" fill="%23ec4899"/><text x="300" y="340" font-family="sans-serif" font-weight="900" font-size="16" fill="%23f472b6" text-anchor="middle">👑 Jovanka Safe Zone 👑</text><text x="300" y="550" font-family="sans-serif" font-weight="bold" font-size="20" fill="%234ade80" text-anchor="middle">RADAR ANTI-TOXIC & ANTI-SEDIH: AKTIF! 🛡️</text></svg>';

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-spongebob',
    title: 'Sujud Sembah Kanjeng Ratu Jovanka 👑🧽',
    caption: 'Detik-detik SpongeBob sadar kalau Jovanka lagi ulang tahun: langsung sujud hormat demi traktiran Krabby Patty!',
    imageUrl: SPONGEBOB_MEME_IMG,
    category: 'meme',
    badge: 'Meme Legend 👑',
    rotation: -2,
  },
  {
    id: 'gal-patrick',
    title: 'Patrick Bawa Spanduk Fans Berat 🌟🎂',
    caption: "Patrick: 'FINLAND! Eh bukan, maksudnya HAPPY BIRTHDAY JOVANKA! Pokoknya hari ini kamu nomor satu se-Bikini Bottom!'",
    imageUrl: PATRICK_MEME_IMG,
    category: 'meme',
    badge: 'Fans Club 🌟',
    rotation: 2,
  },
  {
    id: 'gal-radar',
    title: 'Sistem Radar Anti-Cowok Red Flag 🛡️⚡',
    caption: 'Protokol keamanan tingkat dewa: Cowok red flag dan beban pikiran dilarang mendekat dalam radius 100 kilometer dari Jovanka!',
    imageUrl: RADAR_MEME_IMG,
    category: 'meme',
    badge: '100% Aman 🚨',
    rotation: -1,
  },
  {
    id: 'gal-1',
    title: 'Aura Ratu Sejagat Raya ✨👸',
    caption: 'POV Jovanka baru bangun tidur tapi anggunnya udah kayak putri kerajaan yang siap dapet warisan pulau pribadi.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    category: 'special',
    badge: 'Queen Vibes 👑',
    rotation: 1,
  },
  {
    id: 'gal-2',
    title: 'Gemoy & Menggemaskan Maksimal 🌸🐱',
    caption: 'Kembaran Jovanka waktu mode kalem: pakai mahkota bunga sambil nungguin traktiran cake ulang tahun.',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    category: 'cute',
    badge: 'Cute Queen 🐾',
    rotation: 2,
  },
  {
    id: 'gal-3',
    title: 'Paket Bunga Spesial dari Empus 💐🐾',
    caption: "Empus: 'Kak Jovanka jangan cemberut-cemberut ya, nih kado bunga paling wangi dan jatah Whiskas aman!'",
    imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80',
    category: 'cute',
    badge: 'Buket Cinta 💖',
    rotation: -2,
  },
  {
    id: 'gal-4',
    title: 'Senyuman Pemikat Semesta ✨📸',
    caption: 'Senyum manis Jovanka yang konon katanya bisa menurunkan tingkat stres dunia sebesar 99.9%.',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    category: 'special',
    badge: 'Senyum 1000 Watt 🌟',
    rotation: 1,
  },
  {
    id: 'gal-5',
    title: 'Mode Bos Senggol Bacok 🕶️😼',
    caption: 'Ekspresi Jovanka pas lagi mode tegas anti-cowok red flag, tapi langsung luluh kalau diajak jajan boba.',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80',
    category: 'meme',
    badge: 'Boss Mode 😎',
    rotation: -1,
  },
  {
    id: 'gal-6',
    title: 'Kue Ultah Bebas Kalori 🎂🎉',
    caption: 'Fakta Ilmiah: Semua cake dan makanan manis hari ini 0 kalori khusus buat Jovanka, sah secara hukum semesta!',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    category: 'special',
    badge: '0 Kalori! 🍰',
    rotation: 2,
  },
  {
    id: 'gal-7',
    title: 'Recharge Energi Putri Tidur 😴💤',
    caption: 'Capek seharian jadi orang paling cantik dan dipuja-puja, saatnya Jovanka bobo cantik sambil mimpi indah.',
    imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
    category: 'cute',
    badge: 'Bobo Cantik 🌙',
    rotation: -2,
  },
  {
    id: 'gal-8',
    title: 'Piknik & Sparkling Birthday Glow ✨🥂',
    caption: 'Momen penuh tawa, kue manis, dan cahaya sore yang hangat untuk merayakan tahun terbaik Jovanka.',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    category: 'special',
    badge: 'Party Time 🎈',
    rotation: 1,
  },
];

export const SPECIAL_REASONS: SpecialReason[] = [
  {
    id: 1,
    emoji: '❤️',
    title: 'Punya Hati yang Terlalu Baik',
    description: 'Selalu peduli sama orang lain, pendengar yang tulus.',
  },
  {
    id: 2,
    emoji: '✨',
    title: 'Auranya Bikin Nyaman',
    description: 'Cuma ngobrol hal random sama kamu aja bisa bikin hari yang capek langsung terasa tenang.',
  },
  {
    id: 3,
    emoji: '💪',
    title: 'Perempuan Mandiri & Kuat',
    description: 'Meskipun banyak tantangan, Jovanka selalu bisa berdiri tegak dan bangkit lagi dengan elegan.',
  },
  {
    id: 4,
    emoji: '😄',
    title: 'Humor & Tawanya Menular',
    description: 'Ketawa kamu itu candu banget, kalau udah ketawa bareng bisa lupa waktu dan lupa masalah!',
  },
  {
    id: 5,
    emoji: '👑',
    title: 'Gak Ada Duanya di Dunia',
    description: 'karena cuma satu-satunya, anjayyy',
  },
  {
    id: 6,
    emoji: '🌟',
    title: 'Selalu Bersinar Tanpa Sadar',
    description: 'Bahkan saat kamu ngerasa biasa aja, di mata orang yang menghargaimu kamu selalu luar biasa.',
  },
];

export const VIRTUAL_GIFTS: VirtualGift[] = [
  {
    id: 'gift-1',
    title: 'Kado Misterius #1',
    boxColor: 'from-pink-400 to-rose-500',
    ribbonColor: 'bg-amber-300',
    giftIcon: '🎟️',
    giftTitle: 'Golden VIP Voucher Seumur Hidup!',
    giftContent: 'Voucher bisa telponan, sleep call sama aku, mau lagi bad mood, atau mau yapping. Berlaku tanpa batas waktu dan gak bisa hangus',
    opened: false,
  },
  {
    id: 'gift-2',
    title: 'Kado Misterius #2',
    boxColor: 'from-fuchsia-400 to-pink-500',
    ribbonColor: 'bg-yellow-200',
    giftIcon: '🛡️',
    giftTitle: 'Pelindung Anti-Sedih & Anti-Overthinking',
    giftContent: 'Kotak berisikan doa tulus agar Jovanka selalu dilindungi dari rasa insecure, dijauhkan dari hal-hal toksik, dan selalu dipeluk kebahagiaan!',
    opened: false,
  },
  {
    id: 'gift-3',
    title: 'Kado Misterius #3',
    boxColor: 'from-rose-300 to-pink-400',
    ribbonColor: 'bg-pink-100',
    giftIcon: '👑',
    giftTitle: 'Mahkota Ratu Ter-Spesial',
    giftContent: 'Pengakuan resmi bahwa hari ini (dan hari-hari berikutnya) Jovanka adalah manusia paling keren, cantik, dan berharga!',
    opened: false,
  },
];

export const COMPLIMENTS: string[] = [
  'Jovanka, senyum kamu tuh beneran bisa mencerahkan hari orang lain!',
  'Terima kasih sudah jadi sosok yang begitu tulus dan menyenangkan.',
  'Dunia beruntung punya perempuan sekeren dan setabah kamu.',
  'Jangan pernah ragu sama kemampuanmu, kamu jauh lebih hebat dari yang kamu kira!',
  'Di antara miliaran manusia di bumi, bersyukur banget bisa kenal sama Jovanka.',
  'Hari ini kamu nambah cantik, nambah bijak, dan nambah disayang!',
  'Kalau ada nominasi teman / perempuan paling suportif, pialanya pasti buat kamu 🏆',
  'Semua mimpi-mimpi besarmu pasti bakal terwujud satu per satu. Semangat terus ya!',
];

export const INITIAL_WISHES: UserWish[] = [
  {
    id: 'wish-1',
    name: 'Dari Pengagum Setiamu ❤️',
    message: 'Selamat ulang tahun Jovanka! Terima kasih untuk semua tawa dan kebaikanmu. Semoga kamu selalu dikelilingi cinta dan kedamaian.',
    date: 'Hari Ini',
    avatar: '🐱',
    likes: 12,
  },
  {
    id: 'wish-2',
    name: 'SpongeBob SquarePants 🧽',
    message: 'I am ready to celebrate Queen Jovanka’s Birthday! Panjang umur dan sukses selalu yaa!',
    date: 'Hari Ini',
    avatar: '👑',
    likes: 24,
  },
  {
    id: 'wish-3',
    name: 'Kucing🌸',
    message: 'Meow meow! HBD Kak Jovanka yang paling gemoy dan baik hati!',
    date: 'Hari Ini',
    avatar: '🐾',
    likes: 9,
  }, {
    id: 'wish-4',
    name: 'Peter Parker',
    message: 'MJ bukan Mary Jane, tapi My Jovankaaaa,anjaiii',
    date: 'Hari Ini',
    avatar: '👑',
    likes: 9,
  },
];
