create table public.logs (id int primary key);
grant all on public.logs to anon;
revoke all on public.logs from anon;
alter table public.logs enable row level security;
