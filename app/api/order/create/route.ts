import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BOT = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT = process.env.TELEGRAM_CHAT_ID || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!BOT || !CHAT) {
      return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set" }, { status: 500 });
    }

    const {
      id, // string
      sideText, // "наличных" | "USDT"
      sumText, // "180 000 RUB" | "1 200 USDT" и т.п.
      dealRate, // number
      city, // string
    } = body || {};

    const text =
`Ордер на обмен ${sideText} создан.
Сумма: ${sumText}
Курс: ${dealRate.toFixed(2)}
Касса: ${city} (адрес и время уточните у менеджера)
ID ордера: ${id}`;

    const url = `https://api.telegram.org/bot${BOT}/sendMessage`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ chat_id: CHAT, text, parse_mode: "HTML" }),
    });
    const j = await r.json();
    if (!j.ok) {
      return NextResponse.json({ ok: false, error: "telegram error", tg: j }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "order error" }, { status: 500 });
  }
}
