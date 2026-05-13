# Supabase Production Setup

This project is configured for Supabase Auth and Postgres.

## Environment

Use `.env.local` for local development and configure the same public values plus private secrets in your production host.

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_PASSWORD=
```

Do not commit `.env.local`. It is ignored by git.

## Apply Schema

The schema and RLS policies live in:

```txt
supabase/migrations/0001_audit_flow_schema.sql
```

Preferred options:

1. Supabase Dashboard SQL Editor: paste and run the migration file.
2. Supabase CLI: `supabase db push`.
3. `psql` with the Supabase connection pooler URI.

The direct database hostname can require IPv6. If local `psql` times out, use the connection pooler URI from:

```txt
Supabase Dashboard -> Project Settings -> Database -> Connection string -> Transaction pooler
```

## Initial Admin And Restaurant

Auth users should be created through the app signup page or Supabase Dashboard Auth.

After creating the initial admin user, run:

```txt
supabase/seed-goflow.example.sql
```

Before running it, replace:

```sql
'REPLACE_WITH_ADMIN_EMAIL'
```

with the admin user's email.

The seed creates:

- Restaurant: GoFlow Restaurant
- Country: Costa Rica
- Address/location: GoFlow Demo District
- Default currency: CRC
- Admin membership role: owner
- Initial inventories: Kitchen and Bar

## Security

The schema enables Row Level Security for all app tables.

Access rule summary:

- Users can read/update their own profile.
- Restaurant data is visible only to restaurant members.
- Restaurant settings and membership management require owner/admin role.
- Inventory, suppliers, categories, audits, comments, and stock history are scoped to restaurant membership.

## Important Production Note

Rotate the service role key and database password before launch if they were ever shared outside a secure secret manager.
