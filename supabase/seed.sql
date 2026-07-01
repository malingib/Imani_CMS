-- Seed: One test church with sample data
-- Platform owner: malingib9@gmail.com (already created via Auth API)

-- Sample Members
INSERT INTO members (id, user_id, first_name, last_name, phone, email, location, groups, status, join_date, gender, marital_status, membership_type)
VALUES
  ('m0000001-0000-0000-0000-000000000001', NULL, 'David', 'Ochieng', '+254712345678', 'david.ochieng@example.com', 'Nairobi West', ARRAY['Youth Fellowship', 'Media & Tech'], 'Active', '2023-01-15', 'Male', 'Single', 'Full Member'),
  ('m0000001-0000-0000-0000-000000000002', NULL, 'Mary', 'Wambui', '+254722111222', 'mary.wambui@example.com', 'Kileleshwa', ARRAY['Women of Grace'], 'Active', '2022-11-20', 'Female', 'Married', 'Full Member'),
  ('m0000001-0000-0000-0000-000000000003', NULL, 'John', 'Kamau', '+254733333444', 'john.kamau@example.com', 'Nairobi CBD', ARRAY['Men of Faith', 'Choir'], 'Active', '2023-06-01', 'Male', 'Married', 'Full Member'),
  ('m0000001-0000-0000-0000-000000000004', NULL, 'Grace', 'Njoki', '+254744555666', 'grace.njoki@example.com', 'Westlands', ARRAY['Youth Fellowship'], 'Active', '2024-01-10', 'Female', 'Single', 'Probation'),
  ('m0000001-0000-0000-0000-000000000005', NULL, 'Samuel', 'Mwangi', '+254755777888', 'samuel.mwangi@example.com', 'Karen', ARRAY['Media & Tech'], 'Active', '2023-09-15', 'Male', 'Married', 'Associate')
ON CONFLICT (id) DO NOTHING;

-- Sample Transactions
INSERT INTO transactions (id, member_id, member_name, amount, type, payment_method, date, reference, category, source)
VALUES
  ('t0000001-0000-0000-0000-000000000001', 'm0000001-0000-0000-0000-000000000001', 'David Ochieng', 5000, 'Tithe', 'M-Pesa', '2024-05-19', 'QSG812L90P', 'Income', 'MANUAL'),
  ('t0000001-0000-0000-0000-000000000002', 'm0000001-0000-0000-0000-000000000002', 'Mary Wambui', 12000, 'Tithe', 'M-Pesa', '2024-05-18', 'QSG912M34Q', 'Income', 'MANUAL'),
  ('t0000001-0000-0000-0000-000000000003', NULL, 'Church Utilities', 4500, 'Utility', 'Bank Transfer', '2024-05-15', 'UTL-MAY-001', 'Expense', 'MANUAL'),
  ('t0000001-0000-0000-0000-000000000004', 'm0000001-0000-0000-0000-000000000003', 'John Kamau', 3000, 'Offering', 'Cash', '2024-05-19', 'OFF-0519-001', 'Income', 'MANUAL'),
  ('t0000001-0000-0000-0000-000000000005', 'm0000001-0000-0000-0000-000000000001', 'David Ochieng', 2000, 'Project', 'M-Pesa', '2024-05-20', 'PRJ-0520-001', 'Income', 'MANUAL')
ON CONFLICT (id) DO NOTHING;

-- Sample Groups
INSERT INTO groups (id, name, description, member_count)
VALUES
  ('g0000001-0000-0000-0000-000000000001', 'Youth Fellowship', 'For young adults aged 18-35', 45),
  ('g0000001-0000-0000-0000-000000000002', 'Media & Tech', 'Manages church media and technology', 12),
  ('g0000001-0000-0000-0000-000000000003', 'Women of Grace', 'Women''s ministry fellowship', 30),
  ('g0000001-0000-0000-0000-000000000004', 'Men of Faith', 'Men''s ministry fellowship', 25),
  ('g0000001-0000-0000-0000-000000000005', 'Choir', 'Church music and worship team', 20)
ON CONFLICT (id) DO NOTHING;

-- Sample Events
INSERT INTO church_events (id, title, description, date, time, location, type, coordinator)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'Sunday Worship Service', 'Main weekly worship service', '2024-05-26', '09:00 AM', 'Main Sanctuary', 'WORSHIP', 'Pastor John'),
  ('e0000001-0000-0000-0000-000000000002', 'Midweek Bible Study', 'Wednesday Bible study session', '2024-05-29', '06:00 PM', 'Fellowship Hall', 'BIBLE_STUDY', 'Elder Peter'),
  ('e0000001-0000-0000-0000-000000000003', 'Youth Outreach', 'Community outreach event', '2024-06-01', '10:00 AM', 'Nairobi West', 'OUTREACH', 'Brother David')
ON CONFLICT (id) DO NOTHING;

-- Link John Kamau and Mary Wambui to Sunday Worship
INSERT INTO event_attendance (event_id, member_id)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'm0000001-0000-0000-0000-000000000003'),
  ('e0000001-0000-0000-0000-000000000001', 'm0000001-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated users can read all data
CREATE POLICY "authenticated_read_members" ON members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_transactions" ON transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_events" ON church_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_event_attendance" ON event_attendance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_groups" ON groups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_group_members" ON group_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_communications" ON communications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_activities" ON activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_budgets" ON budgets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_recurring" ON recurring_expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_sermons" ON sermons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_notifications" ON notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_read_audit_logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');
