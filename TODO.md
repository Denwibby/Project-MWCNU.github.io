# TODO - Registration Statistics Fix

## Problem
- Statistics showing 0 because of mismatch between:
  - Stored jenjang values: "Taman Kanak-Kanak (TK)", "Sekolah Dasar Maarif (SD)", "Madrasah Tsanawiyah (MTs)", "Sekolah Menengah Kejuruan (SMK)"
  - Filter values in admin.js: "TK", "SD", "MTs", "SMK"

## Solution
- Update js/admin.js to filter using full jenjang names that are actually stored

## Tasks
- [x] Analyze the root cause of statistics showing 0
- [ ] Update admin.js filtering logic to match stored values
- [ ] Test the fix
