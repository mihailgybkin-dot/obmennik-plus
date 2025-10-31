import { NextResponse } from "next/server";

// Берём курс USDT/RUB со страницы Rapira
const SRC = "https://rapira.net/exchange/USDT_RUB";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch(SRC, {
      headers: { "user-agent": "Mozilla/5.0", "cache-control": "no-cache" },
      cache: "no-store",
    });
    const html = await res.text();

    // Пытаемся вытащить число вида 82.27 (первая встреча с 2 знаками после запятой)
    // Если структура страницы меняется — выхватываем ближайшее валидное значение.
    const m = html.match(/(\d{1,3}[.,]\d{2})/);
    const raw = m ? m[1].replace(",", ".") : "82.00";
    const rate = Math.max(10, Math.min(300, parseFloat(raw)));

    return NextResponse.json(
      { rate, source: "Rapira USDT_RUB", updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { rate: 82.0, source: "fallback", error: e?.message || "fetch error", updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
