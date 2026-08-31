-- CRM: People, Contacts (inquiry pipeline), activity_log, Orders.
-- Additive only — does not touch contact_submissions or the chat tables.

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 1 and 320 and email like '%_@_%.__%'),
  name text,
  phone text,
  company text,
  role text,
  source_site text,
  ok_to_contact boolean not null default false,
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create index if not exists people_email_idx on public.people (email);

alter table public.people enable row level security;

-- Public can upsert themselves via the contact form (insert only — no
-- select/update/delete for anon/authenticated). Reads and edits happen
-- through the service role key from /admin, never through the client.
create policy "anyone can create a person via the contact form"
  on public.people
  for insert
  to anon, authenticated
  with check (true);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  type text not null check (type in ('membership', 'training_enrolment', 'consulting_review')),
  subject text,
  message text,
  source text,
  status text not null default 'new_lead'
    check (status in ('new_lead', 'contacted', 'discovery_call', 'proposal', 'won', 'lost')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists contacts_person_id_idx on public.contacts (person_id);
create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
create index if not exists contacts_status_idx on public.contacts (status);

alter table public.contacts enable row level security;

create policy "anyone can create an inquiry via the contact form"
  on public.contacts
  for insert
  to anon, authenticated
  with check (true);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  from_status text,
  to_status text not null,
  actor text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_contact_id_idx on public.activity_log (contact_id);

-- No public policies: activity_log is written and read only via the
-- service role key from /admin.
alter table public.activity_log enable row level security;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  product_name text not null,
  amount_cents integer not null,
  currency text not null default 'AUD',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists orders_person_id_idx on public.orders (person_id);

-- No public policies: orders is written and read only via the service
-- role key from /admin.
alter table public.orders enable row level security;
