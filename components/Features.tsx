
export default function Features(){
  const items = [
    {title:'Безопасность на уровне банка', text:'Шифрование, ручная модерация сделок.'},
    {title:'Быстрая обработка', text:'Заявки обрабатываем от 5 минут.'},
    {title:'Реальные курсы', text:'Обновление в реальном времени с BestChange (первая строка).'},
    {title:'Личный подход', text:'Сделки лично в Краснодаре, подтверждение личности.'},
    {title:'Прозрачная комиссия', text:'Без скрытых платежей, всё видно в калькуляторе.'},
    {title:'Реферальная программа', text:'Делись ссылкой — получай бонусы.'},
  ];
  return (
    <section id="features" className="grid md:grid-cols-3 gap-4">
      {items.map((it, i)=> (
        <div key={i} className="card p-5">
          <div className="text-lg font-semibold mb-1">{it.title}</div>
          <div className="opacity-80 text-sm">{it.text}</div>
        </div>
      ))}
    </section>
  );
}
