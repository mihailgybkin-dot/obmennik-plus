'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Currency = "RUB_CASH" | "USDT_TRC20" | "USD_CASH";
const TELEGRAM_URL = "https://t.me/mikhail_gubkin";

/** конвертация только для пары RUB <-> USDT */
function convert(amount: number, from: Currency, to: Currency, rateRubPerUsdt: number): number | null {
  if (!rateRubPerUsdt || amount <= 0) return 0;
  const RUB2USDT = (a: number) => a / (rateRubPerUsdt + 1);   // +1 ₽
  const USDT2RUB = (a: number) => a * (rateRubPerUsdt - 1);   // -1 ₽

  if (from === "RUB_CASH" && to === "USDT_TRC20") return RUB2USDT(amount);
  if (from === "USDT_TRC20" && to === "RUB_CASH") return USDT2RUB(amount);
  return null; // прочие пары — не считаем (по запросу)
}

export default function Calculator(){
  const [from, setFrom] = useState<Currency>("RUB_CASH");
  const [to, setTo] = useState<Currency>("USDT_TRC20");
  const [city, setCity] = useState("Краснодар");

  const [fromVal, setFromVal] = useState<string>("");
  const [toVal, setToVal] = useState<string>("");

  const [rate, setRate] = useState<number | null>(null); // RUB за 1 USDT
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  // кто последний менял поле: чтобы не зациклить пересчёт
  const lastEdited = useRef<"from" | "to">("from");

  useEffect(()=>{ setAuthed(!!localStorage.getItem("email")); }, []);

  // --- курс Rapira ---
  useEffect(()=>{
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/rapira", {
          cache: "no-store",
          headers: { "x-no-cache": "1" },
        });
        const j = await r.json();
        if (mounted && j?.rate) setRate(j.rate);
      } catch {}
    };
    load();
    const id = setInterval(load, 10_000); // каждые 10 сек
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // автоматический выбор обратной валюты для пары
  useEffect(()=>{
    if (from === "RUB_CASH") setTo("USDT_TRC20");
    if (from === "USDT_TRC20") setTo("RUB_CASH");
  }, [from]);

  // пересчёт «другого» поля
  const recalc = useCallback(() => {
    if (!rate) return;
    const aFrom = parseFloat(fromVal.replace(",", ".")) || 0;
    const aTo   = parseFloat(toVal.replace(",", ".")) || 0;

    if (lastEdited.current === "from") {
      const res = convert(aFrom, from, to, rate);
      if (res === null) return; // несчитаемая пара
      setToVal(res <= 0 ? "" : (to === "RUB_CASH" ? res.toFixed(0) : res.toFixed(4)));
    } else {
      const resBack = convert(aTo, to, from, rate);
      if (resBack === null) return;
      setFromVal(resBack <= 0 ? "" : (from === "RUB_CASH" ? resBack.toFixed(0) : resBack.toFixed(4)));
    }
  }, [from, to, rate, fromVal, toVal]);

  useEffect(()=>{ recalc(); }, [from, to, rate]); // при смене курса/валют

  const onCreate = () => {
    if (!authed) { router.push("/dashboard"); return; }
    window.location.href = TELEGRAM_URL;
  };

  const editablePair = useMemo(()=>{
    return (
      (from === "RUB_CASH" && to === "USDT_TRC20") ||
      (from === "USDT_TRC20" && to === "RUB_CASH")
    );
  }, [from, to]);

  return (
    <div id="rates" className="card p-4 sm:p-6">
      <div className="grid md:grid-cols-2 gap-4">
        {/* FROM */}
        <div>
          <label className="block text-sm mb-1">Вы отдаёте</label>
          <div className="flex gap-2">
            <select
              value={from}
              onChange={e=>setFrom(e.target.value as Currency)}
              className="bg-black/50 border border-white/10 rounded-xl p-3 grow"
            >
              <option value="RUB_CASH">Наличные RUB</option>
              <option value="USDT_TRC20">USDT TRC20</option>
              <option value="USD_CASH">Наличные USD</option>
            </select>
            <input
              value={fromVal}
              onChange={e=>{ lastEdited.current="from"; setFromVal(e.target.value); }}
              inputMode="decimal"
              placeholder="Сумма"
              className="bg-black/50 border border-white/10 rounded-xl p-3 w-36 sm:w-40"
            />
          </div>
        </div>

        {/* TO */}
        <div>
          <label className="block text-sm mb-1">Вы получаете</label>
          <div className="flex gap-2">
            <select
              value={to}
              onChange={e=>setTo(e.target.value as Currency)}
              className="bg-black/50 border border-white/10 rounded-xl p-3 grow"
            >
              <option value="USDT_TRC20">USDT TRC20</option>
              <option value="RUB_CASH">Наличные RUB</option>
              <option value="USD_CASH">Наличные USD</option>
            </select>

            {/* правое поле теперь тоже редактируемое */}
            <input
              value={toVal}
              onChange={e=>{ lastEdited.current="to"; setToVal(e.target.value); }}
              inputMode="decimal"
              placeholder={editablePair ? "Сумма" : "по запросу"}
              className="bg-black/50 border border-white/10 rounded-xl p-3 w-36 sm:w-40"
              disabled={!editablePair && !toVal}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Город обмена</label>
          <select
            value={city}
            onChange={e=>setCity(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl p-3 w-full"
          >
            <option>Краснодар</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex items-end">
          <button onClick={onCreate} className="btn w-full py-3 text-base">Создать заявку</button>
        </div>
      </div>

      <div className="mt-3 text-xs opacity-70">
        Курс фиксируется при создании заявки. Подробности — в разделах «Правила» и «AML».
      </div>
    </div>
  );
}
