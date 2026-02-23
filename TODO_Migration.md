# Database Migration Plan: Supabase to MySQL

## Overview
Migrate the existing Supabase backend to a custom MySQL backend with PHP API.

## Current Supabase Setup
- **Database Tables**: `Pendaftaran`, `blog`
- **Storage Bucket**: `blog_images`
- **Authentication**: Supabase Auth

## Files to Create (New PHP API)

### 1. API Structure
- [ ] `api/config.php` - Database configuration (credentials, connection settings)
- [ ] `api/db_connect.php` - Database connection helper
- [ ] `api/pendaftaran.php` - API endpoints for registration (CRUD operations)
- [ ] `api/blog.php` - API endpoints for blog posts (CRUD operations)
- [ ] `api/upload.php` - API for image uploads (replacing Supabase Storage)
- [ ] `api/auth.php` - API for authentication (replacing Supabase Auth)
- [ ] `api/.htaccess` - Rewrite rules for clean URLs

### 2. SQL Database Schema
- [ ] `sql/schema.sql` - Complete MySQL schema for all tables

## Files to Modify (JavaScript)

### 1. js/supabase.js
- [ ] Replace Supabase client initialization with MySQL API calls
- [ ] Update `simpanPendaftaran()` to use fetch() to PHP API
- [ ] Update `tampilkanBlog()` to use fetch() to PHP API
- [ ] Update `tampilkanDetailBlog()` to use fetch() to PHP API
- [ ] Update `hapusBlog()` to use fetch() to PHP API
- [ ] Update `simpanBlog()` to use fetch() to PHP API
- [ ] Update `ambilSemuaBlog()` to use fetch() to PHP API
- [ ] Update `uploadImageToSupabase()` to use PHP upload API
- [ ] Update `simpanBlogDenganGambar()` accordingly
- [ ] Update `hapusGambarDariSupabase()` accordingly
- [ ] Update `testKoneksiSupabase()` for MySQL connection test

### 2. js/auth.js
- [ ] Replace Supabase Auth with PHP API authentication
- [ ] Update `loginAdmin()` to use PHP auth endpoint
- [ ] Update `logoutAdmin()` to use PHP auth endpoint
- [ ] Update `checkAuth()` to use PHP auth endpoint

### 3. js/admin.js
- [ ] Update registration data fetch to use PHP API
- [ ] Update registration delete to use PHP API
- [ ] Update or remove realtime subscriptions

### 4. js/pdf-export.js
- [ ] Update to fetch registration data from PHP API

## Implementation Order

### Phase 1: Backend Setup
1. [x] Create MySQL database schema - sql/schema.sql
2. [x] Create PHP API files:
   - [x] api/config.php
   - [x] api/db_connect.php
   - [x] api/pendaftaran.php
   - [x] api/blog.php
   - [x] api/upload.php
   - [x] api/auth.php
   - [x] api/.htaccess
3. [ ] Test API endpoints

### Phase 2: Frontend Migration
1. [ ] Update js/supabase.js to use PHP API
2. [ ] Update js/auth.js for new authentication
3. [ ] Update js/admin.js
4. [ ] Update js/pdf-export.js

### Phase 3: Testing
1. Test registration form submission
2. Test blog display and management
3. Test admin authentication
4. Test image uploads

## Notes
- Need to decide on image storage: local filesystem or cloud storage
- Need to implement session management (JWT or PHP sessions)
- Supabase anon key exposed in code - will need to secure new API
