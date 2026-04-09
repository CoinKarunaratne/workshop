-- Run in Supabase SQL Editor (PostgreSQL) if migrations are not applied automatically.
-- Stores one invoice per job per user; invoice lines are JSON.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  invoice_number text not null,
  invoice_date date not null,
  mileage text,
  rego text,
  notes_top text,
  notes_bottom text,
  gst_enabled boolean not null default true,
  bank_charge_enabled boolean not null default false,
  bank_charge numeric(14, 2),
  payment_status text,
  lines jsonb not null default '[]'::jsonb,
  subtotal numeric(14, 2) not null,
  tax_total numeric(14, 2) not null,
  total numeric(14, 2) not null,
  grand_total numeric(14, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_payment_status_check check (
    payment_status is null or payment_status in ('Paid', 'Unpaid')
  ),
  constraint invoices_user_job_unique unique (user_id, job_id),
  constraint invoices_user_number_unique unique (user_id, invoice_number)
);

create index if not exists invoices_user_id_invoice_date_idx
  on public.invoices (user_id, invoice_date desc);

create index if not exists invoices_job_id_idx on public.invoices (job_id);

alter table public.invoices enable row level security;

create policy "invoices_select_own"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "invoices_insert_own"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "invoices_update_own"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "invoices_delete_own"
  on public.invoices for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.invoices to authenticated;

create or replace function public.invoices_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row
  execute procedure public.invoices_set_updated_at();
