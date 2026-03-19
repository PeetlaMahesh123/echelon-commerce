-- ===========================================
-- VERIFY EMAIL & FIX LOGIN ISSUES
-- Run this in Supabase Dashboard > SQL Editor
-- ===========================================

-- This script will:
-- 1. Show all unverified users
-- 2. Allow you to manually verify them
-- 3. Show how to reset passwords if needed

-- ===========================================
-- STEP 1: Check Unverified Users
-- ===========================================
-- Run this to see which users haven't verified their email
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ NOT VERIFIED'
        ELSE '✅ VERIFIED'
    END as status
FROM auth.users
ORDER BY created_at DESC;

-- ===========================================
-- STEP 2: Manually Verify Email (Choose ONE user)
-- ===========================================
-- Option A: Verify the MOST RECENT user
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC
LIMIT 1;

-- Option B: Verify a SPECIFIC email
-- Replace with your actual email address
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email = 'your-email@example.com';

-- Option C: Verify ALL unverified users (use with caution!)
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email_confirmed_at IS NULL;

-- ===========================================
-- STEP 3: Check Admin Role
-- ===========================================
-- After verifying email, make sure you have admin role
SELECT 
    ur.user_id,
    ur.role,
    au.email,
    au.email_confirmed_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin'
ORDER BY au.created_at DESC;

-- If you don't have admin role, add it:
-- Replace with your actual user ID from Step 1
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('YOUR-USER-ID-HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ===========================================
-- STEP 4: Reset Password (If needed)
-- ===========================================
-- If you forgot password or want to reset it:
-- You'll need to do this through Supabase Dashboard:
-- Authentication > Users > Find your user > Click 3 dots > Send password recovery

-- OR use this SQL to set a temporary password hash (advanced):
-- NOTE: This requires knowing the proper password hash format
-- Better to use the dashboard or resend confirmation email

-- ===========================================
-- STEP 5: Resend Confirmation Email
-- ===========================================
-- To resend confirmation email through SQL:
SELECT auth.email(
    recipient := 'your-email@example.com', -- Replace with your email
    subject := 'Please confirm your email',
    body := '<a href="http://localhost:8081/echelon-commerce/auth">Click here to verify</a>'
);

-- However, the BETTER way is to use the app:
-- 1. Go to /auth page
-- 2. Enter your email
-- 3. Click "Didn't receive verification email? Resend"

-- ===========================================
-- QUICK FIX - Verify Latest User & Make Admin
-- ===========================================
-- Run this complete script to fix everything at once:

-- 1. Verify the most recent unverified user
WITH verified_user AS (
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE email_confirmed_at IS NULL
    RETURNING id, email
)
-- 2. Add admin role for that user
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM verified_user
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Show the result
SELECT 
    '✅ User verified and made admin!' as status,
    email,
    email_confirmed_at
FROM auth.users
WHERE email_confirmed_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;

-- ===========================================
-- TROUBLESHOOTING
-- ===========================================

-- Problem: Can't login even after verification
-- Solution: Check if email is actually confirmed
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Problem: Still says "Invalid credentials"
-- Solution: Your password might be wrong. Try these:
-- 1. Use "Forgot Password" on login page
-- 2. Or create a NEW account with different email
-- 3. Or reset password in Supabase Dashboard

-- Problem: User exists but can't verify
-- Solution: Delete the user and create fresh account
-- WARNING: This deletes all user data!
-- DELETE FROM auth.users WHERE email = 'your-email@example.com';

-- ===========================================
-- DONE!
-- ===========================================
-- After running this:
-- 1. Your email should be verified ✅
-- 2. You should have admin role ✅
-- 3. You can now login with your credentials ✅
--
-- If still having issues:
-- - Clear browser cache and cookies
-- - Try incognito mode
-- - Create a new account with different email
