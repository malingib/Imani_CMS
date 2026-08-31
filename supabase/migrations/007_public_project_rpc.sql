-- Do not grant anonymous access to the projects table. Public pages use this
-- narrowly scoped function instead, so member/financial fields remain private.
CREATE OR REPLACE FUNCTION get_public_project(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  church_id UUID,
  name VARCHAR,
  code VARCHAR,
  description TEXT,
  category VARCHAR,
  target_amount NUMERIC,
  start_date DATE,
  target_date DATE,
  status VARCHAR,
  public_visibility BOOLEAN,
  allow_contributions BOOLEAN,
  image_url TEXT,
  raised_amount NUMERIC,
  contributor_count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
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
  WHERE p.id = p_project_id
    AND p.public_visibility = TRUE
    AND p.status = 'ACTIVE'
  GROUP BY p.id;
$$;

REVOKE ALL ON FUNCTION get_public_project(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_public_project(UUID) TO anon, authenticated;
