// Admin functionality using Supabase for data management

// Default admin credentials (in production, this should be server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'mwcnu2024'
};

// Login state
let isLoggedIn = false;
let registrationsChannel = null;

function normalizeJenjang(value) {
    const raw = (value || '').toString().trim().toLowerCase();
    if (!raw) return '';
    if (raw.includes('smk')) return 'smk';
    if (raw.includes('mts') || raw.includes('tsanawiyah')) return 'mts';
    if (raw.includes('sd') || raw.includes('dasar')) return 'sd';
    if (raw.includes('tk') || raw.includes('kanak')) return 'tk';
    return '';
}

function formatJenjangLabel(value) {
    const normalized = normalizeJenjang(value);
    if (normalized === 'tk') return 'TK';
    if (normalized === 'sd') return 'SD';
    if (normalized === 'mts') return 'MTs';
    if (normalized === 'smk') return 'SMK';
    return (value || '-').toString();
}

// Registration data management - Using Supabase
async function getRegistrations() {
    try {
        const { data, error } = await supabase
            .from('Pendaftaran')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching registrations:', error);
            throw error;
        }
        
        return data || [];
    } catch (error) {
        console.error('Error fetching registrations:', error);
        throw error;
    }
}

async function deleteRegistration(id) {
    try {
        const { error } = await supabase
            .from('Pendaftaran')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting registration:', error);
            alert('Failed to delete registration');
            return false;
        }
        
        // Reload registrations after delete
        renderRegistrations(document.getElementById('program-filter')?.value || 'all');
        renderDashboard();
        return true;
    } catch (error) {
        console.error('Error deleting registration:', error);
        return false;
    }
}

function getRegistrationsByProgram(registrations, program) {
    return registrations.filter(reg => normalizeJenjang(reg.jenjang) === normalizeJenjang(program));
}

// Login functionality
function login(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        return true;
    }
    return false;
}

function logout() {
    isLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    showLoginForm();
}

function checkLoginStatus() {
    const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (loggedIn) {
        isLoggedIn = true;
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

// UI Management
function showLoginForm() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    renderDashboard();
}

// Dashboard rendering - Using Supabase data
async function renderDashboard() {
    try {
        const registrations = await getRegistrations();
        
        const stats = {
            total: registrations.length,
            tk: registrations.filter(reg => normalizeJenjang(reg.jenjang) === 'tk').length,
            sd: registrations.filter(reg => normalizeJenjang(reg.jenjang) === 'sd').length,
            mts: registrations.filter(reg => normalizeJenjang(reg.jenjang) === 'mts').length,
            smk: registrations.filter(reg => normalizeJenjang(reg.jenjang) === 'smk').length
        };

        // Update stats cards
        document.getElementById('total-registrations').textContent = stats.total;
        document.getElementById('tk-registrations').textContent = stats.tk;
        document.getElementById('sd-registrations').textContent = stats.sd;
        document.getElementById('mts-registrations').textContent = stats.mts;
        document.getElementById('smk-registrations').textContent = stats.smk;

        // Recent registrations
        const recentRegistrations = registrations.slice(0, 5);
        const recentList = document.getElementById('recent-registrations');
        recentList.innerHTML = '';

        if (recentRegistrations.length === 0) {
            recentList.innerHTML = '<p>No registrations yet.</p>';
        } else {
            recentRegistrations.forEach(reg => {
                const item = document.createElement('div');
                item.className = 'recent-item';
                item.innerHTML = `
                    <strong>${reg.nama_lengkap}</strong> - ${formatJenjangLabel(reg.jenjang)}
                    <br><small>${new Date(reg.created_at).toLocaleDateString()}</small>
                `;
                recentList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        document.getElementById('total-registrations').textContent = '-';
        document.getElementById('tk-registrations').textContent = '-';
        document.getElementById('sd-registrations').textContent = '-';
        document.getElementById('mts-registrations').textContent = '-';
        document.getElementById('smk-registrations').textContent = '-';

        const recentList = document.getElementById('recent-registrations');
        if (recentList) {
            recentList.innerHTML = '<p>Error loading data from Supabase. Check console and RLS policy.</p>';
        }
    }
}

// Registration management - Using Supabase data
async function renderRegistrations(filter = 'all') {
    try {
        const registrations = await getRegistrations();
        const normalizedFilter = (filter || 'all').toLowerCase();
        const filteredRegistrations = filter === 'all' 
            ? registrations 
            : registrations.filter(reg => normalizeJenjang(reg.jenjang) === normalizedFilter);
        
        const container = document.getElementById('registrations-list');
        container.innerHTML = '';

        if (filteredRegistrations.length === 0) {
            container.innerHTML = '<p>No registrations found.</p>';
            return;
        }

        filteredRegistrations.forEach(reg => {
            const item = document.createElement('div');
            item.className = 'registration-item';
            item.innerHTML = `
                <div class="registration-header">
                    <h4>${reg.nama_lengkap}</h4>
                    <div class="registration-actions">
                        <button onclick="exportToPDF(${reg.id})" class="btn-export">
                            <i class="fas fa-file-pdf"></i> Export PDF
                        </button>
                        <button onclick="deleteRegistration(${reg.id})" class="btn-delete">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="registration-details">
                    <p><strong>Program:</strong> ${formatJenjangLabel(reg.jenjang)}</p>
                    <p><strong>Tempat Lahir:</strong> ${reg.tempat_lahir || '-'}</p>
                    <p><strong>Tanggal Lahir:</strong> ${reg.tanggal_lahir || '-'}</p>
                    <p><strong>Nama Ayah:</strong> ${reg.nama_ayah || '-'}</p>
                    <p><strong>Nama Ibu:</strong> ${reg.nama_ibu || '-'}</p>
                    <p><strong>No. Telepon Ortu:</strong> ${reg.no_telp_ortu || '-'}</p>
                    <p><strong>Email Ortu:</strong> ${reg.email_ortu || '-'}</p>
                    <p><strong>Submitted:</strong> ${new Date(reg.created_at).toLocaleString()}</p>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Error rendering registrations:', error);
        const container = document.getElementById('registrations-list');
        container.innerHTML = '<p>Error loading registrations. Please try again.</p>';
    }
}

// Event handlers
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (login(username, password)) {
        showAdminPanel();
    } else {
        alert('Invalid credentials!');
    }
}

function handleFilterChange() {
    const filter = document.getElementById('program-filter').value;
    renderRegistrations(filter);
}

function setupRegistrationsRealtime() {
    if (!supabase || registrationsChannel) return;

    registrationsChannel = supabase
        .channel('admin-registrations-live')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'Pendaftaran'
        }, () => {
            renderDashboard();

            const activeTab = document.querySelector('.tab-button.active')?.getAttribute('data-tab');
            if (activeTab === 'registrations') {
                const activeFilter = document.getElementById('program-filter')?.value || 'all';
                renderRegistrations(activeFilter);
            }
        })
        .subscribe();
}

// Initialize admin functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on admin.html page (has requireAuth middleware)
    // If so, skip the localStorage-based login check since admin.html handles its own auth
    const isAdminPage = document.getElementById('admin-panel') && document.querySelector('[data-tab]');
    
    if (!isAdminPage) {
        // Only run localStorage-based login check on non-admin pages
        checkLoginStatus();
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Filter change
    const filterSelect = document.getElementById('program-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', handleFilterChange);
    }

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            if (tabId === 'registrations') {
                renderRegistrations();
            }
        });
    });

    setupRegistrationsRealtime();
    window.addEventListener('beforeunload', () => {
        if (registrationsChannel) {
            supabase.removeChannel(registrationsChannel);
            registrationsChannel = null;
        }
    });
});
