create table public.notes (id int primary key, user_id uuid);
alter table public.notes enable row level security;
create policy "own rows" on public.notes for select to anon using (user_id = auth.uid());
create policy "own insert" on public.notes for insert to public with check (auth.uid() = user_id);
-- authenticated + true on SELECT/INSERT is not flagged
create policy "auth read" on public.notes for select to authenticated using (true);
create policy "auth insert" on public.notes for insert to authenticated with check (true);
-- restrictive policies only narrow access
create policy "narrow" on public.notes as restrictive for all to anon using (true);
