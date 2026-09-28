import test from 'node:test';
import assert from 'node:assert/strict';
import { drainNotifications } from '../backend/telegram.js';

function database(jobs, members) {
  const changes=[];
  return { changes, rpc:async()=>({data:jobs,error:null}),from(table) {
    const filters={}; let patch;
    const q={select(){return this},update(value){patch=value;return this},eq(k,v){filters[k]=v;return this},
      async maybeSingle(){return {data:table==='bot_members'?members[filters.chat_id]:null,error:null}},
      async single(){return {data:{id:filters.id,type:'keluhan',target:'jurusan',category:'Akademik',title:'Test',description:'Test',status:'baru',created_at:'2026-09-29'},error:null}},
      then(resolve){changes.push({table,filters,patch});resolve({data:null,error:null})}};
    return q;
  }};
}
test('a failed recipient does not stop other recipients; retry retains lease guard',async()=>{
  const jobs=[{id:1,chat_id:'1',report_id:'a',lock_token:'lease-1',attempts:1},{id:2,chat_id:'2',report_id:'a',lock_token:'lease-2',attempts:1},{id:3,chat_id:'3',report_id:'a',lock_token:'lease-3',attempts:1}];
  const db=database(jobs,{'1':{active:true},'2':{active:true},'3':{active:false}});
  const sent=[];
  await drainNotifications(db,null,async(method,body)=>{
    sent.push(body.chat_id);
    if(body.chat_id==='1'){const e=new Error('Rate limited');e.code=429;e.retryAfter=120;throw e}
    return {message_id:45};
  });
  assert.deepEqual(sent,['1','2']);
  const states=Object.fromEntries(db.changes.map(c=>[c.filters.id,c.patch.state]));
  assert.deepEqual(states,{1:'pending',2:'sent',3:'cancelled'});
  assert.ok(db.changes.every(c=>c.filters.lock_token==='lease-'+c.filters.id && c.filters.state==='sending'));
});
test('blocked recipient marked permanently failed instead of retrying forever',async()=>{
  const db=database([{id:1,chat_id:'1',report_id:'a',lock_token:'lease',attempts:1}],{'1':{active:true}});
  await drainNotifications(db,null,async()=>{const e=new Error('Blocked');e.code=403;throw e});
  assert.equal(db.changes[0].patch.state,'failed');
});
