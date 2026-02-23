<?php
/**
 * Blog API
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
    case 'PUT':
        handlePut();
        break;
    case 'DELETE':
        handleDelete();
        break;
    default:
        jsonError('Method not allowed', 405);
        break;
}

/**
 * Handle GET request - Fetch blog posts
 */
function handleGet() {
    $db = getDb();
    
    // Check if filtering by ID
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if ($id) {
        // Get single blog post
        $sql = "SELECT * FROM blogs WHERE id = :id";
        $result = $db->get($sql, ['id' => $id]);
        
        if (!$result) {
            jsonError('Blog tidak ditemukan', 404);
        }
        
        jsonSuccess('Data blog ditemukan', $result);
    } else {
        // Get all blog posts ordered by date
        $sql = "SELECT * FROM blogs ORDER BY tanggal DESC";
        $results = $db->select($sql);
        jsonSuccess('Data blog', $results);
    }
}

/**
 * Handle POST request - Create new blog post
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
    if (empty($input['blog_title'])) {
        jsonError("Judul blog wajib diisi", 400);
    }
    
    // Map fields to database columns
    $data = [
        'blog_title' => $input['blog_title'],
        'blog_content' => $input['blog_content'] ?? '',
        'gambar_url' => $input['gambar_url'] ?? '',
        'tanggal' => $input['tanggal'] ?? date('Y-m-d H:i:s')
    ];
    
    try {
        $id = $db->insert('blogs', $data);
        jsonSuccess('Blog berhasil disimpan', ['id' => $id]);
    } catch (Exception $e) {
        jsonError('Gagal menyimpan blog: ' . $e->getMessage(), 500);
    }
}

/**
 * Update blog post
 Handle PUT request - */
function handlePut() {
    $db = getDb();
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['id'])) {
        jsonError('ID blog diperlukan', 400);
    }
    
    $id = (int)$input['id'];
    
    // Build update data
    $data = [];
    if (isset($input['blog_title'])) $data['blog_title'] = $input['blog_title'];
    if (isset($input['blog_content'])) $data['blog_content'] = $input['blog_content'];
    if (isset($input['gambar_url'])) $data['gambar_url'] = $input['gambar_url'];
    if (isset($input['tanggal'])) $data['tanggal'] = $input['tanggal'];
    
    if (empty($data)) {
        jsonError('Tidak ada data untuk diperbarui', 400);
    }
    
    try {
        $db->update('blogs', $data, 'id = :id', ['id' => $id]);
        jsonSuccess('Blog berhasil diperbarui');
    } catch (Exception $e) {
        jsonError('Gagal memperbarui blog: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle DELETE request - Delete blog post
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
        jsonError('ID blog diperlukan', 400);
    }
    
    try {
        $db->delete('blogs', 'id = :id', ['id' => $id]);
        jsonSuccess('Blog berhasil dihapus');
    } catch (Exception $e) {
        jsonError('Gagal menghapus blog: ' . $e->getMessage(), 500);
    }
}
