drop policy if exists "Restaurant members can read teammate profiles" on public.profiles;

create policy "Restaurant members can read teammate profiles"
on public.profiles
for select
using (
  id = auth.uid()
  or exists (
    select 1
    from public.restaurant_members viewer
    join public.restaurant_members teammate
      on teammate.restaurant_id = viewer.restaurant_id
    where viewer.user_id = auth.uid()
      and teammate.user_id = profiles.id
  )
);
