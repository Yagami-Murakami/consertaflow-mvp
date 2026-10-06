drop policy if exists "leads public insert" on public.leads;
create policy "leads public insert" on public.leads for insert to anon, authenticated
with check (
  convertido = false and client_id is null and order_id is null and is_demo = false
  and status = 'novo' and urgencia in ('normal','urgente')
  and length(trim(nome)) between 2 and 120
  and length(trim(whatsapp)) between 8 and 25
  and length(trim(problema)) between 10 and 2000
  and length(equipamento_tipo) between 1 and 60
  and (marca_modelo is null or length(marca_modelo) <= 120)
  and (email is null or length(email) <= 200)
  and (periodo_contato is null or periodo_contato in ('manha','tarde','noite'))
);

create or replace function public.leads_sanitize_public_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.codigo := 'LD-' || nextval('lead_code_seq')::text;
    new.created_at := now();
    new.updated_at := now();
  end if;
  return new;
end; $$;

drop trigger if exists leads_sanitize_insert on public.leads;
create trigger leads_sanitize_insert before insert on public.leads
for each row execute function public.leads_sanitize_public_insert();