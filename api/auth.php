<?php
/**
 * Authentication API
 * Replacing Supabase Auth with PHP session-based auth
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db_connect.php';

setCorsHeaders();

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle request based on method
switch ($method) {
    case 'POST':
        handlePost();
        break;
    case 'GET':
        handleGet();
        break;
    default:
        jsonError('Method not allowed', 405);
        break;
}

/**
 * Handle POST - Login or Logout
 */
function handlePost() {
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST;
    }
    
    if (isset($input['action'])) {
        $action = $input['action'];
    }
    
    switch ($action) {
        case 'login':
            handleLogin($input);
            break;
        case 'logout':
            handleLogout();
            break;
        default:
            jsonError('Action tidak valid', 400);
    }
}

/**
 * Handle GET - Check session/auth status
 */
function handleGet() {
    $action = isset($_GET['action']) ? $_GET['action'] : 'check';
    
    switch ($action) {
        case 'check':
            checkAuth();
            break;
        case 'logout':
            handleLogout();
            break;
        default:
            jsonError('Action tidak valid', 400);
    }
}

/**
 * Handle login
 */
function handleLogin($input) {
    if (empty($input['email']) || empty($input['password'])) {
        jsonError('Email dan password wajib diisi', 400);
    }
    
    $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        jsonError('Email tidak valid', 400);
    }
    
    $password = $input['password'];
    
    $db = getDb();
    
    // Get user from users table
    $sql = "SELECT * FROM users WHERE email = :email";
    $user = $db->get($sql, ['email' => $email]);
    
    if (!$user) {
        jsonError('Email atau password salah', 401);
    }
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        jsonError('Email atau password salah', 401);
    }
    
    // Generate session token
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
    
    // Store session in database
    $db->insert('sessions', [
        'id' => $token,
        'user_id' => $user['id'],
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'expires_at' => $expiresAt
    ]);
    
    // Store in PHP session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['nama'];
    $_SESSION['token'] = $token;
    
    jsonSuccess('Login berhasil', [
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'nama' => $user['nama']
        ],
        'token' => $token
    ]);
}

/**
 * Handle logout
 */
function handleLogout() {
    $token = $_SESSION['token'] ?? null;
    
    if ($token) {
        // Remove session from database
        try {
            $db = getDb();
            $db->delete('sessions', 'id = :id', ['id' => $token]);
        } catch (Exception $e) {
            error_log('Failed to delete session: ' . $e->getMessage());
        }
    }
    
    // Destroy PHP session
    session_destroy();
    
    jsonSuccess('Logout berhasil');
}

/**
 * Check authentication status
 */
function checkAuth() {
    $token = null;
    
    // Check Authorization header
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        $token = $matches[1];
    }
    
    // Check query string
    if (!$token && isset($_GET['token'])) {
        $token = $_GET['token'];
    }
    
    // Check PHP session
    if (!$token && isset($_SESSION['token'])) {
        $token = $_SESSION['token'];
    }
    
    if (!$token) {
        jsonError('Tidak terautentikasi', 401);
    }
    
    $db = getDb();
    
    // Verify token - using users table
    $sql = "SELECT s.*, u.email, u.nama 
            FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = :token AND s.expires_at > NOW()";
    $session = $db->get($sql, ['token' => $token]);
    
    if (!$session) {
        jsonError('Token tidak valid atau sudah expired', 401);
    }
    
    jsonSuccess('Terautentikasi', [
        'user' => [
            'id' => $session['user_id'],
            'email' => $session['email'],
            'nama' => $session['nama']
        ]
    ]);
}
