import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

const SITE_URL = process.env.SITE_URL || "";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "login@obmennikplus.ru";

export const dynamic = "force-dynamic";

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !validEmail(email)) {
      return NextResponse.json({ ok: false, error: "Некорректный email" }, { status: 400 });
    }
    if (!SITE_URL) {
      return NextResponse.json({ ok: false, error: "SITE_URL не задан" }, { status: 500 });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });
    const link = `${SITE_URL}/auth/callback?token=${encodeURIComponent(token)}`;

    if (RESEND_API_KEY) {
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: RESEND_FROM,
        to: email,
        subject: "Вход в Обменник +",
        text: `Перейдите по ссылке для входа: ${link}\nСсылка действительна 15 минут.`
      });
      return NextResponse.json({ ok: true });
    }

    // dev-режим — показываем ссылку напрямую
    return NextResponse.json({ ok: true, dev: true, link });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "send error" }, { status: 500 });
  }
}
