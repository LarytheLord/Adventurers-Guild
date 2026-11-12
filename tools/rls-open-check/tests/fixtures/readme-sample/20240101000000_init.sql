create table public.orders (id bigint primary key, user_id uuid, total numeric);
alter table public.orders enable row level security;
create policy "orders open" on public.orders for all to anon using (true);

create table public.notes (id bigint primary key, user_id uuid, body text);
