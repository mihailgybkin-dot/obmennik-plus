
'use client';
import { useEffect, useMemo, useState } from "react";

type Rates = {
  rubToUsdt: number; // сколько USDT за 1 RUB
  usdtToRub: number; // сколько RUB за 1 USDT
  updatedAt: string;
  source: string;
}

export default function Calculator(){
  const [tab, setTab] = useState<'ru2us'|'us2ru'>('ru2us');
  const [amountGive, setAmountGive] = useState('');
  const [rates, setRates] = useState<Rates | null>(null);
  const feePct = 1; // пример комиссии

  const amountGet = useMemo(() => {
    const a = parseFloat(amountGive.replace(',','.')) || 0;
    if(!rates) return '0';
    if(tab==='ru2us'){
      const usdt = a * rates.rubToUsdt;
      const fee = usdt * feePct / 100;
      return (usdt - fee).toFixed(2);
    } else {
      const rub = a * rates.usdtToRub;
      const fee = rub * feePct / 100;
      return (rub - fee).toFixed(0);
    }
  }, [amountGive, rates, tab]);

  useEffect(() => {
    const fetchRates = async () => {
      try{
        const r = await fetch('/api/rates');
        const j = await r.json();
        setRates(j);
      }catch(e){ console.error(e); }
    };
    fetchRates();
    const id = setInterval(fetchRates, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div id="rates" className="card p-6">
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab('ru2us')} className={"badge "+(tab==='ru2us'?'ring-2 ring-cyan-400':'')}>RUB → USDT</button>
        <button onClick={()=>setTab('us2ru')} className={"badge "+(tab==='us2ru'?'ring-2 ring-cyan-400':'')}>USDT → RUB</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Вы отдаёте</label>
          <input
            value={amountGive}
            onChange={e=>setAmountGive(e.target.value)}
            placeholder={tab==='ru2us'?'Сумма в RUB':'Сумма в USDT'}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Получаете (комиссия {feePct}%)</label>
          <div className="w-full bg-black/50 border border-white/10 rounded-xl p-3">
            {amountGet} {tab==='ru2us'?'USDT':'RUB'}
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm opacity-80">
        {rates ? (
          <div>
            Курс: 1 RUB = {rates.rubToUsdt.toFixed(6)} USDT • 1 USDT = {rates.usdtToRub.toFixed(2)} RUB.
            <br/>Источник: {rates.source}. Обновлено: {new Date(rates.updatedAt).toLocaleTimeString()}
          </div>
        ) : 'Загрузка курса...'}
        <div className="mt-2">Город обмена: <b>Краснодар</b>. Курс фиксируется при создании заявки.</div>
      </div>
      <a href="/dashboard" className="btn mt-6 inline-block">Создать заявку</a>
    </div>
  );
}
