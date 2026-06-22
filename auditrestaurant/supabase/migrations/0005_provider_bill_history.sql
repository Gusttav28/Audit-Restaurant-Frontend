create table if not exists public.provider_bills (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  supplier_name text not null,
  invoice_number text not null,
  currency text not null default 'CRC' check (currency in ('USD', 'CRC')),
  source text not null default 'bill-upload' check (source in ('bill-upload', 'manual')),
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_bill_items (
  id uuid primary key default gen_random_uuid(),
  provider_bill_id uuid not null references public.provider_bills(id) on delete cascade,
  item_name text not null,
  category_name text not null default 'General',
  inventory_type_name text not null default '',
  quantity numeric not null default 0,
  unit text not null default 'pieces',
  unit_price numeric not null default 0,
  price_currency text not null default 'CRC' check (price_currency in ('USD', 'CRC')),
  created_at timestamptz not null default now()
);

create index if not exists provider_bills_restaurant_id_idx on public.provider_bills(restaurant_id);
create index if not exists provider_bills_supplier_name_idx on public.provider_bills(restaurant_id, supplier_name);
create index if not exists provider_bill_items_bill_id_idx on public.provider_bill_items(provider_bill_id);

create trigger provider_bills_set_updated_at before update on public.provider_bills for each row execute function public.set_updated_at();

alter table public.provider_bills enable row level security;
alter table public.provider_bill_items enable row level security;

create policy "Members can read provider bills"
on public.provider_bills
for select
using (public.is_restaurant_member(restaurant_id));

create policy "Members with create can add provider bills"
on public.provider_bills
for insert
with check (public.has_restaurant_permission(restaurant_id, 'create'));

create policy "Members with edit can update provider bills"
on public.provider_bills
for update
using (public.has_restaurant_permission(restaurant_id, 'edit'))
with check (public.has_restaurant_permission(restaurant_id, 'edit'));

create policy "Members with delete can remove provider bills"
on public.provider_bills
for delete
using (public.has_restaurant_permission(restaurant_id, 'delete'));

create policy "Members can read provider bill items"
on public.provider_bill_items
for select
using (
  exists (
    select 1
    from public.provider_bills bill
    where bill.id = provider_bill_items.provider_bill_id
      and public.is_restaurant_member(bill.restaurant_id)
  )
);

create policy "Members with create can add provider bill items"
on public.provider_bill_items
for insert
with check (
  exists (
    select 1
    from public.provider_bills bill
    where bill.id = provider_bill_items.provider_bill_id
      and public.has_restaurant_permission(bill.restaurant_id, 'create')
  )
);

create policy "Members with edit can update provider bill items"
on public.provider_bill_items
for update
using (
  exists (
    select 1
    from public.provider_bills bill
    where bill.id = provider_bill_items.provider_bill_id
      and public.has_restaurant_permission(bill.restaurant_id, 'edit')
  )
)
with check (
  exists (
    select 1
    from public.provider_bills bill
    where bill.id = provider_bill_items.provider_bill_id
      and public.has_restaurant_permission(bill.restaurant_id, 'edit')
  )
);

create policy "Members with delete can remove provider bill items"
on public.provider_bill_items
for delete
using (
  exists (
    select 1
    from public.provider_bills bill
    where bill.id = provider_bill_items.provider_bill_id
      and public.has_restaurant_permission(bill.restaurant_id, 'delete')
  )
);
