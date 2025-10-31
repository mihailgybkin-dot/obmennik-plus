import NavBar from "@/components/NavBar";

export const metadata = { title: "Правила — Обменник +" };

export default function Rules(){
  return (
    <main>
      <NavBar/>
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-16 space-y-6">
        <h1 className="text-4xl font-bold">Правила сайта</h1>
        <p className="opacity-85">Настоящие правила регулируют порядок создания заявок, обмена и взаимодействия с сервисом «Обменник +».</p>

        <div className="card p-6 space-y-3">
          <h2 className="text-xl font-semibold">1. Общие положения</h2>
          <p className="opacity-85">Сервис предназначен для лиц старше 18 лет. Используя сайт, вы подтверждаете согласие с Правилами и AML.</p>
          <h2 className="text-xl font-semibold">2. Заявки и курс</h2>
          <p className="opacity-85">Курс фиксируется при создании заявки и действует ограниченное время. Обмены проводятся в г. Краснодар, в офисе сервиса.</p>
          <h2 className="text-xl font-semibold">3. Лимиты и сроки</h2>
          <p className="opacity-85">Лимиты и время обработки обсуждаются с оператором при подтверждении заявки.</p>
          <h2 className="text-xl font-semibold">4. Ответственность</h2>
          <p className="opacity-85">Сервис не несёт ответственности за задержки третьих сторон и технические сбои, не зависящие от нас.</p>
          <h2 className="text-xl font-semibold">5. Персональные данные</h2>
          <p className="opacity-85">Данные используются строго для обработки заявок и не передаются третьим лицам, за исключением случаев, предусмотренных законом.</p>
        </div>

        <p className="text-sm opacity-70">Актуально с: {new Date().toLocaleDateString("ru-RU")}</p>
      </div>
    </main>
  );
}
