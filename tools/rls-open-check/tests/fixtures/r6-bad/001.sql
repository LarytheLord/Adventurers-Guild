create table public.items (id int primary key);
alter table public.items enable row level security;
create policy "own" on public.items for select to authenticated using (auth.uid() is not null);
