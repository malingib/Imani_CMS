-- Migration: Schema refinement — date type consolidation, notification user_id, atomic provisioning, member count function
-- Supersedes: migration 00003 (all content is a no-op duplicate of 00002 L157-259)

-- 1. Convert text date columns to proper types
-- Empty strings and invalid dates become NULL (safe for existing data)
DO $$ BEGIN
  ALTER TABLE members ALTER COLUMN join_date TYPE date
    USING CASE WHEN join_date ~ '^\d{4}-\d{2}-\d{2}$' THEN join_date::date ELSE NULL END;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE members ALTER COLUMN birthday TYPE date
    USING CASE WHEN birthday ~ '^\d{4}-\d{2}-\d{2}$' THEN birthday::date ELSE NULL END;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE transactions ALTER COLUMN date TYPE date
    USING date::date;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE church_events ALTER COLUMN date TYPE date
    USING date::date;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE church_events ALTER COLUMN rsvp_deadline TYPE timestamptz
    USING CASE WHEN rsvp_deadline ~ '^\d{4}-\d{2}-\d{2}' THEN rsvp_deadline::timestamptz ELSE NULL END;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE recurring_expenses ALTER COLUMN next_date TYPE date
    USING CASE WHEN next_date ~ '^\d{4}-\d{2}-\d{2}$' THEN next_date::date ELSE NULL END;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE communications ALTER COLUMN date TYPE date
    USING date::date;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE communications ALTER COLUMN scheduled_for TYPE timestamptz
    USING CASE WHEN scheduled_for ~ '^\d{4}-\d{2}-\d{2}' THEN scheduled_for::timestamptz ELSE NULL END;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE activities ALTER COLUMN timestamp TYPE timestamptz
    USING CASE WHEN timestamp ~ '^\d{4}-\d{2}-\d{2}' THEN timestamp::timestamptz ELSE NULL END;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE sermons ALTER COLUMN date TYPE date
    USING date::date;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE audit_logs ALTER COLUMN timestamp TYPE timestamptz
    USING CASE WHEN timestamp ~ '^\d{4}-\d{2}-\d{2}' THEN timestamp::timestamptz ELSE NULL END;
EXCEPTION WHEN others THEN NULL;
END $$;

-- 2. Add user_id to notifications for recipient-scoped access
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- 3. Efficient bulk member count function (replaces N+1 per-church queries)
CREATE OR REPLACE FUNCTION get_member_counts_v2(church_ids UUID[])
RETURNS TABLE(church_id UUID, member_count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT m.church_id, COUNT(*)::BIGINT
  FROM members m
  WHERE m.church_id = ANY(church_ids)
  GROUP BY m.church_id
$$;

-- 4. Atomic tenant provisioning stored procedure (replaces JS multi-step with transaction)
CREATE OR REPLACE FUNCTION provision_tenant_church(
  p_name TEXT,
  p_slug TEXT,
  p_tier TEXT,
  p_admin_email TEXT DEFAULT NULL,
  p_onboarding_step TEXT DEFAULT 'welcome'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_church_id UUID;
  v_trial_end TIMESTAMPTZ;
BEGIN
  IF EXISTS (SELECT 1 FROM churches WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'A church with slug "%" already exists', p_slug;
  END IF;

  v_trial_end := NOW() + INTERVAL '14 days';

  INSERT INTO churches (name, slug, tier, status, trial_end_date, onboarding_step)
  VALUES (p_name, p_slug, p_tier, 'trialing', v_trial_end, p_onboarding_step)
  RETURNING id INTO v_church_id;

  INSERT INTO subscriptions (church_id, tier, status, start_date, end_date)
  VALUES (v_church_id, p_tier, 'trialing', NOW(), v_trial_end);

  IF p_admin_email IS NOT NULL AND p_admin_email <> '' THEN
    INSERT INTO invitations (church_id, email, role, token, expires_at)
    VALUES (v_church_id, p_admin_email, 'ADMIN', gen_random_uuid()::TEXT, NOW() + INTERVAL '7 days');
  END IF;

  RETURN v_church_id;
END;
$$;
