// Admin functionality using localStorage for data management

// Default admin credentials (in production, this should be server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'mwcnu2024'
};

// Login state
let isLoggedIn = false;

// Registration data management
function saveRegistration(data) {
    const registrations = getRegistrations();
    const newRegistration = {
        id: Date.now(),
        ...data,
        submittedAt: new Date().toISOString()
    };
    registrations.push(newRegistration);
    localStorage.setItem('registrations', JSON.stringify(registrations));
    return newRegistration;
}

function getRegistrations() {
    const registrations = localStorage.getItem('registrations');
    return registrations ? JSON.parse(registrations) : [];
}

function deleteRegistration(id) {
    const registrations = getRegistrations().filter(reg => reg.id !== id);
    localStorage.setItem('registrations', JSON.stringify(registrations));
}

function getRegistrationsByProgram(program) {
    return getRegistrations().filter(reg => reg.program === program);
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

// Dashboard rendering
function renderDashboard() {
    const registrations = getRegistrations();
    const stats = {
        total: registrations.length,
        tk: getRegistrationsByProgram('tk').length,
        sd: getRegistrationsByProgram('sd').length,
        mts: getRegistrationsByProgram('mts').length,
        smk: getRegistrationsByProgram('smk').length
    };

    // Update stats cards
    document.getElementById('total-registrations').textContent = stats.total;
    document.getElementById('tk-registrations').textContent = stats.tk;
    document.getElementById('sd-registrations').textContent = stats.sd;
    document.getElementById('mts-registrations').textContent = stats.mts;
    document.getElementById('smk-registrations').textContent = stats.smk;

    // Recent registrations
    const recentRegistrations = registrations.slice(-5).reverse();
    const recentList = document.getElementById('recent-registrations');
    recentList.innerHTML = '';

    if (recentRegistrations.length === 0) {
        recentList.innerHTML = '<p>No registrations yet.</p>';
    } else {
        recentRegistrations.forEach(reg => {
            const item = document.createElement('div');
            item.className = 'recent-item';
            item.innerHTML = `
                <strong>${reg.fullname}</strong> - ${reg.program.toUpperCase()}
                <br><small>${new Date(reg.submittedAt).toLocaleDateString()}</small>
            `;
            recentList.appendChild(item);
        });
    }
}

// Registration management
function renderRegistrations(filter = 'all') {
    const registrations = filter === 'all' ? getRegistrations() : getRegistrationsByProgram(filter);
    const container = document.getElementById('registrations-list');
    container.innerHTML = '';

    if (registrations.length === 0) {
        container.innerHTML = '<p>No registrations found.</p>';
        return;
    }

    registrations.reverse().forEach(reg => {
        const item = document.createElement('div');
        item.className = 'registration-item';
        item.innerHTML = `
            <div class="registration-header">
                <h4>${reg.fullname}</h4>
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
                <p><strong>Program:</strong> ${reg.program.toUpperCase()}</p>
                <p><strong>Birth Date:</strong> ${reg.birthdate}</p>
                <p><strong>Parent:</strong> ${reg.parentname}</p>
                <p><strong>Phone:</strong> ${reg.parentphone}</p>
                <p><strong>Email:</strong> ${reg.parentemail}</p>
                <p><strong>Submitted:</strong> ${new Date(reg.submittedAt).toLocaleString()}</p>
            </div>
        `;
        container.appendChild(item);
    });
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

// Initialize admin functionality
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();

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
});
