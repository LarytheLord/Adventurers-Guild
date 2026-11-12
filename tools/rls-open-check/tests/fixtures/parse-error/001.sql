create table public.a (id int);
this is not valid sql;
create policy "p" on public.a for all to anon using (true);
