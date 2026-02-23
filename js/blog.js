// Blog utility helpers for admin page
// Uses PHP upload API instead of Supabase Storage

async function handleImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar.');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB.');
        return;
    }

    const imagePreview = document.getElementById('image-preview');
    const blogImage = document.getElementById('blog-image');

    if (imagePreview) {
        imagePreview.alt = 'Uploading...';
        imagePreview.style.opacity = '0.6';
    }

    try {
        const uploadResult = await uploadImageToSupabase(file);

        if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Upload gagal');
        }

        if (blogImage) {
            blogImage.value = uploadResult.publicUrl;
        }

        if (imagePreview) {
            imagePreview.src = uploadResult.publicUrl;
            imagePreview.alt = 'Preview gambar blog';
            imagePreview.style.display = 'block';
            imagePreview.style.opacity = '1';
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Gagal upload gambar. Silakan coba lagi.');
        if (imagePreview) {
            imagePreview.style.opacity = '1';
        }
    }
}

window.handleImageUpload = handleImageUpload;

