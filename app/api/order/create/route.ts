import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BOT = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT = process.env.TELEGRAM_CHAT_ID || "";
const DEFAULT_CONTACT = process.env.TELEGRAM_CONTACT || "@mikhail_gubkin";

function toFixedSmart(n: number, maxFrac = 2) {
  if (!Number.isFinite(n)) return "0";
  const s = n.toFixed(maxFrac);
  return s.replace(/\.?0+$/, "");
}
function rateRu(n: number) {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(2).replace(".", ",");
}

function buildLineAmounts(opts: {
  from: "RUB_CASH" | "USDT_TRC20";
  to: "RUB_CASH" | "USDT_TRC20";
  amountFrom: number;
  amountTo: number;
  city: string;
}) {
  const { from, to, amountFrom, amountTo, city } = opts;

  const Afrom =
    from === "USDT_TRC20"
      ? `${toFixedSmart(amountFrom)} Tether TRC20`
      : `${toFixedSmart(amountFrom, 0)} Cash ${city} RUB`;

  const Ato =
    to === "USDT_TRC20"
      ? `${toFixedSmart(amountTo)} Tether TRC20`
      : `${toFixedSmart(amountTo, 0)} Cash ${city} RUB`;

  // Твой точный шаблон со стрелкой
  return `💸 ${Afrom} USDT→ ${Ato}`;
}

export async function POST(req: Request) {
  try {
    if (!BOT || !CHAT) {
      return NextResponse.json(
        { ok: false, error: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const id: string = body?.id || ""; // числовой ID из калькулятора
    const city: string = body?.city || "Краснодар";
    const rate: number = Number(body?.dealRate) || 0;

    const from: "RUB_CASH" | "USDT_TRC20" = body?.from || "RUB_CASH";
    const to: "RUB_CASH" | "USDT_TRC20" = body?.to || "USDT_TRC20";

    const amountFrom = Number(body?.amountFrom) || 0;
    const amountTo = Number(body?.amountTo) || 0;

    const contactInput: string = (body?.contact ?? DEFAULT_CONTACT).trim();
    const contact =
      contactInput.startsWith("@") ? contactInput : `@${contactInput.replace(/^@/, "")}`;

    const wallet: string = (body?.wallet || "").trim();
    const place: string = (body?.place || "В офисе").trim();
    const when: string = (body?.when || "").trim();
    const password: string = (body?.password || "").trim();

    const line1 = `❗️ Новая заявка: ${id}`;
    const line2 = buildLineAmounts({ from, to, amountFrom, amountTo, city });
    const line3 = `Курс: ${rateRu(rate)}`;
    const line4 = `📱 Для связи: ${contact}`;
    const line5 = `👛 Кошелек: ${wallet || "—"}`;
    const line6 = `💰 Где планирует обмен: ${place}`;
    const line7 = `🕒 Удобно прибыть: ${when || "—"}`;
    const line8 = `🔑 Пароль: ${password || "—"}`;

    const text = [line1, line2, line3, line4, line5, line6, line7, line8].join("\n");

    const url = `https://api.telegram.org/bot${BOT}/sendMessage`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT, // тут ДОЛЖЕН быть числовой id или @channel_username
        text,
        disable_web_page_preview: true,
      }),
    });
    const j = await r.json();
    if (!j?.ok) {
      return NextResponse.json({ ok: false, error: "telegram error", tg: j }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "order-create-error" }, { status: 500 });
  }
}
