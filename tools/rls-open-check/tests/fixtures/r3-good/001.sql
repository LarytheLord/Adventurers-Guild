create table public.docs (id int primary key, owner uuid);
alter table public.docs enable row level security;
create policy "own update" on public.docs for update to authenticated using (owner = auth.uid());
create policy "own delete" on public.docs for delete to authenticated using ((select auth.uid()) = owner);
