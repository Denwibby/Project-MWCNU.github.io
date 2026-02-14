// Konfigurasi Supabase menggunakan CDN @supabase/supabase-js
// Ganti dengan URL dan key Supabase Anda yang sebenarnya
const supabaseUrl = 'https://pjgtefuogurhpkqwgabo.supabase.co'; // Ganti dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZ3RlZnVvZ3VyaHBrcXdnYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMDQ3OTksImV4cCI6MjA4NjU4MDc5OX0.8lywIvOzP5VQPm5ouMlr_8ChKKJ3SvyWBXW-OViQ9os'; // Ganti dengan anon key Supabase Anda

// Inisialisasi koneksi ke Supabase
var supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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
    // Mendapatkan parameter jenjang dari URL
    const params = new URLSearchParams(window.location.search);
    const jenjangParam = params.get('jenjang') || 'tk';

    // Mapping jenjang berdasarkan parameter
    const jenjangMapping = {
        'tk': 'TK',
        'sd': 'SD',
        'mts': 'MTs',
        'smk': 'SMK'
    };

    // Mengembalikan jenjang yang sesuai, default ke 'TK' jika tidak ditemukan
    return jenjangMapping[jenjangParam] || 'TK';
}

// Fungsi untuk menyimpan data pendaftaran ke tabel 'pendaftaran'
async function simpanPendaftaran(dataPendaftaran) {
    try {
        console.log('Data to insert:', dataPendaftaran);

        // Mengirim data ke tabel 'pendaftaran' di Supabase
        const { data, error } = await supabase
            .from('Pendaftaran')
            .insert([dataPendaftaran]);

        if (error) {
            console.error('Error menyimpan pendaftaran:', error);
            throw error;
        }

        console.log('Data pendaftaran berhasil disimpan:', data);
        return data;
    } catch (error) {
        console.error('Terjadi kesalahan saat menyimpan pendaftaran:', error);
        throw error;
    }
}

// Fungsi untuk mengambil data dari form HTML dan menyimpannya
async function simpanDataDariForm() {
    console.log('simpanDataDariForm called');
    try {
        // Mengambil nilai dari elemen-elemen form menggunakan document.querySelector
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

        // Memanggil fungsi simpanPendaftaran untuk menyimpan data
        await simpanPendaftaran(dataPendaftaran);

        // Mengosongkan form setelah berhasil menyimpan
        document.querySelector('#registrationForm').reset();

        // Menampilkan pesan sukses
        const successMsg = document.querySelector('#successMessage');
        successMsg.textContent = 'Pendaftaran berhasil dikirim! Terima kasih telah mendaftar.';
        successMsg.style.display = 'block';

        // Menyembunyikan pesan sukses setelah 5 detik
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);

    } catch (error) {
        console.error('Error in simpanDataDariForm:', error);
        // Menampilkan pesan error jika terjadi kesalahan
        const errorMsg = document.querySelector('#errorMessage');
        errorMsg.textContent = 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.';
        errorMsg.style.display = 'block';

        // Menyembunyikan pesan error setelah 5 detik
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 5000);
    }
}

// Fungsi untuk menampilkan blog dari tabel 'blog'
async function tampilkanBlog() {
    try {
        // Mengambil data dari tabel 'blog' di Supabase
        const { data: posts, error } = await supabase
            .from('blog')
            .select('id, blog_title, blog_content, tanggal, gambar_url')
            .order('tanggal', { ascending: false }); // Mengurutkan berdasarkan tanggal terbaru

        if (error) {
            console.error('Error mengambil data blog:', error);
            throw error;
        }

        // Mengambil container untuk menampilkan blog
        const container = document.querySelector('#blog-posts');
        const latestContainer = document.querySelector('#latest-posts');
        const categoryContainer = document.querySelector('#blog-categories');

        if (!container) {
            console.warn('Container #blog-posts tidak ditemukan');
            return;
        }

        // Mengosongkan container sebelum menampilkan data baru
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

        // Menampilkan setiap postingan blog
        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'blog-post';

            // Format tanggal
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

        // Menampilkan pesan error di container
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
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
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

        const { data: post, error } = await supabase
            .from('blog')
            .select('id, blog_title, blog_content, tanggal, gambar_url')
            .eq('id', id)
            .single();

        if (error || !post) {
            console.error('Error mengambil detail blog:', error);
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
        // Menghapus data dari tabel 'blog' di Supabase berdasarkan ID
        const { data, error } = await supabase
            .from('blog')
            .delete()
            .eq('id', id); // Menggunakan kolom 'id' untuk identifikasi

        if (error) {
            console.error('Error menghapus blog:', error);
            throw error;
        }

        console.log('Blog berhasil dihapus:', data);
        return data;
    } catch (error) {
        console.error('Terjadi kesalahan saat menghapus blog:', error);
        throw error;
    }
}

// Fungsi untuk menyimpan blog ke tabel 'blog'
async function simpanBlog(dataBlog) {
    try {
        console.log('Data blog to insert:', dataBlog);

        // Mengirim data ke tabel 'blog' di Supabase
        const { data, error } = await supabase
            .from('blog')
            .insert([dataBlog]);

        if (error) {
            console.error('Error menyimpan blog:', error);
            throw error;
        }

        console.log('Data blog berhasil disimpan:', data);
        return data;
    } catch (error) {
        console.error('Terjadi kesalahan saat menyimpan blog:', error);
        throw error;
    }
}

// Fungsi untuk mengambil semua blog posts (untuk admin)
async function ambilSemuaBlog() {
    try {
        // Mengambil semua data dari tabel 'blog' di Supabase
        const { data: posts, error } = await supabase
            .from('blog')
            .select('*') // Mengambil semua kolom
            .order('tanggal', { ascending: false }); // Mengurutkan berdasarkan tanggal terbaru

        if (error) {
            console.error('Error mengambil semua blog:', error);
            throw error;
        }

        return posts || [];
    } catch (error) {
        console.error('Terjadi kesalahan saat mengambil semua blog:', error);
        throw error;
    }
}

// Fungsi untuk menginisialisasi koneksi Supabase (opsional, untuk testing)
async function testKoneksiSupabase() {
    try {
        const { data, error } = await supabase.from('Pendaftaran').select('count').limit(1);
        if (error) throw error;
        console.log('Koneksi Supabase berhasil!');
        return true;
    } catch (error) {
        console.error('Koneksi Supabase gagal:', error);
        return false;
    }
}

// Mengekspor fungsi-fungsi agar bisa digunakan di file lain (jika menggunakan module)
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

// Membuat fungsi global untuk digunakan di HTML
window.simpanDataDariForm = simpanDataDariForm;
window.tampilkanBlog = tampilkanBlog;
window.testKoneksiSupabase = testKoneksiSupabase;
window.simpanBlog = simpanBlog;
window.hapusBlog = hapusBlog;
window.ambilSemuaBlog = ambilSemuaBlog;
window.tampilkanDetailBlog = tampilkanDetailBlog;

// Fungsi untuk mengunggah gambar ke Supabase Storage
async function uploadImageToSupabase(file) {
    try {
        // Validasi file
        if (!file) {
            throw new Error('File tidak ditemukan');
        }

        // Validasi tipe file
        if (!file.type.startsWith('image/')) {
            throw new Error('File harus berupa gambar');
        }

        // Validasi ukuran file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Ukuran file maksimal 5MB');
        }

        // Membuat nama file unik dengan Date.now()
        const uniqueFileName = `blog_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        console.log('Mengunggah gambar:', uniqueFileName);

        // Mengunggah file ke Supabase Storage bucket 'blog_images'
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('blog_images')
            .upload(uniqueFileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error upload gambar:', uploadError);
            throw uploadError;
        }

        console.log('Upload berhasil:', uploadData);

        // Mendapatkan public URL dari gambar
        const { data: urlData, error: urlError } = await supabase.storage
            .from('blog_images')
            .getPublicUrl(uniqueFileName);

        if (urlError) {
            console.error('Error mendapatkan URL:', urlError);
            throw urlError;
        }

        const publicUrl = urlData.publicUrl;
        console.log('Public URL:', publicUrl);

        return {
            success: true,
            publicUrl: publicUrl,
            filePath: uploadData.path
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

        // Jika ada file gambar, upload ke Supabase
        if (fileGambar) {
            const uploadResult = await uploadImageToSupabase(fileGambar);
            
            if (!uploadResult.success) {
                throw new Error('Gagal mengunggah gambar: ' + uploadResult.error);
            }
            
            gambarUrl = uploadResult.publicUrl;
        }

        // Menyiapkan data blog
        const dataBlog = {
            blog_title: judul,
            blog_content: konten,
            gambar_url: gambarUrl,
            tanggal: new Date().toISOString()
        };

        console.log('Data blog akan disimpan:', dataBlog);

        // Menyimpan ke database menggunakan fungsi yang sudah ada
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

// Fungsi untuk menghapus gambar dari Supabase Storage
async function hapusGambarDariSupabase(filePath) {
    try {
        const { data, error } = await supabase.storage
            .from('blog_images')
            .remove([filePath]);

        if (error) {
            console.error('Error menghapus gambar:', error);
            throw error;
        }

        console.log('Gambar berhasil dihapus:', data);
        return { success: true, data: data };

    } catch (error) {
        console.error('Terjadi kesalahan saat menghapus gambar:', error);
        return { success: false, error: error.message };
    }
}

// Mengekspor fungsi-fungsi baru ke global window
window.uploadImageToSupabase = uploadImageToSupabase;
window.simpanBlogDenganGambar = simpanBlogDenganGambar;
window.hapusGambarDariSupabase = hapusGambarDariSupabase;
