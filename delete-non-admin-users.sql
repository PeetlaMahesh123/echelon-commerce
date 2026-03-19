-- ===========================================
-- DELETE ALL NON-ADMIN USERS
-- Run this in Supabase Dashboard > SQL Editor
-- ===========================================

-- ⚠️ WARNING: This will permanently delete all users without admin role!
-- This action CANNOT be undone!

-- ===========================================
-- STEP 1: Preview Users That Will Be Deleted
-- ===========================================
-- See which users will be deleted (all non-admin users)
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    '❌ WILL BE DELETED' as status
FROM auth.users
WHERE id NOT IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
)
ORDER BY created_at DESC;

-- ===========================================
-- STEP 2: Preview Admin Users (Will Be Kept)
-- ===========================================
-- See which users have admin role (these will be preserved)
SELECT 
    ur.user_id,
    au.email,
    au.email_confirmed_at,
    '👑 ADMIN - WILL KEEP' as status
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin';

-- ===========================================
-- STEP 3: Delete All Non-Admin Users
-- ===========================================
-- This deletes all users EXCEPT admins
-- Run this when you're ready!

DELETE FROM auth.users
WHERE id NOT IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- ===========================================
-- STEP 4: Verify Deletion
-- ===========================================
-- Check that only admin users remain
SELECT 
    id,
    email,
    email_confirmed_at,
    '✅ REMAINING (Admin)' as status
FROM auth.users
ORDER BY created_at DESC;

-- ===========================================
-- OPTIONAL: Also Clean Up Related Data
-- ===========================================
-- If you want to delete orphaned data from deleted users:

-- Delete orphaned profiles
DELETE FROM profiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- Delete orphaned user roles
DELETE FROM user_roles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Delete orphaned orders
DELETE FROM orders
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ===========================================
-- DONE!
-- ===========================================
-- After running this:
-- ✅ Only admin users remain
-- ✅ You can now register new test users
-- ✅ Old unverified users are gone
--
-- Next steps:
-- 1. Go to /auth page
-- 2. Register with a fresh email
-- 3. Verify your email
-- 4. Login and test!
