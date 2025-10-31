import "./globals.css";
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Обменник +",
  description: "БЫСТРО. ПРОСТО. С ПЛЮСОМ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        <NavBar /> {/* всегда закреплённая панель */}
        {children}
      </body>
    </html>
  );
}
