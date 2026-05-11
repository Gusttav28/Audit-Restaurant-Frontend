create extension if not exists "pgcrypto";

create type public.restaurant_role as enum ('owner', 'admin', 'auditor', 'collaborator');
create type public.audit_status as enum ('not-started', 'in-progress', 'completed');
create type public.audit_item_result as enum ('pending', 'sold', 'discrepancy', 'matched');
create type public.inventory_status as enum ('good', 'warning', 'low', 'critical');
create type public.currency_code as enum ('USD', 'CRC');
create type public.item_phase as enum ('none', 'production', 'merma');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null default 'Costa Rica',
  location text not null default '',
  address text not null default '',
  email text not null default '',
  phone text not null default '',
  default_currency public.currency_code not null default 'CRC',
  exchange_rate_to_usd numeric(14, 8) not null default 0.00197628,
  settings jsonb not null default '{"auditNotifications":true,"inventoryAlerts":true,"weeklyReports":true,"lowStockThreshold":5}'::jsonb,
  inventory_last_edited timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurant_members (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.restaurant_role not null default 'collaborator',
  created_at timestamptz not null default now(),
  unique (restaurant_id, user_id)
);

create table public.inventory_types (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  color text not null default '#3b82f6',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, name)
);

create table public.item_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, name)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, name)
);

create table public.custom_units (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  abbreviation text not null,
  base_unit text not null,
  conversion_factor numeric(14, 4) not null default 1,
  category text not null default 'custom',
  created_at timestamptz not null default now(),
  unique (restaurant_id, abbreviation)
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  inventory_type_id uuid not null references public.inventory_types(id) on delete cascade,
  category_id uuid references public.item_categories(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  name text not null,
  category_name text not null default '',
  supplier_name text not null default '',
  quantity numeric(14, 3) not null default 0,
  unit text not null default 'pieces',
  min_stock numeric(14, 3) not null default 0,
  status public.inventory_status not null default 'good',
  price_usd numeric(14, 4) not null default 0,
  price_currency public.currency_code not null default 'USD',
  phase public.item_phase,
  merma_quantity numeric(14, 3),
  production_quantity numeric(14, 3),
  days_until_expiry integer,
  last_updated date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  inventory_type_id uuid not null references public.inventory_types(id) on delete cascade,
  audit_code text not null,
  auditor_id uuid references public.profiles(id) on delete set null,
  auditor_name text not null default '',
  created_date date not null default current_date,
  started_date date,
  completed_date date,
  status public.audit_status not null default 'in-progress',
  total_items integer not null default 0,
  counted_items integer not null default 0,
  flagged_items integer not null default 0,
  total_discrepancy numeric(14, 4) not null default 0,
  compliance integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, audit_code)
);

create table public.audit_items (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  item_name text not null,
  category text not null default '',
  previous_stock numeric(14, 3) not null default 0,
  current_stock numeric(14, 3),
  unit text not null default 'pieces',
  unit_price numeric(14, 4) not null default 0,
  phase public.item_phase,
  merma_quantity numeric(14, 3),
  production_quantity numeric(14, 3),
  difference numeric(14, 3),
  result public.audit_item_result not null default 'pending',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.audit_comments (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default '',
  content text not null,
  created_at timestamptz not null default now()
);

create table public.stock_history (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  audit_id uuid references public.audits(id) on delete set null,
  completed_date date not null default current_date,
  previous_stock numeric(14, 3) not null,
  new_stock numeric(14, 3) not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger restaurants_set_updated_at before update on public.restaurants for each row execute function public.set_updated_at();
create trigger inventory_types_set_updated_at before update on public.inventory_types for each row execute function public.set_updated_at();
create trigger item_categories_set_updated_at before update on public.item_categories for each row execute function public.set_updated_at();
create trigger suppliers_set_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
create trigger inventory_items_set_updated_at before update on public.inventory_items for each row execute function public.set_updated_at();
create trigger audits_set_updated_at before update on public.audits for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_restaurant_member(target_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurant_members rm
    where rm.restaurant_id = target_restaurant_id
      and rm.user_id = auth.uid()
  );
$$;

create or replace function public.is_restaurant_admin(target_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurant_members rm
    where rm.restaurant_id = target_restaurant_id
      and rm.user_id = auth.uid()
      and rm.role in ('owner', 'admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_members enable row level security;
alter table public.inventory_types enable row level security;
alter table public.item_categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.custom_units enable row level security;
alter table public.inventory_items enable row level security;
alter table public.audits enable row level security;
alter table public.audit_items enable row level security;
alter table public.audit_comments enable row level security;
alter table public.stock_history enable row level security;

create policy "Users can read their own profile" on public.profiles for select using (id = auth.uid());
create policy "Users can update their own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Members can read restaurants" on public.restaurants for select using (public.is_restaurant_member(id));
create policy "Authenticated users can create restaurants" on public.restaurants for insert with check (auth.uid() = created_by);
create policy "Admins can update restaurants" on public.restaurants for update using (public.is_restaurant_admin(id)) with check (public.is_restaurant_admin(id));

create policy "Members can read memberships" on public.restaurant_members for select using (public.is_restaurant_member(restaurant_id));
create policy "Admins can manage memberships" on public.restaurant_members for all using (public.is_restaurant_admin(restaurant_id)) with check (public.is_restaurant_admin(restaurant_id));

create policy "Members can read inventory types" on public.inventory_types for select using (public.is_restaurant_member(restaurant_id));
create policy "Admins can manage inventory types" on public.inventory_types for all using (public.is_restaurant_admin(restaurant_id)) with check (public.is_restaurant_admin(restaurant_id));

create policy "Members can read item categories" on public.item_categories for select using (public.is_restaurant_member(restaurant_id));
create policy "Members can manage item categories" on public.item_categories for all using (public.is_restaurant_member(restaurant_id)) with check (public.is_restaurant_member(restaurant_id));

create policy "Members can read suppliers" on public.suppliers for select using (public.is_restaurant_member(restaurant_id));
create policy "Members can manage suppliers" on public.suppliers for all using (public.is_restaurant_member(restaurant_id)) with check (public.is_restaurant_member(restaurant_id));

create policy "Members can read custom units" on public.custom_units for select using (public.is_restaurant_member(restaurant_id));
create policy "Members can manage custom units" on public.custom_units for all using (public.is_restaurant_member(restaurant_id)) with check (public.is_restaurant_member(restaurant_id));

create policy "Members can read inventory items" on public.inventory_items for select using (public.is_restaurant_member(restaurant_id));
create policy "Members can manage inventory items" on public.inventory_items for all using (public.is_restaurant_member(restaurant_id)) with check (public.is_restaurant_member(restaurant_id));

create policy "Members can read audits" on public.audits for select using (public.is_restaurant_member(restaurant_id));
create policy "Members can manage audits" on public.audits for all using (public.is_restaurant_member(restaurant_id)) with check (public.is_restaurant_member(restaurant_id));

create policy "Members can read audit items" on public.audit_items for select using (
  exists (select 1 from public.audits a where a.id = audit_id and public.is_restaurant_member(a.restaurant_id))
);
create policy "Members can manage audit items" on public.audit_items for all using (
  exists (select 1 from public.audits a where a.id = audit_id and public.is_restaurant_member(a.restaurant_id))
) with check (
  exists (select 1 from public.audits a where a.id = audit_id and public.is_restaurant_member(a.restaurant_id))
);

create policy "Members can read audit comments" on public.audit_comments for select using (
  exists (select 1 from public.audits a where a.id = audit_id and public.is_restaurant_member(a.restaurant_id))
);
create policy "Members can manage audit comments" on public.audit_comments for all using (
  exists (select 1 from public.audits a where a.id = audit_id and public.is_restaurant_member(a.restaurant_id))
) with check (
  exists (select 1 from public.audits a where a.id = audit_id and public.is_restaurant_member(a.restaurant_id))
);

create policy "Members can read stock history" on public.stock_history for select using (public.is_restaurant_member(restaurant_id));
create policy "Members can manage stock history" on public.stock_history for all using (public.is_restaurant_member(restaurant_id)) with check (public.is_restaurant_member(restaurant_id));
