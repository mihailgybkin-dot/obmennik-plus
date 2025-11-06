import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // никаких статических кешей

function toNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Универсальный парсер: пытается вытащить курс USDT/RUB из разных форматов ответа.
 * Возвращает mid (средний) и/или единый "rate" (если есть только одно поле).
 */
function extractRate(json: any): { rate?: number; mid?: number } {
  // Популярные поля
  const buy = toNum(json?.buy ?? json?.bestBid ?? json?.bid);
  const sell = toNum(json?.sell ?? json?.bestAsk ?? json?.ask);
  const price = toNum(json?.price ?? json?.last ?? json?.rate);

  // Иногда данные лежат глубже
  const d = json?.data ?? json?.result ?? json?.payload ?? null;
  if (!buy && !sell && !price && d) {
    const dbuy = toNum(d?.buy ?? d?.bestBid ?? d?.bid);
    const dsell = toNum(d?.sell ?? d?.bestAsk ?? d?.ask);
    const dprice = toNum(d?.price ?? d?.last ?? d?.rate);
    if (dbuy || dsell) {
      const mid = (Number(dbuy ?? dsell) + Number(dsell ?? dbuy)) / 2;
      return { mid };
    }
    if (dprice) return { rate: dprice };
  }

  if (buy || sell) {
    const mid = (Number(buy ?? sell) + Number(sell ?? buy)) / 2;
    return { mid };
  }

  if (price) return { rate: price };

  // Массив записей? Возьмём первую осмысленную
  if (Array.isArray(json)) {
    for (const row of json) {
      const r = extractRate(row);
      if (r.rate || r.mid) return r;
    }
  }

  return {};
}

export async function GET() {
  try {
    const url = "https://api.rapira.net/market/exchange-plate-mini?symbol=USDT/RUB";
    const r = await fetch(url, {
      // на всякий случай уберём кеш на стороне Vercel
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: `rapira http ${r.status}` },
        { status: 502 },
      );
    }

    const j = await r.json();
    const { rate, mid } = extractRate(j);

    const base = toNum(rate ?? mid);
    if (!base) {
      return NextResponse.json(
        { ok: false, error: "cant-parse-rapira-response", raw: j },
        { status: 502 },
      );
    }

    // Возвращаем единый курс USDT/RUB (RUB за 1 USDT)
    return NextResponse.json({
      ok: true,
      rate: base,
      src: "rapira",
      ts: Date.now(),
    }, {
      headers: {
        // отключим кеш в CDN
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "rapira-error" },
      { status: 500 },
    );
  }
}
