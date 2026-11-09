create table public.a (id int primary key);
create table public.b (id int primary key);
alter table public.b enable row level security;
create policy "all b" on public.b for all to public using (auth.uid() is not null);
grant all on all tables in schema public to authenticated;
