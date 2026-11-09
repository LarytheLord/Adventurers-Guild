create table public.logs (id int primary key);
create table public.events (id int primary key);
grant select, insert on public.logs to anon;
grant all on all tables in schema public to anon;
