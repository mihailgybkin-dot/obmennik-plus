'use client';
import { useEffect, useMemo, useState } from 'react';
import NavBar from '../../components/NavBar';
import { refCodeFromEmail } from '../../lib';

function getPhone(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('phone') || null;
}

export default function Dashboard(){
  const [phone, setPhone] = useState<string | null>(null);
  useEffect(()=>{ setPhone(getPhone()); }, []);

  const refLink = useMemo(()=>{
    if(!phone) return '';
    const code = refCodeFromEmail(phone);
    return `${window.location.origin}/r/${code}`;
  }, [phone]);

  const [history, setHistory] = useState<any[]>([]);
  useEffect(()=>{
    const h = localStorage.getItem('history');
    setHistory(h? JSON.parse(h) : []);
  }, []);

  const createDemoOrder = () => {
    const entry = { id: Date.now(), type:'RUB→USDT', give: 100000, get: 1000, status:'Новая', ts: new Date().toISOString() };
    const next = [entry, ...history];
    setHistory(next);
    localStorage.setItem('history', JSON.stringify(next));
  };

  return (
    <main>
      <NavBar/>
      <div className="mx-auto max-w-4xl px-4 pt-28 pb-12">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>

        {!phone ? (
          <div className="card p-6 mt-4">
            <div className="text-lg mb-2">Вход по SMS</div>
            <PhoneLogin/>
            <p className="mt-3 text-sm opacity-70">Код приходит в SMS. Для теста без провайдера возможен dev-режим (код вернётся из API).</p>
          </div>
        ) : (
          <>
            <div className="card p-6 mt-4">
              <div className="text-lg mb-2">Профиль</div>
              <div className="opacity-85">Телефон: <b>{phone}</b></div>
              <button className="badge mt-3" onClick={()=>{localStorage.removeItem('phone'); location.reload();}}>Выйти</button>
            </div>
            <div className="card p-6 mt-4">
              <div className="text-lg mb-2">Моя реферальная ссылка</div>
              <div className="opacity-85 break-all">{refLink || '—'}</div>
            </div>
            <div className="card p-6 mt-4">
              <div className="text-lg mb-2">История транзакций</div>
              <div className="opacity-85 text-sm">{history.length===0?'Пока пусто.':' '}</div>
              <div className="mt-2 space-y-2">
                {history.map(h => (
                  <div key={h.id} className="border border-white/10 rounded-lg p-3">
                    <div className="text-sm">{new Date(h.ts).toLocaleString()} • {h.type}</div>
                    <div className="text-sm opacity-85">Отдал: {h.give} RUB • Получил: {h.get} USDT • Статус: {h.status}</div>
                  </div>
                ))}
              </div>
              <button className="btn mt-4 w-full sm:w-auto" onClick={createDemoOrder}>Создать демо-заявку</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function PhoneLogin(){
  const [step, setStep] = useState<"enter"|"code">("enter");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState<string>("");
  const [code, setCode] = useState("");

  const send = async () => {
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.length < 8) { alert('Введите корректный номер'); return; }
    try{
      const r = await fetch('/api/phone/send', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone: cleaned })
      });
      const j = await r.json();
      if(j.ok){
        setToken(j.token);
        setStep("code");
        if (j.dev && j.code) {
          // dev-режим: показываем код пользователю для теста
          alert(`DEV: ваш код ${j.code}`);
        }
      } else {
        alert(j.error || 'Ошибка отправки');
      }
    }catch(e){ alert('Сеть недоступна'); }
  };

  const verify = async () => {
    try{
      const r = await fetch('/api/phone/verify', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token, code })
      });
      const j = await r.json();
      if(j.ok){
        localStorage.setItem('phone', j.phone);
        location.href='/dashboard';
      } else {
        alert(j.error || 'Неверный код');
      }
    }catch(e){ alert('Сеть недоступна'); }
  };

  return (
    <div className="space-y-3">
      {step === "enter" ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={phone}
            onChange={e=>setPhone(e.target.value)}
            placeholder="+7 999 123-45-67"
            inputMode="tel"
            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button onClick={send} className="btn px-6">Получить код</button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={code}
            onChange={e=>setCode(e.target.value)}
            placeholder="Код из SMS"
            inputMode="numeric"
            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button onClick={verify} className="btn px-6">Подтвердить</button>
        </div>
      )}
    </div>
  );
}
