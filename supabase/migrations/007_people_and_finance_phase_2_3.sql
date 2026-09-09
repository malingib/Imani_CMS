create extension if not exists pgcrypto;

create table if not exists public.member_attendance_notes (id uuid primary key default gen_random_uuid(),church_id uuid not null references public.churches(id) on delete cascade,member_id uuid not null references public.members(id) on delete cascade,event_id uuid references public.church_events(id) on delete set null,status text not null default 'PRESENT' check(status in ('PRESENT','ABSENT','EXCUSED')),notes text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists idx_member_attendance_notes_scope on public.member_attendance_notes(church_id,member_id,created_at desc);
alter table public.member_attendance_notes enable row level security;
drop policy if exists member_attendance_notes_select on public.member_attendance_notes;
drop policy if exists member_attendance_notes_manage on public.member_attendance_notes;
create policy member_attendance_notes_select on public.member_attendance_notes for select to authenticated using (public.is_church_member(church_id));
create policy member_attendance_notes_manage on public.member_attendance_notes for all to authenticated using (public.is_church_member(church_id) and public.church_membership_role(church_id) in ('ADMIN','PASTOR','STAFF')) with check (public.is_church_member(church_id) and public.church_membership_role(church_id) in ('ADMIN','PASTOR','STAFF'));

create or replace view public.member_attendance_summary as select m.church_id,m.id member_id,count(ea.event_id)::int attended_events,count(distinct ce.id)::int tracked_events,case when count(distinct ce.id)=0 then 0 else round((count(ea.event_id)::numeric/count(distinct ce.id)::numeric)*100,1) end attendance_rate,max(ce.date) last_attendance_date from public.members m left join public.church_events ce on ce.church_id=m.church_id left join public.event_attendance ea on ea.church_id=m.church_id and ea.member_id=m.id and ea.event_id=ce.id group by m.church_id,m.id;
create index if not exists idx_transactions_finance_scope_date on public.transactions(church_id,date desc,created_at desc);
create index if not exists idx_transactions_member_date on public.transactions(church_id,member_id,date desc);
create index if not exists idx_transactions_reference on public.transactions(church_id,reference);
create index if not exists idx_budgets_scope_month on public.budgets(church_id,month);

create table if not exists public.funds (id uuid primary key default gen_random_uuid(),church_id uuid not null references public.churches(id) on delete cascade,name text not null,code text not null,description text,active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(church_id,code),unique(church_id,name));
create index if not exists idx_funds_church on public.funds(church_id,active,name);
alter table public.funds enable row level security;
create policy funds_select on public.funds for select to authenticated using(public.is_church_member(church_id));
create policy funds_manage on public.funds for all to authenticated using(public.is_church_member(church_id) and public.church_membership_role(church_id) in ('ADMIN','PASTOR','STAFF')) with check(public.is_church_member(church_id) and public.church_membership_role(church_id) in ('ADMIN','PASTOR','STAFF'));

create table if not exists public.church_projects (id uuid primary key default gen_random_uuid(),church_id uuid not null references public.churches(id) on delete cascade,name text not null,account_prefix text not null,description text,target_amount numeric(14,2) not null default 0 check(target_amount>=0),active boolean not null default true,start_date date,end_date date,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(church_id,account_prefix),unique(church_id,name));
create index if not exists idx_projects_church_active on public.church_projects(church_id,active,name);
alter table public.church_projects enable row level security;
create policy projects_select on public.church_projects for select to authenticated using(public.is_church_member(church_id));
create policy projects_manage on public.church_projects for all to authenticated using(public.is_church_member(church_id) and public.church_membership_role(church_id) in ('ADMIN','PASTOR','STAFF')) with check(public.is_church_member(church_id) and public.church_membership_role(church_id) in ('ADMIN','PASTOR','STAFF'));

alter table public.transactions add column if not exists fund_id uuid references public.funds(id) on delete set null;
alter table public.transactions add column if not exists project_id uuid references public.church_projects(id) on delete set null;
create index if not exists idx_transactions_fund on public.transactions(church_id,fund_id,date desc);
create index if not exists idx_transactions_project on public.transactions(church_id,project_id,date desc);

create table if not exists public.expenses (id uuid primary key default gen_random_uuid(),church_id uuid not null references public.churches(id) on delete cascade,transaction_id uuid unique references public.transactions(id) on delete set null,category text not null,description text not null,amount numeric(14,2) not null check(amount>0),expense_date date not null default current_date,vendor text,receipt_reference text,status text not null default 'RECORDED' check(status in ('RECORDED','PENDING','VOID')),created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists idx_expenses_church_date on public.expenses(church_id,expense_date desc);
create index if not exists idx_expenses_category on public.expenses(church_id,category,expense_date desc);
alter table public.expenses enable row level security;
create policy expenses_select on public.expenses for select to authenticated using(public.is_church_member(church_id));
create policy expenses_manage on public.expenses for all to authenticated using(public.is_church_member(church_id) and public.church_membership_role(church_id) in ('ADMIN','TREASURER','STAFF')) with check(public.is_church_member(church_id) and public.church_membership_role(church_id) in ('ADMIN','TREASURER','STAFF'));

create table if not exists public.financial_audit_log (id uuid primary key default gen_random_uuid(),church_id uuid not null references public.churches(id) on delete cascade,actor_id uuid references auth.users(id) on delete set null,action text not null,entity_type text not null,entity_id uuid,amount numeric(14,2),metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create index if not exists idx_financial_audit_scope on public.financial_audit_log(church_id,created_at desc);
alter table public.financial_audit_log enable row level security;
create policy financial_audit_select on public.financial_audit_log for select to authenticated using(public.is_church_member(church_id) and public.church_membership_role(church_id) in ('ADMIN','PASTOR','TREASURER','STAFF'));
create policy financial_audit_insert on public.financial_audit_log for insert to authenticated with check(public.is_church_member(church_id) and actor_id=auth.uid());
revoke all on table public.funds,public.church_projects,public.expenses,public.financial_audit_log,public.member_attendance_notes from anon;
grant select,insert,update,delete on public.funds,public.church_projects,public.expenses,public.member_attendance_notes to authenticated;
grant select,insert on public.financial_audit_log to authenticated;
