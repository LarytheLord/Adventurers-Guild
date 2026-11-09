create function public.get_secret() returns text
language sql security definer
as $$ select 'x' $$;

create or replace function increment(x int) returns int
language plpgsql
security definer
as $$ begin return x + 1; end $$;
