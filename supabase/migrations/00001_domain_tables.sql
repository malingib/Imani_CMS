-- Migration: Domain tables for Imani CMS

-- Enums
CREATE TYPE member_status AS ENUM ('Active', 'Inactive', 'Visitor', 'Youth', 'Deceased', 'Archived');
CREATE TYPE marital_status AS ENUM ('Single', 'Married', 'Widowed', 'Divorced');
CREATE TYPE membership_type AS ENUM ('Full Member', 'Probation', 'Associate', 'Clergy', 'Non-Communicant');
CREATE TYPE transaction_type AS ENUM ('Tithe', 'Offering', 'Project', 'Harambee', 'Benevolence', 'Expense', 'Salary', 'Utility', 'Maintenance');
CREATE TYPE payment_method AS ENUM ('M-Pesa', 'Cash', 'Bank Transfer', 'Cheque');
CREATE TYPE transaction_category AS ENUM ('Income', 'Expense');
CREATE TYPE transaction_source AS ENUM ('MANUAL', 'INTEGRATED');
CREATE TYPE frequency AS ENUM ('Weekly', 'Monthly', 'Quarterly', 'Yearly');
CREATE TYPE event_type AS ENUM ('WORSHIP', 'BIBLE_STUDY', 'PRAYER', 'OUTREACH', 'YOUTH', 'OTHER');
CREATE TYPE recurrence AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'ANNUALLY');
CREATE TYPE communication_type AS ENUM ('SMS', 'Email', 'WhatsApp');
CREATE TYPE communication_status AS ENUM ('Sent', 'Scheduled', 'Failed');
CREATE TYPE activity_type AS ENUM ('PAYMENT', 'EVENT_RSVP', 'PROFILE_UPDATE', 'GROUP_JOIN');
CREATE TYPE notification_type AS ENUM ('SYSTEM', 'MPESA', 'MEMBER', 'EVENT');
CREATE TYPE severity AS ENUM ('INFO', 'WARN', 'CRITICAL');

-- Members
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  location text,
  groups text[],
  status member_status DEFAULT 'Active',
  join_date text,
  birthday text,
  age integer,
  gender text,
  marital_status marital_status,
  membership_type membership_type,
  photo text,
  stewardship_score integer,
  tenant_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Groups
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  member_count integer DEFAULT 0,
  tenant_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE group_members (
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, member_id)
);

-- Transactions
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  member_name text,
  amount numeric NOT NULL,
  type transaction_type NOT NULL,
  payment_method payment_method,
  date text NOT NULL,
  reference text,
  category transaction_category NOT NULL,
  notes text,
  phone_number text,
  source transaction_source DEFAULT 'MANUAL',
  tenant_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Budgets
CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  amount numeric NOT NULL,
  spent numeric DEFAULT '0',
  month text NOT NULL,
  tenant_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  amount numeric NOT NULL,
  frequency frequency NOT NULL,
  next_date text,
  tenant_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Church Events
CREATE TABLE church_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date text NOT NULL,
  time text,
  location text,
  type event_type DEFAULT 'OTHER',
  coordinator text,
  contact_person text,
  rsvp_deadline text,
  recurrence recurrence DEFAULT 'NONE',
  tenant_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE event_attendance (
  event_id uuid NOT NULL REFERENCES church_events(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, member_id)
);

-- Communications
CREATE TABLE communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type communication_type NOT NULL,
  recipient_count integer,
  target_group_name text,
  subject text,
  content text NOT NULL,
  date text NOT NULL,
  status communication_status DEFAULT 'Sent',
  sender text,
  scheduled_for text,
  delivery_breakdown jsonb,
  tenant_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sermons
CREATE TABLE sermons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  speaker text NOT NULL,
  date text NOT NULL,
  time text,
  scripture text,
  event text,
  event_id uuid REFERENCES church_events(id) ON DELETE SET NULL,
  transcript text,
  tenant_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activities
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  description text,
  timestamp text,
  metadata jsonb,
  tenant_id text,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  time text,
  type notification_type NOT NULL,
  read boolean DEFAULT false,
  tenant_id text,
  created_at timestamptz DEFAULT now()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  user_name text,
  action text NOT NULL,
  module text NOT NULL,
  timestamp text,
  severity severity DEFAULT 'INFO',
  metadata jsonb,
  tenant_id text
);
