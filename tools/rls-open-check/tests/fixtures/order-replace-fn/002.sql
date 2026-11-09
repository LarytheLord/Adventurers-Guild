create or replace function public.f() returns int language sql security definer set search_path = '' as $$ select 1 $$;
alter function public.g() set search_path = '';
drop function public.h();
