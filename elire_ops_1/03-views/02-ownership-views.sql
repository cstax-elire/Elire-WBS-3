-- ==============================
-- Ownership Comparison and Status Views
-- ==============================

BEGIN;

-- Truth table: Expected vs Observed with status
CREATE OR REPLACE VIEW v_rosetta_truth AS
WITH latest_observed AS (
  SELECT DISTINCT ON (unit_id) 
    unit_id, 
    accountable_role_id, 
    accountable_org_unit_id,
    observed_as_of,
    source,
    confidence_pct,
    notes
  FROM unit_observed_ownership
  ORDER BY unit_id, observed_as_of DESC
),
evidence_stats AS (
  SELECT 
    unit_id,
    COUNT(*) as evidence_count,
    MAX(occurred_at) as last_evidence_at
  FROM evidence_log
  GROUP BY unit_id
)
SELECT
  au.code AS unit_code,
  au.name AS unit_name,
  s.code AS stream_code,
  s.name AS stream_name,
  -- Expected ownership
  er.code AS expected_role,
  eo.code AS expected_org,
  -- Observed ownership  
  osr.code AS observed_role,
  oso.code AS observed_org,
  lo.observed_as_of,
  lo.source,
  lo.confidence_pct,
  lo.notes,
  -- Status flags
  CASE 
    WHEN lo.unit_id IS NULL THEN 'Not Observed'
    WHEN lo.accountable_org_unit_id = ueo.accountable_org_unit_id 
     AND lo.accountable_role_id = ueo.accountable_role_id THEN 'Aligned'
    ELSE 'Misattributed'
  END AS status,
  CASE 
    WHEN lo.unit_id IS NULL THEN FALSE
    WHEN lo.accountable_org_unit_id != ueo.accountable_org_unit_id 
      OR lo.accountable_role_id != ueo.accountable_role_id THEN TRUE
    ELSE FALSE
  END AS is_misattributed,
  -- Evidence
  COALESCE(es.evidence_count, 0) as evidence_count,
  es.last_evidence_at
FROM atomic_unit au
JOIN stream s ON s.stream_id = au.stream_id
LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id = au.unit_id
LEFT JOIN org_role er ON er.role_id = ueo.accountable_role_id
LEFT JOIN org_unit eo ON eo.org_unit_id = ueo.accountable_org_unit_id
LEFT JOIN latest_observed lo ON lo.unit_id = au.unit_id
LEFT JOIN org_role osr ON osr.role_id = lo.accountable_role_id
LEFT JOIN org_unit oso ON oso.org_unit_id = lo.accountable_org_unit_id
LEFT JOIN evidence_stats es ON es.unit_id = au.unit_id
ORDER BY s.code, au.code;

-- Misattribution delta view
CREATE OR REPLACE VIEW v_misattribution_delta AS
SELECT
  vrt.*,
  CASE 
    WHEN vrt.is_misattributed THEN 
      vrt.expected_org || '/' || vrt.expected_role || ' → ' || 
      vrt.observed_org || '/' || vrt.observed_role
    ELSE NULL
  END AS misattribution_path
FROM v_rosetta_truth vrt
ORDER BY vrt.stream_code, vrt.unit_code;

-- Ownership summary by organization
CREATE OR REPLACE VIEW v_ownership_summary AS
WITH org_stats AS (
  SELECT 
    ueo.accountable_org_unit_id as org_unit_id,
    COUNT(*) as expected_units,
    SUM(CASE WHEN vrt.status = 'Aligned' THEN 1 ELSE 0 END) as aligned_units,
    SUM(CASE WHEN vrt.status = 'Misattributed' THEN 1 ELSE 0 END) as misattributed_units,
    SUM(CASE WHEN vrt.status = 'Not Observed' THEN 1 ELSE 0 END) as not_observed_units
  FROM unit_expected_ownership ueo
  JOIN atomic_unit au ON au.unit_id = ueo.unit_id
  LEFT JOIN v_rosetta_truth vrt ON vrt.unit_code = au.code
  GROUP BY ueo.accountable_org_unit_id
)
SELECT 
  ou.code,
  ou.name,
  COALESCE(os.expected_units, 0) as expected_units,
  COALESCE(os.aligned_units, 0) as aligned_units,
  COALESCE(os.misattributed_units, 0) as misattributed_units,
  COALESCE(os.not_observed_units, 0) as not_observed_units,
  CASE 
    WHEN os.expected_units > 0 
    THEN ROUND(100.0 * os.aligned_units / os.expected_units, 1)
    ELSE NULL 
  END as alignment_pct
FROM org_unit ou
LEFT JOIN org_stats os ON os.org_unit_id = ou.org_unit_id
WHERE os.expected_units > 0
ORDER BY ou.name;

-- Inferred observed ownership from evidence (90-day window)
CREATE OR REPLACE VIEW v_inferred_observed_90d AS
WITH recent AS (
  SELECT el.unit_id,
         el.actor_role_id,
         el.org_unit_id,
         COUNT(*) AS cnt,
         MAX(el.occurred_at) AS last_seen
  FROM evidence_log el
  WHERE el.occurred_at >= now() - INTERVAL '90 days'
  GROUP BY el.unit_id, el.actor_role_id, el.org_unit_id
),
ranked AS (
  SELECT r.*,
         ROW_NUMBER() OVER (PARTITION BY r.unit_id ORDER BY r.cnt DESC, r.last_seen DESC) AS rn
  FROM recent r
)
SELECT unit_id, actor_role_id AS inferred_role_id, org_unit_id AS inferred_org_id, last_seen
FROM ranked
WHERE rn = 1;

-- Evidence formatted for UI display
CREATE OR REPLACE VIEW v_observed_from_evidence AS
SELECT 
  el.evidence_id,
  au.code AS unit_code,
  au.name AS unit_name,
  el.subject_ref,
  el.evidence_type,
  el.system_ref,
  p.full_name AS actor_name,
  r.name AS actor_role,
  o.name AS actor_org,
  el.occurred_at,
  el.notes
FROM evidence_log el
JOIN atomic_unit au ON au.unit_id = el.unit_id
LEFT JOIN person p ON p.person_id = el.actor_person_id
LEFT JOIN org_role r ON r.role_id = el.actor_role_id
LEFT JOIN org_unit o ON o.org_unit_id = el.org_unit_id
ORDER BY el.occurred_at DESC;

COMMIT;