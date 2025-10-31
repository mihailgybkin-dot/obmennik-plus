import NavBar from "@/components/NavBar";

export const metadata = { title: "AML — Обменник +" };

export default function AML(){
  return (
    <main>
      <NavBar/>
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
        <h1 className="text-4xl font-bold">AML / KYC политика</h1>
        <div className="card p-6 space-y-3 mt-6">
          <p className="opacity-85">Опишите процедуры верификации, источники средств, список запрещённых операций, основания отказа в обслуживании, хранение записей и отчётность.</p>
          <ul className="list-disc pl-5 space-y-2 opacity-85">
            <li>KYC: проверка личности клиента.</li>
            <li>Мониторинг транзакций и пороговые суммы.</li>
            <li>Запрещённые юрисдикции и виды деятельности.</li>
            <li>Отслеживание подозрительных операций.</li>
            <li>Порядок блокировки/отказа.</li>
          </ul>
          <p className="text-sm opacity-70">Актуально с: {new Date().toLocaleDateString("ru-RU")}</p>
        </div>
      </div>
    </main>
  );
}
