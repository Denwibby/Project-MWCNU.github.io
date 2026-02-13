// PDF Export functionality using jsPDF
// Exports registration data to PDF format

// Function to export a single registration to PDF
async function exportToPDF(registrationId) {
    try {
        // Get registration data from Supabase
        const { data: registration, error } = await supabase
            .from('Pendaftaran')
            .select('*')
            .eq('id', registrationId)
            .single();

        if (error) {
            console.error('Error fetching registration:', error);
            alert('Failed to load registration data');
            return;
        }

        if (!registration) {
            alert('Registration not found');
            return;
        }

        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(18);
        doc.setTextColor(76, 175, 80); // Green color
        doc.text('MWCNU Tanggulangin', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Bukti Pendaftaran', 105, 30, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Add registration details
        doc.setFontSize(12);
        let y = 45;

        const fields = [
            ['Nama Lengkap', registration.nama_lengkap],
            ['Tempat Lahir', registration.tempat_lahir],
            ['Tanggal Lahir', registration.tanggal_lahir],
            ['Jenis Kelamin', registration.jenis_kelamin],
            ['Agama', registration.agama],
            ['Alamat', registration.alamat_lengkap],
            ['No. Identitas', registration.no_identitas],
            ['No. Telepon', registration.no_telp_siswa],
            ['Jenjang', registration.jenjang],
            ['Nama Ayah', registration.nama_ayah],
            ['Nama Ibu', registration.nama_ibu],
            ['Pekerjaan Ayah', registration.pekerjaan_ayah],
            ['Pekerjaan Ibu', registration.pekerjaan_ibu],
            ['No. Telepon Ortu', registration.no_telp_ortu],
            ['Email Ortu', registration.email_ortu]
        ];

        fields.forEach(([label, value]) => {
            doc.setFont(undefined, 'bold');
            doc.text(label + ':', 20, y);
            doc.setFont(undefined, 'normal');
            doc.text(String(value || '-'), 80, y);
            y += 8;
        });

        // Add footer
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        const date = new Date().toLocaleDateString('id-ID');
        doc.text('Dicetak pada: ' + date, 105, 280, { align: 'center' });

        // Save PDF
        doc.save('pendaftaran_' + registration.nama_laporan.replace(/\s+/g, '_') + '.pdf');

    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF. Please try again.');
    }
}

// Function to export all registrations to PDF
async function exportAllRegistrations() {
    try {
        // Show loading indicator
        const exportBtn = document.querySelector('.export-all-btn');
        if (exportBtn) {
            exportBtn.disabled = true;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        }

        // Get all registrations from Supabase
        const { data: registrations, error } = await supabase
            .from('Pendaftaran')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching registrations:', error);
            alert('Failed to load registration data');
            return;
        }

        if (!registrations || registrations.length === 0) {
            alert('No registrations found to export');
            return;
        }

        // Create PDF with all registrations
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(18);
        doc.setTextColor(76, 175, 80); // Green color
        doc.text('MWCNU Tanggulangin', 105, 15, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Data Pendaftaran Siswa', 105, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        const date = new Date().toLocaleDateString('id-ID');
        doc.text('Tanggal Export: ' + date, 105, 32, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.line(15, 38, 195, 38);

        // Add summary
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Total Pendaftaran: ' + registrations.length, 15, 48);

        // Group by jenjang
        const groupByJenjang = registrations.reduce((acc, reg) => {
            const jenjang = reg.jenjang || 'Unknown';
            if (!acc[jenjang]) {
                acc[jenjang] = [];
            }
            acc[jenjang].push(reg);
            return acc;
        }, {});

        let y = 58;
        const pageHeight = 280;
        const margin = 15;

        // Iterate through each jenjang group
        Object.keys(groupByJenjang).forEach(jenjang => {
            // Check if we need a new page
            if (y > pageHeight - 30) {
                doc.addPage();
                y = 20;
            }

            // Group header
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(jenjang + ' (' + groupByJenjang[jenjang].length + ' siswa)', margin, y);
            y += 8;

            // Table header
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.text('No.', margin, y);
            doc.text('Nama', margin + 15, y);
            doc.text('TTL', margin + 65, y);
            doc.text(' Orang Tua', margin + 110, y);
            doc.text('Telepon', margin + 160, y);
            y += 6;

            doc.line(margin, y - 2, 195, y - 2);

            // Table rows
            doc.setFont(undefined, 'normal');
            groupByJenjang[jenjang].forEach((reg, index) => {
                if (y > pageHeight - 20) {
                    doc.addPage();
                    y = 20;
                }

                const nama = (reg.nama_lengkap || '-').substring(0, 20);
                const ttl = (reg.tempat_lahir || '-') + ', ' + (reg.tanggal_lahir || '-').substring(0, 5);
                const ortu = (reg.nama_ayah || '-').substring(0, 20);
                const telp = reg.no_telp_ortu || reg.no_telp_siswa || '-';

                doc.text(String(index + 1) + '.', margin, y);
                doc.text(nama, margin + 15, y);
                doc.text(ttl, margin + 65, y);
                doc.text(ortu, margin + 110, y);
                doc.text(telp.substring(0, 15), margin + 160, y);
                y += 6;
            });

            y += 5;
        });

        // Add footer on last page
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text('Dicetak dari Sistem Pendaftaran MWCNU', 105, 285, { align: 'center' });

        // Save PDF
        doc.save('semua_pendaftaran_' + new Date().toISOString().split('T')[0] + '.pdf');

        // Reset button
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export All as PDF';
        }

    } catch (error) {
        console.error('Error exporting all registrations:', error);
        alert('Failed to export PDF. Please try again.');
        
        // Reset button on error
        const exportBtn = document.querySelector('.export-all-btn');
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export All as PDF';
        }
    }
}

// Export functions to global window
window.exportToPDF = exportToPDF;
window.exportAllRegistrations = exportAllRegistrations;
