alter table public.item_categories
  add column if not exists inventory_type_id uuid references public.inventory_types(id) on delete cascade;

alter table public.restaurant_members
  add column if not exists permissions jsonb not null default '{"read":true,"create":false,"edit":false,"delete":false}'::jsonb;

update public.restaurant_members
set permissions = '{"read":true,"create":true,"edit":true,"delete":true}'::jsonb
where role in ('owner', 'admin');

alter table public.item_categories drop constraint if exists item_categories_restaurant_id_name_key;
drop index if exists item_categories_restaurant_id_name_key;
create unique index if not exists item_categories_restaurant_inventory_name_key
  on public.item_categories (restaurant_id, inventory_type_id, name);

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
      and (
        rm.role in ('owner', 'admin')
        or coalesce((rm.permissions ->> 'delete')::boolean, false)
      )
  );
$$;
