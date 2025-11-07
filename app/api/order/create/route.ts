import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BOT = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT = process.env.TELEGRAM_CHAT_ID || "";
const DEFAULT_CONTACT = process.env.TELEGRAM_CONTACT || "@mikhail_gubkin";

// 639082.5 -> "639082.5", 7770 -> "7770"
function toFixedSmart(n: number, maxFrac = 2) {
  if (!Number.isFinite(n)) return "0";
  const s = n.toFixed(maxFrac);
  // убираем хвостовые нули и точку, если целое
  return s.replace(/\.?0+$/, "");
}

// 83.76 -> "83,76"
function rateRu(n: number) {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(2).replace(".", ",");
}

// сборка «💸 …» строки
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

  return `💸 ${Afrom} USDT→ ${Ato}`;
}

export async function POST(req: Request) {
  try {
    if (!BOT || !CHAT) {
      return NextResponse.json(
        { ok: false, error: "TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const id: string = body?.id || "";
    const city: string = body?.city || "Краснодар";
    const rate: number = Number(body?.dealRate) || 0;

    const from: "RUB_CASH" | "USDT_TRC20" = body?.from || "RUB_CASH";
    const to: "RUB_CASH" | "USDT_TRC20" = body?.to || "USDT_TRC20";

    const amountFrom = Number(body?.amountFrom) || 0;
    const amountTo = Number(body?.amountTo) || 0;

    // контакт, кошелёк, место и время
    const contact: string = (body?.contact?.trim() || DEFAULT_CONTACT).startsWith("@")
      ? body?.contact?.trim() || DEFAULT_CONTACT
      : "@" + (body?.contact?.trim() || DEFAULT_CONTACT.replace(/^@/, ""));

    const wallet: string = (body?.wallet || "").trim();
    const place: string = (body?.place || "В офисе").trim();
    const when: string = (body?.when || "").trim(); // ожидаем человеко-понятную строку
    const password: string = (body?.password || "").trim();

    // Формируем сообщение
    const line1 = `❗️ Новая заявка: ${id}`;
    const line2 = buildLineAmounts({ from, to, amountFrom, amountTo, city });
    const line3 = `Курс: ${rateRu(rate)}`;
    const line4 = `📱 Для связи: ${contact}`;
    const line5 = `👛 Кошелек: ${wallet || "—"}`;
    const line6 = `💰 Где планирует обмен: ${place}`;
    const line7 = `🕒 Удобно прибыть: ${when || "—"}`;
    const line8 = `🔑 Пароль: ${password || "—"}`;

    const text = [line1, line2, line3, line4, line5, line6, line7, line8].join("\n");

    // Отправляем в Telegram
    const url = `https://api.telegram.org/bot${BOT}/sendMessage`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT,
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
