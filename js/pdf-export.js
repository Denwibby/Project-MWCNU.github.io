// PDF Export functionality using jsPDF
// Exports registration data to PDF format

async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    const config = { ...defaultOptions, ...options };
    const API_BASE_URL = window.location.origin + '/api';
    
    try {
        const response = await fetch(API_BASE_URL + endpoint, config);
        if (!response.ok) throw new Error('HTTP error: ' + response.status);
        const result = await response.json();
        if (result.success === false) throw new Error(result.error || result.message);
        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

function getJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    if (window.jspdf) return window.jspdf;
    if (window.jsPDF) return window.jsPDF;
    throw new Error('jsPDF library not loaded');
}

function formatDateIndo(dateStr) {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return dateStr; }
}

function getJenjangLabel(jenjang) {
    if (!jenjang) return '-';
    const j = jenjang.toString().toLowerCase();
    if (j.includes('tk')) return 'TK';
    if (j.includes('sd')) return 'SD';
    if (j.includes('mts')) return 'MTs';
    if (j.includes('smk')) return 'SMK';
    return jenjang;
}

async function exportToPDF(registrationId) {
    try {
        const result = await apiRequest('/pendaftaran?id=' + registrationId);
        const reg = result.data;
        if (!reg) { alert('Registration not found'); return; }

        const jsPDF = getJsPDF();
        const doc = new jsPDF();
        const green = [76, 175, 80];
        
        // Header
        doc.setFillColor(...green);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text('MWCNU Tanggulangin', 105, 10, { align: 'center' });
        doc.setFontSize(11);
        doc.text('Bukti Pendaftaran Siswa', 105, 18, { align: 'center' });

        // Badge
        doc.setFillColor(...green);
        doc.roundedRect(15, 30, 18, 7, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(getJenjangLabel(reg.jenjang), 24, 34.5, { align: 'center' });

        // Content
        let y = 48;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        
        const leftFields = [
            ['Nama', reg.nama_lengkap],
            ['TTL', (reg.tempat_lahir || '-') + ', ' + formatDateIndo(reg.tanggal_lahir)],
            ['JK', reg.jenis_kelamin],
            ['Agama', reg.agama],
            ['Alamat', reg.alamat_lengkap],
            ['No. Identitas', reg.no_identitas],
            ['No. HP', reg.no_telp_siswa]
        ];
        
        const rightFields = [
            ['Nama Ayah', reg.nama_ayah],
            ['Pekerjaan Ayah', reg.pekerjaan_ayah],
            ['Nama Ibu', reg.nama_ibu],
            ['Pekerjaan Ibu', reg.pekerjaan_ibu],
            ['No. HP Ortu', reg.no_telp_ortu],
            ['Email', reg.email_ortu]
        ];
        
        doc.setFont('helvetica', 'bold');
        doc.text('DATA SISWA', 15, y);
        doc.line(15, y + 1, 95, y + 1);
        doc.setFont('helvetica', 'normal');
        y += 7;
        
        leftFields.forEach(function(f) {
            doc.setFont('helvetica', 'bold');
            doc.text(f[0] + ':', 15, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(f[1] || '-'), 45, y);
            y += 6;
        });
        
        y = 48;
        doc.setFont('helvetica', 'bold');
        doc.text('DATA ORANG TUA', 110, y);
        doc.line(110, y + 1, 195, y + 1);
        doc.setFont('helvetica', 'normal');
        y += 7;
        
        rightFields.forEach(function(f) {
            doc.setFont('helvetica', 'bold');
            doc.text(f[0] + ':', 110, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(f[1] || '-'), 140, y);
            y += 6;
        });

        // Footer
        doc.setTextColor(128, 128, 128);
        doc.setFontSize(9);
        doc.text('Dicetak: ' + new Date().toLocaleString('id-ID'), 105, 285, { align: 'center' });

        const fname = reg.nama_lengkap ? 'pendaftaran_' + reg.nama_lengkap.replace(/\s+/g, '_') + '.pdf' : 'pendaftaran_' + registrationId + '.pdf';
        doc.save(fname);

    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF: ' + error.message);
    }
}

async function exportAllRegistrations(jenjangFilter) {
    try {
        const btn = document.querySelector('.export-all-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...'; }

        // Get filter from dropdown if not provided
        if (!jenjangFilter) {
            const filterSelect = document.getElementById('program-filter');
            if (filterSelect) {
                jenjangFilter = filterSelect.value;
            }
        }

        // Build API endpoint with filter
        let endpoint = '/pendaftaran';
        if (jenjangFilter && jenjangFilter !== 'all') {
            endpoint += '?jenjang=' + encodeURIComponent(jenjangFilter);
        }

        const result = await apiRequest(endpoint);
        const regs = result.data || [];
        if (regs.length === 0) { alert('No registrations found'); return; }

        const jsPDF = getJsPDF();
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        
        const green = [76, 175, 80];
        const dark = [33, 33, 33];
        const gray = [128, 128, 128];

        // Header
        doc.setFillColor(...green);
        doc.rect(0, 0, 297, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text('MWCNU Tanggulangin', 148, 8, { align: 'center' });
        doc.setFontSize(10);
        doc.text('Laporan Data Pendaftaran Siswa', 148, 14, { align: 'center' });

        // Summary
        doc.setTextColor(...dark);
        doc.setFontSize(10);
        doc.text('Total: ' + regs.length + ' siswa', 15, 28);
        doc.text('Export: ' + new Date().toLocaleDateString('id-ID'), 282, 28, { align: 'right' });

        // Group by jenjang
        const groups = regs.reduce(function(acc, r) {
            const j = getJenjangLabel(r.jenjang);
            if (!acc[j]) acc[j] = [];
            acc[j].push(r);
            return acc;
        }, {});

        const order = ['TK', 'SD', 'MTs', 'SMK'];
        const sortedKeys = Object.keys(groups).sort(function(a, b) {
            const ia = order.indexOf(a), ib = order.indexOf(b);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });

        let y = 35;
        const pageH = 210, margin = 12;
        
        // Column widths
        const cNo = 10, cNama = 48, cTTL = 42, cJK = 10, cAlamat = 55, cOrtu = 40, cTelp = 22;
        const totalW = cNo + cNama + cTTL + cJK + cAlamat + cOrtu + cTelp;

        sortedKeys.forEach(function(jenjang) {
            if (y > pageH - 35) { doc.addPage(); y = 15; }

            // Group header
            doc.setFillColor(230, 250, 230);
            doc.rect(margin, y - 4, totalW, 8, 'F');
            doc.setTextColor(...green);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(jenjang + ' (' + groups[jenjang].length + ' siswa)', margin + 4, y + 2);
            y += 10;

            // Table header
            doc.setFillColor(...green);
            doc.rect(margin, y, totalW, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            const hy = y + 5;
            doc.text('No', margin + cNo/2, hy, { align: 'center' });
            doc.text('Nama', margin + cNo + cNama/2, hy, { align: 'center' });
            doc.text('TTL', margin + cNo + cNama + cTTL/2, hy, { align: 'center' });
            doc.text('JK', margin + cNo + cNama + cTTL + cJK/2, hy, { align: 'center' });
            doc.text('Alamat', margin + cNo + cNama + cTTL + cJK + cAlamat/2, hy, { align: 'center' });
            doc.text('Ortu', margin + cNo + cNama + cTTL + cJK + cAlamat + cOrtu/2, hy, { align: 'center' });
            doc.text('HP', margin + cNo + cNama + cTTL + cJK + cAlamat + cOrtu + cTelp/2, hy, { align: 'center' });
            y += 7;

            // Rows
            doc.setTextColor(...dark);
            doc.setFont('helvetica', 'normal');
            
            groups[jenjang].forEach(function(r, i) {
                if (y > pageH - 12) {
                    doc.addPage(); y = 15;
                    doc.setFillColor(...green);
                    doc.rect(margin, y, totalW, 7, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(8);
                    const hy2 = y + 5;
                    doc.text('No', margin + cNo/2, hy2, { align: 'center' });
                    doc.text('Nama', margin + cNo + cNama/2, hy2, { align: 'center' });
                    doc.text('TTL', margin + cNo + cNama + cTTL/2, hy2, { align: 'center' });
                    doc.text('JK', margin + cNo + cNama + cTTL + cJK/2, hy2, { align: 'center' });
                    doc.text('Alamat', margin + cNo + cNama + cTTL + cJK + cAlamat/2, hy2, { align: 'center' });
                    doc.text('Ortu', margin + cNo + cNama + cTTL + cJK + cAlamat + cOrtu/2, hy2, { align: 'center' });
                    doc.text('HP', margin + cNo + cNama + cTTL + cJK + cAlamat + cOrtu + cTelp/2, hy2, { align: 'center' });
                    y += 7;
                    doc.setTextColor(...dark);
                }

                if (i % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(margin, y - 3, totalW, 6, 'F'); }
                
                doc.setFontSize(7);
                doc.text(String(i + 1), margin + cNo/2, y, { align: 'center' });
                doc.text((r.nama_lengkap || '-').substring(0, 22), margin + cNo + 2, y);
                doc.text(((r.tempat_lahir || '-')).substring(0, 15) + ',' + (r.tanggal_lahir || '-').substring(0, 5), margin + cNo + cNama + 2, y);
                doc.text(r.jenis_kelamin === 'L' ? 'L' : (r.jenis_kelamin === 'P' ? 'P' : '-'), margin + cNo + cNama + cTTL + cJK/2, y, { align: 'center' });
                doc.text((r.alamat_lengkap || '-').substring(0, 28), margin + cNo + cNama + cTTL + cJK + 2, y);
                doc.text((r.nama_ayah || r.nama_ibu || '-').substring(0, 18), margin + cNo + cNama + cTTL + cJK + cAlamat + 2, y);
                doc.text((r.no_telp_ortu || r.no_telp_siswa || '-').substring(0, 12), margin + cNo + cNama + cTTL + cJK + cAlamat + cOrtu + 2, y);
                
                y += 6;
            });
            y += 6;
        });

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFillColor(240, 240, 240);
            doc.rect(0, pageH - 12, 297, 12, 'F');
            doc.setTextColor(...gray);
            doc.setFontSize(8);
            doc.text('MWCNU Tanggulangin - Sistem Pendaftaran', 148, pageH - 6, { align: 'center' });
            doc.text('Hal ' + i + '/' + totalPages, 282, pageH - 6, { align: 'right' });
        }

        doc.save('semua_pendaftaran_' + new Date().toISOString().split('T')[0] + '.pdf');

        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-file-pdf"></i> Export All as PDF'; }

    } catch (error) {
        console.error('Error exporting all:', error);
        alert('Failed to export PDF: ' + error.message);
        const btn = document.querySelector('.export-all-btn');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-file-pdf"></i> Export All as PDF'; }
    }
}

window.exportToPDF = exportToPDF;
window.exportAllRegistrations = exportAllRegistrations;
