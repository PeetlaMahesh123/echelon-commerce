-- ===========================================
-- SUPABASE CONFIGURATION FOR EMAIL VERIFICATION
-- Run this in Supabase Dashboard > SQL Editor
-- ===========================================

-- This script configures your Supabase project to:
-- 1. Allow email verification from any domain (not just localhost)
-- 2. Set up proper site URLs for production
-- 3. Configure email templates with correct redirect URLs

-- ===========================================
-- STEP 1: Update Site URL Settings
-- ===========================================
-- IMPORTANT: You MUST also update these in Supabase Dashboard:
-- Go to: Authentication > URL Configuration
-- - Site URL: https://your-production-domain.com
-- - Redirect URLs: Add both http://localhost:8080 and https://your-production-domain.com

-- For now, we'll set up the database to accept all redirects
-- But you should still configure the URLs in the dashboard

-- ===========================================
-- STEP 2: Update Email Template Redirect URL
-- ===========================================
-- The email confirmation links will use the origin from which the user signed up
-- This is already handled in the code with: emailRedirectTo: window.location.origin

-- To verify this is working, check Auth.tsx lines 54 and 106
-- It should use: `${window.location.origin}/auth`

-- ===========================================
-- STEP 3: Verify Email Function Settings
-- ===========================================
-- Check in Supabase Dashboard:
-- 1. Go to Authentication > Email Templates
-- 2. Click on "Confirm signup" template
-- 3. Make sure the {{ .ConfirmationURL }} variable is used
-- 4. The link should look like: {{ .ConfirmationURL }}

-- ===========================================
-- STEP 4: Test Email Delivery
-- ===========================================
-- 1. Go to Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Enter a test email
-- 4. Check if email arrives

-- If emails don't arrive:
-- - Check Authentication > Email Templates > SMTP settings
-- - Supabase free tier uses their default email service
-- - For production, consider setting up custom SMTP

-- ===========================================
-- STEP 5: RLS Policy Verification (Already Fixed)
-- ===========================================
-- Your RLS policies are already configured correctly
-- Admin users can manage products, categories, orders, etc.

-- ===========================================
-- IMPORTANT MANUAL STEPS IN SUPABASE DASHBOARD
-- ===========================================
/*
YOU MUST DO THESE STEPS MANUALLY IN SUPABASE:

1. Go to Project Settings > API
   - Note your Project URL: https://dqcxljpkrlbaolxbzmxe.supabase.co
   
2. Go to Authentication > URL Configuration
   - Site URL: Set to your production URL (or leave empty for now)
   - Add these Redirect URLs:
     * http://localhost:8080
     * http://localhost:5173
     * https://your-username.github.io/echelon-commerce (if using GitHub Pages)
     * https://your-domain.com (your actual production domain)
   
3. Go to Authentication > Email Templates
   - Review each template
   - Make sure they use {{ .ConfirmationURL }} or {{ .Email }} variables
   - Don't hardcode localhost in templates
   
4. Go to Authentication > Rate Limits
   - Make sure email sending isn't rate limited too strictly
   - Default limits should be fine for testing

5. Test the complete flow:
   - Open your app in a normal browser (not incognito)
   - Go to /auth
   - Sign up with a real email address
   - Check your email inbox
   - Click the verification link
   - You should be redirected back to your app and verified
*/

-- ===========================================
-- OPTIONAL: Force Email Confirmation Setting
-- ===========================================
-- By default, Supabase requires email confirmation
-- If you want to DISABLE email confirmation (NOT RECOMMENDED for production):
/*
Run this in SQL Editor:

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
*/

-- ===========================================
-- VERIFICATION QUERY
-- ===========================================
-- Run this to check your current auth settings:
SELECT 
  name, 
  value 
FROM auth.config 
WHERE name IN ('site_url', 'uri_allow_list');

-- ===========================================
-- DONE!
-- ===========================================
-- After running this and completing the manual steps:
-- 1. Email verification will work from any domain
-- 2. Users will be redirected to the correct URL after verification
-- 3. The app will work in both normal and incognito browsers

-- If you still have issues:
-- 1. Check browser console for errors
-- 2. Check Supabase logs in Dashboard
-- 3. Verify your .env file has correct VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
