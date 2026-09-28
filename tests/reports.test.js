import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReport, normalizePhone } from '../backend/reports.js';
import { formatReport, reportKeyboard, periodStart, telegramCall } from '../backend/telegram.js';
import { secretMatches, genCSV } from '../backend/core.js';

const standard = { type:'keluhan',target:'jurusan',category:'Akademik',title:'AC lab',description:'AC tidak berfungsi.',attachments:[] };
test('keluhan/aspirasi and legacy types accepted, contact data stripped',()=>{
  for(const type of ['keluhan','aspirasi','kritik','saran']) {
    const {data,error}=validateReport({...standard,type,name:'private',contact:'08123456789'});
    assert.equal(error,undefined); assert.equal(data.name,null); assert.equal(data.contact,null);
  }
});
test('mental health stores name separately and has no target or public name in title',()=>{
  const {data}=validateReport({type:'mental_health',name:'Dina',contact:'0812 3456 7890',description:'Saya ingin bercerita.'});
  assert.equal(data.name,'Dina'); assert.equal(data.category,'Mental Health');assert.equal(data.target,null);
  assert.equal(data.contact,'6281234567890');assert.ok(!data.title.includes('Dina'));
});
test('invalid types and malformed fields fail without throwing',()=>{
  for(const b of [null,{}, {...standard,type:'admin'}, {...standard,description:1},{...standard,title:[]},{...standard,attachments:['https://attacker.test/photo.jpg']},{...standard,attachments:{}},{type:'mental_health',description:'x',contact:'nama saja'}]) assert.ok(validateReport(b).error);
});
test('phone normalization handles international numbers, rejects mixed identity field',()=>{
  assert.equal(normalizePhone('+62 (812) 3456-7890'),'6281234567890');
  assert.equal(normalizePhone('Dina / 081234567890'),null);
});
test('notification has two formats and handles literal Markdown characters',()=>{
  const r={...standard,id:'11111111-1111-4111-8111-111111111111',status:'baru',created_at:'2026-09-28T00:00:00Z'};
  assert.match(formatReport(r),/Tujuan: jurusan/);
  const mh={...r,type:'mental_health',target:null,name:'Dina [A] _ B',contact:'6281234567890'};
  assert.match(formatReport(mh),/Nama: Dina \[A\] _ B/);assert.ok(!formatReport(mh).includes('Tujuan:'));
  for(const row of reportKeyboard(mh).inline_keyboard)for(const button of row)if(button.callback_data)assert.ok(Buffer.byteLength(button.callback_data)<=64);
  assert.ok(reportKeyboard(mh).inline_keyboard.flat().some(b=>b.url==='https://wa.me/6281234567890'));
});
test('Makassar date boundaries do not use Vercel UTC midnight',()=>{
  const now=new Date('2026-09-27T20:00:00Z'); // Monday 04:00 WITA
  assert.equal(periodStart('day',now),'2026-09-27T16:00:00.000Z');
  assert.equal(periodStart('week',now),'2026-09-27T16:00:00.000Z');
  assert.equal(periodStart('month',now),'2026-08-31T16:00:00.000Z');
});
test('empty webhook secrets never authenticate',()=>{
  assert.equal(secretMatches('',''),false);assert.equal(secretMatches('x','xx'),false);assert.equal(secretMatches('abc','abc'),true);
});
test('CSV neutralizes spreadsheet formulas',()=>assert.ok(genCSV([{title:'=1+1'}]).includes("'=1+1")));
test('Telegram rejection propagates rather than reporting success',async()=>{
  const original=globalThis.fetch,old=process.env.TELEGRAM_BOT_TOKEN;
  process.env.TELEGRAM_BOT_TOKEN='test-token';
  globalThis.fetch=async()=>({ok:false,status:400,json:async()=>({ok:false,error_code:400,description:'Bad Request'})});
  try { await assert.rejects(telegramCall('sendMessage',{text:'x'}),/Telegram menolak/); }
  finally {globalThis.fetch=original;if(old)process.env.TELEGRAM_BOT_TOKEN=old;else delete process.env.TELEGRAM_BOT_TOKEN;}
});
