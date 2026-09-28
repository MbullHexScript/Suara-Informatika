import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('PostgreSQL migrations, invitation redemption, authorization, outbox and leases',async()=>{
  const db=new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth;
      create table auth.users(id uuid primary key); create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid);`);
    for(const migration of ['001_initial.sql','002_mental_health.sql','003_bot_members_and_delivery.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+migration,import.meta.url),'utf8'));
    await db.exec("insert into bot_members(telegram_id,chat_id,role) values('1','1','owner'); insert into bot_destinations values('1',true);");
    await db.exec("insert into bot_invites(token_hash,created_by) values('hash-a','1');");
    const redeem=(user,hash='hash-a')=>db.query('select redeem_bot_invite($1,$2,$2,$3) as ok',[hash,user,'Anggota']);
    const results=await Promise.all([redeem('2'),redeem('3')]);
    assert.equal(results.filter(r=>r.rows[0].ok).length,1,'one token binds exactly one user');
    const winner=results[0].rows[0].ok?'2':'3',loser=winner==='2'?'3':'2';
    assert.equal((await redeem(winner)).rows[0].ok,false,'used token cannot be consumed again');
    await db.exec("insert into bot_invites(token_hash,created_by,expires_at) values('expired','1',now()-interval '1 day'); insert into bot_invites(token_hash,created_by,revoked) values('revoked','1',true)");
    assert.equal((await redeem(loser,'expired')).rows[0].ok,false);
    assert.equal((await redeem(loser,'revoked')).rows[0].ok,false);
    const report=(await db.query("insert into reports(type,target,category,title,description,name,contact) values('mental_health',null,'Mental Health','Konsultasi Mental Health','Cerita','Dina','6281234567890') returning id")).rows[0];
    assert.equal((await db.query('select * from notification_jobs')).rows.length,2,'owner legacy chat deduplicated; member receives job');
    const first=await db.query('select * from claim_notification_jobs(null,1)');
    const second=await db.query('select * from claim_notification_jobs(null,20)');
    assert.notEqual(first.rows[0].id,second.rows[0].id,'jobs cannot be claimed twice during lease');
    assert.equal((await db.query('select * from claim_notification_jobs(null,20)')).rows.length,0);
    await db.query("select bot_action($1,'status',$2,'diproses')",[winner,report.id]);
    assert.equal((await db.query('select status from reports where id=$1',[report.id])).rows[0].status,'diproses');
    await db.query("select bot_action($1,'notes',$2,'Sudah dihubungi')",[winner,report.id]);
    await assert.rejects(db.query("select bot_action($1,'revoke_member','1','')",[winner]),/Access denied/);
    await db.query("select bot_action('1','revoke_member',$1,'')",[winner]);
    await assert.rejects(db.query("select bot_action($1,'status',$2,'selesai')",[winner,report.id]),/Access denied/);
    assert.equal((await redeem(winner)).rows[0].ok,false,'revocation does not reactivate spent token');
    assert.equal((await db.query('select state from notification_jobs where chat_id=$1',[winner])).rows[0].state,'cancelled');
    assert.equal((await db.query('select * from bot_audit_logs')).rows.length,4);
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from reports'),/permission denied/);
    await assert.rejects(db.query("select redeem_bot_invite('hash-a','4','4','x')"),/permission denied/);
    await db.exec('reset role');
    assert.equal((await db.query('select claim_bot_update(123) as ok')).rows[0].ok,true);
    assert.equal((await db.query('select claim_bot_update(123) as ok')).rows[0].ok,false);
  } finally { await db.close(); }
});
