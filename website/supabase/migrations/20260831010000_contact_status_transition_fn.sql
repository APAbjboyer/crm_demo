-- Build 2: atomic Contacts status transition + activity_log write.
-- Wrapping both writes in a single Postgres function makes them
-- transactional (both succeed or both roll back) — a plain two-step
-- update-then-insert from the app layer could leave a status change
-- with no matching activity_log row if the second call failed.

create or replace function public.transition_contact_status(
  p_contact_id uuid,
  p_to_status text,
  p_actor text,
  p_note text default null
)
returns public.contacts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contact public.contacts;
  v_from_status text;
begin
  if p_to_status not in ('new_lead', 'contacted', 'discovery_call', 'proposal', 'won', 'lost') then
    raise exception 'Invalid contact status: %', p_to_status;
  end if;

  select status into v_from_status
    from public.contacts
    where id = p_contact_id
    for update;

  if not found then
    raise exception 'Contact % not found', p_contact_id;
  end if;

  update public.contacts
    set status = p_to_status
    where id = p_contact_id
    returning * into v_contact;

  insert into public.activity_log (contact_id, person_id, from_status, to_status, actor, note)
    values (p_contact_id, v_contact.person_id, v_from_status, p_to_status, p_actor, p_note);

  return v_contact;
end;
$$;

-- Least privilege: only the service role (used server-side from /admin)
-- may call this. No anon/authenticated grant — status changes never
-- happen from the client directly.
revoke all on function public.transition_contact_status(uuid, text, text, text) from public;
grant execute on function public.transition_contact_status(uuid, text, text, text) to service_role;
