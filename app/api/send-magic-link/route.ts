import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

const SITE_URL = process.env.SITE_URL || "";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "login@obmennikplus.ru";

export const dynamic = "force-dynamic";

function okEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!okEmail(email)) return NextResponse.json({ ok: false, error: "Некорректный email" }, { status: 400 });
  if (!SITE_URL) return NextResponse.json({ ok: false, error: "SITE_URL не задан" }, { status: 500 });

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });
  const link = `${SITE_URL}/auth/callback?token=${encodeURIComponent(token)}`;

  if (RESEND_API_KEY) {
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({ from: RESEND_FROM, to: email, subject: "Вход в Обменник +", text: link });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: true, dev: true, link });
}
