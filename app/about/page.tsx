export const metadata = { title: "О нас — Обменник +" };

export default function About(){
  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-16 space-y-8">
      <h1 className="text-4xl font-bold">О нас</h1>

      <section className="card p-6 space-y-3">
        <p>Мы — команда профессионалов с опытом в офлайн-обменах и блокчейн-операциях. Наш фокус — безопасные и быстрые сделки в Краснодаре с прозрачными условиями.</p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="text-lg font-semibold mb-1">Поддержка 24/7</div>
          <p className="opacity-85">Отвечаем в Telegram и на почте, помогаем с заявками и уточнениями в любое время.</p>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold mb-1">Сделки в офисе</div>
          <p className="opacity-85">Встречи проходят в нашем офисе в Краснодаре — комфортно и безопасно.</p>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold mb-1">Быстро и аккуратно</div>
          <p className="opacity-85">Обычно подтверждаем заявку в течение 5–15 минут и закрепляем курс.</p>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold mb-1">Прозрачные условия</div>
          <p className="opacity-85">Курс и сумма понятны до встречи. Никаких скрытых платежей.</p>
        </div>
      </section>
    </div>
  );
}
