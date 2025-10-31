export default function Features(){
  const items = [
    {title:'Поддержка 24/7', text:'Всегда на связи в Telegram и на почте.'},
    {title:'Сделки в офисе', text:'Комфортная встреча в Краснодаре, без очередей.'},
    {title:'Быстрое подтверждение', text:'Обычно от 5–15 минут до фиксации курса.'},
    {title:'Прозрачные условия', text:'Сумма и курс понятны до встречи, без скрытых платежей.'},
    {title:'Реферальная программа', text:'Приглашайте друзей — получайте бонусы.'},
    {title:'Конфиденциальность', text:'Данные используются только для обработки заявок.'},
  ];
  return (
    <section className="grid md:grid-cols-3 gap-4">
      {items.map((it, i)=> (
        <div key={i} className="card p-5">
          <div className="text-lg font-semibold mb-1">{it.title}</div>
          <div className="opacity-85 text-sm">{it.text}</div>
        </div>
      ))}
    </section>
  );
}
