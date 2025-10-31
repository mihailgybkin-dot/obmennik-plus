import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { token, code } = await req.json();
    if (!token || !code) return NextResponse.json({ ok: false, error: "token and code required" }, { status: 400 });

    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (!payload?.phone || !payload?.code) return NextResponse.json({ ok: false, error: "bad token" }, { status: 400 });

    if (String(payload.code) !== String(code)) {
      return NextResponse.json({ ok: false, error: "invalid code" }, { status: 400 });
    }

    // Успех — возвращаем подтверждённый номер
    return NextResponse.json({ ok: true, phone: payload.phone });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "verify error" }, { status: 400 });
  }
}
