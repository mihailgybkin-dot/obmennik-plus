import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";

function toNum(v: any): number | null {
  const n = Number(String(v).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function topFromSide(side: any): number | null {
  if (!side || typeof side !== "object") return null;
  // В этом API top цены лежат в highestPrice, а также первой строкой в items[0].price
  const hp = toNum(side.highestPrice);
  const item0 = Array.isArray(side.items) && side.items.length ? toNum(side.items[0].price) : null;
  return hp ?? item0 ?? null;
}

export async function GET(req: Request) {
  const url = "https://api.rapira.net/market/exchange-plate-mini?symbol=USDT/RUB";
  const debug = new URL(req.url).searchParams.get("debug") === "1";

  try {
    const resp = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Referer: "https://rapira.net/",
        Origin: "https://rapira.net",
      },
    });

    const rawText = await resp.text();
    let data: any = null;
    try { data = JSON.parse(rawText); } catch {}

    if (debug) {
      return NextResponse.json(
        { ok: resp.ok, status: resp.status, rawText, parsed: data },
        { status: resp.ok ? 200 : 502 }
      );
    }

    if (!resp.ok || !data) {
      return NextResponse.json({ ok: false, error: `rapira http ${resp.status}` }, { status: 502 });
    }

    // Ожидаемый формат: { ask: {...}, bid: {...} }
    const bestAsk = topFromSide(data.ask);
    const bestBid = topFromSide(data.bid);

    // Если есть обе стороны — берём mid; если одна — её и отдаём.
    const base =
      (bestAsk && bestBid) ? (bestAsk + bestBid) / 2 :
      (bestAsk ?? bestBid ?? null);

    if (!base) {
      return NextResponse.json({ ok: false, error: "cant-parse-rapira-orderbook", sample: data }, { status: 502 });
    }

    return NextResponse.json(
      { ok: true, rate: base, bid: bestBid ?? undefined, ask: bestAsk ?? undefined, src: "rapira", ts: Date.now() },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "rapira-error" }, { status: 500 });
  }
}
