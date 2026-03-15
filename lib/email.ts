import { Resend } from "resend";

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
// PREMIUM E-POSTA LAYOUT
// ─────────────────────────────────────
function emailLayout(content: string, preheader: string = "") {
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
                <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color: #0a0a0a; border-radius: 12px; overflow: hidden; border: 1px solid #1a1a1a;">

                    <!-- TOP ACCENT LINE -->
                    <tr>
                        <td style="height: 3px; background: linear-gradient(90deg, #ef4444, #dc2626, #ef4444); font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>

                    <!-- LOGO HEADER -->
                    <tr>
                        <td class="header-padding" style="text-align:center; padding: 36px 32px 28px;">
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
                                        <span style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 6px; color: #555555; font-weight: 600;">PREMIUM STREETWEAR</span>
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
                        <td style="padding: 28px 32px; text-align: center;">
                            <!-- Social / Links -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <a href="${BRAND_URL}" style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; color: #ef4444; text-decoration: none; text-transform: uppercase; letter-spacing: 3px; font-weight: 700; border: 1px solid #2a1515; padding: 8px 16px; border-radius: 4px; display: inline-block;">Siteyi Ziyaret Et</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <p style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #333333; margin: 0; line-height: 1.6;">
                                            ${BRAND_NAME} &mdash; Premium Streetwear
                                        </p>
                                        <p style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; color: #222222; margin: 8px 0 0; line-height: 1.6;">
                                            Bu e-posta ${BRAND_NAME} tarafindan gonderilmistir.
                                        </p>
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
            <td style="padding: 14px 0; border-bottom: 1px solid #141414; font-family: 'Inter', Arial, sans-serif;">
                <span style="color: #ffffff; font-size: 14px; font-weight: 600; display: block;">${item.name}</span>
                ${(item.size || item.color) ? `<span style="color: #555555; font-size: 11px; font-weight: 400; display: block; margin-top: 2px;">${item.size || ""}${item.size && item.color ? " / " : ""}${item.color || ""}</span>` : ""}
            </td>
            <td style="padding: 14px 0; border-bottom: 1px solid #141414; color: #666666; font-size: 13px; text-align: center; font-family: 'Inter', Arial, sans-serif; font-weight: 500;">${item.quantity}x</td>
            <td style="padding: 14px 0; border-bottom: 1px solid #141414; color: #ffffff; font-size: 14px; text-align: right; font-weight: 700; font-family: 'Inter', Arial, sans-serif;">${item.price.toFixed(2)} TL</td>
        </tr>
    `).join("");

    const content = `
        <!-- Status Badge -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-bottom: 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background-color: #1a0f0f; border: 1px solid #2a1515; border-radius: 20px; padding: 6px 18px;">
                                <span style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #ef4444; font-weight: 700;">Siparis Onaylandi</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <h1 style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #ffffff; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin: 0 0 8px; line-height: 1.2;">
            Siparisin Alindi
        </h1>
        <p style="font-family: 'Inter', Arial, sans-serif; color: #666666; font-size: 14px; text-align: center; margin: 0 0 32px; line-height: 1.6;">
            Merhaba <strong style="color:#ffffff">${order.customerName}</strong>, siparisin basariyla olusturuldu.
        </p>

        <!-- Order Number Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
            <tr>
                <td style="background-color: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 8px; padding: 20px; text-align: center;">
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #555555; font-weight: 600; display: block;">Siparis Numarasi</span>
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 24px; font-weight: 900; color: #ef4444; display: block; margin-top: 8px; letter-spacing: 3px;">${order.orderId.toUpperCase()}</span>
                </td>
            </tr>
        </table>

        <!-- Items -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 4px;">
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #444444; font-weight: 700;">Urun</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #444444; font-weight: 700; text-align: center;">Adet</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #1a1a1a; font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #444444; font-weight: 700; text-align: right;">Fiyat</td>
            </tr>
            ${itemsHtml}
        </table>

        <!-- Total -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 28px;">
            <tr>
                <td style="background: linear-gradient(135deg, #1a0f0f 0%, #0f0f0f 100%); border: 1px solid #2a1515; border-radius: 8px; padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #888888; font-weight: 600; vertical-align: middle;">Toplam</td>
                            <td style="font-family: 'Inter', Arial, sans-serif; font-size: 28px; font-weight: 900; color: #ffffff; text-align: right; vertical-align: middle; letter-spacing: -1px;">${order.total.toFixed(2)} <span style="font-size: 16px; font-weight: 600; color: #888888;">TL</span></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        ${order.shippingAddress ? `
        <!-- Address -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
            <tr>
                <td style="background-color: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 8px; padding: 16px 20px;">
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #555555; font-weight: 700; display: block; margin-bottom: 8px;">Teslimat Adresi</span>
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: #999999; line-height: 1.6;">${order.shippingAddress}</span>
                </td>
            </tr>
        </table>
        ` : ""}

        <!-- CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-top: 8px;">
                    <a href="${BRAND_URL}/account" class="cta-button" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Siparisimi Takip Et</a>
                </td>
            </tr>
        </table>
    `;

    try {
        const r = getResend();
        if (!r) return;
        await r.emails.send({
            from: `${BRAND_NAME} <${FROM_EMAIL}>`,
            to: order.customerEmail,
            subject: `Siparis Onaylandi - ${order.orderId} | ${BRAND_NAME}`,
            html: emailLayout(content, `Siparisiniz ${order.orderId} basariyla alindi. Toplam: ${order.total.toFixed(2)} TL`),
            text: `Merhaba ${order.customerName}, siparisiniz ${order.orderId} basariyla olusturuldu. Toplam: ${order.total.toFixed(2)} TL. Siparisini takip etmek icin: ${BRAND_URL}/account`,
            headers: {
                "List-Unsubscribe": `<mailto:${FROM_EMAIL}?subject=unsubscribe>`,
            },
        });
        console.log(`✓ Siparis onay e-postasi gonderildi: ${order.customerEmail}`);
    } catch (err) {
        console.error("E-posta gonderim hatasi (siparis onay):", err);
    }
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
    const content = `
        <!-- Status Badge -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-bottom: 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background-color: #0f1a0f; border: 1px solid #152a15; border-radius: 20px; padding: 6px 18px;">
                                <span style="font-family: 'Inter', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #22c55e; font-weight: 700;">Kargoya Verildi</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <h1 style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #ffffff; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin: 0 0 8px; line-height: 1.2;">
            Siparisin Yola Cikti
        </h1>
        <p style="font-family: 'Inter', Arial, sans-serif; color: #666666; font-size: 14px; text-align: center; margin: 0 0 32px; line-height: 1.6;">
            Merhaba <strong style="color:#ffffff">${data.customerName}</strong>, siparisin kargoya verildi!
        </p>

        <!-- Tracking Cards -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
            <!-- Order Number -->
            <tr>
                <td style="background-color: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 8px 8px 0 0; padding: 16px 20px; text-align: center; border-bottom: none;">
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 4px; color: #555555; font-weight: 700; display: block;">Siparis No</span>
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 18px; font-weight: 900; color: #ef4444; display: block; margin-top: 6px; letter-spacing: 2px;">${data.orderId.toUpperCase()}</span>
                </td>
            </tr>
            <!-- Tracking Number -->
            <tr>
                <td style="background-color: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 0 0 8px 8px; padding: 20px; text-align: center;">
                    <span style="font-family: 'Inter', Arial, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 4px; color: #555555; font-weight: 700; display: block;">Kargo Takip Numarasi</span>
                    <span style="font-family: 'Inter', monospace, Arial; font-size: 22px; font-weight: 900; color: #22c55e; display: block; margin-top: 8px; letter-spacing: 4px;">${data.trackingNumber}</span>
                    ${data.carrier ? `<span style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #555555; display: block; margin-top: 6px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">${data.carrier}</span>` : ""}
                </td>
            </tr>
        </table>

        <!-- CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding-top: 8px;">
                    <a href="${BRAND_URL}/account" class="cta-button" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Kargonu Takip Et</a>
                </td>
            </tr>
        </table>
    `;

    try {
        const r = getResend();
        if (!r) return;
        await r.emails.send({
            from: `${BRAND_NAME} <${FROM_EMAIL}>`,
            to: data.customerEmail,
            subject: `Siparisiniz Kargoya Verildi - ${data.orderId} | ${BRAND_NAME}`,
            html: emailLayout(content, `Kargo takip numarasi: ${data.trackingNumber}`),
            text: `Merhaba ${data.customerName}, ${data.orderId} numarali siparisiniz kargoya verildi. Kargo takip no: ${data.trackingNumber}. Takip icin: ${BRAND_URL}/account`,
            headers: {
                "List-Unsubscribe": `<mailto:${FROM_EMAIL}?subject=unsubscribe>`,
            },
        });
        console.log(`✓ Kargo bildirimi gonderildi: ${data.customerEmail}`);
    } catch (err) {
        console.error("E-posta gonderim hatasi (kargo):", err);
    }
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
                <td align="center" style="padding-bottom: 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="width: 64px; height: 64px; background-color: #1a0f0f; border: 1px solid #2a1515; border-radius: 50%; text-align: center; vertical-align: middle; line-height: 64px;">
                                <span style="font-size: 28px;">&#9889;</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <h1 style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #ffffff; font-size: 30px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin: 0 0 8px; line-height: 1.1;">
            Hos Geldin
        </h1>
        <p style="font-family: 'Inter', Arial, sans-serif; color: #666666; font-size: 15px; text-align: center; margin: 0 0 36px; line-height: 1.7;">
            Merhaba <strong style="color:#ffffff">${data.customerName}</strong>,<br/>
            <strong style="color:#ef4444;">${BRAND_NAME}</strong> ailesine katildigin icin memnunuz.
        </p>

        <!-- Features Grid -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
            <!-- Feature 1 -->
            <tr>
                <td style="padding: 0 0 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background-color: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 8px; padding: 16px 20px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="40" style="vertical-align: middle;">
                                            <span style="display: inline-block; width: 36px; height: 36px; background-color: #1a0f0f; border: 1px solid #2a1515; border-radius: 8px; text-align: center; line-height: 36px; font-size: 16px;">&#128293;</span>
                                        </td>
                                        <td style="padding-left: 14px; vertical-align: middle;">
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; display: block;">Yeni Koleksiyonlar</span>
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #555555; display: block; margin-top: 2px;">Ilk sen haberdar ol</span>
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
                <td style="padding: 0 0 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="background-color: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 8px; padding: 16px 20px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="40" style="vertical-align: middle;">
                                            <span style="display: inline-block; width: 36px; height: 36px; background-color: #1a0f0f; border: 1px solid #2a1515; border-radius: 8px; text-align: center; line-height: 36px; font-size: 16px;">&#127873;</span>
                                        </td>
                                        <td style="padding-left: 14px; vertical-align: middle;">
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; display: block;">Ozel Indirimler</span>
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #555555; display: block; margin-top: 2px;">Sadece uyelere ozel kampanyalar</span>
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
                            <td style="background-color: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 8px; padding: 16px 20px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="40" style="vertical-align: middle;">
                                            <span style="display: inline-block; width: 36px; height: 36px; background-color: #1a0f0f; border: 1px solid #2a1515; border-radius: 8px; text-align: center; line-height: 36px; font-size: 16px;">&#128230;</span>
                                        </td>
                                        <td style="padding-left: 14px; vertical-align: middle;">
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; display: block;">Kolay Takip</span>
                                            <span style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #555555; display: block; margin-top: 2px;">Siparislerini aninda takip et</span>
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
                    <a href="${BRAND_URL}" class="cta-button" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 6px; font-family: 'Inter', Arial, sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Siteye Gir</a>
                </td>
            </tr>
        </table>
    `;

    try {
        const r = getResend();
        if (!r) return;
        await r.emails.send({
            from: `${BRAND_NAME} <${FROM_EMAIL}>`,
            to: data.customerEmail,
            subject: `${BRAND_NAME} Ailesine Hos Geldin!`,
            html: emailLayout(content, `${BRAND_NAME} ailesine hos geldin! Premium streetwear dunyasini kesfet.`),
            text: `Merhaba ${data.customerName}, ${BRAND_NAME} ailesine katildigin icin memnunuz! Yeni koleksiyonlar, ozel indirimler ve daha fazlasi seni bekliyor. Siteyi ziyaret et: ${BRAND_URL}`,
            headers: {
                "List-Unsubscribe": `<mailto:${FROM_EMAIL}?subject=unsubscribe>`,
            },
        });
        console.log(`✓ Hos geldiniz e-postasi gonderildi: ${data.customerEmail}`);
    } catch (err) {
        console.error("E-posta gonderim hatasi (welcome):", err);
    }
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
                <td align="center" style="padding-bottom: 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="width: 64px; height: 64px; background-color: #1a0f0f; border: 1px solid #2a1515; border-radius: 50%; text-align: center; vertical-align: middle; line-height: 64px;">
                                <span style="font-size: 28px;">&#128274;</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <h1 style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #ffffff; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin: 0 0 8px; line-height: 1.2;">
            Sifre Sifirlama
        </h1>
        <p style="font-family: 'Inter', Arial, sans-serif; color: #666666; font-size: 14px; text-align: center; margin: 0 0 32px; line-height: 1.6;">
            Merhaba <strong style="color:#ffffff">${data.customerName}</strong>,<br/>
            Hesabiniz icin bir sifre sifirlama istegi aldik.
        </p>

        <!-- Reset Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
            <tr>
                <td align="center">
                    <a href="${data.resetUrl}" class="cta-button" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 6px; font-family: 'Inter', Arial, sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Sifremi Sifirla</a>
                </td>
            </tr>
        </table>

        <!-- Info Box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
            <tr>
                <td style="background-color: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 8px; padding: 16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td>
                                <span style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #999999; line-height: 1.8;">
                                    &#9201; Bu baglanti <strong style="color:#ef4444">1 saat</strong> icerisinde gecerlidir.<br/>
                                    &#128274; Eger bu istegi siz yapmadiysaniz, bu e-postayi dikkate almayin.
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
                        Buton calismiyorsa asagidaki baglantiya tiklayin:
                    </p>
                    <p style="font-family: 'Inter', monospace, Arial; font-size: 10px; color: #ef4444; word-break: break-all; margin: 8px 0 0;">
                        <a href="${data.resetUrl}" style="color: #ef4444; text-decoration: underline;">${data.resetUrl}</a>
                    </p>
                </td>
            </tr>
        </table>
    `;

    try {
        const r = getResend();
        if (!r) return;
        await r.emails.send({
            from: `${BRAND_NAME} <${FROM_EMAIL}>`,
            to: data.customerEmail,
            subject: `Şifre Sıfırlama | ${BRAND_NAME}`,
            html: emailLayout(content, `Hesabınız için şifre sıfırlama bağlantısı`),
            text: `Merhaba ${data.customerName}, şifre sıfırlama bağlantınız: ${data.resetUrl} — Bu bağlantı 1 saat geçerlidir.`,
            headers: {
                "List-Unsubscribe": `<mailto:${FROM_EMAIL}?subject=unsubscribe>`,
            },
        });
        console.log(`✓ Şifre sıfırlama e-postası gönderildi: ${data.customerEmail}`);
    } catch (err) {
        console.error("E-posta gönderim hatası (reset):", err);
    }
}

