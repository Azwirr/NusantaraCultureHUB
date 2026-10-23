import type { AppRole } from "@/lib/auth";
import type { AuthErrorCode } from "@/lib/auth-actions";
import type { ReviewEntityType } from "@/lib/review";

/**
 * Indonesian UI strings. This file defines the dictionary shape: en.ts must
 * provide exactly the same keys (enforced by `satisfies Dictionary`).
 * Strings are plain text and are always rendered as text nodes.
 */
export const id = {
  meta: {
    defaultTitle: "Nusantara · Pusaka Budaya",
    description:
      "Jelajahi busana adat, resep warisan, dan dongeng rakyat Indonesia dalam dua bahasa.",
  },
  brand: {
    tagline: "Pusaka Budaya",
  },
  a11y: {
    skipToContent: "Lewati ke konten utama",
    mainNav: "Navigasi utama",
  },
  nav: {
    home: "Beranda",
    library: "Perpustakaan",
    regions: "Wilayah",
    me: "Saya",
  },
  language: {
    label: "Bahasa",
    id: "Bahasa Indonesia",
    en: "English",
    idCode: "ID",
    enCode: "EN",
  },
  theme: {
    toggle: "Mode gelap",
  },
  account: {
    generic: "Akun",
    signIn: "Masuk",
    myAccount: "Akun saya",
  },
  common: {
    comingSoon: "Segera hadir",
    openLibrary: "Buka perpustakaan",
    backToLibrary: "Kembali ke perpustakaan",
    backToRegions: "Kembali ke daftar wilayah",
    backHome: "Kembali ke beranda",
  },
  home: {
    kicker: "Arsip budaya dwibahasa",
    title: "Jelajahi Budaya Nusantara",
    lead: "Busana adat, resep warisan, dan dongeng rakyat dari berbagai daerah di Indonesia, dalam bahasa Indonesia dan Inggris.",
    primaryCta: "Buka perpustakaan",
    pillarsHeading: "Tiga pilar pusaka",
    pillarsLead: "Pilih jalur untuk mulai menjelajah.",
    pillars: {
      costume: {
        kicker: "Coba di perangkat",
        title: "Baju Adat Try-On",
        subtitle: "Kenakan busana adat secara virtual",
        body: "Pilih busana adat dari berbagai daerah lalu coba langsung di peramban. Foto diproses di perangkat Anda dan tidak pernah diunggah.",
        cta: "Lihat busana adat",
      },
      recipe: {
        kicker: "Dapur warisan",
        title: "Resep Nusantara",
        subtitle: "Resep tradisional dengan sumber yang jelas",
        body: "Bahan, langkah, porsi, dan keterangan diet dalam dua bahasa. Label halal hanya muncul bila sudah diverifikasi oleh sumber.",
        cta: "Lihat resep",
      },
      story: {
        kicker: "Cerita lisan",
        title: "Dongeng & Audio",
        subtitle: "Dongeng rakyat, bab demi bab",
        body: "Baca atau dengarkan dongeng rakyat lengkap dengan ilustrasi dan deskripsi audio, sehingga pembaca tunanetra pun dapat menikmatinya.",
        cta: "Lihat dongeng",
      },
    },
    reviewTitle: "Ditinjau sebelum tayang",
    reviewBody:
      "Setiap cerita, resep, dan busana diperiksa oleh peninjau manusia. Hanya konten yang sudah disetujui yang tampil untuk publik.",
  },
  library: {
    kicker: "Perpustakaan",
    title: "Perpustakaan Budaya",
    lead: "Telusuri dongeng rakyat, resep warisan, dan busana adat Nusantara.",
    emptyTitle: "Belum ada konten yang tayang",
    emptyBody:
      "Cerita, resep, dan busana adat akan muncul di sini setelah disetujui peninjau.",
  },
  regions: {
    kicker: "Wilayah",
    title: "Jelajah per Wilayah",
    lead: "Setiap wilayah akan memiliki halaman berisi cerita, resep, dan busana adatnya.",
    emptyTitle: "Belum ada wilayah yang tayang",
    emptyBody: "Daftar wilayah akan muncul di sini setelah disetujui peninjau.",
  },
  regionDetail: {
    kicker: "Wilayah",
    title: "Halaman wilayah",
    body: "Halaman ini akan menampilkan cerita, resep, dan busana adat dari wilayah ini setelah disetujui peninjau.",
  },
  storyDetail: {
    kicker: "Dongeng",
    title: "Pemutar cerita",
    body: "Di sini Anda akan membaca dan mendengarkan dongeng bab demi bab, setelah ceritanya disetujui peninjau.",
    accessibilityNote:
      "Setiap bab menampilkan teksnya, ilustrasi dengan teks alternatif, dan deskripsi audio sebelum audionya diputar.",
  },
  recipeDetail: {
    kicker: "Resep",
    title: "Detail resep",
    body: "Halaman ini akan menampilkan nama resep dalam dua bahasa, bahan, langkah, porsi, dan keterangan diet, setelah resepnya disetujui peninjau.",
    halalNote:
      "Label halal hanya ditampilkan bila status halal sudah diverifikasi oleh sumber.",
  },
  tryOn: {
    kicker: "Baju Adat Try-On",
    title: "Studio Coba Busana",
    lead: "Coba busana adat dari berbagai daerah langsung di peramban Anda.",
    privacyTitle: "Foto tetap di perangkat Anda",
    privacyBody:
      "Foto diproses di perangkat Anda dan tidak pernah diunggah. Kami tidak menyimpan foto Anda di server mana pun.",
    statusBody:
      "Studio coba busana sedang disiapkan. Sementara itu, lihat busana adat di perpustakaan.",
    cta: "Lihat busana adat",
  },
  me: {
    kicker: "Saya",
    title: "Halaman Anggota",
    loading: "Memuat akun…",
    usernameLabel: "Nama panggilan",
    noUsername: "Belum diatur",
    rolesLabel: "Peran",
    memberRole: "Anggota",
    reviewLink: "Buka antrean peninjau",
    signOut: "Keluar",
    nickname: {
      title: "Pilih nama panggilan",
      body: "Nama panggilan inilah yang terlihat di Nusantara. Kami tidak menampilkan nama asli atau foto dari akun Google Anda.",
      editTitle: "Ubah nama panggilan",
      submit: "Simpan nama panggilan",
      pending: "Menyimpan…",
      saved: "Nama panggilan disimpan.",
    },
  },
  roles: {
    reviewer: "Peninjau",
    owner: "Pemilik",
  } satisfies Record<AppRole, string>,
  review: {
    kicker: "Peninjau",
    title: "Antrean Peninjau",
    lead: "Ringkasan draf yang menunggu tinjauan.",
    loading: "Memuat ringkasan draf…",
    tableCaption: "Jumlah draf per jenis konten",
    typeHeader: "Jenis konten",
    draftsHeader: "Draf",
    phaseNote:
      "Antrean lengkap untuk menyunting, menyetujui, menolak, dan menurunkan konten hadir di Fase 2.",
    types: {
      region: "Wilayah",
      story: "Cerita",
      chapter: "Bab cerita",
      recipe: "Resep",
      costume: "Busana adat",
    } satisfies Record<ReviewEntityType, string>,
  },
  auth: {
    login: {
      kicker: "Akun",
      title: "Masuk",
      lead: "Masuk untuk menyimpan progres dan penanda Anda.",
      submit: "Masuk",
      pending: "Sedang masuk…",
      switchPrompt: "Belum punya akun?",
      switchLink: "Daftar",
    },
    signup: {
      kicker: "Akun",
      title: "Daftar",
      lead: "Buat akun dengan nama panggilan. Kami tidak meminta nama asli Anda.",
      submit: "Buat akun",
      pending: "Membuat akun…",
      switchPrompt: "Sudah punya akun?",
      switchLink: "Masuk",
    },
    fields: {
      username: "Nama panggilan",
      usernameHint: "3–24 karakter: huruf kecil, angka, atau garis bawah.",
      email: "Email",
      password: "Kata sandi",
      passwordHint: "Minimal 8 karakter.",
    },
    errors: {
      invalid_input: "Periksa kembali isian yang ditandai.",
      invalid_credentials: "Email atau kata sandi salah.",
      email_not_confirmed:
        "Email Anda belum dikonfirmasi. Buka tautan yang kami kirim ke email Anda terlebih dahulu.",
      weak_password: "Kata sandi terlalu lemah. Gunakan kata sandi yang lebih panjang.",
      email_taken: "Email ini sudah terdaftar. Silakan masuk.",
      link_invalid: "Tautan konfirmasi tidak berlaku atau sudah kedaluwarsa. Silakan masuk, atau daftar lagi.",
      oauth_failed: "Masuk dengan Google gagal. Silakan coba lagi.",
      oauth_cancelled: "Masuk dengan Google dibatalkan.",
      nickname_taken: "Nama panggilan ini sudah dipakai. Coba yang lain.",
      rate_limited: "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.",
      unknown: "Terjadi kesalahan. Silakan coba lagi.",
    } satisfies Record<AuthErrorCode, string>,
    google: {
      continue: "Lanjutkan dengan Google",
      pending: "Mengalihkan ke Google…",
      privacyNote: "Kami hanya memakai akun Google untuk masuk. Nama dan foto Google tidak ditampilkan.",
      divider: "atau",
    },
    checkEmailTitle: "Cek email Anda",
    checkEmailBody:
      "Kami telah mengirim tautan konfirmasi. Buka tautan itu untuk mengaktifkan akun Anda.",
  },
  halal: {
    verified: "Halal (terverifikasi sumber)",
  },
  notFound: {
    title: "Halaman tidak ditemukan",
    body: "Halaman yang Anda cari tidak ada atau belum tayang.",
  },
  errorPage: {
    title: "Terjadi kesalahan",
    body: "Halaman ini gagal dimuat. Coba lagi, atau kembali ke beranda.",
    retry: "Coba lagi",
    home: "Ke beranda",
    reference: "Kode referensi",
  },
};

export type Dictionary = typeof id;
