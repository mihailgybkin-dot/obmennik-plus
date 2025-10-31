
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Обменник + — Краснодар",
  description: "Обмен кэш RUB ↔ USDT TRC-20 в Краснодаре. Быстро. Честно. С реальными курсами.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
