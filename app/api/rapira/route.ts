import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";        // запрет статического кеша
export const revalidate = 0;                   // запрет ISR
export const runtime = "edge";                 // быстрый edge-рантайм

function toNum(v: any): number | null {
  if (v == null) return null;
  const s = String(v).replace(/\s/g, "").replace(",", "."); // "82,30" -> "82.30"
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function pick(obj: any, keys: string[]): number | null {
  if (!obj || typeof obj !== "object") return null;
  for (const k of keys) {
    const n = toNum(obj[k]);
    if (n) return n;
  }
  return null;
}

function extractRate(json: any): { bid?: number; ask?: number; last?: number; mid?: number } {
  let bid = pick(json, ["buy", "bestBid", "bid"]);
  let ask = pick(json, ["sell", "bestAsk", "ask"]);
  let last = pick(json, ["last", "price", "rate"]);

  const d = json?.data ?? json?.result ?? json?.payload ?? null;
  if ((!bid && !ask && !last) && d) {
    bid = pick(d, ["buy", "bestBid", "bid"]) ?? bid;
    ask = pick(d, ["sell", "bestAsk", "ask"]) ?? ask;
    last = pick(d, ["last", "price", "rate"]) ?? last;
  }

  if (!bid && !ask && !last && Array.isArray(json)) {
    for (const row of json) {
      const r = extractRate(row);
      if (r.bid || r.ask || r.last) return r;
    }
  }

  const mid = bid && ask ? (bid + ask) / 2 : undefined;
  return { bid: bid || undefined, ask: ask || undefined, last: last || undefined, mid };
}

export async function GET(req: Request) {
  const rapiraURL = "https://api.rapira.net/market/exchange-plate-mini?symbol=USDT/RUB";
  const url = new URL(req.url);
  const debug = url.searchParams.get("debug") === "1";

  try {
    const resp = await fetch(rapiraURL, {
      cache: "no-store",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        "Referer": "https://rapira.net/",
        "Origin": "https://rapira.net",
      },
    });

    const text = await resp.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { /* бывает */ }

    if (debug) {
      return NextResponse.json(
        { ok: resp.ok, status: resp.status, rawText: text, parsed: json },
        { status: resp.ok ? 200 : 502 }
      );
    }

    if (!resp.ok || !json) {
      return NextResponse.json(
        { ok: false, error: `rapira http ${resp.status}` },
        { status: 502 }
      );
    }

    const { bid, ask, last, mid } = extractRate(json);
    const base = toNum(bid && ask ? (bid + ask) / 2 : (mid ?? last));
    if (!base) {
      return NextResponse.json(
        { ok: false, error: "cant-parse-rapira-response" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { ok: true, rate: base, src: "rapira", ts: Date.now(), bid, ask, last },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "rapira-error" },
      { status: 500 }
    );
  }
}
