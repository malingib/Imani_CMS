export const MOCK_CHURCHES = [
  { id: 'c0000000-0000-0000-0000-000000000001', name: 'Demo Church', slug: 'demo-church', tier: 'pro', status: 'active', created_at: '2024-01-01T00:00:00Z' },
  { id: 'c0000000-0000-0000-0000-000000000002', name: 'Nairobi Chapel', slug: 'nairobi-chapel', tier: 'basic', status: 'active', created_at: '2024-03-15T00:00:00Z' },
];

export const MOCK_MEMBERS = [
  { id: 'm0000001-0000-0000-0000-000000000001', first_name: 'David', last_name: 'Ochieng', phone: '+254712345678', email: 'david@example.com', location: 'Nairobi West', groups: ['Youth Fellowship', 'Media & Tech'], status: 'Active', join_date: '2023-01-15', gender: 'Male', marital_status: 'Single', membership_type: 'Full Member', church_id: 'c0000000-0000-0000-0000-000000000001' },
  { id: 'm0000001-0000-0000-0000-000000000002', first_name: 'Mary', last_name: 'Wambui', phone: '+254722111222', email: 'mary@example.com', location: 'Kileleshwa', groups: ['Women of Grace'], status: 'Active', join_date: '2022-11-20', gender: 'Female', marital_status: 'Married', membership_type: 'Full Member', church_id: 'c0000000-0000-0000-0000-000000000001' },
  { id: 'm0000001-0000-0000-0000-000000000003', first_name: 'John', last_name: 'Kamau', phone: '+254733333444', email: 'john@example.com', location: 'Karen', groups: ['Men of Faith'], status: 'Active', join_date: '2024-01-10', gender: 'Male', marital_status: 'Married', membership_type: 'Full Member', church_id: 'c0000000-0000-0000-0000-000000000002' },
];

export const MOCK_TRANSACTIONS = [
  { id: 't0000001-0000-0000-0000-000000000001', member_id: 'm0000001-0000-0000-0000-000000000001', member_name: 'David Ochieng', amount: 5000, type: 'Tithe', payment_method: 'M-Pesa', date: '2024-05-19', reference: 'QSG812L90P', category: 'Income', source: 'MANUAL', church_id: 'c0000000-0000-0000-0000-000000000001' },
  { id: 't0000001-0000-0000-0000-000000000002', member_id: null, member_name: 'Church Utilities', amount: 4500, type: 'Utility', payment_method: 'Bank Transfer', date: '2024-05-15', reference: 'UTL-001', category: 'Expense', source: 'MANUAL', church_id: 'c0000000-0000-0000-0000-000000000001' },
];

export const MOCK_EVENTS = [
  { id: 'e0000001-0000-0000-0000-000000000001', title: 'Sunday Worship', description: 'Weekly service', date: '2024-05-26', time: '09:00 AM', location: 'Main Sanctuary', type: 'WORSHIP', coordinator: 'Pastor John', attendance: [], church_id: 'c0000000-0000-0000-0000-000000000001' },
];

export const MOCK_SUBSCRIPTIONS = [
  { id: 's0000001-0000-0000-0000-000000000001', church_id: 'c0000000-0000-0000-0000-000000000001', tier: 'pro', status: 'active', start_date: '2024-01-01T00:00:00Z', end_date: null },
  { id: 's0000001-0000-0000-0000-000000000002', church_id: 'c0000000-0000-0000-0000-000000000002', tier: 'basic', status: 'active', start_date: '2024-03-15T00:00:00Z', end_date: null },
];

export const MOCK_INVOICES = [
  { id: 'i0000001-0000-0000-0000-000000000001', church_id: 'c0000000-0000-0000-0000-000000000001', subscription_id: 's0000001-0000-0000-0000-000000000001', amount: 9900, status: 'paid', due_date: '2024-06-01', paid_at: '2024-06-01T00:00:00Z' },
  { id: 'i0000001-0000-0000-0000-000000000002', church_id: 'c0000000-0000-0000-0000-000000000002', subscription_id: 's0000001-0000-0000-0000-000000000002', amount: 2900, status: 'pending', due_date: '2024-05-01', paid_at: null },
];

export const MOCK_PLATFORM_SETTINGS = {
  id: 'global',
  flags: { sms_integration: true, ai_features: true, allow_self_signup: false, maintenance_mode: false },
};
