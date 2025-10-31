"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthCallback(){
  const sp = useSearchParams();
  const [msg, setMsg] = useState("Входим...");

  useEffect(()=>{
    const t = sp.get("token");
    if (!t) { setMsg("Нет токена"); return; }
    (async ()=>{
      try{
        const r = await fetch("/api/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t })
        });
        const j = await r.json();
        if (j.ok && j.email) {
          localStorage.setItem("email", j.email);
          window.location.replace("/dashboard");
        } else {
          setMsg(j.error || "Ошибка входа");
        }
      }catch{
        setMsg("Сеть недоступна");
      }
    })();
  }, [sp]);

  return (
    <div className="mx-auto max-w-md px-4 pt-28">
      <div className="card p-6 text-center">{msg}</div>
    </div>
  );
}
