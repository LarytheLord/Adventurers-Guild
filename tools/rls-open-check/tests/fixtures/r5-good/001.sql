create function public.safe_one() returns text
language sql security definer set search_path = ''
as $$ select 'x' $$;
create function public.safe_two() returns text
language sql security definer set search_path = public, pg_temp
as $$ select 'x' $$;
-- invoker functions and other schemas are not flagged
create function public.plain() returns int language sql as $$ select 1 $$;
create function private.definer_elsewhere() returns int language sql security definer as $$ select 1 $$;
