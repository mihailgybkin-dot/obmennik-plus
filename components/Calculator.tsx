"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Asset = "RUB_CASH" | "USDT_TRC20";
const ASSET_LABEL: Record<Asset, string> = {
  RUB_CASH: "Наличные RUB",
  USDT_TRC20: "USDT TRC20",
};
const CITY = "Краснодар";

const fmtRub = (n: number) =>
  n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
const fmtUsdt = (n: number) =>
  n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function uuid() {
  // простая uuid v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random()*16)|0, v = c === "x" ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

export default function Calculator() {
  const [from, setFrom] = useState<Asset>("RUB_CASH");
  const [to, setTo] = useState<Asset>("USDT_TRC20");
  const [rate, setRate] = useState<number>(82); // Rapira USDT→RUB (в фоне)
  const [left, setLeft] = useState<string>("");   // ввод пользователя слева
  const [right, setRight] = useState<string>(""); // ввод пользователя справа
  const activeRef = useRef<"left"|"right">("left");

  // тянем курс с бэка каждые 30 секунд
  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch("/api/rapira", { cache: "no-store" });
        const j = await r.json();
        if (!stop && j?.rate) setRate(Number(j.rate));
      } catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => { stop = true; clearInterval(t); };
  }, []);

  // итоговый «Курс сделки» (без отображения Rapira)
  const effective = useMemo(() => {
    if (from === "RUB_CASH" && to === "USDT_TRC20") return rate + 1;      // рубли -> USDT
    if (from === "USDT_TRC20" && to === "RUB_CASH") return Math.max(1, rate - 1); // USDT -> рубли
    return rate;
  }, [from, to, rate]);

  // пересчёт
  useEffect(() => {
    const L = parseFloat(left.replace(",", "."));
    const R = parseFloat(right.replace(",", "."));
    if (activeRef.current === "left") {
      if (from === "RUB_CASH" && to === "USDT_TRC20") {
        const usdt = !isFinite(L) ? 0 : Math.max(0, L) / effective;
        setRight(usdt ? usdt.toFixed(2) : "");
      } else if (from === "USDT_TRC20" && to === "RUB_CASH") {
        const rub = !isFinite(L) ? 0 : Math.max(0, L) * effective;
        setRight(rub ? Math.round(rub).toString() : "");
      } else setRight("");
    } else {
      if (from === "RUB_CASH" && to === "USDT_TRC20") {
        const rub = !isFinite(R) ? 0 : Math.max(0, R) * effective;
        setLeft(rub ? Math.round(rub).toString() : "");
      } else if (from === "USDT_TRC20" && to === "RUB_CASH") {
        const usdt = !isFinite(R) ? 0 : Math.max(0, R) / effective;
        setLeft(usdt ? usdt.toFixed(2) : "");
      } else setLeft("");
    }
  }, [left, right, from, to, effective]);

  async function createOrder() {
    // нужно быть авторизованным (email в localStorage)
    const email = typeof window !== "undefined" ? localStorage.getItem("email") : null;
    if (!email) {
      if (typeof window !== "undefined") window.location.href = "/dashboard";
      return;
    }

    const id = uuid();

    // какие поля считать «суммой»/текстом для телеграма
    const isCashToUsdt = from === "RUB_CASH" && to === "USDT_TRC20";
    const sideText = isCashToUsdt ? "наличных" : "USDT";
    const sumText = isCashToUsdt
      ? `${fmtRub(Number(left || "0"))} RUB`
      : `${fmtUsdt(Number(left || "0"))} USDT`; // при вводе слева

    try {
      // отправка в Telegram
      await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          id,
          sideText,
          sumText,
          dealRate: effective,
          city: CITY,
        }),
      });
    } catch {}

    // пишем локальную историю для пользователя
    try {
      const key = `orders:${email}`;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.unshift({
        id,
        createdAt: new Date().toISOString(),
        from,
        to,
        amountFrom: left,
        amountTo: right,
        rate: effective,
        city: CITY,
      });
      localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
    } catch {}

    alert("Заявка создана. Мы свяжемся с вами.");
  }

  return (
    <div className="card p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Слева */}
        <div>
          <div className="text-sm opacity-75 mb-1">Вы отдаёте</div>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as Asset)}
            className="w-full rounded-md bg-black/40 border border-white/15 px-3 py-2"
          >
            <option value="RUB_CASH">{ASSET_LABEL.RUB_CASH}</option>
            <option value="USDT_TRC20">{ASSET_LABEL.USDT_TRC20}</option>
          </select>
          <input
            inputMode="decimal"
            placeholder="Сумма"
            value={left}
            onChange={(e) => { activeRef.current = "left"; setLeft(e.target.value.replace(/[^\d.,]/g, "")); }}
            className="mt-2 w-full rounded-md bg-black/40 border border-white/15 px-3 py-2"
          />
        </div>

        {/* Справа */}
        <div>
          <div className="text-sm opacity-75 mb-1">Вы получаете</div>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value as Asset)}
            className="w-full rounded-md bg-black/40 border border-white/15 px-3 py-2"
          >
            <option value="USDT_TRC20">{ASSET_LABEL.USDT_TRC20}</option>
            <option value="RUB_CASH">{ASSET_LABEL.RUB_CASH}</option>
          </select>
          <input
            inputMode="decimal"
            placeholder="Сумма"
            value={right}
            onChange={(e) => { activeRef.current = "right"; setRight(e.target.value.replace(/[^\d.,]/g, "")); }}
            className="mt-2 w-full rounded-md bg-black/40 border border-white/15 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-4">
        <div className="text-sm opacity-75">
          Город обмена
          <select disabled className="w-full mt-1 rounded-md bg-black/40 border border-white/15 px-3 py-2">
            <option>{CITY}</option>
          </select>
        </div>

        <div className="text-sm opacity-75">
          Курс сделки
          <div className="mt-1 rounded-md bg-black/40 border border-white/15 px-3 py-2 font-medium">
            {effective.toFixed(2)} ₽ за 1 USDT
          </div>
        </div>

        <button
          onClick={createOrder}
          className="h-10 self-end rounded-md bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
        >
          Создать заявку
        </button>
      </div>

      <div className="text-xs opacity-60 mt-2">
        Курс фиксируется при подтверждении заявки оператором. Подробности — в разделах «Правила» и «AML».
      </div>
    </div>
  );
}
