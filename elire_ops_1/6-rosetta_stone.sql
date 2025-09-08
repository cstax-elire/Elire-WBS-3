BEGIN;

-- Rosetta Stone pivot: atomic unit as the join row
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

-- Stream rollup: latest outcomes & selected drivers
CREATE OR REPLACE VIEW v_stream_rollup AS
WITH latest AS (
  SELECT DISTINCT ON (km.kpi_id, COALESCE(km.stream_id, u.stream_id))
         km.kpi_id, COALESCE(km.stream_id, u.stream_id) AS stream_id, km.value_numeric, km.measured_at
  FROM kpi_measurement km
  LEFT JOIN atomic_unit u ON u.unit_id=km.unit_id
  ORDER BY km.kpi_id, COALESCE(km.stream_id, u.stream_id), km.measured_at DESC
)
SELECT
  s.code AS stream,
  k.code AS kpi,
  l.value_numeric AS latest_value,
  l.measured_at
FROM latest l
JOIN kpi k ON k.kpi_id=l.kpi_id
JOIN stream s ON s.stream_id=l.stream_id
WHERE k.kind='lagging'
ORDER BY stream, kpi;

-- Org rollup: count people, sum budget by org unit, with hierarchy path
CREATE OR REPLACE VIEW v_org_rollup AS
WITH people AS (
  SELECT ou.org_unit_id, COUNT(p.person_id) AS headcount
  FROM org_unit ou LEFT JOIN person p ON p.org_unit_id=ou.org_unit_id
  GROUP BY ou.org_unit_id
),
budget AS (
  SELECT org_unit_id, SUM(amount) AS budget_2025
  FROM financial_fact
  WHERE period='2025' AND type='budget'
  GROUP BY org_unit_id
),
path AS (
  -- build a simple "parent chain" string for display
  SELECT
    ou.org_unit_id,
    ou.code,
    ou.name,
    (SELECT name FROM org_unit WHERE org_unit_id=ou.parent_id) AS parent_name
  FROM org_unit ou
)
SELECT
  pth.code,
  pth.name,
  pth.parent_name,
  COALESCE(ppl.headcount,0) AS headcount,
  COALESCE(bud.budget_2025,0) AS budget_2025
FROM path pth
LEFT JOIN people ppl ON ppl.org_unit_id=pth.org_unit_id
LEFT JOIN budget bud ON bud.org_unit_id=pth.org_unit_id
ORDER BY pth.parent_name NULLS FIRST, pth.name;

-- Financial rollup: totals by category and pillar (you can pivot deeper in app)
CREATE OR REPLACE VIEW v_financial_rollup AS
SELECT
  ou.code              AS org_unit,
  fa.category          AS category,
  SUM(ff.amount)       AS amount_2025
FROM financial_fact ff
JOIN financial_account fa ON fa.account_id=ff.account_id
LEFT JOIN org_unit ou ON ou.org_unit_id=ff.org_unit_id
WHERE ff.period='2025' AND ff.type='budget'
GROUP BY ou.code, fa.category
ORDER BY ou.code, fa.category;

-- KPI rollup (drivers → outcomes mapping, per stream)
CREATE OR REPLACE VIEW v_kpi_rollup AS
SELECT
  s.code AS stream,
  kout.code AS outcome_kpi,
  string_agg(DISTINCT kdrv.code, ', ' ORDER BY kdrv.code) AS driver_kpis
FROM kpi kout
JOIN unit_kpi uk ON uk.kpi_id IN (
  SELECT kpi_id FROM kpi WHERE kind='leading'
)
JOIN kpi kdrv ON kdrv.kpi_id = uk.kpi_id
JOIN atomic_unit u ON u.unit_id=uk.unit_id
JOIN stream s ON s.stream_id=u.stream_id
WHERE kout.kind='lagging'
GROUP BY s.code, kout.code
ORDER BY stream, outcome_kpi;

COMMIT;
