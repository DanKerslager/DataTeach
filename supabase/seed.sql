-- Replace the UUID below with a real auth.users id from your Supabase project.
insert into public.users (id, full_name)
values ('00000000-0000-0000-0000-000000000001', 'Demo Teacher')
on conflict (id) do nothing;

insert into public.topics (id, user_id, title, parent_id, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Algebra', null, 1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Linear equations', '10000000-0000-0000-0000-000000000001', 1),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Geometry', null, 2)
on conflict (id) do nothing;

insert into public.classes (id, user_id, name)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '7.A'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '7.B'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '8.A')
on conflict (id) do nothing;

insert into public.class_topic_status (class_id, topic_id, taught, notes, teaching_date)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', true, 'Solved worksheet 3.', '2026-03-15')
on conflict (class_id, topic_id) do update
set taught = excluded.taught,
    notes = excluded.notes,
    teaching_date = excluded.teaching_date;
