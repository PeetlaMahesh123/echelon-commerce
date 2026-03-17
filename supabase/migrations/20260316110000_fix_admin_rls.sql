-- Fix admin RLS policies - Run this in Supabase SQL Editor

-- ===========================================
-- 1. Create or replace the has_role function
-- ===========================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ===========================================
-- 2. Fix Products RLS policies
-- ===========================================
DROP POLICY IF EXISTS "Products are public" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Products are public"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- ===========================================
-- 3. Fix Categories RLS policies  
-- ===========================================
DROP POLICY IF EXISTS "Categories are public" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Categories are public"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- ===========================================
-- 4. Fix User Roles RLS policies
-- ===========================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own admin role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own admin role"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ===========================================
-- 5. Fix RPC function
-- ===========================================
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

-- ===========================================
-- 6. Grant necessary permissions
-- ===========================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_admin_role TO authenticated;

-- ===========================================
-- DONE! Now try adding a product again
-- ===========================================
