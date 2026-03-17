-- ===========================================
-- FINAL FIX - Complete Database Setup
-- Run this entire script in Supabase Dashboard > SQL Editor
-- ===========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;

-- ===========================================
-- 1. Fix has_role function to use TEXT instead of app_role
-- ===========================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
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
-- 2. Fix Products RLS - Use direct check instead of has_role
-- ===========================================
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ===========================================
-- 3. Fix Categories RLS
-- ===========================================
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ===========================================
-- 4. Fix User Roles RLS
-- ===========================================
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ===========================================
-- 5. Fix Orders RLS
-- ===========================================
CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ===========================================
-- 6. Fix Order Items RLS
-- ===========================================
CREATE POLICY "Admins can manage all order items"
  ON public.order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ===========================================
-- 7. Fix RPC function
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
-- 8. Grant permissions
-- ===========================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_admin_role TO authenticated;

-- ===========================================
-- 9. Verify admin user exists (optional - replace with your user ID)
-- ===========================================
-- Uncomment and run this if you need to manually make someone admin:
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('YOUR-USER-ID-HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ===========================================
-- DONE! 
-- ===========================================
-- Now:
-- 1. Sign in to your app
-- 2. Click "Make Me Admin" button
-- 3. Try adding a product
-- ===========================================
