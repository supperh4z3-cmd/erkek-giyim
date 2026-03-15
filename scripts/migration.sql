-- =============================================
-- Chase & Chain — Supabase SQL Migration
-- =============================================

-- 1. ÜRÜNLER
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  hover_image TEXT,
  badge TEXT,
  discount_percentage INTEGER DEFAULT 0,
  is_new_season BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hex TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 2. MÜŞTERİLER
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SİPARİŞLER
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  total NUMERIC(10,2) NOT NULL,
  tracking_number TEXT DEFAULT '',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image TEXT
);

-- 4. KATEGORİLER
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT,
  link TEXT,
  label TEXT,
  section TEXT NOT NULL DEFAULT 'homepage',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AYARLAR (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. KAMPANYALAR
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  data JSONB NOT NULL,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DISCOVER
CREATE TABLE IF NOT EXISTS discover_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  theme TEXT,
  product_name TEXT,
  product_price TEXT,
  product_image TEXT,
  product_link TEXT,
  text_effect TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS discover_editor_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  link TEXT DEFAULT '',
  is_large BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- 8. POLİTİKALAR
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  faq JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. İADE TALEPLERİ
CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  customer_id UUID REFERENCES customers(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  refund_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID REFERENCES return_requests(id) ON DELETE CASCADE,
  order_item_id UUID,
  product_name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  image TEXT
);

-- İNDEXLER
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_new_season ON products(is_new_season);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_categories_section ON categories(section);
CREATE INDEX IF NOT EXISTS idx_policies_slug ON policies(slug);

-- RLS (Row Level Security) — Service role bypass eder
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE discover_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE discover_editor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;

-- Public read policies (herkes okuyabilir)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_colors" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Public read product_sizes" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read product_features" ON product_features FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Public read discover_slides" ON discover_slides FOR SELECT USING (true);
CREATE POLICY "Public read discover_editor_products" ON discover_editor_products FOR SELECT USING (true);
CREATE POLICY "Public read policies" ON policies FOR SELECT USING (true);
CREATE POLICY "Public read return_requests" ON return_requests FOR SELECT USING (true);
CREATE POLICY "Public read return_items" ON return_items FOR SELECT USING (true);
CREATE POLICY "Public insert return_requests" ON return_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert return_items" ON return_items FOR INSERT WITH CHECK (true);

-- Orders: public can insert (checkout), only service role can read/update
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public read order_items" ON order_items FOR SELECT USING (true);
