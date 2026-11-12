create table public.logs (id int primary key);
alter table public.logs enable row level security;
grant select on public.logs to anon;
grant select on public.logs to authenticated;
