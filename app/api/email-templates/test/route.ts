import { NextRequest, NextResponse } from "next/server";

// POST /api/email-templates/test — Test e-postası gönder
export async function POST(req: NextRequest) {
    try {
        const { templateKey, email } = await req.json();

        if (!templateKey || !email) {
            return NextResponse.json({ error: "Şablon ve e-posta adresi zorunludur" }, { status: 400 });
        }

        const emailModule = await import("@/lib/email");

        switch (templateKey) {
            case "order_confirmation":
                await emailModule.sendOrderConfirmation({
                    orderId: "TEST-" + Date.now().toString(36).toUpperCase(),
                    customerName: "Test Müşteri",
                    customerEmail: email,
                    items: [
                        { name: "Premium Oversize T-Shirt", quantity: 2, price: 449.90, size: "L", color: "Siyah" },
                        { name: "Cargo Jogger Pantolon", quantity: 1, price: 699.90, size: "M", color: "Haki" },
                    ],
                    total: 1599.70,
                    shippingAddress: "Test Mahalle, Test Sokak No:1, İstanbul",
                });
                break;

            case "shipping_notification":
                await emailModule.sendShippingNotification({
                    orderId: "TEST-" + Date.now().toString(36).toUpperCase(),
                    customerName: "Test Müşteri",
                    customerEmail: email,
                    trackingNumber: "TR" + Math.random().toString().slice(2, 14),
                    carrier: "Aras Kargo",
                });
                break;

            case "welcome":
                await emailModule.sendWelcomeEmail({
                    customerName: "Test Müşteri",
                    customerEmail: email,
                });
                break;

            case "password_reset":
                await emailModule.sendPasswordResetEmail({
                    customerName: "Test Müşteri",
                    customerEmail: email,
                    resetUrl: "https://erkek-giyim.vercel.app/reset-password?token=test-token-preview",
                });
                break;

            default:
                return NextResponse.json({ error: "Bilinmeyen şablon" }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: `Test e-postası ${email} adresine gönderildi` });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
