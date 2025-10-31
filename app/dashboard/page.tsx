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

  return (
    <main>
      <div className="mx-auto max-w-4xl px-4 pt-28 pb-12">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>

        {!email ? (
          <div className="card p-6 mt-4">
            <div className="text-lg mb-2">Вход по e-mail</div>
            <EmailLogin/>
            <p className="mt-3 text-sm opacity-70">
              Если почтовый провайдер не подключён, появится dev-ссылка — перейдите по ней для входа.
            </p>
          </div>
        ) : (
          <>
            <div className="card p-6 mt-4">
              <div className="text-lg mb-2">Профиль</div>
              <div className="opacity-85">E-mail: <b>{email}</b></div>
              <button className="badge mt-3" onClick={()=>{localStorage.removeItem('email'); location.reload();}}>Выйти</button>
            </div>
            <div className="card p-6 mt-4">
              <div className="text-lg mb-2">Моя реферальная ссылка</div>
              <div className="opacity-85 break-all">{refLink || '—'}</div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function EmailLogin(){
  const [email, setEmail] = useState("");
  const [devLink, setDevLink] = useState("");

  const send = async () => {
    try{
      const r = await fetch('/api/send-magic-link', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email })
      });
      const j = await r.json();
      if(j.ok){
        if (j.dev && j.link) setDevLink(j.link);
        else alert("Письмо отправлено. Проверьте почту.");
      } else {
        alert(j.error || 'Ошибка отправки');
      }
    }catch{ alert('Сеть недоступна'); }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="you@example.com"
          inputMode="email"
          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <button onClick={send} className="btn px-6">Отправить ссылку</button>
      </div>
      {devLink && (
        <div className="text-sm">
          Dev-ссылка для входа:{" "}
          <a href={devLink} className="underline break-all">{devLink}</a>
        </div>
      )}
    </div>
  );
}
