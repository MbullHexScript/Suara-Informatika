-- Run AFTER 002 has committed. No existing reports are deleted.
begin;
alter table public.reports add column if not exists name text;
alter table public.reports add column if not exists contact text;
alter table public.reports alter column target drop not null;

create table if not exists public.web_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.web_admins enable row level security;
drop policy if exists "Public can insert reports" on public.reports;
drop policy if exists "Authenticated can select all reports" on public.reports;
drop policy if exists "Authenticated can update reports" on public.reports;
-- All report access now goes through authenticated server endpoints.
revoke all on public.reports from anon, authenticated;

create table if not exists public.bot_members (
  telegram_id text primary key check (telegram_id ~ '^[0-9]+$'),
  chat_id text not null,
  display_name text not null default '',
  role text not null default 'member' check (role in ('owner','member')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.bot_destinations (
  chat_id text primary key,
  active boolean not null default true
);
create table if not exists public.bot_invites (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null,
  created_by text not null references public.bot_members(telegram_id),
  expires_at timestamptz not null default now() + interval '7 days',
  redeemed_by text references public.bot_members(telegram_id),
  redeemed_at timestamptz,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.bot_audit_logs (
  id bigint generated always as identity primary key,
  actor text not null,
  action text not null,
  target text,
  created_at timestamptz not null default now()
);
create table if not exists public.request_limits (
  key text primary key,
  attempts int not null,
  resets_at timestamptz not null
);
create table if not exists public.bot_updates (
  update_id bigint primary key,
  done boolean not null default false,
  locked_until timestamptz not null default now() + interval '2 minutes'
);
create table if not exists public.notification_jobs (
  id bigint generated always as identity primary key,
  report_id uuid not null references public.reports(id) on delete cascade,
  chat_id text not null,
  state text not null default 'pending' check (state in ('pending','sending','sent','failed','cancelled')),
  attempts int not null default 0,
  next_attempt_at timestamptz not null default now(),
  locked_until timestamptz,
  lock_token uuid,
  message_id bigint,
  last_error text,
  unique(report_id, chat_id)
);
create index if not exists notification_jobs_pending_idx on public.notification_jobs(state, next_attempt_at);
alter table public.bot_members enable row level security;
alter table public.bot_destinations enable row level security;
alter table public.bot_invites enable row level security;
alter table public.bot_audit_logs enable row level security;
alter table public.request_limits enable row level security;
alter table public.bot_updates enable row level security;
alter table public.notification_jobs enable row level security;
revoke all on public.web_admins, public.bot_members, public.bot_destinations, public.bot_invites, public.bot_audit_logs, public.request_limits, public.bot_updates, public.notification_jobs from anon, authenticated;
grant all on public.reports, public.web_admins, public.bot_members, public.bot_destinations, public.bot_invites, public.bot_audit_logs, public.request_limits, public.bot_updates, public.notification_jobs to service_role;
grant usage, select on sequence public.bot_audit_logs_id_seq, public.notification_jobs_id_seq to service_role;

create or replace function public.consume_request_limit(p_key text, p_limit int, p_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into request_limits values (p_key, 1, now() + make_interval(secs => p_seconds))
  on conflict (key) do update set
    attempts = case when request_limits.resets_at <= now() then 1 else request_limits.attempts + 1 end,
    resets_at = case when request_limits.resets_at <= now() then excluded.resets_at else request_limits.resets_at end
  returning attempts into n;
  return n <= p_limit;
end; $$;

create or replace function public.redeem_bot_invite(p_hash text, p_user text, p_chat text, p_name text)
returns boolean language plpgsql security definer set search_path = public as $$
declare invitation bot_invites%rowtype;
begin
  -- Same account cannot consume two invitations concurrently.
  perform pg_advisory_xact_lock(hashtextextended(p_user, 0));
  if p_user <> p_chat or p_user !~ '^[0-9]+$' then return false; end if;
  if not consume_request_limit('invite:' || p_user, 5, 900) then return false; end if;
  if exists(select 1 from bot_members where telegram_id=p_user and active) then return false; end if;
  select * into invitation from bot_invites where token_hash=p_hash for update;
  if not found or invitation.revoked or invitation.redeemed_by is not null or invitation.expires_at <= now() then return false; end if;
  insert into bot_members(telegram_id, chat_id, display_name) values(p_user, p_chat, left(p_name,100))
  on conflict(telegram_id) do update set active=true, chat_id=excluded.chat_id, display_name=excluded.display_name;
  update bot_invites set redeemed_by=p_user, redeemed_at=now() where id=invitation.id;
  insert into bot_audit_logs(actor, action, target) values(p_user,'invite_redeemed',invitation.id::text);
  return true;
end; $$;

create or replace function public.bot_action(p_actor text, p_action text, p_target text, p_value text default '')
returns jsonb language plpgsql security definer set search_path = public as $$
declare member bot_members%rowtype; r reports%rowtype;
begin
  select * into member from bot_members where telegram_id=p_actor and active for share;
  if not found then raise exception 'Access denied'; end if;
  if p_action='status' then
    if p_value not in ('baru','diproses','selesai','ditolak') then raise exception 'Invalid status'; end if;
    update reports set status=p_value::report_status where id=p_target::uuid returning * into r;
    if not found then raise exception 'Report not found'; end if;
  elsif p_action='notes' then
    if length(trim(p_value)) not between 1 and 2000 then raise exception 'Invalid note'; end if;
    update reports set admin_notes=p_value where id=p_target::uuid returning * into r;
    if not found then raise exception 'Report not found'; end if;
  elsif p_action='revoke_member' and member.role='owner' then
    update bot_members set active=false where telegram_id=p_target and role <> 'owner';
    if not found then raise exception 'Member not found'; end if;
    update notification_jobs set state='cancelled' where chat_id=p_target and state in ('pending','sending');
  elsif p_action='revoke_invite' and member.role='owner' then
    update bot_invites set revoked=true where id=p_target::uuid and redeemed_by is null;
    if not found then raise exception 'Invitation not found'; end if;
  else raise exception 'Access denied'; end if;
  insert into bot_audit_logs(actor, action, target) values(p_actor,p_action,p_target);
  return to_jsonb(r);
end; $$;

create or replace function public.enqueue_report_notifications()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into notification_jobs(report_id,chat_id)
  select new.id, chat_id from (
    select chat_id from bot_members where active
    union select chat_id from bot_destinations where active
  ) recipients on conflict do nothing;
  return new;
end; $$;
drop trigger if exists enqueue_report_notifications on public.reports;
create trigger enqueue_report_notifications after insert on public.reports
for each row execute function public.enqueue_report_notifications();

create or replace function public.claim_notification_jobs(p_report uuid default null, p_limit int default 12)
returns setof notification_jobs language plpgsql security definer set search_path = public as $$
begin
  return query
  update notification_jobs j set state='sending', attempts=j.attempts+1,
    lock_token=gen_random_uuid(), locked_until=now()+interval '2 minutes'
  where j.id in (
    select q.id from notification_jobs q where
      (q.state='pending' and q.next_attempt_at<=now() or q.state='sending' and q.locked_until<now())
      and (p_report is null or q.report_id=p_report)
    order by q.id for update skip locked limit least(greatest(p_limit,1),20)
  ) returning j.*;
end; $$;

create or replace function public.claim_bot_update(p_id bigint)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into bot_updates(update_id) values(p_id) on conflict(update_id) do update
    set locked_until=now()+interval '2 minutes'
    where not bot_updates.done and bot_updates.locked_until<now();
  get diagnostics n=row_count;
  return n=1;
end; $$;

revoke all on function public.consume_request_limit(text,int,int), public.redeem_bot_invite(text,text,text,text), public.bot_action(text,text,text,text), public.claim_notification_jobs(uuid,int), public.claim_bot_update(bigint), public.enqueue_report_notifications() from public, anon, authenticated;
grant execute on function public.consume_request_limit(text,int,int), public.redeem_bot_invite(text,text,text,text), public.bot_action(text,text,text,text), public.claim_notification_jobs(uuid,int), public.claim_bot_update(bigint) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('report-attachments','report-attachments',false,4194304,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Public upload to report-attachments" on storage.objects;
drop policy if exists "Authenticated can read attachments" on storage.objects;
notify pgrst, 'reload schema';
commit;
