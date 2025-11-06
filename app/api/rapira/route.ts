import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function toNum(v: any): number | null {
  if (v == null) return null;
  const s = String(v).replace(/\s/g, "").replace(",", "."); // "82,30" -> "82.30"
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// из объекта вытаскиваем первое валидное число по списку ключей
function pick(obj: any, keys: string[]): number | null {
  if (!obj || typeof obj !== "object") return null;
  for (const k of keys) {
    const n = toNum(obj[k]);
    if (n) return n;
  }
  return null;
}

function extractRate(json: any): { bid?: number; ask?: number; mid?: number; last?: number } {
  // прямые поля
  let bid = pick(json, ["buy", "bestBid", "bid"]);
  let ask = pick(json, ["sell", "bestAsk", "ask"]);
  let last = pick(json, ["last", "price", "rate"]);

  // вложенные контейнеры
  const d = json?.data ?? json?.result ?? json?.payload ?? null;
  if ((!bid && !ask && !last) && d) {
    bid = pick(d, ["buy", "bestBid", "bid"]) ?? bid;
    ask = pick(d, ["sell", "bestAsk", "ask"]) ?? ask;
    last = pick(d, ["last", "price", "rate"]) ?? last;
  }

  // массив?
  if (!bid && !ask && !last && Array.isArray(json)) {
    for (const row of json) {
      const r = extractRate(row);
      if (r.bid || r.ask || r.last) return r;
    }
  }

  const mid = (bid && ask) ? (bid + ask) / 2 : undefined;
  return { bid: bid || undefined, ask: ask || undefined, last: last || undefined, mid };
}

export async function GET(req: Request) {
  const url = "https://api.rapira.net/market/exchange-plate-mini?symbol=USDT/RUB";
  const { searchParams } = new URL(req.url);
  const debug = searchParams.get("debug") === "1";

  try {
    const r = await fetch(url, {
      cache: "no-store",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        "Referer": "https://rapira.net/",
      },
    });

    const text = await r.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { /* бывает text/html или другие обёртки */ }

    if (debug) {
      return NextResponse.json({ ok: r.ok, status: r.status, headers: Object.fromEntries(r.headers), rawText: text, parsed: json }, { status: r.ok ? 200 : 502 });
    }

    if (!r.ok || !json) {
      return NextResponse.json({ ok: false, error: `rapira http ${r.status}`, raw: text?.slice?.(0, 2000) }, { status: 502 });
    }

    const { bid, ask, last, mid } = extractRate(json);
    // Выбираем приоритет: bid/ask -> mid -> last
    const base = toNum(bid && ask ? (bid + ask) / 2 : (mid ?? last));
    if (!base) {
      return NextResponse.json({ ok: false, error: "cant-parse-rapira-response", sample: json }, { status: 502 });
    }

    return NextResponse.json(
      { ok: true, rate: base, src: "rapira", ts: Date.now(), bid, ask, last },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "rapira-error" }, { status: 500 });
  }
}
