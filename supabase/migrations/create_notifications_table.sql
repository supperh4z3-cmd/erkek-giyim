-- Notifications tablosu (Admin Bildirim Sistemi)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performans için index'ler
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- RLS (Row Level Security) - Admin için okuma/yazma
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON notifications FOR ALL USING (true) WITH CHECK (true);
