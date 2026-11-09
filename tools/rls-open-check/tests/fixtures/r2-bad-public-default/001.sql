create table public.notes (id int primary key);
alter table public.notes enable row level security;
-- no TO clause means PUBLIC
create policy "read all" on public.notes for select using (true);
create policy "explicit public" on public.notes for select to public using ((true));
create policy "tautology" on public.notes for select using (1 = 1);
