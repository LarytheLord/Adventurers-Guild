create table public.tmp_a (id int);
create policy "x" on public.tmp_a for all to anon using (true);
grant all on public.tmp_a to anon;
