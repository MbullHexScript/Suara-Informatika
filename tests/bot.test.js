import test from 'node:test';
import assert from 'node:assert/strict';
import { createBot } from '../backend/telegram.js';

function fakeDb(member,rows=[]) {
  const calls=[];
  return { calls, from(table) {
    calls.push(table);
    const query={select(){return this},eq(){return this},order(){return this},limit(){return this},gte(){return this},maybeSingle:async()=>({data:member,error:null}),then(resolve){resolve({data:rows,error:null})}};
    return query;
  }, rpc:async(name)=>{calls.push(name);return {data:true,error:null}} };
}
const message=text=>({message:{from:{id:2,first_name:'Anggota'},chat:{id:2,type:'private'},text}});
test('outsiders are asked for a token and cannot query reports',async()=>{
  const db=fakeDb(null),sent=[];
  await createBot({db,call:async(m,b)=>{sent.push([m,b]);return {message_id:1}}}).receive(message('/laporan'));
  assert.ok(!db.calls.includes('reports'));assert.match(sent[0][1].text,/Masukkan token/);
});
test('revoked users cannot use old callback buttons',async()=>{
  const db=fakeDb(null),sent=[];
  await createBot({db,call:async(m,b)=>sent.push([m,b])}).receive({callback_query:{id:'cb',from:{id:2},message:{chat:{id:2,type:'private'},message_id:2},data:'status_11111111-1111-4111-8111-111111111111_selesai'}});
  assert.ok(!db.calls.includes('bot_action'));assert.equal(sent[0][0],'answerCallbackQuery');
});
test('members cannot generate invitations',async()=>{
  const db=fakeDb({role:'member'}),sent=[];
  await createBot({db,call:async(m,b)=>sent.push([m,b])}).receive(message('/undang'));
  assert.ok(!db.calls.includes('bot_invites'));assert.match(sent[0][1].text,/Hanya pemilik/);
});
test('week menu resolves and help uses plain text (no Markdown parse failures)',async()=>{
  const db=fakeDb({role:'member'}),sent=[];
  const bot=createBot({db,call:async(m,b)=>sent.push([m,b])});
  await bot.receive(message('🗓 Minggu Ini'));assert.ok(db.calls.includes('reports'));
  await bot.receive(message('/help'));assert.equal(sent.at(-1)[1].parse_mode,undefined);
  assert.ok(sent.at(-1)[1].reply_markup.keyboard.length);
});
