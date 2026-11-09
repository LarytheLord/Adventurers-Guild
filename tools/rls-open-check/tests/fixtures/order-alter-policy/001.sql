create table public.posts (id int primary key, owner uuid);
alter table public.posts enable row level security;
create policy "open" on public.posts for update to authenticated using (true);
