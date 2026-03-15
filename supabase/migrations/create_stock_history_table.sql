-- Stok Geçmişi tablosu
CREATE TABLE IF NOT EXISTS stock_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    variant TEXT,
    change INTEGER NOT NULL,
    reason TEXT DEFAULT 'Manuel düzenleme',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indeksler
CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_created ON stock_history (created_at DESC);

-- Sipariş tamamlandığında otomatik stok düşürme logu için örnek fonksiyon (isteğe bağlı trigger)
-- NOT: Bu fonksiyonu aktive etmek için aşağıdaki trigger'ı da oluşturmanız gerekir.
-- CREATE OR REPLACE FUNCTION log_order_stock_change()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
--         INSERT INTO stock_history (product_id, variant, change, reason)
--         SELECT oi.product_id, oi.variant, -oi.quantity, 'Sipariş teslim edildi: ' || NEW.id
--         FROM order_items oi WHERE oi.order_id = NEW.id;
--     END IF;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- CREATE TRIGGER trg_order_stock_change AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION log_order_stock_change();
