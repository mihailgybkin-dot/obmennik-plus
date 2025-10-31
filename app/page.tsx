import Calculator from "../components/Calculator";
import Features from "../components/Features";
import FAQ from "../components/FAQ";

export default function Page(){
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pt-28 pb-12">
        {/* Центральная надпись */}
        <div className="text-center mb-10">
          <div className="font-extrabold tracking-tight">
            <span className="text-5xl sm:text-6xl text-white">Обменник</span>
            <span className="text-5xl sm:text-6xl text-[#F5C84B]"> +</span>
          </div>
          <div className="mt-3 text-xl opacity-90">
            БЫСТРО. ПРОСТО. С ПЛЮСОМ<span className="text-[#F5C84B]"> +</span>
          </div>
        </div>

        <Calculator/>

        <div className="mt-12" id="features">
          <h2 className="mb-4">Преимущества</h2>
          <Features/>
        </div>

        <div id="faq" className="mt-10 card p-6">
          <h2 className="mb-3">FAQ</h2>
          <FAQ/>
        </div>

        <footer className="mt-12 opacity-80 text-sm pb-10 space-y-1">
          <div>© {new Date().getFullYear()} «Обменник +». Все права защищены.</div>
          <div>Сайт не предоставляет возможности зачисления иностранной валюты на счета валютных резидентов РФ.</div>
          <div>Сайт не проводит операции с ЦФА для физ. лиц на территории РФ.</div>
          <div>Сайт предназначен только для лиц старше 18 лет.</div>
        </footer>
      </section>
    </main>
  );
}
