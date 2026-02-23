/**
 * MWCNU Database API - MySQL Backend
 * Migrated from Supabase to MySQL
 * 
 * This file provides the same functions as before, but uses fetch()
 * to call the PHP API endpoints instead of Supabase.
 */

// API Base URL - UPDATE THIS to point to your PHP API
const API_BASE_URL = window.location.origin + '/api';

// Helper function for making API requests
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(API_BASE_URL + endpoint, config);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || result.message);
        }
        
        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

function normalizeJenjangForDb(value) {
    const raw = (value || '').toString().trim().toLowerCase();
    if (!raw) return '';
    if (raw.includes('smk')) return 'SMK';
    if (raw.includes('mts') || raw.includes('tsanawiyah')) return 'MTs';
    if (raw.includes('sd') || raw.includes('dasar')) return 'SD';
    if (raw.includes('tk') || raw.includes('kanak')) return 'TK';
    return value;
}

// Fungsi untuk mendeteksi jenjang secara otomatis berdasarkan parameter URL
function deteksiJenjang() {
    const params = new URLSearchParams(window.location.search);
    const jenjangParam = params.get('jenjang') || 'tk';

    const jenjangMapping = {
        'tk': 'TK',
        'sd': 'SD',
        'mts': 'MTs',
        'smk': 'SMK'
    };

    return jenjangMapping[jenjangParam] || 'TK';
}

// Fungsi untuk menyimpan data pendaftaran ke tabel 'pendaftaran'
async function simpanPendaftaran(dataPendaftaran) {
    try {
        console.log('Data to insert:', dataPendaftaran);

        const result = await apiRequest('/pendaftaran', {
            method: 'POST',
            body: JSON.stringify(dataPendaftaran)
        });

        console.log('Data pendaftaran berhasil disimpan:', result);
        return result.data;
    } catch (error) {
        console.error('Error menyimpan pendaftaran:', error);
        throw error;
    }
}

// Fungsi untuk mengambil data dari form HTML dan menyimpannya
async function simpanDataDariForm() {
    console.log('simpanDataDariForm called');
    try {
        const dataPendaftaran = {
            nama_lengkap: document.querySelector('#nama_lengkap').value,
            tempat_lahir: document.querySelector('#tempat_lahir').value,
            tanggal_lahir: document.querySelector('#tanggal_lahir').value,
            jenis_kelamin: document.querySelector('#jenis_kelamin').value,
            agama: document.querySelector('#agama').value,
            alamat_lengkap: document.querySelector('#alamat').value,
            no_identitas: document.querySelector('#no_identitas').value,
            no_telp_siswa: document.querySelector('#no_telp_siswa').value,
            nama_ayah: document.querySelector('#nama_ayah').value,
            nama_ibu: document.querySelector('#nama_ibu').value,
            pekerjaan_ayah: document.querySelector('#pekerjaan_ayah').value,
            pekerjaan_ibu: document.querySelector('#pekerjaan_ibu').value,
            no_telp_ortu: document.querySelector('#no_telp_ortu').value,
            email_ortu: document.querySelector('#email_ortu').value,
            jenjang: normalizeJenjangForDb(document.querySelector('#jenjang').value),
            no_ujian_rapor: document.querySelector('#no_ujian_rapor').value,
            prestasi: document.querySelector('#prestasi').value,
            alasan_memilih: document.querySelector('#alasan_memilih').value
        };

        console.log('Data collected:', dataPendaftaran);

        await simpanPendaftaran(dataPendaftaran);

        document.querySelector('#registrationForm').reset();

        const successMsg = document.querySelector('#successMessage');
        successMsg.textContent = 'Pendaftaran berhasil dikirim! Terima kasih telah mendaftar.';
        successMsg.style.display = 'block';

        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);

    } catch (error) {
        console.error('Error in simpanDataDariForm:', error);
        const errorMsg = document.querySelector('#errorMessage');
        errorMsg.textContent = 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.';
        errorMsg.style.display = 'block';

        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 5000);
    }
}

// Fungsi untuk menampilkan blog dari tabel 'blog'
async function tampilkanBlog() {
    try {
        const result = await apiRequest('/blog');
        const posts = result.data || [];

        const container = document.querySelector('#blog-posts');
        const latestContainer = document.querySelector('#latest-posts');
        const categoryContainer = document.querySelector('#blog-categories');

        if (!container) {
            console.warn('Container #blog-posts tidak ditemukan');
            return;
        }

        container.innerHTML = '';
        if (latestContainer) latestContainer.innerHTML = '';
        if (categoryContainer) categoryContainer.innerHTML = '';

        if (!posts || posts.length === 0) {
            container.innerHTML = '<p class="blog-state">Belum ada postingan blog.</p>';
            if (latestContainer) latestContainer.innerHTML = '<li class="blog-state">Belum ada berita terbaru.</li>';
            if (categoryContainer) categoryContainer.innerHTML = '<li class="blog-state">Kategori belum tersedia.</li>';
            return;
        }

        const fallbackImagePath = window.location.pathname.includes('/pages/')
            ? '../assets/images/nu-logo.png'
            : 'assets/images/nu-logo.png';
        const categoryCounter = {};

        function inferKategori(post) {
            const text = `${post.blog_title || ''} ${post.blog_content || ''}`.toLowerCase();
            if (text.includes('pengumuman')) return 'Pengumuman';
            if (text.includes('kegiatan')) return 'Kegiatan';
            if (text.includes('program')) return 'Program';
            if (text.includes('pendaftaran')) return 'Pendaftaran';
            if (text.includes('pendidikan') || text.includes('sekolah')) return 'Pendidikan';
            return 'Umum';
        }

        function formatTanggalIndonesia(value) {
            if (!value) return '-';
            return new Date(value).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        function ringkasKonten(text, maxLength = 220) {
            const raw = (text || '').replace(/<[^>]*>/g, '').trim();
            if (raw.length <= maxLength) return raw;
            return `${raw.slice(0, maxLength).trimEnd()}...`;
        }

        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'blog-post';

            const tanggal = formatTanggalIndonesia(post.tanggal);
            const judul = post.blog_title || 'Tanpa Judul';
            const konten = post.blog_content || '';
            const gambar = post.gambar_url && post.gambar_url.trim() ? post.gambar_url : fallbackImagePath;
            const detailUrl = `blog-detail.html?id=${encodeURIComponent(post.id)}`;
            const kategori = inferKategori(post);
            categoryCounter[kategori] = (categoryCounter[kategori] || 0) + 1;

            postElement.innerHTML = `
                <a href="${detailUrl}" aria-label="Buka detail blog ${judul}">
                    <img src="${gambar}" alt="${judul}" class="post-image" loading="lazy" onerror="this.src='${fallbackImagePath}'">
                </a>
                <h3 class="blog-post-title"><a href="${detailUrl}" style="color:inherit;text-decoration:none;">${judul}</a></h3>
                <p class="post-date">${tanggal}</p>
                <div class="post-content">${ringkasKonten(konten)}</div>
                <a href="${detailUrl}" class="button" style="margin-top:12px;">Baca Selengkapnya</a>
            `;

            container.appendChild(postElement);
        });

        if (latestContainer) {
            posts.slice(0, 8).forEach(post => {
                const item = document.createElement('li');
                item.innerHTML = `<a href="blog-detail.html?id=${encodeURIComponent(post.id)}" class="latest-title">${post.blog_title || 'Tanpa Judul'}</a>`;
                latestContainer.appendChild(item);
            });
        }

        if (categoryContainer) {
            Object.entries(categoryCounter).forEach(([nama, jumlah]) => {
                const item = document.createElement('li');
                item.textContent = `${nama} (${jumlah})`;
                categoryContainer.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Terjadi kesalahan saat menampilkan blog:', error);

        const container = document.querySelector('#blog-posts');
        const latestContainer = document.querySelector('#latest-posts');
        const categoryContainer = document.querySelector('#blog-categories');
        if (container) {
            container.innerHTML = '<p class="blog-state">Terjadi kesalahan saat memuat blog. Silakan coba lagi nanti.</p>';
        }
        if (latestContainer) latestContainer.innerHTML = '<li class="blog-state">Gagal memuat berita terbaru.</li>';
        if (categoryContainer) categoryContainer.innerHTML = '<li class="blog-state">Gagal memuat kategori.</li>';
    }
}

async function tampilkanDetailBlog() {
    const titleEl = document.querySelector('#detail-title');
    const dateEl = document.querySelector('#detail-date');
    const imageEl = document.querySelector('#detail-image');
    const contentEl = document.querySelector('#detail-content');
    const loadingEl = document.querySelector('#detail-loading');
    const errorEl = document.querySelector('#detail-error');
    const fallbackImagePath = '../assets/images/nu-logo.png';

    if (!titleEl || !dateEl || !imageEl || !contentEl) {
        console.warn('Elemen detail blog tidak lengkap.');
        return;
    }

    function setLoading(isLoading) {
        if (loadingEl) loadingEl.style.display = isLoading ? 'block' : 'none';
    }

    function setError(message) {
        if (!errorEl) return;
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    function formatTanggal(value) {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function renderKonten(konten) {
        const raw = (konten || '').trim();
        if (!raw) return '<p>Konten belum tersedia.</p>';
        const escaped = raw
            .replace(/&/g, '&amp;')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#39;');
        return escaped
            .split(/\n{2,}/)
            .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
            .join('');
    }

    try {
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get('id');
        const id = Number(idParam);

        if (!idParam || Number.isNaN(id)) {
            setError('ID blog tidak valid.');
            return;
        }

        setLoading(true);

        const result = await apiRequest(`/blog?id=${id}`);
        const post = result.data;

        if (!post) {
            setError('Blog tidak ditemukan atau gagal dimuat.');
            return;
        }

        titleEl.textContent = post.blog_title || 'Tanpa Judul';
        dateEl.textContent = formatTanggal(post.tanggal);
        imageEl.src = post.gambar_url && post.gambar_url.trim() ? post.gambar_url : fallbackImagePath;
        imageEl.alt = post.blog_title || 'Gambar blog';
        imageEl.onerror = function onImageError() {
            this.src = fallbackImagePath;
        };
        contentEl.innerHTML = renderKonten(post.blog_content);

        document.title = `${post.blog_title || 'Detail Blog'} - MWCNU`;
    } catch (error) {
        console.error('Terjadi kesalahan saat menampilkan detail blog:', error);
        setError('Terjadi kesalahan saat memuat detail blog.');
    } finally {
        setLoading(false);
    }
}

// Fungsi untuk menghapus blog berdasarkan ID
async function hapusBlog(id) {
    try {
        const result = await apiRequest(`/blog?id=${id}`, {
            method: 'DELETE'
        });

        console.log('Blog berhasil dihapus:', result);
        return result;
    } catch (error) {
        console.error('Terjadi kesalahan saat menghapus blog:', error);
        throw error;
    }
}

// Fungsi untuk menyimpan blog ke tabel 'blog'
async function simpanBlog(dataBlog) {
    try {
        console.log('Data blog to insert:', dataBlog);

        const result = await apiRequest('/blog', {
            method: 'POST',
            body: JSON.stringify(dataBlog)
        });

        console.log('Data blog berhasil disimpan:', result);
        return result.data;
    } catch (error) {
        console.error('Error menyimpan blog:', error);
        throw error;
    }
}

// Fungsi untuk mengambil semua blog posts (untuk admin)
async function ambilSemuaBlog() {
    try {
        const result = await apiRequest('/blog');
        return result.data || [];
    } catch (error) {
        console.error('Terjadi kesalahan saat mengambil semua blog:', error);
        throw error;
    }
}

// Fungsi untuk mengetes koneksi ke database
async function testKoneksiSupabase() {
    try {
        const result = await apiRequest('/blog');
        console.log('Koneksi MySQL berhasil!');
        return true;
    } catch (error) {
        console.error('Koneksi MySQL gagal:', error);
        return false;
    }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        simpanPendaftaran,
        simpanDataDariForm,
        tampilkanBlog,
        deteksiJenjang,
        testKoneksiSupabase,
        hapusBlog,
        simpanBlog,
        ambilSemuaBlog,
        tampilkanDetailBlog
    };
}

// Make functions available globally
window.simpanDataDariForm = simpanDataDariForm;
window.tampilkanBlog = tampilkanBlog;
window.testKoneksiSupabase = testKoneksiSupabase;
window.simpanBlog = simpanBlog;
window.hapusBlog = hapusBlog;
window.ambilSemuaBlog = ambilSemuaBlog;
window.tampilkanDetailBlog = tampilkanDetailBlog;

// Fungsi untuk mengunggah gambar ke server
async function uploadImageToSupabase(file) {
    try {
        if (!file) {
            throw new Error('File tidak ditemukan');
        }

        if (!file.type.startsWith('image/')) {
            throw new Error('File harus berupa gambar');
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Ukuran file maksimal 5MB');
        }

        const formData = new FormData();
        formData.append('file', file);

        console.log('Mengunggah gambar:', file.name);

        const response = await fetch(API_BASE_URL + '/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Upload failed');
        }

        console.log('Upload berhasil:', result);

        return {
            success: true,
            publicUrl: result.data.publicUrl,
            filePath: result.data.filePath
        };

    } catch (error) {
        console.error('Terjadi kesalahan saat mengunggah gambar:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Fungsi untuk menyimpan blog dengan upload gambar otomatis
async function simpanBlogDenganGambar(judul, konten, fileGambar) {
    try {
        let gambarUrl = '';

        if (fileGambar) {
            const uploadResult = await uploadImageToSupabase(fileGambar);
            
            if (!uploadResult.success) {
                throw new Error('Gagal mengunggah gambar: ' + uploadResult.error);
            }
            
            gambarUrl = uploadResult.publicUrl;
        }

        const dataBlog = {
            blog_title: judul,
            blog_content: konten,
            gambar_url: gambarUrl,
            tanggal: new Date().toISOString()
        };

        console.log('Data blog akan disimpan:', dataBlog);

        const result = await simpanBlog(dataBlog);

        return {
            success: true,
            data: result,
            gambarUrl: gambarUrl
        };

    } catch (error) {
        console.error('Error menyimpan blog dengan gambar:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Fungsi untuk menghapus gambar dari server
async function hapusGambarDariSupabase(filePath) {
    try {
        // Extract just the filename if full path is provided
        const filename = filePath.split('/').pop();
        
        const result = await apiRequest(`/upload?path=${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        });

        console.log('Gambar berhasil dihapus:', result);
        return { success: true, data: result };

    } catch (error) {
        console.error('Terjadi kesalahan saat menghapus gambar:', error);
        return { success: false, error: error.message };
    }
}

// Export new functions to global window
window.uploadImageToSupabase = uploadImageToSupabase;
window.simpanBlogDenganGambar = simpanBlogDenganGambar;
window.hapusGambarDariSupabase = hapusGambarDariSupabase;
