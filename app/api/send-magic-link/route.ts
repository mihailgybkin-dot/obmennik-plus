
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export async function POST(req: Request){
  try{
    const { email } = await req.json();
    if(!email) return NextResponse.json({ ok:false, error:'Email required' }, { status:400 });
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '30m' });
    const link = `${SITE_URL}/auth/callback?token=${encodeURIComponent(token)}`;

    if(!RESEND_API_KEY){
      // Dev fallback: просто вернуть ссылку
      return NextResponse.json({ ok:true, dev:true, link, token });
    }

    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: 'login@obmennik-plus.dev', // замените после верификации домена в Resend
      to: email,
      subject: 'Ваш вход на Обменник +',
      html: `<p>Для входа нажмите: <a href="${link}">${link}</a></p><p>Или вставьте токен: <code>${token}</code></p>`
    });

    return NextResponse.json({ ok:true });
  }catch(e:any){
    return NextResponse.json({ ok:false, error: e?.message||'send error' }, { status:500 });
  }
}
