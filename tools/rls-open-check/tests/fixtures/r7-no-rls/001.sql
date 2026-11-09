create table public.notes (id int primary key, body text);
grant select, insert, update, delete on public.notes to authenticated;
