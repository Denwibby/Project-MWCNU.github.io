<?php
/**
 * Database Configuration for MWCNU Website
 * Migrated from Supabase to MySQL
 */

// Database credentials - UPDATE THESE WITH YOUR MySQL DETAILS
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'u790382321_MWCNU');
define('DB_USER', 'u790382321_Adminmwcnu');        // Change to your MySQL username
define('DB_PASS', 'T4nggul4ng1n$');            // Change to your MySQL password
define('DB_CHARSET', 'utf8mb4');

// Upload configuration
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', '/uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

// Session configuration
define('SESSION_LIFETIME', 86400); // 24 hours in seconds
define('SESSION_NAME', 'MWCNU_SESSION');

// API Response helpers
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError($message, $statusCode = 400) {
    jsonResponse(['success' => false, 'error' => $message], $statusCode);
}

function jsonSuccess($message, $data = null) {
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    jsonResponse($response);
}

// CORS headers (secure configuration)
// Daftar domain yang diizinkan mengakses API
function setCorsHeaders() {
    // Dapatkan origin dari request
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Daftar domain yang diizinkan (sesuaikan dengan domain Anda)
    $allowedOrigins = [
        'https://mwcnutanggulangin.com',
        'https://www.mwcnutanggulangin.com',
        'http://localhost',
        'http://localhost:3000',
        'http://localhost:8080',
    ];
    
    // Periksa apakah origin ada dalam daftar yang diizinkan
    if (in_array($origin, $allowedOrigins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
    } else {
        // Jika origin tidak diizinkan, coba cek berdasarkan prefix (untuk subdomain)
        $found = false;
        foreach ($allowedOrigins as $allowed) {
            if (strpos($origin, $allowed) === 0 || $allowed === '*') {
                $found = true;
                if ($allowed !== '*') {
                    header('Access-Control-Allow-Origin: ' . $origin);
                    header('Access-Control-Allow-Credentials: true');
                } else {
                    header('Access-Control-Allow-Origin: *');
                }
                break;
            }
        }
        
        // Jika tidak ditemukan, tetap izinkan tapi tanpa credentials
        if (!$found) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 24 hours
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Security: Generate CSRF token
function generateCsrfToken() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Validate CSRF token
function validateCsrfToken($token) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
