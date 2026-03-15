import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PUT /api/coupons/[id] — Kuponu güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};
        if (body.code !== undefined) updateData.code = body.code.toUpperCase().trim();
        if (body.discountType !== undefined) updateData.discount_type = body.discountType;
        if (body.discountValue !== undefined) updateData.discount_value = Number(body.discountValue);
        if (body.minOrderAmount !== undefined) updateData.min_order_amount = Number(body.minOrderAmount);
        if (body.maxUses !== undefined) updateData.max_uses = body.maxUses ? Number(body.maxUses) : null;
        if (body.expiryDate !== undefined) updateData.expiry_date = body.expiryDate || null;
        if (body.isActive !== undefined) updateData.is_active = body.isActive;

        const { data, error } = await supabaseAdmin
            .from("coupons")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Güncelleme başarısız" }, { status: 400 });
    }
}

// DELETE /api/coupons/[id] — Kuponu sil
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from("coupons")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Silme başarısız" }, { status: 400 });
    }
}
