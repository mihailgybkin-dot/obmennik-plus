import { NextResponse } from "next/server";

const SRC = "https://rapira.net/exchange/USDT_RUB";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const r = await fetch(SRC, {
      headers: { "user-agent": "Mozilla/5.0", "cache-control": "no-cache" },
      cache: "no-store",
    });
    const html = await r.text();

    // Берём первое число вида 82.27 на странице
    const m = html.match(/(\d{1,3}[.,]\d{2})/);
    const raw = m ? m[1].replace(",", ".") : "82.00";
    const rate = Math.max(10, Math.min(500, parseFloat(raw)));

    return NextResponse.json({
      ok: true,
      rate,               // USDT→RUB базовый курс Rapira
      updatedAt: new Date().toISOString(),
      source: "rapira",
    }, { headers: { "Cache-Control": "no-store" }});
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      rate: 82.0,
      error: e?.message || "fetch error",
      updatedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" }});
  }
}
