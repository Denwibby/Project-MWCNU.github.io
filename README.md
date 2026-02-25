# MWCNU Tanggulangin Website

## Overview

Website resmi MWCNU (Majelis Wakil Cabin Nahdlatul Ulama) Tanggulangin adalah platform digital yang dirancang untuk memberikan informasi mengenai lembaga-lembaga pendidikan di bawah naungan MWCNU Tanggulangin, meliputi TK (Taman Kanak-Kanak), SD Maarif, MTs (Madrasah Tsanawiyah), dan SMK (Sekolah Menengah Kejuruan). Website ini berfungsi sebagai sumber informasi komprehensif bagi orang tua, siswa, dan masyarakat umum, menampilkan misi, visi, dan berbagai program pendidikan yang ditawarkan oleh lembaga-lembaga tersebut.

## Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: PHP Native
- **Database**: MySQL/MariaDB
- **External Libraries**: Font Awesome 6.4.0

## Struktur Proyek

```
mwcnu/
├── index.html                    # Halaman utama (Beranda)
├── login.html                    # Halaman login admin
├── package.json                  # Konfigurasi npm
├── README.md                     # Dokumentasi proyek
├── api/                          # Backend API (PHP)
│   ├── .htaccess                # Konfigurasi Apache
│   ├── auth.php                 # API Autentikasi (Login/Logout/Check Session)
│   ├── blog.php                # API Manajemen Blog
│   ├── config.php              # Konfigurasi Database & Security
│   ├── db_connect.php          # Koneksi Database
│   ├── pendaftaran.php         # API Pendaftaran Siswa
│   └── upload.php              # API Upload File/Gambar
├── assets/
│   ├── fonts/                   # File font
│   └── images/                  # Gambar dan logo
│       ├── favicon.png
│       ├── mts-crowd.png
│       ├── mts-logo.png
│       ├── nu-logo.png
│       ├── sd-crowd.png
│       ├── sd-logo.png
│       ├── smk-crowd.png
│       ├── smk-logo.png
│       ├── smk.jpeg
│       ├── tk-crowd.png
│       └── tk-logo.png
│       └── Ypm.jpeg
├── css/
│   ├── mobile-override.css      # Override CSS untuk mobile
│   ├── responsive.css           # Styling responsif
│   └── styles.css               # Styling utama
├── js/
│   ├── admin.js                 # JavaScript untuk halaman admin
│   ├── api.js                  # Fungsi untuk memanggil API
│   ├── auth.js                 # Fungsi autentikasi
│   ├── device-detector.js      # Deteksi perangkat
│   ├── main.js                 # Fungsi JavaScript utama
│   ├── navigation.js           # Fungsi navigasi
│   └── pdf-export.js           # Export ke PDF
├── pages/
│   ├── admin.html              # Halaman admin panel
│   ├── blog-detail.html        # Halaman detail blog
│   ├── blog.html               # Halaman daftar blog/berita
│   ├── bp3nu-profile.html      # Halaman profil BP3NU
│   ├── contact.html            # Halaman kontak
│   ├── mts.html                # Halaman MTs (Madrasah Tsanawiyah)
│   ├── pendaftaran.html        # Halaman pendaftaran siswa
│   ├── sd-maarif.html          # Halaman SD Maarif
│   ├── smk.html                # Halaman SMK (Sekolah Menengah Kejuruan)
│   └── tk.html                 # Halaman TK (Taman Kanak-Kanak)
└── sql/
    └── MWCNU_database.sql      # Schema database MySQL
```

## Fitur Utama

### Halaman Publik
- **Beranda**: Informasi lengkap tentang MWCNU Tanggulangin, visi misi, program pendidikan, dan statistik
- **Profil BP3NU**: Profil Badan Pembina Pendidikan Nahdlatul Ulama
- **Lembaga Pendidikan**: Informasi detail untuk setiap jenjang pendidikan
  - TK (Taman Kanak-Kanak)
  - SD Maarif (Sekolah Dasar)
  - MTs (Madrasah Tsanawiyah)
  - SMK (Sekolah Menengah Kejuruan)
- **Blog/Berita**: Artikel dan berita terkini
- **Kontak**: Formulir kontak dan informasi lokasi

### Sistem Autentikasi
- Login admin dengan email dan password
- Session-based authentication menggunakan PHP
- Proteksi CSRF token
- CORS configuration untuk keamanan API

### Pendaftaran Siswa
- Formulir pendaftaran online
- Validasi data siswa dan orang tua
- Penyimpanan ke database MySQL

### Admin Panel
- Dashboard admin
- Manajemen blog/berita
- Manajemen data siswa pendaftar
- Export data ke PDF

### Fitur Teknis
- Responsive design untuk semua perangkat
- Device detection (mobile/desktop)
- Floating WhatsApp button
- Google Maps integration
- Image optimization

## Instalasi

### Persyaratan Sistem
- PHP 7.2 atau lebih tinggi
- MySQL/MariaDB
- Web server (Apache/Nginx)

### Langkah Instalasi

1. **Clone repository**:
   
```
   git clone <repository-url>
   cd mwcnu
   
```

2. **Setup database**:
   - Buat database MySQL baru
   - Import file `sql/MWCNU_database.sql`

3. **Konfigurasi database**:
   - Edit file `api/config.php`
   - Sesuaikan kredensial database:
     
```
php
     define('DB_HOST', '127.0.0.1');
     define('DB_NAME', 'nama_database');
     define('DB_USER', 'username');
     define('DB_PASS', 'password');
     
```

4. **Setup web server**:
   - Arahkan document root ke folder proyek
   - Pastikan mod_rewrite aktif (untuk .htaccess)

5. **Buka di browser**:
   
```
   http://localhost
   
```

### Untuk Development Lokal

1. Install dependencies:
   
```
   npm install
   
```

2. Jalankan local server:
   
```
   npm start
   
```

## Struktur Database

### Tabel Users
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | bigint | Primary key |
| nama | varchar(100) | Nama lengkap user |
| username | varchar(50) | Username unik |
| password | varchar(255) | Password terenkripsi |
| email | varchar(100) | Email user |
| role | enum | Peran (admin/user) |
| created_at | timestamp | Waktu pembuatan |

### Tabel Students
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | bigint | Primary key |
| user_id | bigint | Foreign key ke users |
| nama_lengkap | text | Nama siswa |
| tempat_lahir | text | Tempat lahir |
| tanggal_lahir | date | Tanggal lahir |
| jenis_kelamin | varchar(20) | Jenis kelamin |
| agama | varchar(50) | Agama |
| alamat_lengkap | text | Alamat lengkap |
| no_identitas | varchar(50) | Nomor identitas |
| no_telp_siswa | varchar(20) | Nomor telepon siswa |
| nama_ayah | text | Nama ayah |
| nama_ibu | text | Nama ibu |
| pekerjaan_ayah | text | Pekerjaan ayah |
| pekerjaan_ibu | text | Pekerjaan ibu |
| no_telp_ortu | varchar(20) | Nomor telepon orang tua |
| email_ortu | varchar(100) | Email orang tua |
| no_ujian_rapor | varchar(50) | Nomor ujian rapor |
| prestasi | text | Prestasi siswa |
| alasan_memilih | text | Alasan memilih sekolah |
| jenjang | varchar(50) | Jenjang pendidikan |

### Tabel Blogs
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | bigint | Primary key |
| admin_id | bigint | Foreign key ke users |
| tanggal | timestamp | Tanggal posting |
| blog_title | text | Judul blog |
| blog_content | text | Konten blog |
| gambar_url | varchar(255) | URL gambar |

## API Endpoints

### Authentication API (`api/auth.php`)
- `POST /api/auth.php` - Login atau Logout
- `GET /api/auth.php?action=check` - Cek status autentikasi

### Blog API (`api/blog.php`)
- `GET /api/blog.php` - Ambil semua blog
- `GET /api/blog.php?id=<id>` - Ambil blog berdasarkan ID
- `POST /api/blog.php` - Buat blog baru (admin)
- `PUT /api/blog.php` - Update blog (admin)
- `DELETE /api/blog.php?id=<id>` - Hapus blog (admin)

### Pendaftaran API (`api/pendaftaran.php`)
- `GET /api/pendaftaran.php` - Ambil semua pendaftaran
- `POST /api/pendaftaran.php` - Submit pendaftaran baru
- `DELETE /api/pendaftaran.php?id=<id>` - Hapus pendaftaran (admin)

### Upload API (`api/upload.php`)
- `POST /api/upload.php` - Upload file/gambar

## Kontak

- **Alamat**: Jl. Raya Ngaban (Utara Pasar Ngaban), Ngaban, Tanggulangin, Sidoarjo 61272, Jawa Timur
- **Telepon**: +62 838-5357-7035 / +62 852-3513-7630
- **Email**: bpppmnut@gmail.com
- **Facebook**: https://www.facebook.com/bpppmnutanggulangin
- **Instagram**: https://www.instagram.com/bpppmnutanggulangin
- **YouTube**: https://youtube.com/@bpppmnutanggulangin
- **TikTok**: https://www.tiktok.com/@bpppmnu_tanggulangin

## Lisensi

Proyek ini dilindungi oleh hak cipta. Semua hak dilindungi.

## Credits

- Developed dengan penuh kesadaran untuk umat Nahdlatul Ulama
- Mengintegrasikan nilai-nilai Ahlussunnah wal Jama'ah dalam setiap aspek pendidikan
