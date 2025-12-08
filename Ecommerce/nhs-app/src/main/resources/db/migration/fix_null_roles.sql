-- Migration script to fix NULL role names in database
-- This ensures all roles have a valid name set

USE WebServices;

-- Fix any roles with NULL name
UPDATE role SET name = 'USER' WHERE name IS NULL AND id = 1;
UPDATE role SET name = 'ADMIN' WHERE name IS NULL AND id = 2;
UPDATE role SET name = 'SUPER_ADMIN' WHERE name IS NULL AND id = 3;

-- Fix any roles with empty string name
UPDATE role SET name = 'USER' WHERE (name IS NULL OR TRIM(name) = '') AND id = 1;
UPDATE role SET name = 'ADMIN' WHERE (name IS NULL OR TRIM(name) = '') AND id = 2;
UPDATE role SET name = 'SUPER_ADMIN' WHERE (name IS NULL OR TRIM(name) = '') AND id = 3;

-- Ensure all roles have names (fallback to USER if unknown)
UPDATE role SET name = 'USER' WHERE name IS NULL OR TRIM(name) = '';

-- Verify no NULL roles remain
SELECT id, name FROM role WHERE name IS NULL OR TRIM(name) = '';

