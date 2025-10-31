
import NavBar from "../components/NavBar";
import Calculator from "../components/Calculator";
import Features from "../components/Features";

export default function Page(){
  return (
    <main>
      <NavBar/>
      <section className="mx-auto max-w-6xl px-4 pt-28 pb-12">
        <div className="card p-8 mb-8">
          <h1>Обмен кэш RUB ↔ USDT TRC-20 в Краснодаре</h1>
          <p className="mt-3 text-lg opacity-90">Честные курсы, быстрые сделки, личный подход.</p>
          <div className="mt-4 flex gap-3">
            <a href="/dashboard" className="btn">Создать заявку</a>
            <a href="#rates" className="badge">К калькулятору</a>
          </div>
          <div className="mt-4 flex gap-2 text-xs opacity-75">
            <span className="badge">Курсы в реальном времени</span>
            <span className="badge">Подтверждение по email</span>
            <span className="badge">Краснодар</span>
          </div>
        </div>
        <Calculator/>
        <div className="mt-10">
          <h2 className="mb-4">Преимущества</h2>
          <Features/>
        </div>
        <div id="faq" className="mt-10 card p-6">
          <h2 className="mb-3">FAQ</h2>
          <ul className="list-disc pl-5 space-y-2 opacity-90 text-sm">
            <li>Как проходит обмен? — Создаёте заявку, получаете подтверждение, встреча в Краснодаре.</li>
            <li>Какие документы нужны? — Подтверждение личности по AML.</li>
            <li>Какая комиссия? — Отображается в калькуляторе перед заявкой.</li>
            <li>Сколько времени? — Обычно от 5 минут после подтверждения.</li>
            <li>Где именно? — Место встречи сообщаем после подтверждения заявки.</li>
          </ul>
        </div>
        <footer className="mt-12 opacity-70 text-sm pb-10">
          © 2025 «Обменник +». Курсы ориентировочные и фиксируются при создании заявки.
        </footer>
      </section>
    </main>
  );
}
