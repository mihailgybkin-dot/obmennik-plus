'use client';
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Currency = "RUB_CASH" | "USD_CASH" | "USDT_TRC20";
const TELEGRAM_URL = "https://t.me/mikhail_gubkin";

export default function Calculator(){
  const [from, setFrom] = useState<Currency>("RUB_CASH");
  const [to, setTo] = useState<Currency>("USDT_TRC20");
  const [city, setCity] = useState("Краснодар");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState<number | null>(null); // RUB per 1 USDT (Rapira не показываем)
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(()=>{ setAuthed(!!localStorage.getItem("phone")); }, []);

  // подтягиваем курс Rapira, но НЕ показываем его
  useEffect(()=>{
    const load = async () => {
      try {
        const r = await fetch("/api/rapira", { cache: "no-store" });
        const j = await r.json();
        setRate(j.rate);
      } catch {}
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  // пресеты
  useEffect(()=>{
    if (from === "RUB_CASH") setTo("USDT_TRC20");
    if (from === "USDT_TRC20") setTo("RUB_CASH");
  }, [from]);

  const result = useMemo(()=>{
    const a = parseFloat((amount || "0").replace(",", ".")) || 0;
    if (!rate || a <= 0) return "0";
    if (from === "USD_CASH" || to === "USD_CASH") return "по запросу";
    if (from === "USDT_TRC20" && to === "RUB_CASH") {
      const r = (rate - 1);           // минус 1 ₽
      return Math.max(0, a * r).toFixed(0) + " RUB";
    } else {
      const r = (rate + 1);           // плюс 1 ₽
      return (a / r).toFixed(4) + " USDT";
    }
  }, [amount, rate, from, to]);

  const onCreate = () => {
    if (!authed) { router.push("/dashboard"); return; }
    window.location.href = TELEGRAM_URL;
  };

  return (
    <div id="rates" className="card p-4 sm:p-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Вы отдаёте</label>
          <div className="flex gap-2">
            <select
              value={from}
              onChange={e=>setFrom(e.target.value as Currency)}
              className="bg-black/50 border border-white/10 rounded-xl p-3 grow"
            >
              <option value="RUB_CASH">Наличные RUB</option>
              <option value="USD_CASH">Наличные USD</option>
              <option value="USDT_TRC20">USDT TRC20</option>
            </select>
            <input
              value={amount}
              onChange={e=>setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="Сумма"
              className="bg-black/50 border border-white/10 rounded-xl p-3 w-36 sm:w-40"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Вы получаете</label>
          <div className="flex gap-2">
            <select
              value={to}
              onChange={e=>setTo(e.target.value as Currency)}
              className="bg-black/50 border border-white/10 rounded-xl p-3 grow"
            >
              <option value="USDT_TRC20">USDT TRC20</option>
              <option value="USD_CASH">USD</option>
              <option value="RUB_CASH">Наличные RUB</option>
            </select>
            <div className="bg-black/50 border border-white/10 rounded-xl p-3 w-36 sm:w-40 whitespace-nowrap">
              {result}
            </div>
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
