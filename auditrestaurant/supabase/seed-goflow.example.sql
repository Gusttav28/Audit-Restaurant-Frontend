-- Run this after:
-- 1. Applying supabase/migrations/0001_audit_flow_schema.sql
-- 2. Creating the initial admin user through Supabase Auth or the app signup page
--
-- Replace the admin email below with the actual admin email.

do $$
declare
  admin_user_id uuid;
  goflow_restaurant_id uuid;
  kitchen_id uuid;
begin
  select id into admin_user_id
  from public.profiles
  where email = 'REPLACE_WITH_ADMIN_EMAIL'
  limit 1;

  if admin_user_id is null then
    raise exception 'Admin profile not found. Create the admin auth user first.';
  end if;

  insert into public.restaurants (
    name,
    country,
    location,
    address,
    default_currency,
    exchange_rate_to_usd,
    created_by
  )
  values (
    'GoFlow Restaurant',
    'Costa Rica',
    'GoFlow Demo District',
    'GoFlow Demo District',
    'CRC',
    0.00197628,
    admin_user_id
  )
  returning id into goflow_restaurant_id;

  insert into public.restaurant_members (restaurant_id, user_id, role)
  values (goflow_restaurant_id, admin_user_id, 'owner');

  insert into public.inventory_types (restaurant_id, name, color, active, sort_order)
  values (goflow_restaurant_id, 'Kitchen', '#3b82f6', true, 1)
  returning id into kitchen_id;

  insert into public.inventory_types (restaurant_id, name, color, active, sort_order)
  values (goflow_restaurant_id, 'Bar', '#8b5cf6', true, 2);
end $$;
