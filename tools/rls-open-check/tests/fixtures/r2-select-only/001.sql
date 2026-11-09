create table public.catalog (id int primary key);
alter table public.catalog enable row level security;
create policy "public catalog" on public.catalog for select to anon using (true);
