import NavBar from "../components/NavBar";
import Calculator from "../components/Calculator";
import Features from "../components/Features";
import FAQ from "../components/FAQ";
import Logo from "../components/Logo";

export default function Page(){
  return (
    <main>
      <NavBar/>
      <section className="mx-auto max-w-6xl px-4 pt-28 pb-12">
        {/* Герой: большой логотип O⁺ и слоган */}
        <div className="text-center mb-10">
          <div className="inline-block">
            <Logo size={140} />
          </div>
          <div className="mt-3 text-xl opacity-90">— быстро. просто. в Краснодаре.</div>
        </div>

        {/* Калькулятор */}
        <Calculator/>

        {/* Преимущества */}
        <div className="mt-12" id="features">
          <h2 className="mb-4">Преимущества</h2>
          <Features/>
        </div>

        {/* FAQ-аккордеон */}
        <div id="faq" className="mt-10 card p-6">
          <h2 className="mb-3">FAQ</h2>
          <FAQ/>
        </div>

        {/* Футер и юридические строки */}
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
