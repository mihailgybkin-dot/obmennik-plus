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

function uuidDigits(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  if (s[0] === "0") s = (1 + Math.floor(Math.random() * 9)).toString() + s.slice(1);
  return s;
}

export default function Calculator() {
  const [from, setFrom] = useState<Asset>("RUB_CASH");
  const [to, setTo] = useState<Asset>("USDT_TRC20");

  // курс Rapira (mid)
  const [rate, setRate] = useState<number>(82);
  const [left, setLeft] = useState<string>("");   // пользователь вводит
  const [right, setRight] = useState<string>(""); // пользователь вводит
  const activeRef = useRef<"left" | "right">("left");

  // доп. поля для заявки
  const [contact, setContact] = useState<string>("@mikhail_gubkin");
  const [wallet, setWallet] = useState<string>(""); // адрес USDT
  const [place, setPlace] = useState<string>("В офисе");
  const [when, setWhen] = useState<string>(""); // datetime-local (строка)
  const [password, setPassword] = useState<string>(() => uuidDigits(7));

  // тянем курс с бэка каждые 10 сек
  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch(`/api/rapira?ts=${Date.now()}`, { cache: "no-store" });
        const j = await r.json();
        if (!stop && j?.ok && j?.rate) {
          setRate(Number(j.rate));
        }
      } catch {}
    };
    load();
    const t = setInterval(load, 10000);
    return () => { stop = true; clearInterval(t); };
  }, []);

  // итоговый «Курс сделки» (±1 рубль)
  const effective = useMemo(() => {
    if (from === "RUB_CASH" && to === "USDT_TRC20") return rate + 1;            // рубли -> USDT
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
    // проверяем авторизацию по email
    const email = typeof window !== "undefined" ? localStorage.getItem("email") : null;
    if (!email) {
      if (typeof window !== "undefined") window.location.href = "/dashboard";
      return;
    }

    // валидации
    const amountFrom = parseFloat(left.replace(",", "."));
    const amountTo = parseFloat(right.replace(",", "."));
    if (!Number.isFinite(amountFrom) || amountFrom <= 0) {
      alert("Введите корректную сумму в поле «Вы отдаёте»");
      return;
    }
    if (!Number.isFinite(amountTo) || amountTo <= 0) {
      alert("Введите корректную сумму в поле «Вы получаете»");
      return;
    }
    if (to === "USDT_TRC20" && !wallet.trim()) {
      alert("Укажите адрес кошелька USDT TRC20");
      return;
    }

    const id = uuidDigits(9); // числовой ID заявки

    try {
      await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          city: CITY,
          dealRate: effective,
          from,
          to,
          amountFrom,
          amountTo,
          contact,
          wallet,
          place,
          // превращаем datetime-local в «ДД.ММ.ГГГГ в ЧЧ:ММ»
          when: (() => {
            if (!when) return "";
            const d = new Date(when);
            if (isNaN(d.getTime())) return when;
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            const hh = String(d.getHours()).padStart(2, "0");
            const mi = String(d.getMinutes()).padStart(2, "0");
            return `${dd}.${mm}.${yyyy} в ${hh}:${mi}`;
          })(),
          password,
        }),
      });
    } catch {}

    // локальная история для ЛК
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
        contact,
        wallet,
        place,
        when,
        password,
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
          <div className="text-xs opacity-50 mt-1">(обновляется онлайн)</div>
        </div>

        <div className="text-sm opacity-75">
          Где планирует обмен
          <select
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="w-full mt-1 rounded-md bg-black/40 border border-white/15 px-3 py-2"
          >
            <option>В офисе</option>
            <option>Дистанционно</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-4">
        <div className="text-sm opacity-75">
          Для связи (Telegram)
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="@username"
            className="w-full mt-1 rounded-md bg-black/40 border border-white/15 px-3 py-2"
          />
        </div>

        <div className="text-sm opacity-75">
          Кошелёк USDT TRC20 (если получаете USDT)
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="TV... адрес"
            className="w-full mt-1 rounded-md bg-black/40 border border-white/15 px-3 py-2"
          />
        </div>

        <div className="text-sm opacity-75">
          Удобное время визита
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="w-full mt-1 rounded-md bg-black/40 border border-white/15 px-3 py-2"
          />
        </div>

        <div className="text-sm opacity-75">
          Пароль для заявки
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/[^\d]/g, "").slice(0, 8))}
            placeholder="например, 1005022"
            className="w-full mt-1 rounded-md bg-black/40 border border-white/15 px-3 py-2"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={createOrder}
          className="w-full h-11 rounded-md bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
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
