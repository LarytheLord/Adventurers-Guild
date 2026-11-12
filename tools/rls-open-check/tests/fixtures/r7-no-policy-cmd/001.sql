create table public.items (id int primary key, owner uuid);
alter table public.items enable row level security;
create policy "read own" on public.items for select to authenticated using (auth.uid() = owner);
grant select, insert, update, delete on public.items to authenticated;
grant select on public.items to anon;
