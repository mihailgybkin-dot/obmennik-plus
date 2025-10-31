import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * Универсальная отправка SMS через SMSC.ru или Twilio.
 * Выбор провайдера: SMS_PROVIDER = "smsc" | "twilio"
 *
 * ENV для SMSC.ru:
 *   SMS_PROVIDER=smsc
 *   SMSC_LOGIN=your_login
 *   SMSC_PASSWORD=your_password
 *
 * ENV для Twilio:
 *   SMS_PROVIDER=twilio
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxx...
 *   TWILIO_AUTH_TOKEN=xxxxxxxx
 *   TWILIO_FROM=+1xxxxxxxxxx
 *
 * Общие:
 *   JWT_SECRET=случайная_длинная_строка
 */

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const SMS_PROVIDER = (process.env.SMS_PROVIDER || "").toLowerCase();

export const dynamic = "force-dynamic";

function generateCode(): string {
  // 6-значный код без ведущих нулей
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendViaSMSC(phone: string, message: string) {
  const login = process.env.SMSC_LOGIN;
  const password = process.env.SMSC_PASSWORD;
  if (!login || !password) throw new Error("SMSC credentials are missing");

  // Документация: https://smsc.ru/api/http/
  const params = new URLSearchParams({
    login,
    psw: password,
    phones: phone,
    mes: message,
    fmt: "3",
  });

  const url = `https://smsc.ru/sys/send.php?${params.toString()}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`SMSC HTTP ${res.status}`);
  const data = await res.json().catch(() => ({}));
  if ((data as any).error) throw new Error(`SMSC: ${(data as any).error}`);
  return true;
}

async function sendViaTwilio(phone: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) throw new Error("Twilio credentials are missing");

  const form = new URLSearchParams({
    To: phone,
    From: from,
    Body: message,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio ${res.status}: ${text}`);
  }
  return true;
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ ok: false, error: "phone required" }, { status: 400 });

    // нормализуем, но не навязываем формат
    const cleaned = String(phone).replace(/[^\d+]/g, "");
    if (cleaned.length < 8) return NextResponse.json({ ok: false, error: "invalid phone" }, { status: 400 });

    const code = generateCode();
    const message = `Код входа: ${code}`;

    if (SMS_PROVIDER === "smsc") {
      await sendViaSMSC(cleaned, message);
    } else if (SMS_PROVIDER === "twilio") {
      await sendViaTwilio(cleaned, message);
    } else {
      // Если провайдер не настроен — вернём dev-режим (без отправки)
      return NextResponse.json({ ok: true, dev: true, token: jwt.sign({ phone: cleaned, code }, JWT_SECRET, { expiresIn: "10m" }), code });
    }

    // Возвращаем "сессию" с кодом в JWT (храним на клиенте, без БД)
    const token = jwt.sign({ phone: cleaned, code }, JWT_SECRET, { expiresIn: "10m" });
    return NextResponse.json({ ok: true, token });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "send error" }, { status: 500 });
  }
}
