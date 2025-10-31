export const metadata = { title: "Правила — Обменник +" };

export default function Rules(){
  const today = new Date().toLocaleDateString("ru-RU");
  return (
    <main>
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-16 space-y-6">
        <h1 className="text-4xl font-bold">Правила сайта</h1>
        <p className="opacity-85">
          Настоящие правила регулируют порядок создания заявок, обмена и взаимодействия с сервисом «Обменник +».
        </p>

        <div className="card p-6 space-y-4">
          <section>
            <h2 className="text-xl font-semibold">1. Общие положения</h2>
            <ul className="list-disc pl-5 opacity-85 space-y-2">
              <li>Сервис предназначен только для лиц старше 18 лет.</li>
              <li>Используя сайт, вы подтверждаете согласие с Правилами и AML-политикой.</li>
              <li>Обмены проводятся в г. Краснодар в офисе сервиса по договорённости.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Заявки и курс</h2>
            <ul className="list-disc pl-5 opacity-85 space-y-2">
              <li>Курс и расчёт видны в калькуляторе. Окончательная фиксация курса — при подтверждении заявки оператором.</li>
              <li>Срок действия зафиксированного курса ограничен и сообщается при подтверждении.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Лимиты и сроки</h2>
            <ul className="list-disc pl-5 opacity-85 space-y-2">
              <li>Лимиты зависят от направления обмена и согласуются индивидуально.</li>
              <li>Подтверждение заявки обычно занимает 5–15 минут.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Запрещённые операции</h2>
            <ul className="list-disc pl-5 opacity-85 space-y-2">
              <li>Операции, нарушающие законодательство РФ, и иные запреты.</li>
              <li>Сервис вправе отказать в обслуживании при выявлении рисков.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Персональные данные</h2>
            <ul className="list-disc pl-5 opacity-85 space-y-2">
              <li>Данные используются только для обработки заявок и не передаются третьим лицам, кроме случаев, предусмотренных законом.</li>
              <li>Срок и способ хранения информации определяются внутренними регламентами сервиса.</li>
            </ul>
          </section>
        </div>

        <div className="space-y-1 text-sm opacity-75">
          <div>Сайт не предоставляет возможности зачисления иностранной валюты на счета валютных резидентов РФ.</div>
          <div>Сайт не проводит операции с ЦФА для физ. лиц на территории РФ.</div>
          <div>Сайт предназначен только для лиц старше 18 лет.</div>
        </div>

        <p className="text-sm opacity-70">Актуально с: {today}</p>
      </div>
    </main>
  );
}
