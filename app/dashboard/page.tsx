"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  createdAt: string;
  from: "RUB_CASH" | "USDT_TRC20";
  to: "RUB_CASH" | "USDT_TRC20";
  amountFrom: string;
  amountTo: string;
  rate: number;
  city: string;
};

const L = (a: "RUB_CASH"|"USDT_TRC20") => a === "RUB_CASH" ? "Наличные RUB" : "USDT TRC20";

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<Row[]>([]);
  const site = typeof window !== "undefined" ? window.location.origin : "";
  const ref = useMemo(() => {
    const base = site || "https://obmennikplus.ru";
    // простая "рефка" — хэш из почты
    const code = (email || "guest").split("").reduce((a,c)=> (a*31 + c.charCodeAt(0)) % 1_000_000, 7).toString(36);
    return `${base}/r/${code}`;
  }, [email, site]);

  useEffect(() => {
    const e = localStorage.getItem("email");
    setEmail(e);
    if (e) {
      try {
        const key = `orders:${e}`;
        const list: Row[] = JSON.parse(localStorage.getItem(key) || "[]");
        setOrders(list);
      } catch { setOrders([]); }
    }
  }, []);

  return (
    <main>
      <div className="mx-auto max-w-4xl px-4 pt-28 pb-16 space-y-8">
        <h1 className="text-4xl font-bold">Личный кабинет</h1>

        <section className="card p-6">
          <div className="font-semibold mb-2">Профиль</div>
          <div className="opacity-85">E-mail: <b>{email || "не авторизован"}</b></div>
          {!email && (
            <a href="/dashboard" className="inline-block mt-3 px-3 py-1.5 rounded-md bg-white/10 border border-white/15">
              Войти
            </a>
          )}
        </section>

        <section className="card p-6">
          <div className="font-semibold mb-2">Моя реферальная ссылка</div>
          <div className="break-all">{ref}</div>
        </section>

        <section className="card p-6">
          <div className="font-semibold mb-4">История заявок</div>
          {email ? (
            orders.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left opacity-70">
                    <tr>
                      <th className="py-2 pr-4">Дата</th>
                      <th className="py-2 pr-4">ID</th>
                      <th className="py-2 pr-4">Из</th>
                      <th className="py-2 pr-4">В</th>
                      <th className="py-2 pr-4">Сумма</th>
                      <th className="py-2 pr-4">Получите</th>
                      <th className="py-2 pr-4">Курс</th>
                      <th className="py-2 pr-4">Город</th>
                    </tr>
                  </thead>
                  <tbody className="opacity-90">
                    {orders.map(o => (
                      <tr key={o.id} className="border-t border-white/10">
                        <td className="py-2 pr-4">{new Date(o.createdAt).toLocaleString("ru-RU")}</td>
                        <td className="py-2 pr-4">{o.id}</td>
                        <td className="py-2 pr-4">{L(o.from)}</td>
                        <td className="py-2 pr-4">{L(o.to)}</td>
                        <td className="py-2 pr-4">{o.amountFrom}</td>
                        <td className="py-2 pr-4">{o.amountTo}</td>
                        <td className="py-2 pr-4">{o.rate.toFixed(2)}</td>
                        <td className="py-2 pr-4">{o.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="opacity-80">Заявок пока нет.</div>
            )
          ) : (
            <div className="opacity-80">Войдите, чтобы видеть историю заявок.</div>
          )}
        </section>
      </div>
    </main>
  );
}
