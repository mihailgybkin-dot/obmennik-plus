"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Asset = "RUB_CASH" | "USDT_TRC20";

const ASSET_LABEL: Record<Asset, string> = {
  RUB_CASH: "Наличные RUB",
  USDT_TRC20: "USDT TRC20",
};

function norm(n: number) {
  if (!isFinite(n)) return 0;
  return Math.max(0, n);
}

export default function Calculator() {
  const [from, setFrom] = useState<Asset>("RUB_CASH");
  const [to, setTo] = useState<Asset>("USDT_TRC20");
  const [city] = useState("Краснодар");

  const [rate, setRate] = useState<number>(82); // базовый Rapira USDT→RUB
  const [left, setLeft] = useState<string>("");
  const [right, setRight] = useState<string>("");

  const activeRef = useRef<"left" | "right">("left");

  // Подтягиваем курс и обновляем каждые 30 секунд
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

  // Цена сделки с наценкой/скидкой
  const effective = useMemo(() => {
    // RUB -> USDT : курс = Rapira + 1
    if (from === "RUB_CASH" && to === "USDT_TRC20") return rate + 1;
    // USDT -> RUB : курс = Rapira - 1
    if (from === "USDT_TRC20" && to === "RUB_CASH") return Math.max(1, rate - 1);
    return rate;
  }, [from, to, rate]);

  // Пересчёт
  useEffect(() => {
    const L = parseFloat(left.replace(",", "."));
    const R = parseFloat(right.replace(",", "."));

    if (activeRef.current === "left") {
      if (from === "RUB_CASH" && to === "USDT_TRC20") {
        const usdt = norm(L) / effective;
        setRight(usdt ? usdt.toFixed(2) : "");
      } else if (from === "USDT_TRC20" && to === "RUB_CASH") {
        const rub = norm(L) * effective;
        setRight(rub ? rub.toFixed(0) : "");
      } else {
        setRight("");
      }
    } else {
      if (from === "RUB_CASH" && to === "USDT_TRC20") {
        const rub = norm(R) * effective;
        setLeft(rub ? rub.toFixed(0) : "");
      } else if (from === "USDT_TRC20" && to === "RUB_CASH") {
        const usdt = norm(R) / effective;
        setLeft(usdt ? usdt.toFixed(2) : "");
      } else {
        setLeft("");
      }
    }
  }, [left, right, from, to, effective]);

  // Смена направлений
  function flip() {
    setFrom(to);
    setTo(from);
  }

  function createOrder() {
    // Требуем авторизацию — переводим в кабинет
    if (typeof window !== "undefined") {
      const sum = activeRef.current === "left" ? left : right;
      localStorage.setItem("pending_amount", sum || "");
      window.location.href = "/dashboard";
    }
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
            <option>Краснодар</option>
          </select>
        </div>

        <div className="text-sm opacity-75">
          Текущий курс
          <div className="mt-1 rounded-md bg-black/40 border border-white/15 px-3 py-2">
            <span className="opacity-80">Rapira:</span> {rate.toFixed(2)} ₽ за 1 USDT
            <span className="opacity-80"> · Сделка:</span> {effective.toFixed(2)} ₽
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

      <div className="mt-3 text-right">
        <button onClick={flip} className="text-sm opacity-75 hover:opacity-100 underline">
          Поменять местами направления
        </button>
      </div>
    </div>
  );
}
