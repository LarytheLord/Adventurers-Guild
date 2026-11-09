create table public.profiles (id uuid primary key, name text);
create table public.orders (id int primary key, user_id uuid);
alter table public.orders enable row level security;
create policy "orders open" on public.orders for all using (true) with check (true);
