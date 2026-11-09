create table public.todos (id uuid primary key, title text);
alter table public.todos enable row level security;
-- other schemas and temp tables are not checked
create table private.audit_log (id int);
create temp table scratch (id int);
