
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export async function POST(req: Request){
  try{
    const { token } = await req.json();
    if(!token) return NextResponse.json({ ok:false, error:'Token required' }, { status:400 });
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return NextResponse.json({ ok:true, email: payload.email });
  }catch(e:any){
    return NextResponse.json({ ok:false, error: e?.message||'verify error' }, { status:400 });
  }
}
