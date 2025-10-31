'use client';
import { useState } from "react";

const QA = [
  { q: "Как проходит обмен?", a: "Вы создаёте заявку, мы подтверждаем курс и время встречи в офисе в Краснодаре." },
  { q: "Какие сроки?", a: "Подтверждение обычно за 5–15 минут. Время встречи — по согласованию." },
  { q: "Какие лимиты?", a: "Лимиты зависят от направления и оговариваются при подтверждении заявки." },
  { q: "Где именно офис?", a: "Адрес сообщаем после подтверждения заявки для безопасности." },
];

export default function FAQ(){
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-white/10">
      {QA.map((row, i)=>(
        <div key={i} className="py-3">
          <button className="w-full text-left flex justify-between items-center" onClick={()=>setOpen(open===i?null:i)}>
            <span className="font-medium">{row.q}</span>
            <span className="badge">{open===i? "—" : "+"}</span>
          </button>
          {open===i && <div className="mt-2 opacity-85 text-sm">{row.a}</div>}
        </div>
      ))}
    </div>
  );
}
