import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
    try {
        // Tüm siparişleri al
        const { data: orders, error: orderErr } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*)")
            .order("created_at", { ascending: false });

        if (orderErr) console.error("Orders fetch error:", orderErr);

        // Tüm ürünleri al
        const { data: products, error: prodErr } = await supabaseAdmin
            .from("products")
            .select("id, name, price, slug, category");

        if (prodErr) console.error("Products fetch error:", prodErr);

        // Tüm müşterileri al
        const { data: customers, error: custErr } = await supabaseAdmin
            .from("customers")
            .select("id");

        if (custErr) console.error("Customers fetch error:", custErr);

        const allOrders = orders || [];
        const allProducts = products || [];
        const allCustomers = customers || [];
        const now = new Date();

        // İade taleplerini al
        const { data: returns } = await supabaseAdmin
            .from("return_requests")
            .select("refund_amount, status")
            .in("status", ["approved", "completed"]);

        const totalRefunds = (returns || []).reduce((s, r) => s + Number(r.refund_amount || 0), 0);
        const returnCount = (returns || []).length;

        // ─── GENEL İSTATİSTİKLER ───
        const totalRevenue = allOrders.reduce((s, o) => s + Number(o.total || 0), 0);
        const totalOrders = allOrders.length;
        const completedOrders = allOrders.filter(o => o.status === "delivered" || o.status === "shipped");
        const completedRevenue = completedOrders.reduce((s, o) => s + Number(o.total || 0), 0);
        const pendingRevenue = allOrders.filter(o => o.status === "pending" || o.status === "processing").reduce((s, o) => s + Number(o.total || 0), 0);
        const cancelledOrders = allOrders.filter(o => o.status === "cancelled");
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Bugünkü siparişler
        const todayStr = now.toISOString().split("T")[0];
        const todayOrders = allOrders.filter(o => new Date(o.created_at).toISOString().split("T")[0] === todayStr);
        const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total || 0), 0);

        // Bu haftaki siparişler
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekOrders = allOrders.filter(o => new Date(o.created_at) >= weekAgo);
        const weekRevenue = weekOrders.reduce((s, o) => s + Number(o.total || 0), 0);

        // Bu ayki siparişler
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthOrders = allOrders.filter(o => new Date(o.created_at) >= monthStart);
        const monthRevenue = monthOrders.reduce((s, o) => s + Number(o.total || 0), 0);

        // ─── GÜNLÜK SATIŞ (SON 30 GÜN) ───
        const dailyData: Record<string, { revenue: number; orders: number }> = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split("T")[0];
            dailyData[key] = { revenue: 0, orders: 0 };
        }
        for (const order of allOrders) {
            const day = new Date(order.created_at).toISOString().split("T")[0];
            if (dailyData[day] !== undefined) {
                dailyData[day].revenue += Number(order.total || 0);
                dailyData[day].orders += 1;
            }
        }
        const dailySales = Object.entries(dailyData).map(([date, val]) => ({
            date,
            day: new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
            revenue: Math.round(val.revenue * 100) / 100,
            orders: val.orders,
        }));

        // ─── HAFTALIK SATIŞ (SON 12 HAFTA) ───
        const weeklyData: { label: string; revenue: number; orders: number }[] = [];
        for (let i = 11; i >= 0; i--) {
            const wEnd = new Date(now);
            wEnd.setDate(wEnd.getDate() - (i * 7));
            const wStart = new Date(wEnd);
            wStart.setDate(wStart.getDate() - 6);

            const weekOrds = allOrders.filter(o => {
                const d = new Date(o.created_at);
                return d >= wStart && d <= wEnd;
            });

            weeklyData.push({
                label: `${wStart.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} - ${wEnd.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}`,
                revenue: Math.round(weekOrds.reduce((s, o) => s + Number(o.total || 0), 0) * 100) / 100,
                orders: weekOrds.length,
            });
        }

        // ─── AYLIK CİRO (SON 12 AY) ───
        const monthlySales: { month: string; revenue: number; orders: number; items: number }[] = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            const label = d.toLocaleDateString("tr-TR", { month: "short", year: "numeric" });

            const mOrders = allOrders.filter(o => {
                const od = new Date(o.created_at);
                return od >= d && od <= mEnd;
            });

            monthlySales.push({
                month: label,
                revenue: Math.round(mOrders.reduce((s, o) => s + Number(o.total || 0), 0) * 100) / 100,
                orders: mOrders.length,
                items: mOrders.reduce((s, o) => s + (o.order_items || []).length, 0),
            });
        }

        // ─── EN ÇOK SATAN ÜRÜNLER ───
        const productSales: Record<string, { name: string; quantity: number; revenue: number; image?: string }> = {};
        for (const order of allOrders) {
            for (const item of (order.order_items || [])) {
                const key = item.name || item.product_id;
                if (!productSales[key]) {
                    productSales[key] = { name: item.name, quantity: 0, revenue: 0, image: item.image || "" };
                }
                productSales[key].quantity += Number(item.quantity || 1);
                productSales[key].revenue += Number(item.price || 0) * Number(item.quantity || 1);
            }
        }
        const topSellers = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 15)
            .map(p => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));

        // ─── KATEGORİ BAZLI SATIŞ ───
        const categorySales: Record<string, { revenue: number; orders: number; quantity: number }> = {};
        for (const order of allOrders) {
            for (const item of (order.order_items || [])) {
                const product = allProducts.find(p => p.id === item.product_id);
                const cat = product?.category || "Diğer";
                if (!categorySales[cat]) categorySales[cat] = { revenue: 0, orders: 0, quantity: 0 };
                categorySales[cat].revenue += Number(item.price || 0) * Number(item.quantity || 1);
                categorySales[cat].orders += 1;
                categorySales[cat].quantity += Number(item.quantity || 1);
            }
        }
        const categoryBreakdown = Object.entries(categorySales)
            .map(([name, val]) => ({ name, revenue: Math.round(val.revenue * 100) / 100, orders: val.orders, quantity: val.quantity }))
            .sort((a, b) => b.revenue - a.revenue);

        // ─── SON SİPARİŞLER ───
        const recentOrders = allOrders.slice(0, 15).map(o => ({
            id: o.order_number,
            customerName: o.customer_name,
            email: o.customer_email,
            total: Number(o.total),
            status: o.status,
            date: o.created_at,
            itemCount: (o.order_items || []).length,
        }));

        // ─── SİPARİŞ DURUMU DAĞILIMI ───
        const statusCounts: Record<string, number> = {};
        for (const order of allOrders) {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        }

        // ─── ÖDEME DURUMU ───
        const paymentCounts: Record<string, number> = {};
        for (const order of allOrders) {
            paymentCounts[order.payment_status] = (paymentCounts[order.payment_status] || 0) + 1;
        }

        return NextResponse.json({
            overview: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                completedRevenue: Math.round(completedRevenue * 100) / 100,
                pendingRevenue: Math.round(pendingRevenue * 100) / 100,
                todayRevenue: Math.round(todayRevenue * 100) / 100,
                weekRevenue: Math.round(weekRevenue * 100) / 100,
                monthRevenue: Math.round(monthRevenue * 100) / 100,
                totalOrders,
                todayOrders: todayOrders.length,
                weekOrders: weekOrders.length,
                monthOrders: monthOrders.length,
                completedOrders: completedOrders.length,
                cancelledOrders: cancelledOrders.length,
                avgOrderValue: Math.round(avgOrderValue * 100) / 100,
                totalProducts: allProducts.length,
                totalCustomers: allCustomers.length,
                uniqueOrderCustomers: new Set(allOrders.map(o => o.customer_email).filter(Boolean)).size,
            },
            monthlySales,
            weeklySales: weeklyData,
            dailySales,
            topSellers,
            categoryBreakdown,
            recentOrders,
            statusCounts,
            paymentCounts,
            totalRefunds: Math.round(totalRefunds * 100) / 100,
            returnCount,
        });
    } catch (err) {
        console.error("Finance API error:", err);
        return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
    }
}
