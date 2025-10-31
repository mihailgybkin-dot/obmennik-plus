'use client';
import Link from "next/link";
import Logo from "./Logo";

export default function NavBar(){
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-black/40 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" aria-label="Обменник +" className="flex items-center gap-3">
          <Logo size={36} />
          <span className="sr-only">Обменник +</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/about" className="hover:opacity-80">О нас</Link>
          <a href="/#features" className="hover:opacity-80">Преимущества</a>
          <a href="/#faq" className="hover:opacity-80">FAQ</a>
          <Link href="/rules" className="hover:opacity-80">Правила</Link>
          <Link href="/aml" className="hover:opacity-80">AML</Link>
          <a href="https://t.me/mikhail_gubkin" target="_blank" className="btn">Написать в поддержку</a>
          <Link href="/dashboard" className="badge">Вход / Кабинет</Link>
        </div>

        {/* Mobile: две крупные кнопки */}
        <div className="md:hidden flex items-center gap-2">
          <a href="https://t.me/mikhail_gubkin" target="_blank" className="btn px-3 py-2 text-sm">Поддержка</a>
          <Link href="/dashboard" className="badge px-3 py-2 text-sm">Кабинет</Link>
        </div>
      </div>
    </nav>
  );
}
