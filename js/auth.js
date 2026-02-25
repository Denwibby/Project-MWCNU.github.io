// ============================================
// Sistem Autentikasi Admin dengan PHP API
// Migrated from Supabase Auth
// ============================================

// API Base URL
const AUTH_API_URL = window.location.origin + '/api/auth';

// Helper function for auth API requests
async function authApiRequest(action, data = {}) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    // Add action to data
    const payload = { action, ...data };
    options.body = JSON.stringify(payload);
    
    try {
        const response = await fetch(AUTH_API_URL, options);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || result.message);
        }
        
        return result;
    } catch (error) {
        console.error('Auth API Error:', error);
        throw error;
    }
}

// Fungsi Login Admin
async function loginAdmin(email, password) {
    try {
        console.log('Attempting login with email:', email);

        if (!email || !password) {
            throw new Error('Email dan password harus diisi');
        }

        const result = await authApiRequest('login', { email, password });

        console.log('Login successful:', result);

        if (result.data && result.data.token) {
            // Simpan token ke localStorage
            localStorage.setItem('auth_token', result.data.token);
            localStorage.setItem('admin_info', JSON.stringify(result.data.admin));
            
            // Redirect ke halaman admin
            window.location.href = 'pages/admin.html';
        }

        return { success: true, data: result.data };

    } catch (error) {
        console.error('Login failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Fungsi Logout Admin
async function logoutAdmin() {
    try {
        console.log('Attempting logout...');

        const result = await authApiRequest('logout');

        // Hapus token dari localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_info');

        console.log('Logout successful');

        // Redirect ke halaman login
        window.location.href = 'login.html';

        return { success: true };

    } catch (error) {
        console.error('Logout failed:', error.message);
        // Still remove local storage even if API fails
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_info');
        return { success: false, error: error.message };
    }
}

// Fungsi Cek Auth
async function checkAuth() {
    try {
        console.log('Checking authentication status...');

        const token = localStorage.getItem('auth_token');
        
        if (!token) {
            console.log('No token found');
            return { isAuthenticated: false, session: null };
        }

        // Verify token with server
        const result = await fetch(AUTH_API_URL + '?action=check&token=' + encodeURIComponent(token));
        const data = await result.json();

        if (data.success) {
            console.log('User is logged in');
            return { isAuthenticated: true, session: data.data };
        } else {
            console.log('Token invalid or expired');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('admin_info');
            return { isAuthenticated: false, session: null };
        }

    } catch (error) {
        console.error('Auth check failed:', error.message);
        return { isAuthenticated: false, session: null, error: error.message };
    }
}

// Middleware: Cek apakah user sudah login
async function requireAuth() {
    try {
        console.log('Running auth middleware...');

        const authResult = await checkAuth();

        if (!authResult.isAuthenticated) {
            console.log('User not authenticated, redirecting to login.html');
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
                if (errorMessage) {
                    errorMessage.textContent = result.error || 'Login failed';
                    errorMessage.style.display = 'block';
                }
                
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                }
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            if (errorMessage) {
                errorMessage.textContent = 'Terjadi kesalahan saat login';
                errorMessage.style.display = 'block';
            }
            
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
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
}

// Event listener untuk inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginForm);
    }

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
