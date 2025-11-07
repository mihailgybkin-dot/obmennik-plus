import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const BOT = process.env.TELEGRAM_BOT_TOKEN || "";
  const CHAT = process.env.TELEGRAM_CHAT_ID || "";
  if (!BOT || !CHAT) {
    return NextResponse.json({ ok: false, error: "env not set" }, { status: 500 });
  }
  const q = new URL(req.url).searchParams;
  const text = q.get("text") || "Ping from Vercel";
  const r = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ chat_id: CHAT, text }),
  });
  const j = await r.json();
  return NextResponse.json(j);
}
