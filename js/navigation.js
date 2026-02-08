// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    const navUl = document.querySelector('nav ul');
    
    // Create hamburger menu for mobile
    if (window.innerWidth < 768) {
        createMobileMenu();
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            removeMobileMenu();
        } else if (!document.querySelector('.nav-toggle')) {
            createMobileMenu();
        }
    });

    // Highlight active page
    highlightActivePage();

    // Smooth scroll for navigation links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// QR Modal handler: open modal and set QR image src based on data-jenjang
document.addEventListener('click', function(e) {
    // Open modal when clicking the trigger
    const openBtn = e.target.closest && e.target.closest('.open-qr-modal');
    if (openBtn) {
        const jenjang = openBtn.dataset.jenjang || 'tk';
        const modal = document.querySelector('.qr-modal');
        if (!modal) return;
        const img = modal.querySelector('#qrImage');
        const title = modal.querySelector('h3');
        const qrData = `pendaftaran.html?jenjang=${encodeURIComponent(jenjang)}`;
        const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
        if (img) img.src = qrSrc;
        if (title) title.textContent = 'Scan QR Code untuk mendaftar - ' + (jenjang || '').toUpperCase();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        return;
    }

    // Close modal when clicking close button or overlay
    if (e.target.matches('.qr-modal-close') || e.target.matches('.qr-modal-overlay')) {
        const modal = document.querySelector('.qr-modal');
        if (!modal) return;
        modal.style.display = 'none';
        document.body.style.overflow = '';
        // clear image src to stop any caching/loading
        const img = modal.querySelector('#qrImage');
        if (img) img.src = '';
    }
});

function createMobileMenu() {
    const nav = document.querySelector('nav');
    const navUl = document.querySelector('nav ul');
    
    const toggle = document.createElement('div');
    toggle.className = 'nav-toggle';
    toggle.innerHTML = '☰';
    toggle.style.display = 'block';
    toggle.style.cursor = 'pointer';
    toggle.style.fontSize = '24px';
    toggle.style.color = 'white';
    toggle.style.padding = '10px';
    
    nav.insertBefore(toggle, navUl);
    navUl.classList.add('nav-menu');
    
    toggle.addEventListener('click', () => {
        navUl.classList.toggle('active');
        toggle.textContent = navUl.classList.contains('active') ? '✕' : '☰';
    });
}

function removeMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    if (toggle) {
        toggle.remove();
        document.querySelector('nav ul').classList.remove('active', 'nav-menu');
    }
}

function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href.endsWith(currentPage) || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Remove active class from all content
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Add active class to corresponding content
            const activeContent = document.getElementById(tabId);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
});

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.querySelector('.registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Get parent name to personalize message
            const parentName = data.parentname || 'Calon Siswa Baru';
            const studentName = data.fullname || 'calon siswa';
            const program = data.program || 'program pilihan';
            
            // Create WhatsApp message
            const message = `Halo, saya ingin mendaftarkan ${studentName} untuk program ${program}. Nama orang tua: ${parentName}. No. HP: ${data.parentphone}`;
            const whatsappLink = `https://wa.me/62xxxxxxxxxx?text=${encodeURIComponent(message)}`;
            
            // Show confirmation
            alert('Terima kasih telah mengisi formulir!\n\nData Anda telah dicatat. Tim kami akan segera menghubungi Anda melalui WhatsApp atau email.\n\nSilakan juga hubungi kami di WhatsApp untuk proses pendaftaran lebih lanjut.');
            
            // Optional: Redirect to WhatsApp
            // window.open(whatsappLink, '_blank');
            
            // Reset form
            this.reset();
        });
    }
});