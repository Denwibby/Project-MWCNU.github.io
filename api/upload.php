<?php
/**
 * Upload API
 * Replacing Supabase Storage with local filesystem
 * Note: Image metadata is stored in blogs table (gambar_url field)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db_connect.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handleUpload();
        break;
    case 'DELETE':
        handleDelete();
        break;
    default:
        jsonError('Method not allowed', 405);
}

function handleUpload() {
    if (!isset($_FILES['file'])) {
        jsonError('File tidak ditemukan', 400);
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        jsonError('Gagal mengunggah file', 400);
    }

    if ($file['size'] > MAX_FILE_SIZE) {
        jsonError('Ukuran file melebihi batas maksimum 5MB', 400);
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, ALLOWED_TYPES, true)) {
        jsonError('Tipe file tidak diizinkan', 400);
    }

    if (!is_dir(UPLOAD_DIR) && !mkdir(UPLOAD_DIR, 0775, true)) {
        jsonError('Gagal membuat direktori upload', 500);
    }

    $originalName = $file['name'];
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if ($extension === '') {
        $mimeToExt = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp'
        ];
        $extension = $mimeToExt[$mimeType] ?? 'bin';
    }
    $fileName = sprintf('%s-%s.%s', date('YmdHis'), bin2hex(random_bytes(6)), $extension);
    $destination = rtrim(UPLOAD_DIR, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        jsonError('Gagal menyimpan file ke server', 500);
    }

    // Catatan: Tidak perlu menyimpan metadata ke database karena:
    // - Gambar blog disimpan di tabel 'blogs' pada kolom 'gambar_url'
    // - File disimpan di folder /uploads/ secara langsung
    
    jsonSuccess('File berhasil diunggah', [
        'publicUrl' => '/uploads/' . $fileName,
        'filePath' => $fileName,
        'originalName' => $originalName
    ]);
}

function handleDelete() {
    $path = isset($_GET['path']) ? trim((string)$_GET['path']) : '';
    if ($path === '') {
        $input = json_decode(file_get_contents('php://input'), true);
        $path = isset($input['path']) ? trim((string)$input['path']) : '';
    }

    if ($path === '') {
        jsonError('Path file diperlukan', 400);
    }

    $fileName = basename($path);
    if ($fileName === '' || $fileName === '.' || $fileName === '..') {
        jsonError('Path file tidak valid', 400);
    }

    $fullPath = rtrim(UPLOAD_DIR, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $fileName;

    if (file_exists($fullPath) && !unlink($fullPath)) {
        jsonError('Gagal menghapus file dari server', 500);
    }

    jsonSuccess('File berhasil dihapus');
}
