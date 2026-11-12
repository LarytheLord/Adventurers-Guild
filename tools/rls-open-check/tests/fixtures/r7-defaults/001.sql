alter default privileges in schema public grant select, insert on tables to authenticated;
create table public.later (id int primary key);
alter table public.later enable row level security;
