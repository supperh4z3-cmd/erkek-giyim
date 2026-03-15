-- =============================================
-- Chase & Chain — Customer Auth Migration
-- =============================================

-- 1. customers tablosuna auth alanları
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS auth_id UUID;
CREATE INDEX IF NOT EXISTS idx_customers_auth_id ON customers(auth_id);

-- 2. Müşteri adresleri
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Ev Adresim',
  full_name TEXT NOT NULL,
  line1 TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Müşteri favorileri
CREATE TABLE IF NOT EXISTS customer_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- RLS
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;

-- Public read/write for addresses and favorites (auth via API)
CREATE POLICY "Public read customer_addresses" ON customer_addresses FOR SELECT USING (true);
CREATE POLICY "Public insert customer_addresses" ON customer_addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update customer_addresses" ON customer_addresses FOR UPDATE USING (true);
CREATE POLICY "Public delete customer_addresses" ON customer_addresses FOR DELETE USING (true);

CREATE POLICY "Public read customer_favorites" ON customer_favorites FOR SELECT USING (true);
CREATE POLICY "Public insert customer_favorites" ON customer_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete customer_favorites" ON customer_favorites FOR DELETE USING (true);

-- customers tablosu update policy
CREATE POLICY "Public update customers" ON customers FOR UPDATE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer ON customer_favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_product ON customer_favorites(product_id);
