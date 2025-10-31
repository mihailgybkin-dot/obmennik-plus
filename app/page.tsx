import NavBar from "@/components/NavBar";
import Calculator from "@/components/Calculator";

export const metadata = { title: "Обменник + — быстро. просто. с плюсом." };

export default function Home() {
  return (
    <main>
      <NavBar />

      {/* Hero */}
      <section className="pt-28 pb-10 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          <span className="inline-flex items-end gap-2">
            <span className="uppercase">Обменник</span>
            <span className="text-yellow-400 relative -mb-1 text-6xl sm:text-7xl leading-none">+</span>
          </span>
        </h1>
        <p className="mt-3 text-lg opacity-90">
          <span className="uppercase tracking-wider">БЫСТРО. ПРОСТО. С ПЛЮСОМ</span>
          <span className="text-yellow-400"> +</span>
        </p>
      </section>

      {/* Calculator */}
      <section className="mx-auto max-w-4xl px-4">
        <Calculator />
      </section>

      {/* Преимущества */}
      <section id="benefits" className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-3xl font-bold mb-6">Преимущества</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            ["Поддержка 24/7", "Всегда на связи в Telegram и на почте."],
            ["Сделки в офисе", "Комфортная встреча в Краснодаре."],
            ["Быстрое подтверждение", "Обычно 5–15 минут до фиксации курса."],
            ["Прозрачные условия", "Курс и сумма понятны до встречи. Без скрытых платежей."],
            ["Реферальная программа", "Приводите друзей — получайте бонусы."],
            ["Конфиденциальность", "Данные используются только для обработки заявок."],
          ].map(([t, d]) => (
            <div key={t} className="card p-6">
              <div className="text-lg font-semibold mb-1">{t}</div>
              <p className="opacity-85">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="text-3xl font-bold mb-6">FAQ</h2>
        <details className="card p-4 mb-3">
          <summary className="cursor-pointer font-medium">Как фиксируется курс?</summary>
          <div className="mt-2 opacity-85">
            Предварительный расчёт вы видите в калькуляторе. Окончательная фиксация — при подтверждении заявки оператором.
          </div>
        </details>
        <details className="card p-4 mb-3">
          <summary className="cursor-pointer font-medium">Где проходит обмен?</summary>
          <div className="mt-2 opacity-85">В нашем офисе в Краснодаре. Адрес сообщаем после подтверждения.</div>
        </details>
        <details className="card p-4">
          <summary className="cursor-pointer font-medium">Нужна ли верификация?</summary>
          <div className="mt-2 opacity-85">При необходимости — по AML/KYT требованиям см. раздел «AML».</div>
        </details>

        <div className="text-xs opacity-60 mt-8 space-y-1">
          <div>Сайт не предоставляет возможности зачисления иностранной валюты на счета валютных резидентов РФ.</div>
          <div>Сайт не проводит операции с ЦФА для физ. лиц на территории РФ.</div>
          <div>Сайт предназначен только для лиц старше 18 лет.</div>
        </div>
      </section>
    </main>
  );
}
