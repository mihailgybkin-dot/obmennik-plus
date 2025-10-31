import NavBar from "../../components/NavBar";

export const metadata = { title: "О нас — Обменник +" };

export default function About(){
  return (
    <main>
      <NavBar/>
      <div className="mx-auto max-w-4xl px-4 pt-28 pb-16 space-y-8">
        <h1 className="text-4xl font-bold">О нас</h1>

        <section className="card p-6 space-y-3">
          <p>Мы — команда профессионалов с опытом в офлайн-обменах и блокчейн-операциях. Наш фокус — быстрые и прозрачные сделки в Краснодаре.</p>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="card p-6">
            <div className="text-lg font-semibold mb-1">Поддержка 24/7</div>
            <p className="opacity-85">Всегда на связи: отвечаем быстро и по делу.</p>
          </div>
          <div className="card p-6">
            <div className="text-lg font-semibold mb-1">Сделки в офисе</div>
            <p className="opacity-85">Комфортная встреча в Краснодаре. Адрес сообщаем после подтверждения заявки.</p>
          </div>
          <div className="card p-6">
            <div className="text-lg font-semibold mb-1">Быстрое подтверждение</div>
            <p className="opacity-85">Обычно 5–15 минут, курс закрепляем при подтверждении.</p>
          </div>
          <div className="card p-6">
            <div className="text-lg font-semibold mb-1">Прозрачные условия</div>
            <p className="opacity-85">Суммы и расчёты видны в калькуляторе. Никаких скрытых платежей.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
