import test from 'node:test';
import assert from 'node:assert/strict';
import reports from '../api/reports/index.js';
import detail from '../api/reports/[id].js';
import track from '../api/track/[id].js';
import webhook from '../api/telegram/webhook.js';

function response() {
  return { code:0,body:null, status(n){this.code=n;return this},setHeader(){return this},end(text){this.body=text?JSON.parse(text):null} };
}
test('public detail endpoint cannot expose private reports',async()=>{
  const res=response();
  await detail({method:'GET',headers:{},query:{id:'11111111-1111-4111-8111-111111111111'}},res);
  assert.equal(res.code,401);
});
test('webhook rejects missing secret even if no secret is configured',async()=>{
  const previous=process.env.TELEGRAM_WEBHOOK_SECRET;delete process.env.TELEGRAM_WEBHOOK_SECRET;
  try {const res=response();await webhook({method:'POST',headers:{},body:{}},res);assert.equal(res.code,403)}
  finally {if(previous)process.env.TELEGRAM_WEBHOOK_SECRET=previous;}
});
test('report save failure, durable notification path, and public mental-health projection',async()=>{
  const originalFetch=globalThis.fetch,oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL='https://supabase.test';process.env.SUPABASE_SERVICE_ROLE_KEY='test-service-key';
  const id='11111111-1111-4111-8111-111111111111';
  const body={type:'mental_health',name:'Private Name',contact:'081234567890',description:'Private story',attachments:[]};
  let failure=false,deliveryChecked=false,inserted;
  globalThis.fetch=async(input,init)=>{
    const url=String(input);
    if(url.includes('consume_request_limit'))return Response.json(true);
    if(url.includes('claim_notification_jobs')){await new Promise(r=>setTimeout(r,10));deliveryChecked=true;return Response.json([])}
    if(init.method==='POST'&&url.includes('/reports')) {
      inserted=JSON.parse(init.body);
      return failure ? Response.json({code:'TEST_FAILURE',message:'Database unavailable'},{status:400}) : Response.json({id});
    }
    if(url.includes('/reports'))return Response.json({id,type:'mental_health',category:'Private Name',title:'Private Name',target:null,status:'baru',created_at:'2026-09-29',updated_at:'2026-09-29'});
    throw new Error('Unexpected request in test');
  };
  try {
    let res=response();
    await reports({method:'POST',headers:{},body},res);
    assert.equal(res.code,201);assert.equal(deliveryChecked,true);assert.equal(inserted.name,'Private Name');
    assert.equal(inserted.category,'Mental Health');assert.equal(res.body.id,id);
    failure=true;res=response();await reports({method:'POST',headers:{},body},res);
    assert.equal(res.code,503);assert.equal(res.body.details,undefined);assert.ok(res.body.reference);
    res=response();await track({method:'GET',headers:{},query:{id}},res);
    assert.equal(res.code,200);assert.equal(res.body.category,'Mental Health');assert.equal(res.body.title,'Konsultasi Mental Health');assert.ok(!JSON.stringify(res.body).includes('Private Name'));
  } finally {
    globalThis.fetch=originalFetch;
    if(oldUrl)process.env.SUPABASE_URL=oldUrl;else delete process.env.SUPABASE_URL;
    if(oldKey)process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
});
