create table public.posts (id int primary key, body text);
alter table public.posts enable row level security;
create policy "anyone writes" on public.posts for insert to anon with check (true);
create policy "anyone edits" on public.posts for update to anon using (true);
create policy "anyone deletes" on public.posts for delete to anon using (true);
create policy "anyone all" on public.posts for all to anon using (true) with check (true);
