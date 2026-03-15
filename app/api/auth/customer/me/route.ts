import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "chase-chain-customer-secret-key-2026");

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("customer_token")?.value;
        if (!token) {
            return NextResponse.json({ customer: null });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const customerId = payload.customerId as string;

        const { data: customer } = await supabaseAdmin
            .from("customers")
            .select("id, name, email, phone, created_at")
            .eq("id", customerId)
            .single();

        if (!customer) {
            return NextResponse.json({ customer: null });
        }

        return NextResponse.json({ customer });
    } catch {
        return NextResponse.json({ customer: null });
    }
}
