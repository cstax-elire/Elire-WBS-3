-- ==============================
-- Core Rosetta Stone Views
-- ==============================

BEGIN;

-- Basic Rosetta Stone pivot: atomic unit as the join row
CREATE OR REPLACE VIEW v_rosetta_stone AS
SELECT
  au.code          AS unit_code,
  au.name          AS unit_name,
  s.code           AS stream,
  oue.code         AS expected_org_unit,
  re.code          AS expected_role,
  string_agg(DISTINCT sor.code, ', ' ORDER BY sor.code) AS systems,
  string_agg(DISTINCT k.code, ', ' ORDER BY k.code)    AS kpis
FROM atomic_unit au
JOIN stream s ON s.stream_id=au.stream_id
LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id=au.unit_id
LEFT JOIN org_unit oue ON oue.org_unit_id=ueo.accountable_org_unit_id
LEFT JOIN org_role re ON re.role_id=ueo.accountable_role_id
LEFT JOIN unit_system us ON us.unit_id=au.unit_id
LEFT JOIN system_of_record sor ON sor.sor_id=us.sor_id
LEFT JOIN unit_kpi uk ON uk.unit_id=au.unit_id
LEFT JOIN kpi k ON k.kpi_id=uk.kpi_id
GROUP BY au.code, au.name, s.code, oue.code, re.code
ORDER BY stream, au.code;

-- Enhanced Rosetta Stone with latest observed ownership
CREATE OR REPLACE VIEW v_rosetta_stone_enhanced AS
WITH latest_observed AS (
  SELECT DISTINCT ON (unit_id) 
    unit_id, 
    accountable_role_id, 
    accountable_org_unit_id,
    observed_as_of,
    source,
    confidence_pct
  FROM unit_observed_ownership
  ORDER BY unit_id, observed_as_of DESC
)
SELECT
  au.code          AS unit_code,
  au.name          AS unit_name,
  s.code           AS stream,
  s.name           AS stream_name,
  -- Expected
  oue.code         AS expected_org_unit,
  oue.name         AS expected_org_name,
  re.code          AS expected_role,
  re.name          AS expected_role_name,
  -- Observed
  ouo.code         AS observed_org_unit,
  ro.code          AS observed_role,
  lo.observed_as_of,
  lo.source        AS observed_source,
  lo.confidence_pct,
  -- Status
  CASE 
    WHEN lo.unit_id IS NULL THEN 'Not Observed'
    WHEN lo.accountable_org_unit_id = ueo.accountable_org_unit_id 
     AND lo.accountable_role_id = ueo.accountable_role_id THEN 'Aligned'
    ELSE 'Misattributed'
  END AS ownership_status,
  -- Systems and KPIs
  string_agg(DISTINCT sor.code, ', ' ORDER BY sor.code) AS systems,
  string_agg(DISTINCT k.code, ', ' ORDER BY k.code)    AS kpis
FROM atomic_unit au
JOIN stream s ON s.stream_id = au.stream_id
LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id = au.unit_id
LEFT JOIN org_unit oue ON oue.org_unit_id = ueo.accountable_org_unit_id
LEFT JOIN org_role re ON re.role_id = ueo.accountable_role_id
LEFT JOIN latest_observed lo ON lo.unit_id = au.unit_id
LEFT JOIN org_unit ouo ON ouo.org_unit_id = lo.accountable_org_unit_id
LEFT JOIN org_role ro ON ro.role_id = lo.accountable_role_id
LEFT JOIN unit_system us ON us.unit_id = au.unit_id
LEFT JOIN system_of_record sor ON sor.sor_id = us.sor_id
LEFT JOIN unit_kpi uk ON uk.unit_id = au.unit_id
LEFT JOIN kpi k ON k.kpi_id = uk.kpi_id
GROUP BY 
  au.code, au.name, s.code, s.name,
  oue.code, oue.name, re.code, re.name,
  ouo.code, ro.code, lo.observed_as_of, lo.source, lo.confidence_pct,
  lo.unit_id, lo.accountable_org_unit_id, lo.accountable_role_id,
  ueo.accountable_org_unit_id, ueo.accountable_role_id
ORDER BY s.code, au.code;

COMMIT;