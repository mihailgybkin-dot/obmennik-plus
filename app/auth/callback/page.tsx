
'use client';
import { useEffect } from 'react';

export default function Callback(){
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if(token){
      fetch('/api/verify-token', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token })
      }).then(r=>r.json()).then(j=>{
        if(j.ok){
          localStorage.setItem('email', j.email);
          window.location.href='/dashboard';
        } else {
          alert(j.error||'Ошибка подтверждения');
        }
      }).catch(()=> alert('Сеть недоступна'));
    }
  },[]);
  return <div className="mx-auto max-w-3xl px-4 pt-28 pb-12">Подтверждаем вход…</div>;
}
