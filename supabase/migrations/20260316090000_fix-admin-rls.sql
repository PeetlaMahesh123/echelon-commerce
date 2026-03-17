-- Fix RLS policy for user_roles to allow admin self-assignment
-- This allows users to add admin role to themselves

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can insert their own admin role"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roles"
  ON public.user_roles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- Create RPC function for admin role assignment
CREATE OR REPLACE FUNCTION assign_admin_role(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_roles (user_id, role) 
  VALUES (user_uuid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
