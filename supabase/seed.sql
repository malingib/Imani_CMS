-- Local development fixtures only. The Demo Church is created by the base multi-tenant migration.
-- All IDs are valid, deterministic UUIDs and every tenant-owned row is explicitly scoped.
-- Fixture email addresses use the reserved .invalid domain and cannot receive mail.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.churches WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    RAISE EXCEPTION 'Demo Church fixture is missing; apply migrations before loading seed data';
  END IF;
END;
$$;

INSERT INTO public.members (
  id, church_id, first_name, last_name, phone, email, location, groups,
  status, join_date, gender, marital_status, membership_type
) VALUES
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000001', 'David', 'Ochieng', '+254700000001', 'david.ochieng@example.invalid', 'Nairobi West', ARRAY['Youth Fellowship', 'Media & Tech'], 'Active', '2023-01-15', 'Male', 'Single', 'Full Member'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000001', 'Mary', 'Wambui', '+254700000002', 'mary.wambui@example.invalid', 'Kileleshwa', ARRAY['Women of Grace'], 'Active', '2022-11-20', 'Female', 'Married', 'Full Member'),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000001', 'John', 'Kamau', '+254700000003', 'john.kamau@example.invalid', 'Nairobi CBD', ARRAY['Men of Faith', 'Choir'], 'Active', '2023-06-01', 'Male', 'Married', 'Full Member'),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000001', 'Grace', 'Njoki', '+254700000004', 'grace.njoki@example.invalid', 'Westlands', ARRAY['Youth Fellowship'], 'Active', '2024-01-10', 'Female', 'Single', 'Probation'),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000001', 'Samuel', 'Mwangi', '+254700000005', 'samuel.mwangi@example.invalid', 'Karen', ARRAY['Media & Tech'], 'Active', '2023-09-15', 'Male', 'Married', 'Associate')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transactions (
  id, church_id, member_id, member_name, amount, type, payment_method, date,
  reference, category, source
) VALUES
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-4000-8000-000000000001', 'David Ochieng', 5000.00, 'Tithe', 'M-Pesa', '2024-05-19', 'SEED-TITHE-001', 'Income', 'MANUAL'),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-4000-8000-000000000002', 'Mary Wambui', 12000.00, 'Tithe', 'M-Pesa', '2024-05-18', 'SEED-TITHE-002', 'Income', 'MANUAL'),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000001', NULL, 'Church Utilities', 4500.00, 'Utility', 'Bank Transfer', '2024-05-15', 'SEED-EXPENSE-001', 'Expense', 'MANUAL'),
  ('20000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-4000-8000-000000000003', 'John Kamau', 3000.00, 'Offering', 'Cash', '2024-05-19', 'SEED-OFFERING-001', 'Income', 'MANUAL'),
  ('20000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-4000-8000-000000000001', 'David Ochieng', 2000.00, 'Project', 'M-Pesa', '2024-05-20', 'SEED-PROJECT-001', 'Income', 'MANUAL')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.groups (id, church_id, name, description, member_count)
VALUES
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000001', 'Youth Fellowship', 'For young adults aged 18-35', 1),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000001', 'Media & Tech', 'Manages church media and technology', 2),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000001', 'Women of Grace', 'Women''s ministry fellowship', 1),
  ('30000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000001', 'Men of Faith', 'Men''s ministry fellowship', 1),
  ('30000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000001', 'Choir', 'Church music and worship team', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.church_events (id, church_id, title, description, date, time, location, type, coordinator)
VALUES
  ('40000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000001', 'Sunday Worship Service', 'Main weekly worship service', '2027-05-26', '09:00 AM', 'Main Sanctuary', 'WORSHIP', 'Pastor John'),
  ('40000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000001', 'Midweek Bible Study', 'Wednesday Bible study session', '2027-05-29', '06:00 PM', 'Fellowship Hall', 'BIBLE_STUDY', 'Elder Peter'),
  ('40000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000001', 'Youth Outreach', 'Community outreach event', '2027-06-01', '10:00 AM', 'Nairobi West', 'OUTREACH', 'Brother David')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.event_attendance (church_id, event_id, member_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', '40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003'),
  ('00000000-0000-0000-0000-000000000001', '40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002')
ON CONFLICT DO NOTHING;
