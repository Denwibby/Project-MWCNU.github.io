// Konfigurasi Supabase menggunakan CDN @supabase/supabase-js
// Ganti dengan URL dan key Supabase Anda yang sebenarnya
const supabaseUrl = 'https://rgaozqsrkpiwffzxcyiy.supabase.co'; // Ganti dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnYW96cXNya3Bpd2ZmenhjeWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODMxMTQsImV4cCI6MjA4NjQ1OTExNH0.WDVGqr9riRsZVrR5tiGu1TFdr_ciaPrKS0b_y60Mpbc'; // Ganti dengan anon key Supabase Anda

// Inisialisasi koneksi ke Supabase
var supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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
            jenjang: document.querySelector('#jenjang').value,
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
            .from('Blog')
            .select('judul, konten, gambar_url, tanggal')
            .order('tanggal', { ascending: false }); // Mengurutkan berdasarkan tanggal terbaru

        if (error) {
            console.error('Error mengambil data blog:', error);
            throw error;
        }

        // Mengambil container untuk menampilkan blog
        const container = document.querySelector('#blog-posts');

        if (!container) {
            console.warn('Container #blog-posts tidak ditemukan');
            return;
        }

        // Mengosongkan container sebelum menampilkan data baru
        container.innerHTML = '';

        if (!posts || posts.length === 0) {
            container.innerHTML = '<p>Belum ada postingan blog.</p>';
            return;
        }

        // Menampilkan setiap postingan blog
        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'blog-post';

            // Format tanggal
            const tanggal = new Date(post.tanggal).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            postElement.innerHTML = `
                <h3>${post.judul}</h3>
                <p class="post-date">${tanggal}</p>
                ${post.gambar_url ? `<img src="${post.gambar_url}" alt="${post.judul}" class="post-image">` : ''}
                <div class="post-content">${post.konten}</div>
            `;

            container.appendChild(postElement);
        });

    } catch (error) {
        console.error('Terjadi kesalahan saat menampilkan blog:', error);

        // Menampilkan pesan error di container
        const container = document.querySelector('#blog-posts');
        if (container) {
            container.innerHTML = '<p>Terjadi kesalahan saat memuat blog. Silakan coba lagi nanti.</p>';
        }
    }
}

// Fungsi untuk menghapus blog berdasarkan ID
async function hapusBlog(id) {
    try {
        // Menghapus data dari tabel 'blog' di Supabase berdasarkan ID
        const { data, error } = await supabase
            .from('Blog')
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
        ambilSemuaBlog
    };
}

// Membuat fungsi global untuk digunakan di HTML
window.simpanDataDariForm = simpanDataDariForm;
window.tampilkanBlog = tampilkanBlog;
window.testKoneksiSupabase = testKoneksiSupabase;
