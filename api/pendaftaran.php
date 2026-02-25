<?php
/**
 * Pendaftaran (Registration) API
 * Migrated from Supabase to MySQL
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db_connect.php';

setCorsHeaders();

// Start session so registration can use authenticated user_id when available
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

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

    // Resolve a valid users.id to satisfy students.user_id foreign key.
    $userId = resolveRegistrationUserId($db, $input);
    
    // Map fields to database columns
    $data = [
        'user_id' => $userId,
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
 * Resolve user_id for new student registration.
 *
 * Priority:
 * 1) user_id from payload (if valid)
 * 2) logged-in session user_id
 * 3) existing user by parent email
 * 4) auto-create a "user" account for applicant
 */
function resolveRegistrationUserId($db, $input) {
    $payloadUserId = isset($input['user_id']) ? (int)$input['user_id'] : 0;
    if ($payloadUserId > 0) {
        $existing = $db->get(
            "SELECT id FROM users WHERE id = :id LIMIT 1",
            ['id' => $payloadUserId]
        );
        if ($existing) {
            return (int)$existing['id'];
        }
    }

    $sessionUserId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
    if ($sessionUserId > 0) {
        $existing = $db->get(
            "SELECT id FROM users WHERE id = :id LIMIT 1",
            ['id' => $sessionUserId]
        );
        if ($existing) {
            return (int)$existing['id'];
        }
    }

    $emailOrtu = trim((string)($input['email_ortu'] ?? ''));
    if ($emailOrtu !== '' && filter_var($emailOrtu, FILTER_VALIDATE_EMAIL)) {
        $existingByEmail = $db->get(
            "SELECT id FROM users WHERE email = :email ORDER BY id ASC LIMIT 1",
            ['email' => $emailOrtu]
        );
        if ($existingByEmail) {
            return (int)$existingByEmail['id'];
        }
    }

    return createApplicantUser($db, $input, $emailOrtu);
}

/**
 * Create a lightweight account for public registration to satisfy FK integrity.
 */
function createApplicantUser($db, $input, $emailOrtu) {
    $nama = trim((string)($input['nama_lengkap'] ?? 'Pendaftar'));
    if ($nama === '') {
        $nama = 'Pendaftar';
    }

    $baseUsername = buildUsernameBase($nama, (string)($input['no_identitas'] ?? ''));
    $username = ensureUniqueUsername($db, $baseUsername);

    $email = ($emailOrtu !== '' && filter_var($emailOrtu, FILTER_VALIDATE_EMAIL))
        ? $emailOrtu
        : ($username . '+' . time() . '@mwcnu.local');

    $passwordHash = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);

    return (int)$db->insert('users', [
        'nama' => $nama,
        'username' => $username,
        'password' => $passwordHash,
        'email' => $email,
        'role' => 'user'
    ]);
}

function buildUsernameBase($nama, $noIdentitas) {
    $cleanName = preg_replace('/[^a-zA-Z0-9]+/', '', strtolower($nama));
    if ($cleanName === '') {
        $cleanName = 'pendaftar';
    }

    $digits = preg_replace('/\D+/', '', (string)$noIdentitas);
    if ($digits !== '') {
        $cleanName .= substr($digits, -4);
    }

    return substr($cleanName, 0, 40);
}

function ensureUniqueUsername($db, $baseUsername) {
    $candidate = $baseUsername;

    for ($attempt = 0; $attempt < 20; $attempt++) {
        $exists = $db->get(
            "SELECT id FROM users WHERE username = :username LIMIT 1",
            ['username' => $candidate]
        );
        if (!$exists) {
            return $candidate;
        }

        $suffix = str_pad((string)random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        $candidate = substr($baseUsername, 0, 46) . $suffix;
    }

    return 'pendaftar' . bin2hex(random_bytes(4));
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
