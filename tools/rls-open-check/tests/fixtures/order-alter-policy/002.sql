alter policy "open" on public.posts using (owner = auth.uid());
