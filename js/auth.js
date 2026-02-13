// ============================================
// Sistem Autentikasi Admin dengan Supabase Auth
// ============================================

// Fungsi Login Admin
// Menggunakan supabase.auth.signInWithPassword untuk autentikasi
async function loginAdmin(email, password) {
    try {
        console.log('Attempting login with email:', email);

        // Validasi input
        if (!email || !password) {
            throw new Error('Email dan password harus diisi');
        }

        // Melakukan login dengan Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Login error:', error.message);
            throw error;
        }

        console.log('Login successful:', data);

        // Login berhasil, simpan session dan redirect ke admin.html
        if (data.session) {
            // Simpan session ke localStorage (opsional, untuk debugging)
            localStorage.setItem('supabase_session', JSON.stringify(data.session));
            
            // Redirect ke halaman admin (pages/admin.html)
            window.location.href = 'pages/admin.html';
        }

        return { success: true, data: data };

    } catch (error) {
        console.error('Login failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Fungsi Logout Admin
// Menggunakan supabase.auth.signOut() untuk logout
async function logoutAdmin() {
    try {
        console.log('Attempting logout...');

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error.message);
            throw error;
        }

        // Hapus session dari localStorage
        localStorage.removeItem('supabase_session');

        console.log('Logout successful');

        // Redirect ke halaman login
        window.location.href = 'login.html';

        return { success: true };

    } catch (error) {
        console.error('Logout failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Fungsi Cek Auth (Mendapatkan session saat ini)
// Menggunakan supabase.auth.getSession() untuk mendapatkan session
async function checkAuth() {
    try {
        console.log('Checking authentication status...');

        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Error getting session:', error.message);
            throw error;
        }

        console.log('Session data:', data);

        if (data.session) {
            console.log('User is logged in');
            return { isAuthenticated: true, session: data.session };
        } else {
            console.log('User is not logged in');
            return { isAuthenticated: false, session: null };
        }

    } catch (error) {
        console.error('Auth check failed:', error.message);
        return { isAuthenticated: false, session: null, error: error.message };
    }
}

// Middleware Sederhana: Cek apakah user sudah login
// Jika belum login, tendang balik ke login.html
async function requireAuth() {
    try {
        console.log('Running auth middleware...');

        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Error in requireAuth:', error.message);
            window.location.href = '../login.html';
            return false;
        }

        if (!data.session) {
            console.log('No session found, redirecting to login.html');
            window.location.href = '../login.html';
            return false;
        }

        console.log('User is authenticated, allowing access');
        return true;

    } catch (error) {
        console.error('Middleware error:', error.message);
        window.location.href = '../login.html';
        return false;
    }
}

// Fungsi untuk menangani form login
function handleLoginForm(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Reset messages
    if (errorMessage) errorMessage.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';

    // Disable button during login
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
    }

    loginAdmin(email, password)
        .then(result => {
            if (!result.success) {
                // Tampilkan error message
                if (errorMessage) {
                    errorMessage.textContent = result.error || 'Login failed';
                    errorMessage.style.display = 'block';
                }
                
                // Re-enable button
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                }
            }
            // Jika berhasil, redirect akan ditangani oleh loginAdmin
        })
        .catch(error => {
            console.error('Login error:', error);
            if (errorMessage) {
                errorMessage.textContent = 'Terjadi kesalahan saat login';
                errorMessage.style.display = 'block';
            }
            
            // Re-enable button
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        });
}

// Fungsi untuk menangani form logout
function handleLogout(event) {
    if (event) {
        event.preventDefault();
    }

    logoutAdmin()
        .then(result => {
            if (!result.success) {
                console.error('Logout failed:', result.error);
                alert('Logout gagal: ' + result.error);
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Terjadi kesalahan saat logout');
        });
}

// Event listener untuk inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    // Cek jika ada form login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginForm);
    }

    // Cek jika ada tombol logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Export fungsi-fungsi ke global window
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.checkAuth = checkAuth;
window.requireAuth = requireAuth;
window.handleLoginForm = handleLoginForm;
window.handleLogout = handleLogout;
