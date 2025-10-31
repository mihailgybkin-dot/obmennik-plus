import { NextResponse } from "next/server";

// Источник: https://rapira.net/exchange/USDT_RUB — берём текущий курс (RUB за 1 USDT)
const SRC = "https://rapira.net/exchange/USDT_RUB";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(SRC, { headers: { "user-agent": "Mozilla/5.0" }, cache: "no-store" });
    const html = await res.text();

    // Грубый, но устойчивый парсинг числа вида 82.27 из страницы
    const m = html.match(/(\d{1,3}[.,]\d{2})/);
    const raw = m ? m[1].replace(",", ".") : "82.00";
    const rate = Math.max(10, Math.min(300, parseFloat(raw))); // санити-чеки

    return NextResponse.json({ rate, source: "Rapira USDT_RUB", updatedAt: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ rate: 82.0, source: "fallback", error: e?.message || "fetch error", updatedAt: new Date().toISOString() });
  }
}
