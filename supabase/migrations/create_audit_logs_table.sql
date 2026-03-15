-- Audit Logs tablosu (Admin Etkinlik Kaydı)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performans için index'ler
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
