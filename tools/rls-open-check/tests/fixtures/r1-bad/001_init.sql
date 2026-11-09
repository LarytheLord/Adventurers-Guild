create table public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null
);
