-- Create admin user directly in Supabase
-- Run this in your Supabase SQL Editor

-- First, check if user already exists
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Check if user exists
  SELECT id INTO user_id FROM auth.users WHERE email = 'peetlamahesh81@gmail.com';
  
  IF user_id IS NULL THEN
    -- Create the user with password 'Mahesh@1234'
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      gen_random_uuid(),
      'peetlamahesh81@gmail.com',
      crypt('Mahesh@1234', gen_salt('bf')),
      NOW(),
      '{"full_name": "Admin User"}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      ''
    )
    RETURNING id INTO user_id;
    
    RAISE NOTICE 'User created with ID: %', user_id;
  ELSE
    RAISE NOTICE 'User already exists with ID: %', user_id;
  END IF;
  
  -- Check if admin role exists
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_id AND role = 'admin'
  ) THEN
    -- Insert admin role
    INSERT INTO user_roles (user_id, role)
    VALUES (user_id, 'admin');
    
    RAISE NOTICE 'Admin role assigned';
  ELSE
    RAISE NOTICE 'Admin role already exists';
  END IF;
END $$;

-- Verify the user was created
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  ur.role
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id AND ur.role = 'admin'
WHERE au.email = 'peetlamahesh81@gmail.com';
