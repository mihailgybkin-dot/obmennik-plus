
'use client';
import { useEffect, useMemo, useState } from 'react';
import { refCodeFromEmail } from '../../lib';

function getEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('email') || null;
}

export default function Dashboard(){
  const [email, setEmail] = useState<string | null>(null);
  useEffect(()=>{ setEmail(getEmail()); }, []);

  const refLink = useMemo(()=>{
    if(!email) return '';
    const code = refCodeFromEmail(email);
    return `${window.location.origin}/r/${code}`;
  }, [email]);

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
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-12">
      <h1>Личный кабинет</h1>
      {!email ? (
        <div className="card p-6 mt-4">
          <div className="text-lg mb-2">Вход по email</div>
          <EmailLogin/>
          <p className="mt-3 text-sm opacity-70">Подтвердите почту и получите доступ к истории и рефералке. (MVP демо: хранение локально в браузере)</p>
        </div>
      ) : (
        <>
          <div className="card p-6 mt-4">
            <div className="text-lg mb-2">Профиль</div>
            <div className="opacity-85">Email: <b>{email}</b></div>
            <button className="badge mt-3" onClick={()=>{localStorage.removeItem('email'); location.reload();}}>Выйти</button>
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
            <button className="btn mt-4" onClick={createDemoOrder}>Создать демо-заявку</button>
          </div>
        </>
      )}
    </div>
  );
}

function EmailLogin(){
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState('');

  const send = async () => {
    try{
      const r = await fetch('/api/send-magic-link', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email })
      });
      const j = await r.json();
      if(j.ok){ setSent(true); }
      else alert(j.error||'Ошибка отправки');
    }catch(e){ alert('Ошибка сети'); }
  };
  const verify = async () => {
    try{
      const r = await fetch('/api/verify-token', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token })
      });
      const j = await r.json();
      if(j.ok){
        localStorage.setItem('email', j.email);
        location.href='/dashboard';
      } else alert(j.error||'Неверный токен');
    }catch(e){ alert('Ошибка сети'); }
  };

  return (
    <div>
      {!sent ? (
        <div className="flex gap-2">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-400" />
          <button onClick={send} className="btn">Отправить ссылку</button>
        </div>
      ) : (
        <div className="space-y-2">
          <div>Мы отправили письмо с magic‑ссылкой. Либо введите токен вручную:</div>
          <input value={token} onChange={e=>setToken(e.target.value)} placeholder="Вставьте токен" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-400" />
          <button onClick={verify} className="btn">Подтвердить</button>
        </div>
      )}
    </div>
  );
}
