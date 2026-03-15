import { supabaseAdmin } from "@/lib/supabase";

export type AuditAction =
    | "create" | "update" | "delete"
    | "status_change" | "login" | "settings_update";

export type AuditEntityType =
    | "product" | "order" | "category" | "coupon"
    | "customer" | "settings" | "seo" | "campaign"
    | "discover" | "policy" | "auth";

interface LogActionParams {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string;
    details?: string;
}

export async function logAction({ action, entityType, entityId, details }: LogActionParams) {
    try {
        await supabaseAdmin.from("audit_logs").insert({
            action,
            entity_type: entityType,
            entity_id: entityId || null,
            details: details || null,
        });
    } catch (err) {
        console.error("Audit log hatası:", err);
    }
}
