create table public.posts (id int primary key);
alter table public.posts enable row level security;
create policy "open" on public.posts for all to anon using (true) with check (true);
