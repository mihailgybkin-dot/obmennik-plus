'use client';
import Link from "next/link";

export default function NavBar(){
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-black/40 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="logo">
          <span className="brand">Обменник</span><span className="plus">+</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/about" className="hover:opacity-80">О нас</Link>
          <a href="#features" className="hover:opacity-80">Преимущества</a>
          <a href="#faq" className="hover:opacity-80">FAQ</a>
          <Link href="/rules" className="hover:opacity-80">Правила</Link>
          <Link href="/aml" className="hover:opacity-80">AML</Link>
          <a href="https://t.me/mikhail_gubkin" target="_blank" className="badge">Telegram: @mikhail_gubkin</a>
          <Link href="/dashboard" className="btn">Вход / Кабинет</Link>
        </div>
      </div>
    </nav>
  );
}
