create table public.docs (id int primary key, owner uuid);
alter table public.docs enable row level security;
create policy "any user updates" on public.docs for update to authenticated using (true);
create policy "any user deletes" on public.docs for delete to authenticated using (true);
create policy "any user all" on public.docs for all to authenticated using (true) with check (true);
