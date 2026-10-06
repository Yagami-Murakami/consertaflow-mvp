-- Roles
create type public.app_role as enum ('admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;

-- Bootstrap: only works while there is no admin yet
create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Nao autenticado'; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return false;
  end if;
  insert into public.user_roles (user_id, role) values (uid, 'admin')
  on conflict do nothing;
  return true;
end;
$$;

revoke all on function public.claim_first_admin() from public;
grant execute on function public.claim_first_admin() to authenticated;
grant execute on function public.admin_exists() to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

create policy "profiles self read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles self insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles self update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "roles read own" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Shared updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end; $$;

-- Readable codes
create sequence public.lead_code_seq start 1001;
create sequence public.order_code_seq start 1001;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text not null,
  email text,
  observacoes text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;
alter table public.clients enable row level security;
create policy "clients admin all" on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger clients_touch before update on public.clients for each row execute function public.touch_updated_at();

create table public.service_orders (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default ('OS-' || nextval('public.order_code_seq')::text),
  client_id uuid not null references public.clients(id) on delete cascade,
  equipamento_tipo text not null,
  marca_modelo text,
  problema_relatado text not null,
  diagnostico text,
  valor_estimado numeric(10,2),
  prazo_previsto date,
  status text not null default 'novo' check (status in ('novo','em_diagnostico','aguardando_aprovacao','aprovado','em_reparo','pronto_retirada','entregue','cancelado')),
  observacoes text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
grant select, insert, update, delete on public.service_orders to authenticated;
grant all on public.service_orders to service_role;
alter table public.service_orders enable row level security;
create policy "orders admin all" on public.service_orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger orders_touch before update on public.service_orders for each row execute function public.touch_updated_at();

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default ('LD-' || nextval('public.lead_code_seq')::text),
  nome text not null,
  whatsapp text not null,
  email text,
  equipamento_tipo text not null,
  marca_modelo text,
  problema text not null,
  urgencia text not null default 'normal' check (urgencia in ('normal','urgente')),
  periodo_contato text check (periodo_contato in ('manha','tarde','noite')),
  status text not null default 'novo' check (status in ('novo','em_contato','convertido','descartado')),
  convertido boolean not null default false,
  client_id uuid references public.clients(id) on delete set null,
  order_id uuid references public.service_orders(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
grant usage on sequence public.lead_code_seq to anon, authenticated;
grant usage on sequence public.order_code_seq to authenticated;
alter table public.leads enable row level security;
create policy "leads public insert" on public.leads for insert to anon, authenticated with check (
  convertido = false and client_id is null and order_id is null and is_demo = false
  and length(trim(nome)) between 2 and 120
  and length(trim(whatsapp)) between 8 and 25
  and length(trim(problema)) between 10 and 2000
);
create policy "leads admin select" on public.leads for select to authenticated using (public.is_admin());
create policy "leads admin update" on public.leads for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "leads admin delete" on public.leads for delete to authenticated using (public.is_admin());
create trigger leads_touch before update on public.leads for each row execute function public.touch_updated_at();

create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.service_orders(id) on delete cascade,
  status_anterior text,
  status_novo text not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert on public.status_history to authenticated;
grant all on public.status_history to service_role;
alter table public.status_history enable row level security;
create policy "history admin read" on public.status_history for select to authenticated using (public.is_admin());
create policy "history admin insert" on public.status_history for insert to authenticated with check (public.is_admin());

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.service_orders(id) on delete cascade,
  texto text not null,
  reminder_at timestamptz not null,
  concluido boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.reminders to authenticated;
grant all on public.reminders to service_role;
alter table public.reminders enable row level security;
create policy "reminders admin all" on public.reminders for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Record status changes automatically
create or replace function public.log_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.status_history (order_id, status_anterior, status_novo, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.status_history (order_id, status_anterior, status_novo, changed_by)
    values (new.id, old.status, new.status, auth.uid());
    if new.status = 'entregue' and new.completed_at is null then
      new.completed_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger orders_status_insert after insert on public.service_orders
for each row execute function public.log_status_change();

create trigger orders_status_update before update on public.service_orders
for each row execute function public.log_status_change();

create index on public.service_orders (client_id);
create index on public.service_orders (status);
create index on public.leads (status);
create index on public.reminders (reminder_at);
create index on public.status_history (order_id);