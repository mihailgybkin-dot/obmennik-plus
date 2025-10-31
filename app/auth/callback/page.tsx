"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function Inner() {
  const sp = useSearchParams();
  const [msg, setMsg] = useState("Входим...");

  useEffect(() => {
    const t = sp.get("token");
    if (!t) { setMsg("Нет токена"); return; }
    (async () => {
      const r = await fetch("/api/verify-token", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ token: t })});
      const j = await r.json();
      if (j.ok && j.email) { localStorage.setItem("email", j.email); location.replace("/dashboard"); }
      else setMsg(j.error || "Ошибка входа");
    })();
  }, [sp]);

  return <div className="card p-6 text-center">{msg}</div>;
}

export default function Page() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28">
      <Suspense fallback={<div className="card p-6 text-center">Загрузка…</div>}>
        <Inner />
      </Suspense>
    </div>
  );
}
