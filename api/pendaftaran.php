<?php
/**
 * Pendaftaran (Registration) API
 * Migrated from Supabase to MySQL
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db_connect.php';

setCorsHeaders();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle request based on method
switch ($method) {
    case 'GET':
        handleGet();
        break;
    case 'POST':
        handlePost();
        break;
    case 'DELETE':
        handleDelete();
        break;
    default:
        jsonError('Method not allowed', 405);
        break;
}

/**
 * Handle GET request - Fetch registrations
 */
function handleGet() {
    $db = getDb();
    
    // Check if filtering by ID
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $jenjang = isset($_GET['jenjang']) ? $_GET['jenjang'] : null;
    
    if ($id) {
        // Get single registration
        $sql = "SELECT * FROM students WHERE id = :id";
        $result = $db->get($sql, ['id' => $id]);
        
        if (!$result) {
            jsonError('Pendaftaran tidak ditemukan', 404);
        }
        
        jsonSuccess('Data pendaftaran ditemukan', $result);
    } else {
        // Get all registrations with optional filtering
        $sql = "SELECT * FROM students";
        $params = [];
        
        if ($jenjang) {
            $sql .= " WHERE jenjang = :jenjang";
            $params['jenjang'] = $jenjang;
        }
        
        $sql .= " ORDER BY create_at DESC";
        
        $results = $db->select($sql, $params);
        jsonSuccess('Data pendaftaran', $results);
    }
}

/**
 * Handle POST request - Create new registration
 */
function handlePost() {
    $db = getDb();
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        // Try form data
        $input = $_POST;
    }
    
    // Validate required fields
    $required = ['nama_lengkap'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            jsonError("Field $field wajib diisi", 400);
        }
    }
    
    // Map fields to database columns
    $data = [
        'nama_lengkap' => $input['nama_lengkap'],
        'tempat_lahir' => $input['tempat_lahir'] ?? '',
        'tanggal_lahir' => $input['tanggal_lahir'] ?? null,
        'jenis_kelamin' => $input['jenis_kelamin'] ?? null,
        'agama' => $input['agama'] ?? '',
        'alamat_lengkap' => $input['alamat_lengkap'] ?? '',
        'no_identitas' => $input['no_identitas'] ?? '',
        'no_telp_siswa' => $input['no_telp_siswa'] ?? '',
        'nama_ayah' => $input['nama_ayah'] ?? '',
        'nama_ibu' => $input['nama_ibu'] ?? '',
        'pekerjaan_ayah' => $input['pekerjaan_ayah'] ?? '',
        'pekerjaan_ibu' => $input['pekerjaan_ibu'] ?? '',
        'no_telp_ortu' => $input['no_telp_ortu'] ?? '',
        'email_ortu' => $input['email_ortu'] ?? '',
        'jenjang' => $input['jenjang'] ?? 'TK',
        'no_ujian_rapor' => $input['no_ujian_rapor'] ?? '',
        'prestasi' => $input['prestasi'] ?? '',
        'alasan_memilih' => $input['alasan_memilih'] ?? ''
    ];
    
    try {
        $id = $db->insert('students', $data);
        jsonSuccess('Pendaftaran berhasil disimpan', ['id' => $id]);
    } catch (Exception $e) {
        jsonError('Gagal menyimpan pendaftaran: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle DELETE request - Delete registration
 */
function handleDelete() {
    $db = getDb();
    
    // Get ID from query string or JSON body
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id) {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($input['id']) ? (int)$input['id'] : null;
    }
    
    if (!$id) {
        jsonError('ID pendaftaran diperlukan', 400);
    }
    
    try {
        $db->delete('students', 'id = :id', ['id' => $id]);
        jsonSuccess('Pendaftaran berhasil dihapus');
    } catch (Exception $e) {
        jsonError('Gagal menghapus pendaftaran: ' . $e->getMessage(), 500);
    }
}
