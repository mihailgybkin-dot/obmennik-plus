
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const SRC = 'https://www.bestchange.ru/cash-ruble-to-tether-trc20-in-krasn.html';

export const dynamic = 'force-dynamic';

export async function GET(){
  try{
    const res = await fetch(SRC, { headers: { 'user-agent':'Mozilla/5.0' }, cache:'no-store' });
    const html = await res.text();
    const $ = cheerio.load(html);

    // Пробуем найти первую строку таблицы курсов:
    // Структуры BestChange меняются, поэтому fallback: регулярки по числам.
    let rubToUsdt = 0;
    let usdtToRub = 0;

    // Первое числовое значение в строке похоже на курс RUB->USDT (сколько USDT за 1 RUB)
    // и обратный курс может быть отражён иначе. В целях MVP считаем взаимно обратными.
    const firstRowText = $('table, .table, #content').first().text();
    const nums = (firstRowText.match(/\d+[\.,]?\d*/g) || []).map(s=>parseFloat(s.replace(',','.')));
    if(nums.length>0){
      // Грубая эвристика: берём число, похожее на 0.0xxx.. (USDT за 1 RUB)
      const candidate = nums.find(n=> n>0 && n<1) || (1 / (nums.find(n=> n>10 && n<1000) || 100));
      rubToUsdt = candidate || 0.01;
      usdtToRub = rubToUsdt>0 ? (1 / rubToUsdt) : 100;
    } else {
      rubToUsdt = 0.01;
      usdtToRub = 100;
    }

    return NextResponse.json({
      rubToUsdt,
      usdtToRub,
      updatedAt: new Date().toISOString(),
      source: 'BestChange (первая строка)'
    });
  }catch(e:any){
    return NextResponse.json({
      rubToUsdt: 0.01,
      usdtToRub: 100,
      updatedAt: new Date().toISOString(),
      source: 'fallback (ошибка парсинга)',
      error: e?.message || 'parse error'
    }, { status: 200 });
  }
}
