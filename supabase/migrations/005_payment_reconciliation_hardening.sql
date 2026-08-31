-- Ensure integrated payment records have the fields required by the webhook.
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS phone_number VARCHAR(32);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'MANUAL';

-- Never allow a successful M-Pesa receipt to create two financial transactions.
CREATE UNIQUE INDEX IF NOT EXISTS uq_transactions_integrated_reference
  ON transactions(reference)
  WHERE source = 'INTEGRATED' AND reference IS NOT NULL;

-- Public project progress is calculated without exposing individual member/payment data.
CREATE OR REPLACE VIEW public_projects AS
SELECT
  p.id,
  p.church_id,
  p.name,
  p.code,
  p.description,
  p.category,
  p.target_amount,
  p.start_date,
  p.target_date,
  p.status,
  p.public_visibility,
  p.allow_contributions,
  p.image_url,
  COALESCE(SUM(CASE WHEN t.category = 'Income' AND t.type = 'Project' THEN t.amount ELSE 0 END), 0) AS raised_amount,
  COUNT(DISTINCT CASE WHEN t.category = 'Income' AND t.type = 'Project' AND t.member_id IS NOT NULL THEN t.member_id END) AS contributor_count
FROM projects p
LEFT JOIN transactions t ON t.project_id = p.id
WHERE p.public_visibility = TRUE AND p.status = 'ACTIVE'
GROUP BY p.id;
