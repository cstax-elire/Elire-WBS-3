-- UI Fix: Align status model to use single 'Misattributed' status (ui-fix.md recommendation A Option 1)
-- This fixes the critical bug where filters and summaries expect 'Role Mismatch'/'Org Mismatch' 
-- but v_rosetta_truth only returns 'Misattributed'

-- Fix get_rosetta_truth_page function to correctly filter on 'Misattributed' status
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
  last_evidence_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_data AS (
    SELECT
      vrt.unit_code,
      vrt.unit_name,
      vrt.stream_code,
      vrt.expected_role,
      vrt.expected_org,
      vrt.observed_role,
      vrt.observed_org,
      vrt.status,
      vrt.evidence_count,
      vrt.last_evidence_at
    FROM v_rosetta_truth vrt
    WHERE
      (filter_stream IS NULL OR vrt.stream_code = filter_stream)
      AND (filter_status IS NULL OR vrt.status = filter_status)  -- Fixed: direct status comparison
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
$$;

-- Fix v_ownership_summary to correctly count 'Misattributed' status
CREATE OR REPLACE VIEW v_ownership_summary AS
WITH status_counts AS (
  SELECT 
    stream_code,
    COUNT(*) AS total_units,
    COUNT(*) FILTER (WHERE status = 'Aligned') AS aligned_count,
    COUNT(*) FILTER (WHERE status = 'Misattributed') AS misattributed_count,  -- Fixed: use 'Misattributed'
    COUNT(*) FILTER (WHERE status = 'Not Observed') AS not_observed_count
  FROM v_rosetta_truth
  GROUP BY stream_code
)
SELECT 
  s.code AS stream,
  s.name AS stream_name,
  COALESCE(sc.total_units, 0) AS total_units,
  COALESCE(sc.aligned_count, 0) AS aligned,
  COALESCE(sc.misattributed_count, 0) AS misattributed,
  COALESCE(sc.not_observed_count, 0) AS not_observed,
  CASE 
    WHEN COALESCE(sc.total_units, 0) > 0 
    THEN ROUND(100.0 * sc.aligned_count / sc.total_units, 1)
    ELSE 0
  END AS alignment_pct
FROM stream s
LEFT JOIN status_counts sc ON sc.stream_code = s.code
WHERE s.parent_id IS NULL  -- Top-level streams only
ORDER BY s.order_in_parent;

-- Verify the fix
SELECT 'Status values in v_rosetta_truth:' as check_name;
SELECT DISTINCT status FROM v_rosetta_truth;

SELECT 'Ownership summary with fixed counting:' as check_name;
SELECT * FROM v_ownership_summary;

SELECT 'Test pagination with Misattributed filter:' as check_name;
SELECT COUNT(*) as misattributed_count 
FROM get_rosetta_truth_page(50, 0, NULL, 'Misattributed');