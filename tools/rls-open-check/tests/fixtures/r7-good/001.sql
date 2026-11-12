create table public.items (id int primary key, owner uuid);
alter table public.items enable row level security;
create policy "read own" on public.items for select to authenticated using (auth.uid() = owner);
create policy "write own" on public.items for all to authenticated using (auth.uid() = owner) with check (auth.uid() = owner);
grant select, insert, update, delete on public.items to authenticated;
-- grants of other privileges and to other roles are not R7
create table public.internal (id int primary key);
grant select on public.internal to service_role;
grant truncate on public.internal to authenticated;
