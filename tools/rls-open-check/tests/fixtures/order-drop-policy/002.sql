drop policy "open" on public.posts;
create policy "closed" on public.posts for select to authenticated using (auth.uid() is not null);
