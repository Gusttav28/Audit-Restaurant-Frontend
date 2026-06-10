create or replace function public.has_restaurant_permission(target_restaurant_id uuid, permission_name text)
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
        or coalesce((rm.permissions ->> permission_name)::boolean, false)
      )
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

drop policy if exists "Members can manage item categories" on public.item_categories;
drop policy if exists "Members can manage suppliers" on public.suppliers;
drop policy if exists "Members can manage custom units" on public.custom_units;
drop policy if exists "Members can manage inventory items" on public.inventory_items;
drop policy if exists "Members can manage audits" on public.audits;
drop policy if exists "Members can manage audit items" on public.audit_items;
drop policy if exists "Members can manage audit comments" on public.audit_comments;
drop policy if exists "Members can manage stock history" on public.stock_history;

create policy "Members with create can add item categories"
on public.item_categories
for insert
with check (public.has_restaurant_permission(restaurant_id, 'create'));

create policy "Members with edit can update item categories"
on public.item_categories
for update
using (public.has_restaurant_permission(restaurant_id, 'edit'))
with check (public.has_restaurant_permission(restaurant_id, 'edit'));

create policy "Members with delete can remove item categories"
on public.item_categories
for delete
using (public.has_restaurant_permission(restaurant_id, 'delete'));

create policy "Members with create can add suppliers"
on public.suppliers
for insert
with check (public.has_restaurant_permission(restaurant_id, 'create'));

create policy "Members with edit can update suppliers"
on public.suppliers
for update
using (public.has_restaurant_permission(restaurant_id, 'edit'))
with check (public.has_restaurant_permission(restaurant_id, 'edit'));

create policy "Members with delete can remove suppliers"
on public.suppliers
for delete
using (public.has_restaurant_permission(restaurant_id, 'delete'));

create policy "Members with create can add custom units"
on public.custom_units
for insert
with check (public.has_restaurant_permission(restaurant_id, 'create'));

create policy "Members with edit can update custom units"
on public.custom_units
for update
using (public.has_restaurant_permission(restaurant_id, 'edit'))
with check (public.has_restaurant_permission(restaurant_id, 'edit'));

create policy "Members with delete can remove custom units"
on public.custom_units
for delete
using (public.has_restaurant_permission(restaurant_id, 'delete'));

create policy "Members with create can add inventory items"
on public.inventory_items
for insert
with check (public.has_restaurant_permission(restaurant_id, 'create'));

create policy "Members with edit can update inventory items"
on public.inventory_items
for update
using (public.has_restaurant_permission(restaurant_id, 'edit') or public.has_restaurant_permission(restaurant_id, 'audit'))
with check (public.has_restaurant_permission(restaurant_id, 'edit') or public.has_restaurant_permission(restaurant_id, 'audit'));

create policy "Members with delete can remove inventory items"
on public.inventory_items
for delete
using (public.has_restaurant_permission(restaurant_id, 'delete'));

create policy "Members with audit can add audits"
on public.audits
for insert
with check (public.has_restaurant_permission(restaurant_id, 'audit') or public.has_restaurant_permission(restaurant_id, 'create'));

create policy "Members with audit can update audits"
on public.audits
for update
using (public.has_restaurant_permission(restaurant_id, 'audit') or public.has_restaurant_permission(restaurant_id, 'edit'))
with check (public.has_restaurant_permission(restaurant_id, 'audit') or public.has_restaurant_permission(restaurant_id, 'edit'));

create policy "Members with delete can remove audits"
on public.audits
for delete
using (public.has_restaurant_permission(restaurant_id, 'delete'));

create policy "Members with audit can add audit items"
on public.audit_items
for insert
with check (
  exists (
    select 1
    from public.audits a
    where a.id = audit_id
      and (public.has_restaurant_permission(a.restaurant_id, 'audit') or public.has_restaurant_permission(a.restaurant_id, 'create'))
  )
);

create policy "Members with audit can update audit items"
on public.audit_items
for update
using (
  exists (
    select 1
    from public.audits a
    where a.id = audit_id
      and (public.has_restaurant_permission(a.restaurant_id, 'audit') or public.has_restaurant_permission(a.restaurant_id, 'edit'))
  )
)
with check (
  exists (
    select 1
    from public.audits a
    where a.id = audit_id
      and (public.has_restaurant_permission(a.restaurant_id, 'audit') or public.has_restaurant_permission(a.restaurant_id, 'edit'))
  )
);

create policy "Members with delete can remove audit items"
on public.audit_items
for delete
using (
  exists (
    select 1
    from public.audits a
    where a.id = audit_id
      and public.has_restaurant_permission(a.restaurant_id, 'delete')
  )
);

create policy "Members with audit can add audit comments"
on public.audit_comments
for insert
with check (
  exists (
    select 1
    from public.audits a
    where a.id = audit_id
      and public.has_restaurant_permission(a.restaurant_id, 'audit')
  )
);

create policy "Members can update their audit comments"
on public.audit_comments
for update
using (
  author_id = auth.uid()
  or exists (
    select 1
    from public.audits a
    where a.id = audit_id
      and public.has_restaurant_permission(a.restaurant_id, 'edit')
  )
)
with check (
  author_id = auth.uid()
  or exists (
    select 1
    from public.audits a
    where a.id = audit_id
      and public.has_restaurant_permission(a.restaurant_id, 'edit')
  )
);

create policy "Members with delete can remove audit comments"
on public.audit_comments
for delete
using (
  exists (
    select 1
    from public.audits a
    where a.id = audit_id
      and public.has_restaurant_permission(a.restaurant_id, 'delete')
  )
);

create policy "Members with audit can add stock history"
on public.stock_history
for insert
with check (public.has_restaurant_permission(restaurant_id, 'audit') or public.has_restaurant_permission(restaurant_id, 'edit'));

create policy "Members with edit can update stock history"
on public.stock_history
for update
using (public.has_restaurant_permission(restaurant_id, 'edit'))
with check (public.has_restaurant_permission(restaurant_id, 'edit'));

create policy "Members with delete can remove stock history"
on public.stock_history
for delete
using (public.has_restaurant_permission(restaurant_id, 'delete'));
