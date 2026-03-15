import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

let _resend: Resend | null = null;
function getResend(): Resend | null {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠ RESEND_API_KEY tanımlı değil — e-posta gönderilemeyecek");
        return null;
    }
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const BRAND_NAME = "CHASE & CHAIN";
const BRAND_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://erkek-giyim.vercel.app";

// ─────────────────────────────────────
// UNSUBSCRIBE HELPER
// ─────────────────────────────────────
function generateUnsubscribeToken(email: string): string {
    return Buffer.from(email).toString("base64");
}

function getUnsubscribeUrl(email: string): string {
    const token = generateUnsubscribeToken(email);
    return `${BRAND_URL}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

async function isUnsubscribed(email: string): Promise<boolean> {
    try {
        const { data } = await supabaseAdmin
            .from("email_unsubscribes")
            .select("id")
            .eq("email", email)
            .single();
        return !!data;
    } catch {
        return false;
    }
}

// ─────────────────────────────────────
// PREMIUM E-POSTA LAYOUT
// ─────────────────────────────────────
function emailLayout(content: string, preheader: string = "", recipientEmail: string = "") {
    const unsubUrl = recipientEmail ? getUnsubscribeUrl(recipientEmail) : "#";

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="tr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
    <title>${BRAND_NAME}</title>
    <!--[if mso]>
    <style>
        * { font-family: Arial, sans-serif !important; }
    </style>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap');
        
        * { margin: 0; padding: 0; }
        body { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-spacing: 0; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        .email-body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        
        @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .content-padding { padding: 24px 16px !important; }
            .header-padding { padding: 24px 16px !important; }
            .cta-button { padding: 16px 24px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#000000; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;" class="email-body">
    <!-- Preheader -->
    <div style="display:none; font-size:1px; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; mso-hide:all;">
        ${preheader}&#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;">
        <tr>
            <td align="center" style="padding: 24px 12px;">
                <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a1a; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">

                    <!-- TOP ACCENT LINE -->
                    <tr>
                        <td style="height: 4px; background: linear-gradient(90deg, #ef4444 0%, #dc2626 40%, #b91c1c 60%, #ef4444 100%); font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>

                    <!-- LOGO HEADER -->
                    <tr>
                        <td class="header-padding" style="text-align:center; padding: 40px 32px 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center">
                                        <a href="${BRAND_URL}" style="text-decoration:none; display: inline-block;">
                                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 32px; font-weight: 900; letter-spacing: -2px; color: #ffffff; font-style: italic; padding-right: 4px;">CHASE</td>
                                                    <td style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 32px; font-weight: 900; color: #ef4444; font-style: italic; padding: 0 6px;">&amp;</td>
                                                    <td style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 32px; font-weight: 900; letter-spacing: -2px; color: #ffffff; font-style: italic; padding-left: 4px;">CHAIN</td>
                                                </tr>
                                            </table>
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 8px;">
                                        <span style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 6px; color: #444444; font-weight: 600;">PREMIUM STREETWEAR</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                        <td style="padding: 0 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="border-bottom: 1px solid #1a1a1a; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- CONTENT -->
                    <tr>
                        <td class="content-padding" style="padding: 40px 32px;">
                            ${content}
                        </td>
                    </tr>

                    <!-- FOOTER DIVIDER -->
                    <tr>
                        <td style="padding: 0 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="border-bottom: 1px solid #1a1a1a; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="padding: 32px 32px 24px; text-align: center;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <a href="${BRAND_URL}" style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; color: #ef4444; text-decoration: none; text-transform: uppercase; letter-spacing: 3px; font-weight: 700; border: 1px solid #2a1515; padding: 10px 20px; border-radius: 6px; display: inline-block;">Siteyi Ziyaret Et</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <p style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #333333; margin: 0; line-height: 1.6;">
                                            ${BRAND_NAME} &mdash; Premium Streetwear
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="border-top: 1px solid #141414; padding-top: 16px; text-align: center;">
                                                    <p style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; color: #333333; margin: 0 0 8px; line-height: 1.6;">
                                                        Bu e-postayı ${BRAND_NAME} hesabınız olduğu için aldınız.
                                                    </p>
                                                    <a href="${unsubUrl}" style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; color: #555555; text-decoration: underline; letter-spacing: 0.5px;">E-posta bildirimlerinden çık</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- BOTTOM ACCENT -->
                    <tr>
                        <td style="height: 2px; background: linear-gradient(90deg, transparent, #ef4444, transparent); font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// ─────────────────────────────────────
// E-POSTA GÖNDER (UNSUBSCRIBE KONTROLÜ)
// ─────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string, text: string, isTransactional: boolean = false) {
    const r = getResend();
    if (!r) return;

    // Transactional (şifre sıfırlama, sipariş onay) e-postalarında unsubscribe kontrolü yapma
    if (!isTransactional) {
        const unsub = await isUnsubscribed(to);
        if (unsub) {
            console.log(`⏭ E-posta gönderilmedi (unsubscribed): ${to}`);
            return;
        }
    }

    const unsubUrl = getUnsubscribeUrl(to);

    try {
        await r.emails.send({
            from: `${BRAND_NAME} <${FROM_EMAIL}>`,
            to,
            subject,
            html,
            text,
            headers: {
                "List-Unsubscribe": `<${unsubUrl}>, <mailto:${FROM_EMAIL}?subject=unsubscribe>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
        });
        console.log(`✓ E-posta gönderildi: ${to} — ${subject}`);
    } catch (err) {
        console.error("E-posta gönderim hatası:", err);
    }
}

// ─────────────────────────────────────
// SİPARİŞ ONAY E-POSTASI
// ─────────────────────────────────────
interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
}

interface OrderData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    total: number;
    shippingAddress?: string;
}

export async function sendOrderConfirmation(order: OrderData) {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #141414; font-family: 'Inter', Arial, sans-serif;">
                <span style="color: #ffffff; font-size: 14px; font-weight: 700; display: block;">${item.name}</span>
                ${(item.size || item.color) ? `<span style="color: #666666; font-size: 11px; font-weight: 400; display: block; margin-top: 4px;">${item.size || ""}${item.size && item.color ? " · " : ""}${item.color || ""}</span>` : ""}
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #141414; color: #666666; font-size: 13px; text-align: center; font-family: 'Inter', Arial, sans-serif; font-weight: 500;">${item.quantity}x</td>
            <td style="padding: 16px 0; border-bottom: 1px solid #141414; color: #ffffff; font-size: 14px; text-align: right; font-weight: 700; font-family: 'Inter', Arial, sans-serif;">${item.price.toFixed(2)} TL</td>
        </tr>
    `).join("");

    const content = `
        <!-- Status Badge -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-bottom: 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background-color: #1a0f0f; border: 1px solid #2a1515; border-radius: 24px; padding: 8px 24px;">
                                <span style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #ef4444; font-weight: 700;">✓ Sipariş Onaylandı</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <h1 style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin: 0 0 8px; line-height: 1.2;">
            Siparişin Alındı
        </h1>
        <p style="font-family: 'Inter', Arial, sans-serif; color: #666666; font-size: 14px; text-align: center; margin: 0 0 36px; line-height: 1.7;">
            Merhaba <strong style="color:#ffffff">${order.customerName}</strong>, siparişin başarıyla oluşturuldu.
        </p>

        <!-- Order Number Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
            <tr>
                <td style="background: linear-gradient(135deg, #0f0f0f 0%, #111111 100%); border: 1px solid #1f1f1f; border-radius: 12px; padding: 24px; text-align: center;">
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 5px; color: #555555; font-weight: 600; display: block;">Sipariş Numarası</span>
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 26px; font-weight: 900; color: #ef4444; display: block; margin-top: 10px; letter-spacing: 3px;">${order.orderId.toUpperCase()}</span>
                </td>
            </tr>
        </table>

        <!-- Items -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 4px;">
            <tr>
                <td style="padding: 12px 0; border-bottom: 2px solid #1a1a1a; font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #444444; font-weight: 700;">Ürün</td>
                <td style="padding: 12px 0; border-bottom: 2px solid #1a1a1a; font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #444444; font-weight: 700; text-align: center;">Adet</td>
                <td style="padding: 12px 0; border-bottom: 2px solid #1a1a1a; font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #444444; font-weight: 700; text-align: right;">Fiyat</td>
            </tr>
            ${itemsHtml}
        </table>

        <!-- Total -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0 32px;">
            <tr>
                <td style="background: linear-gradient(135deg, #1a0f0f 0%, #120a0a 100%); border: 1px solid #2a1515; border-radius: 12px; padding: 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; color: #888888; font-weight: 600; vertical-align: middle;">Toplam</td>
                            <td style="font-family: 'Inter', Arial, sans-serif; font-size: 30px; font-weight: 900; color: #ffffff; text-align: right; vertical-align: middle; letter-spacing: -1px;">${order.total.toFixed(2)} <span style="font-size: 16px; font-weight: 600; color: #666666;">TL</span></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        ${order.shippingAddress ? `
        <!-- Address -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
            <tr>
                <td style="background-color: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px 24px;">
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 4px; color: #555555; font-weight: 700; display: block; margin-bottom: 10px;">📍 Teslimat Adresi</span>
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: #999999; line-height: 1.7;">${order.shippingAddress}</span>
                </td>
            </tr>
        </table>
        ` : ""}

        <!-- CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-top: 8px;">
                    <a href="${BRAND_URL}/account?tab=orders" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; box-shadow: 0 4px 15px rgba(239,68,68,0.3);">Siparişimi Takip Et</a>
                </td>
            </tr>
        </table>
    `;

    await sendEmail(
        order.customerEmail,
        `Sipariş Onaylandı — ${order.orderId} | ${BRAND_NAME}`,
        emailLayout(content, `Siparişiniz ${order.orderId} başarıyla alındı. Toplam: ${order.total.toFixed(2)} TL`, order.customerEmail),
        `Merhaba ${order.customerName}, siparişiniz ${order.orderId} başarıyla oluşturuldu. Toplam: ${order.total.toFixed(2)} TL. Takip: ${BRAND_URL}/account`,
        true // transactional
    );
}

// ─────────────────────────────────────
// KARGO BİLDİRİM E-POSTASI
// ─────────────────────────────────────
interface ShippingData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    trackingNumber: string;
    carrier?: string;
}

export async function sendShippingNotification(data: ShippingData) {
    const carrierDisplay = data.carrier || "";
    const carrierLabel = carrierDisplay ? carrierDisplay.toUpperCase() : "";

    const content = `
        <!-- Status Badge -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-bottom: 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background-color: #0f1a0f; border: 1px solid #152a15; border-radius: 24px; padding: 8px 24px;">
                                <span style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #22c55e; font-weight: 700;">📦 Kargoya Verildi</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <h1 style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin: 0 0 8px; line-height: 1.2;">
            Siparişin Yola Çıktı!
        </h1>
        <p style="font-family: 'Inter', Arial, sans-serif; color: #666666; font-size: 14px; text-align: center; margin: 0 0 36px; line-height: 1.7;">
            Merhaba <strong style="color:#ffffff">${data.customerName}</strong>, siparişin kargoya verildi!
        </p>

        <!-- Tracking Cards -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
            <!-- Order Number -->
            <tr>
                <td style="background: linear-gradient(135deg, #0f0f0f, #111111); border: 1px solid #1f1f1f; border-radius: 12px 12px 0 0; padding: 20px 24px; text-align: center; border-bottom: none;">
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 5px; color: #555555; font-weight: 700; display: block;">Sipariş No</span>
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 20px; font-weight: 900; color: #ef4444; display: block; margin-top: 8px; letter-spacing: 2px;">${data.orderId.toUpperCase()}</span>
                </td>
            </tr>
            <!-- Carrier + Tracking Number -->
            <tr>
                <td style="background: linear-gradient(135deg, #0a1a0a, #0f150f); border: 1px solid #152a15; border-radius: 0 0 12px 12px; padding: 28px 24px; text-align: center;">
                    ${carrierLabel ? `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                        <tr>
                            <td align="center">
                                <span style="display: inline-block; background-color: #22c55e; color: #000000; font-family: 'Inter', Arial, sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; padding: 8px 20px; border-radius: 6px;">${carrierLabel}</span>
                            </td>
                        </tr>
                    </table>
                    ` : ""}
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 5px; color: #555555; font-weight: 700; display: block;">Kargo Takip Numarası</span>
                    <span style="font-family: 'Inter', monospace, Arial; font-size: 24px; font-weight: 900; color: #22c55e; display: block; margin-top: 10px; letter-spacing: 5px;">${data.trackingNumber}</span>
                </td>
            </tr>
        </table>

        <!-- Info -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
            <tr>
                <td style="background-color: #0f0f10; border: 1px solid #1a1a1a; border-radius: 12px; padding: 18px 24px; text-align: center;">
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #666666; line-height: 1.8;">
                        Kargonuz tahmini <strong style="color:#ffffff">1–3 iş günü</strong> içinde teslim edilecektir.${carrierLabel ? `<br/>Kargo firmanız: <strong style="color:#22c55e">${carrierLabel}</strong>` : ""}
                    </span>
                </td>
            </tr>
        </table>

        <!-- CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-top: 8px;">
                    <a href="${BRAND_URL}/account?tab=orders" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; box-shadow: 0 4px 15px rgba(34,197,94,0.3);">Kargonu Takip Et</a>
                </td>
            </tr>
        </table>
    `;

    await sendEmail(
        data.customerEmail,
        `Siparişiniz Kargoya Verildi${carrierLabel ? ` (${carrierLabel})` : ""} — ${data.orderId} | ${BRAND_NAME}`,
        emailLayout(content, `Kargo takip: ${data.trackingNumber}${carrierLabel ? ` — ${carrierLabel}` : ""}`, data.customerEmail),
        `Merhaba ${data.customerName}, ${data.orderId} siparişiniz kargoya verildi.${carrierLabel ? ` Kargo: ${carrierLabel}.` : ""} Takip No: ${data.trackingNumber}. Takip: ${BRAND_URL}/account`,
        true // transactional
    );
}

// ─────────────────────────────────────
// HOŞ GELDİNİZ E-POSTASI
// ─────────────────────────────────────
interface WelcomeData {
    customerName: string;
    customerEmail: string;
}

export async function sendWelcomeEmail(data: WelcomeData) {
    const content = `
        <!-- Welcome Icon -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-bottom: 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="width: 72px; height: 72px; background: linear-gradient(135deg, #1a0f0f, #0f0f0f); border: 2px solid #2a1515; border-radius: 50%; text-align: center; vertical-align: middle; line-height: 72px;">
                                <span style="font-size: 32px;">⚡</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <h1 style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #ffffff; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin: 0 0 8px; line-height: 1.1;">
            Hoş Geldin
        </h1>
        <p style="font-family: 'Inter', Arial, sans-serif; color: #666666; font-size: 15px; text-align: center; margin: 0 0 40px; line-height: 1.8;">
            Merhaba <strong style="color:#ffffff">${data.customerName}</strong>,<br/>
            <strong style="color:#ef4444;">${BRAND_NAME}</strong> ailesine katıldığın için memnunuz.
        </p>

        <!-- Features Grid -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 36px;">
            <!-- Feature 1 -->
            <tr>
                <td style="padding: 0 0 10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background: linear-gradient(135deg, #0f0f0f, #111111); border: 1px solid #1f1f1f; border-radius: 12px; padding: 18px 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="44" style="vertical-align: middle;">
                                            <span style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #1a0f0f, #0f0a0a); border: 1px solid #2a1515; border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">🔥</span>
                                        </td>
                                        <td style="padding-left: 16px; vertical-align: middle;">
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; display: block;">Yeni Koleksiyonlar</span>
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #555555; display: block; margin-top: 3px;">İlk sen haberdar ol</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- Feature 2 -->
            <tr>
                <td style="padding: 0 0 10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background: linear-gradient(135deg, #0f0f0f, #111111); border: 1px solid #1f1f1f; border-radius: 12px; padding: 18px 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="44" style="vertical-align: middle;">
                                            <span style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #1a0f0f, #0f0a0a); border: 1px solid #2a1515; border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">🎁</span>
                                        </td>
                                        <td style="padding-left: 16px; vertical-align: middle;">
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; display: block;">Özel İndirimler</span>
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #555555; display: block; margin-top: 3px;">Sadece üyelere özel kampanyalar</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- Feature 3 -->
            <tr>
                <td style="padding: 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background: linear-gradient(135deg, #0f0f0f, #111111); border: 1px solid #1f1f1f; border-radius: 12px; padding: 18px 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="44" style="vertical-align: middle;">
                                            <span style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #1a0f0f, #0f0a0a); border: 1px solid #2a1515; border-radius: 10px; text-align: center; line-height: 40px; font-size: 18px;">📦</span>
                                        </td>
                                        <td style="padding-left: 16px; vertical-align: middle;">
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; display: block;">Kolay Takip</span>
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #555555; display: block; margin-top: 3px;">Siparişlerini anında takip et</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center">
                    <a href="${BRAND_URL}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; text-decoration: none; padding: 18px 56px; border-radius: 8px; font-family: 'Inter', Arial, sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; box-shadow: 0 4px 15px rgba(239,68,68,0.3);">Siteye Gir</a>
                </td>
            </tr>
        </table>
    `;

    await sendEmail(
        data.customerEmail,
        `${BRAND_NAME} Ailesine Hoş Geldin! 🔥`,
        emailLayout(content, `${BRAND_NAME} ailesine hoş geldin! Premium streetwear dünyasını keşfet.`, data.customerEmail),
        `Merhaba ${data.customerName}, ${BRAND_NAME} ailesine katıldığın için memnunuz! Siteyi ziyaret et: ${BRAND_URL}`,
        false // marketing
    );
}

// ─────────────────────────────────────
// ŞİFRE SIFIRLAMA E-POSTASI
// ─────────────────────────────────────
interface PasswordResetData {
    customerName: string;
    customerEmail: string;
    resetUrl: string;
}

export async function sendPasswordResetEmail(data: PasswordResetData) {
    const content = `
        <!-- Lock Icon -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-bottom: 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="width: 72px; height: 72px; background: linear-gradient(135deg, #1a0f0f, #0f0f0f); border: 2px solid #2a1515; border-radius: 50%; text-align: center; vertical-align: middle; line-height: 72px;">
                                <span style="font-size: 32px;">🔐</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <h1 style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin: 0 0 8px; line-height: 1.2;">
            Şifre Sıfırlama
        </h1>
        <p style="font-family: 'Inter', Arial, sans-serif; color: #666666; font-size: 14px; text-align: center; margin: 0 0 36px; line-height: 1.7;">
            Merhaba <strong style="color:#ffffff">${data.customerName}</strong>,<br/>
            Hesabınız için bir şifre sıfırlama isteği aldık.
        </p>

        <!-- Reset Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
            <tr>
                <td align="center">
                    <a href="${data.resetUrl}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; text-decoration: none; padding: 18px 56px; border-radius: 8px; font-family: 'Inter', Arial, sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; box-shadow: 0 4px 15px rgba(239,68,68,0.3);">Şifremi Sıfırla</a>
                </td>
            </tr>
        </table>

        <!-- Info Box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
            <tr>
                <td style="background: linear-gradient(135deg, #0f0f0f, #111111); border: 1px solid #1f1f1f; border-radius: 12px; padding: 20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td>
                                <span style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #999999; line-height: 2;">
                                    ⏱ Bu bağlantı <strong style="color:#ef4444">1 saat</strong> içerisinde geçerlidir.<br/>
                                    🔒 Eğer bu isteği siz yapmadıysanız, bu e-postayı dikkate almayın.
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Direct Link -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td style="text-align: center;">
                    <p style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #444444; margin: 0;">
                        Buton çalışmıyorsa aşağıdaki bağlantıya tıklayın:
                    </p>
                    <p style="font-family: 'Inter', monospace, Arial; font-size: 10px; color: #ef4444; word-break: break-all; margin: 8px 0 0;">
                        <a href="${data.resetUrl}" style="color: #ef4444; text-decoration: underline;">${data.resetUrl}</a>
                    </p>
                </td>
            </tr>
        </table>
    `;

    await sendEmail(
        data.customerEmail,
        `Şifre Sıfırlama | ${BRAND_NAME}`,
        emailLayout(content, `Hesabınız için şifre sıfırlama bağlantısı`, data.customerEmail),
        `Merhaba ${data.customerName}, şifre sıfırlama bağlantınız: ${data.resetUrl} — Bu bağlantı 1 saat geçerlidir.`,
        true // transactional — always deliver
    );
}

// ─────────────────────────────────────
// TESLİM BİLDİRİM E-POSTASI
// ─────────────────────────────────────
interface DeliveryData {
    orderId: string;
    customerName: string;
    customerEmail: string;
}

export async function sendDeliveryConfirmation(data: DeliveryData) {
    const content = `
        <!-- Status Badge -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-bottom: 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background-color: #0f1a0f; border: 1px solid #152a15; border-radius: 24px; padding: 8px 24px;">
                                <span style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #22c55e; font-weight: 700;">✅ Teslim Edildi</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <h1 style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin: 0 0 8px; line-height: 1.2;">
            Siparişin Teslim Edildi!
        </h1>
        <p style="font-family: 'Inter', Arial, sans-serif; color: #666666; font-size: 14px; text-align: center; margin: 0 0 36px; line-height: 1.7;">
            Merhaba <strong style="color:#ffffff">${data.customerName}</strong>, siparişin başarıyla teslim edildi. Keyifle kullanmanı dileriz!
        </p>

        <!-- Order Number Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
            <tr>
                <td style="background: linear-gradient(135deg, #0a1a0a 0%, #0f150f 100%); border: 1px solid #152a15; border-radius: 12px; padding: 24px; text-align: center;">
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 5px; color: #555555; font-weight: 600; display: block;">Sipariş Numarası</span>
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 26px; font-weight: 900; color: #22c55e; display: block; margin-top: 10px; letter-spacing: 3px;">${data.orderId.toUpperCase()}</span>
                </td>
            </tr>
        </table>

        <!-- Satisfaction Message -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
            <tr>
                <td style="background: linear-gradient(135deg, #0f0f0f, #111111); border: 1px solid #1f1f1f; border-radius: 12px; padding: 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td width="48" style="vertical-align: top;">
                                <span style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #1a0f0f, #0f0a0a); border: 1px solid #2a1515; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">💬</span>
                            </td>
                            <td style="padding-left: 16px; vertical-align: top;">
                                <span style="font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; display: block; margin-bottom: 6px;">Memnun Kaldın mı?</span>
                                <span style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #666666; line-height: 1.7;">
                                    Herhangi bir sorun varsa <strong style="color:#ef4444">14 gün</strong> içinde iade talebi oluşturabilirsin. Siparişlerim sayfasından kolayca işlem yapabilirsin.
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-top: 8px;">
                    <a href="${BRAND_URL}/account?tab=orders" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; box-shadow: 0 4px 15px rgba(34,197,94,0.3);">Siparişlerimi Görüntüle</a>
                </td>
            </tr>
        </table>
    `;

    await sendEmail(
        data.customerEmail,
        `Siparişiniz Teslim Edildi! ✅ — ${data.orderId} | ${BRAND_NAME}`,
        emailLayout(content, `${data.orderId} numaralı siparişiniz başarıyla teslim edildi.`, data.customerEmail),
        `Merhaba ${data.customerName}, ${data.orderId} numaralı siparişiniz teslim edildi. Keyifle kullanmanızı dileriz! Detaylar: ${BRAND_URL}/account?tab=orders`,
        true // transactional
    );
}
