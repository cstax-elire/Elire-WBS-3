-- ======================================================================
-- 10-ui-helpers.sql: UI Support Views and Missing Role Fixes
-- ======================================================================

BEGIN;

-- ======================================================================
-- SECTION A: Add Missing Roles Referenced in Expected Ownership
-- ======================================================================

-- Add roles that are referenced but don't exist
INSERT INTO org_role (code, name) VALUES
('COO', 'Chief Operating Officer'),
('CFO', 'Chief Financial Officer'),
('CONTROLLER', 'Controller'),
('RESOURCE_MGR', 'Resource Manager')
ON CONFLICT (code) DO NOTHING;

-- ======================================================================
-- SECTION B: Create UI Helper Views for Dropdowns
-- ======================================================================

-- Role options for dropdowns
CREATE OR REPLACE VIEW v_role_options AS
SELECT 
  role_id as value,
  code || ': ' || name as label,
  code,
  name
FROM org_role
ORDER BY 
  CASE 
    WHEN code LIKE 'CO_%' THEN 1
    WHEN code LIKE '%_DIR' THEN 2
    WHEN code LIKE '%_LEAD' THEN 3
    WHEN code = 'PARTNER' THEN 4
    ELSE 5
  END,
  name;

-- Org options with hierarchical path
CREATE OR REPLACE VIEW v_org_options AS
WITH RECURSIVE org_path AS (
  SELECT 
    org_unit_id,
    code,
    name,
    parent_id,
    name::text as path,
    0 as depth
  FROM org_unit
  WHERE parent_id IS NULL
  
  UNION ALL
  
  SELECT 
    o.org_unit_id,
    o.code,
    o.name,
    o.parent_id,
    op.path || ' > ' || o.name,
    op.depth + 1
  FROM org_unit o
  JOIN org_path op ON op.org_unit_id = o.parent_id
)
SELECT 
  org_unit_id as value,
  CASE 
    WHEN depth = 0 THEN name
    ELSE repeat('  ', depth) || '└─ ' || name
  END as label,
  path,
  code,
  depth
FROM org_path
ORDER BY path;

-- Stream options for filters
CREATE OR REPLACE VIEW v_stream_options AS
SELECT 
  stream_id as value,
  CASE 
    WHEN parent_id IS NULL THEN name
    ELSE '  └─ ' || name
  END as label,
  code,
  is_enabler,
  order_in_parent
FROM stream
ORDER BY 
  CASE WHEN parent_id IS NULL THEN order_in_parent ELSE 999 END,
  order_in_parent;

-- ======================================================================
-- SECTION C: Performance Indexes for UI Queries
-- ======================================================================

-- Critical indexes for UI performance
CREATE INDEX IF NOT EXISTS idx_observed_latest 
  ON unit_observed_ownership(unit_id, observed_as_of DESC);
  
CREATE INDEX IF NOT EXISTS idx_evidence_composite 
  ON evidence_log(unit_id, evidence_type, occurred_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_kpi_measurement_latest
  ON kpi_measurement(kpi_id, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_person_org
  ON person(org_unit_id);

CREATE INDEX IF NOT EXISTS idx_unit_stream
  ON atomic_unit(stream_id);

-- ======================================================================
-- SECTION D: Create Paginated Truth View for Performance
-- ======================================================================

-- Function to get paginated truth data
CREATE OR REPLACE FUNCTION get_rosetta_truth_page(
  page_size INT DEFAULT 50,
  page_offset INT DEFAULT 0,
  filter_stream TEXT DEFAULT NULL,
  filter_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  unit_code TEXT,
  unit_name TEXT,
  stream_code TEXT,
  expected_role TEXT,
  expected_org TEXT,
  observed_role TEXT,
  observed_org TEXT,
  status TEXT,
  evidence_count BIGINT,
  last_evidence_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_data AS (
    SELECT * FROM v_rosetta_truth
    WHERE 
      (filter_stream IS NULL OR stream_code = filter_stream)
      AND (filter_status IS NULL OR 
           CASE 
             WHEN filter_status = 'Misattributed' THEN status IN ('Role Mismatch', 'Org Mismatch')
             ELSE status = filter_status
           END)
  ),
  counted AS (
    SELECT *, COUNT(*) OVER() as total
    FROM filtered_data
  )
  SELECT 
    c.unit_code,
    c.unit_name,
    c.stream_code,
    c.expected_role,
    c.expected_org,
    c.observed_role,
    c.observed_org,
    c.status,
    c.evidence_count,
    c.last_evidence_at,
    c.total
  FROM counted c
  ORDER BY c.stream_code, c.unit_code
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- ======================================================================
-- SECTION E: Create Summary Statistics View
-- ======================================================================

CREATE OR REPLACE VIEW v_ownership_summary AS
WITH status_counts AS (
  SELECT 
    stream_code,
    COUNT(*) as total_units,
    COUNT(*) FILTER (WHERE status = 'Aligned') as aligned_count,
    COUNT(*) FILTER (WHERE status IN ('Role Mismatch', 'Org Mismatch')) as misattributed_count,
    COUNT(*) FILTER (WHERE status = 'Not Observed') as not_observed_count
  FROM v_rosetta_truth
  GROUP BY stream_code
)
SELECT 
  s.code as stream,
  s.name as stream_name,
  COALESCE(sc.total_units, 0) as total_units,
  COALESCE(sc.aligned_count, 0) as aligned,
  COALESCE(sc.misattributed_count, 0) as misattributed,
  COALESCE(sc.not_observed_count, 0) as not_observed,
  CASE 
    WHEN COALESCE(sc.total_units, 0) > 0 
    THEN ROUND(100.0 * sc.aligned_count / sc.total_units, 1)
    ELSE 0 
  END as alignment_pct
FROM stream s
LEFT JOIN status_counts sc ON sc.stream_code = s.code
WHERE s.parent_id IS NULL
ORDER BY s.order_in_parent;

-- ======================================================================
-- SECTION F: Fix NULL Handling in Misattribution Delta
-- ======================================================================

CREATE OR REPLACE VIEW v_misattribution_delta AS
WITH latest_observed AS (
  SELECT DISTINCT ON (unit_id)
    unit_id,
    accountable_role_id AS obs_role_id,
    accountable_org_unit_id AS obs_org_id,
    observed_as_of,
    source,
    confidence_pct
  FROM unit_observed_ownership
  ORDER BY unit_id, observed_as_of DESC
)
SELECT
  s.code AS stream,
  ps.code AS parent_stream,
  au.code AS unit_code,
  au.name AS unit_name,
  
  -- Expected ownership (handle NULLs)
  COALESCE(exp_role.code, 'UNDEFINED') AS expected_role,
  COALESCE(exp_org.code, 'UNDEFINED') AS expected_org,
  
  -- Observed ownership (handle NULLs)
  COALESCE(obs_role.code, 'NOT_SET') AS observed_role,
  COALESCE(obs_org.code, 'NOT_SET') AS observed_org,
  
  -- Misattribution flags
  CASE 
    WHEN lo.unit_id IS NULL THEN 'Not Observed'
    WHEN ueo.accountable_role_id IS NULL OR ueo.accountable_org_unit_id IS NULL THEN 'Incomplete Expected'
    WHEN exp_role.code IS DISTINCT FROM obs_role.code THEN 'Role Mismatch'
    WHEN exp_org.code IS DISTINCT FROM obs_org.code THEN 'Org Mismatch'
    ELSE 'Aligned'
  END AS attribution_status,
  
  CASE
    WHEN lo.unit_id IS NOT NULL AND 
         (exp_role.code IS DISTINCT FROM obs_role.code OR 
          exp_org.code IS DISTINCT FROM obs_org.code) 
    THEN true
    ELSE false
  END AS is_misattributed,
  
  lo.observed_as_of,
  lo.source AS observation_source,
  lo.confidence_pct
  
FROM atomic_unit au
JOIN stream s ON s.stream_id = au.stream_id
LEFT JOIN stream ps ON ps.stream_id = s.parent_id
LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id = au.unit_id
LEFT JOIN org_role exp_role ON exp_role.role_id = ueo.accountable_role_id
LEFT JOIN org_unit exp_org ON exp_org.org_unit_id = ueo.accountable_org_unit_id
LEFT JOIN latest_observed lo ON lo.unit_id = au.unit_id
LEFT JOIN org_role obs_role ON obs_role.role_id = lo.obs_role_id
LEFT JOIN org_unit obs_org ON obs_org.org_unit_id = lo.obs_org_id
ORDER BY 
  COALESCE(ps.code, s.code),
  s.code,
  au.order_in_stream;

-- ======================================================================
-- SECTION G: Create Evidence Type Enum and Constraints
-- ======================================================================

-- Create evidence type constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'evidence_type_check'
  ) THEN
    ALTER TABLE evidence_log 
    ADD CONSTRAINT evidence_type_check 
    CHECK (evidence_type IN (
      'ownership_update',
      'kpi_measurement', 
      'pricing_decision',
      'solution_outline',
      'proposal_redline',
      'recruit_req',
      'scope_change',
      'milestone_complete',
      'invoice_adjustment'
    ));
  END IF;
END$$;

-- ======================================================================
-- SECTION H: Validation Summary
-- ======================================================================

CREATE OR REPLACE VIEW v_ui_validation AS
SELECT 'UI Helper Views Validation' as check_name
UNION ALL
SELECT '------------------------'
UNION ALL
SELECT 'Role options available: ' || COUNT(*)::text FROM v_role_options
UNION ALL
SELECT 'Org options available: ' || COUNT(*)::text FROM v_org_options
UNION ALL
SELECT 'Stream options available: ' || COUNT(*)::text FROM v_stream_options
UNION ALL
SELECT 'Missing roles fixed: ' || COUNT(*)::text 
FROM org_role WHERE code IN ('COO', 'CFO', 'CONTROLLER', 'RESOURCE_MGR')
UNION ALL
SELECT 'Ownership summary streams: ' || COUNT(*)::text FROM v_ownership_summary
UNION ALL
SELECT 'Total units tracked: ' || COUNT(*)::text FROM atomic_unit
UNION ALL
SELECT 'Units with expected ownership: ' || COUNT(*)::text FROM unit_expected_ownership
UNION ALL
SELECT 'Units with observed ownership: ' || COUNT(*)::text 
FROM (SELECT DISTINCT unit_id FROM unit_observed_ownership) x;

COMMIT;

-- Run validation
SELECT * FROM v_ui_validation;