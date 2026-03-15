import { supabaseAdmin } from "@/lib/supabase";

export type NotificationType = "new_order" | "new_customer" | "low_stock" | "order_status" | "system";

interface CreateNotificationParams {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}

export async function createNotification({ type, title, message, link }: CreateNotificationParams) {
    try {
        await supabaseAdmin.from("notifications").insert({
            type,
            title,
            message,
            link: link || null,
            read: false,
        });
    } catch (err) {
        console.error("Bildirim oluşturma hatası:", err);
    }
}
