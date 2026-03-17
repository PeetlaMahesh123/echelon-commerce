-- ===========================================
-- COMPLETE DATABASE SETUP FOR AURUM E-COMMERCE
-- Run this entire script in Supabase Dashboard > SQL Editor
-- ===========================================

-- ===========================================
-- 1. Timestamp update function
-- ===========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===========================================
-- 2. User Roles (enum + table)
-- ===========================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

-- Drop existing policies and recreate
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

CREATE POLICY "Users can update their own roles"
  ON public.user_roles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- ===========================================
-- 3. Profiles
-- ===========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Profiles viewable by owner"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile and user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- 4. Categories
-- ===========================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are public" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Categories are public"
  ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ===========================================
-- 5. Products
-- ===========================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2) CHECK (original_price IS NULL OR original_price >= 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are public" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Products are public"
  ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- 6. Cart
-- ===========================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;

CREATE POLICY "Users can manage own cart"
  ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- 7. Orders
-- ===========================================
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  total NUMERIC(10,2) NOT NULL,
  shipping_name TEXT,
  shipping_email TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- 8. Order Items
-- ===========================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert order items for own orders"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));
CREATE POLICY "Admins can manage all order items"
  ON public.order_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ===========================================
-- 9. Wishlist
-- ===========================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlists;

CREATE POLICY "Users can manage own wishlist"
  ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- 10. Reviews
-- ===========================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are public" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;

CREATE POLICY "Reviews are public"
  ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- 11. Product image storage bucket
-- ===========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Product images are public" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

CREATE POLICY "Product images are public"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- ===========================================
-- 12. RPC function for admin role assignment
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
-- 13. SEED DATA - Categories
-- ===========================================
INSERT INTO public.categories (id, name, slug, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Bags', 'bags', 'Luxury handbags and totes'),
  ('22222222-2222-2222-2222-222222222222', 'Watches', 'watches', 'Premium timepieces'),
  ('33333333-3333-3333-3333-333333333333', 'Eyewear', 'eyewear', 'Designer sunglasses'),
  ('44444444-4444-4444-4444-444444444444', 'Fragrance', 'fragrance', 'Exclusive perfumes'),
  ('55555555-5555-5555-5555-555555555555', 'Footwear', 'footwear', 'Designer shoes'),
  ('66666666-6666-6666-6666-666666666666', 'Jewelry', 'jewelry', 'Fine jewelry pieces'),
  ('77777777-7777-7777-7777-777777777777', 'Accessories', 'accessories', 'Luxury accessories')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- 14. SEED DATA - Products
-- ===========================================
INSERT INTO public.products (id, name, slug, description, price, original_price, category_id, in_stock, is_new, is_featured, rating, review_count) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Noir Leather Tote', 'noir-leather-tote', 'Handcrafted from the finest Italian leather, this timeless tote features meticulous stitching and gold-plated hardware. A statement piece for the discerning professional.', 1299.00, 1599.00, '11111111-1111-1111-1111-111111111111', true, false, true, 4.8, 24),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Royal Chronograph', 'royal-chronograph', 'Swiss-made automatic movement with 42-hour power reserve. The 41mm case in brushed titanium houses a sapphire crystal face with anti-reflective coating.', 4499.00, NULL, '22222222-2222-2222-2222-222222222222', true, true, true, 4.9, 18),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Aviator Noir', 'aviator-noir', 'Classic aviator silhouette reimagined with polarized Zeiss lenses and titanium frames. Includes leather case and microfiber cloth.', 485.00, 595.00, '33333333-3333-3333-3333-333333333333', true, false, true, 4.7, 31),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Oud Imperial', 'oud-imperial', 'A majestic fusion of rare Cambodian oud, Bulgarian rose, and amber. Presented in a hand-blown crystal flacon with gold accents.', 385.00, NULL, '44444444-4444-4444-4444-444444444444', true, true, false, 4.6, 42),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Oxford Classique', 'oxford-classique', 'Hand-welted Oxford crafted from patinated calfskin. Goodyear construction ensures decades of wear. Made in Northampton, England.', 895.00, 1100.00, '55555555-5555-5555-5555-555555555555', true, false, true, 4.8, 15),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Medallion Pendant', 'medallion-pendant', '18k yellow gold pendant featuring hand-engraved guilloche pattern. Suspended on a 22-inch chain with lobster clasp.', 2450.00, NULL, '66666666-6666-6666-6666-666666666666', true, true, true, 4.9, 27),
  ('00000000-0000-0000-0000-000000000007', 'Silk Royale Scarf', 'silk-royale-scarf', '100% mulberry silk with hand-rolled edges. Features an exclusive print inspired by Art Deco architecture.', 285.00, 350.00, '77777777-7777-7777-7777-777777777777', true, false, false, 4.5, 19)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- SETUP COMPLETE!
-- ===========================================
-- After running this script:
-- 1. Create an account through the app
-- 2. Sign in with your account
-- 3. Click "Make Me Admin" button on the auth page
-- 4. You will have admin access to /admin
-- ===========================================
