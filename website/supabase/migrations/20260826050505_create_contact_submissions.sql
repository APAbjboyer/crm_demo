-- Contact form submissions
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 1 and 320 and email like '%_@_%.__%'),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

-- Public can submit the form (insert only). No select/update/delete policy is
-- defined for anon/authenticated, so submissions are only readable via the
-- Supabase dashboard or service_role key, never through the client.
create policy "anyone can submit the contact form"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);
