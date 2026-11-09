create table public.notes (id int primary key);
grant all on public.notes to authenticated;
revoke all on public.notes from authenticated;
