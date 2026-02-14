# TODO - Blog Page Implementation

## Task: Create Blog Page with Supabase Integration

### Requirements:
- 2-column grid layout: 75% articles, 25% sidebar
- Blog cards with image at top (rounded corners)
- Dark elegant title color
- Date in CAPITAL format (e.g., FEBRUARY 13, 2026)
- Fallback image (organization logo) when gambar_url is empty
- Sidebar with "Berita Terbaru" and "Kategori"
- async/await for data loading
- try-catch error handling (already exists)

### Implementation Steps:

- [ ] 1. Update `pages/blog.html` - Add 2-column grid layout with sidebar structure
- [ ] 2. Add custom CSS for blog cards and sidebar styling
- [ ] 3. Update `js/supabase.js` - Modify `tampilkanBlog()` function:
      - Add fallback image logic
      - Format date in CAPITAL format
      - Render sidebar with recent article titles
- [ ] 4. Test the implementation
