import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const isValid = await getTokenFromRequest(req);

    if (isValid) {
        return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
}
