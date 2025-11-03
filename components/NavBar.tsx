"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function NavBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur bg-black/70 border-b border-white/10">
      <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-bold tracking-wide">
            ОБМЕННИК<span className="text-yellow-400"> +</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/about" className="hover:opacity-80">О нас</Link>
          <Link href="/#benefits" className="hover:opacity-80">Преимущества</Link>
          <Link href="/#faq" className="hover:opacity-80">FAQ</Link>
          <Link href="/rules" className="hover:opacity-80">Правила</Link>
          <Link href="/aml" className="hover:opacity-80">AML</Link>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://t.me/jetherofficial"
            target="_blank"
            className="px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black font-medium"
          >
            Написать в поддержку
          </a>
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/15"
          >
            Вход / Кабинет
          </Link>
        </div>
      </nav>
    </header>
  );
}
