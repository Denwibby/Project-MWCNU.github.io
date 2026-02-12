// Blog management functions using localStorage

// Save a blog post
function saveBlogPost(title, content, imageUrl = '', date = new Date().toISOString()) {
    const posts = getBlogPosts();
    const newPost = {
        id: Date.now(),
        title,
        content,
        imageUrl,
        date
    };
    posts.push(newPost);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Handle image upload for blog posts
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        document.getElementById('blog-image').value = imageUrl;
        document.getElementById('image-preview').src = imageUrl;
        document.getElementById('image-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Get all blog posts
function getBlogPosts() {
    const posts = localStorage.getItem('blogPosts');
    return posts ? JSON.parse(posts) : [];
}

// Delete a blog post by ID
function deleteBlogPost(id) {
    const posts = getBlogPosts().filter(post => post.id !== id);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Render blog posts on the blog page
function renderBlogPosts() {
    const posts = getBlogPosts();
    const container = document.getElementById('blog-posts');
    if (!container) return;

    container.innerHTML = '';
    if (posts.length === 0) {
        container.innerHTML = '<p>No blog posts yet.</p>';
        return;
    }

    posts.reverse().forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'blog-post';
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p class="post-date">${new Date(post.date).toLocaleDateString()}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image">` : ''}
            <div class="post-content">${post.content}</div>
        `;
        container.appendChild(postElement);
    });
}

// Handle form submission for adding posts
function handleBlogFormSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('blog-title').value;
    const content = document.getElementById('blog-content').value;
    const imageUrl = document.getElementById('blog-image').value;

    if (title && content) {
        saveBlogPost(title, content, imageUrl);
        alert('Blog post added successfully!');
        document.getElementById('blog-form').reset();
    } else {
        alert('Please fill in title and content.');
    }
}

// Initialize blog functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add sample post if no posts exist
    if (getBlogPosts().length === 0) {
        saveBlogPost(
            'Selamat Datang di Blog MWCNU',
            'Blog ini adalah tempat untuk berbagi berita, pengumuman, dan informasi terbaru dari Majelis Wakil Cabang Nahdlatul Ulama Tanggulangin. Kami berkomitmen untuk memberikan informasi yang akurat dan bermanfaat bagi masyarakat.',
            'https://via.placeholder.com/600x300/4CAF50/white?text=MWCNU+Blog',
            '2023-10-01T10:00:00.000Z'
        );
    }

    renderBlogPosts();

    const form = document.getElementById('blog-form');
    if (form) {
        form.addEventListener('submit', handleBlogFormSubmit);
    }
});
