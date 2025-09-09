-- Enhanced views for data-driven UI trees with ownership rollups

-- 1. Organization tree with ownership alignment rollups
CREATE OR REPLACE VIEW v_org_tree_with_ownership AS
WITH RECURSIVE org_ownership_stats AS (
    -- Calculate ownership stats for each org unit
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
),
recursive_rollup AS (
    -- Base case: leaf nodes with their direct stats
    SELECT 
        o.org_unit_id,
        o.code,
        o.name,
        o.parent_id,
        o.depth,
        o.path,
        o.path_codes,
        o.direct_headcount,
        o.direct_revenue,
        o.direct_cos,
        o.direct_sga,
        o.direct_gross_margin,
        o.direct_gm_pct,
        COALESCE(os.expected_units, 0) as direct_expected_units,
        COALESCE(os.aligned_units, 0) as direct_aligned_units,
        COALESCE(os.misattributed_units, 0) as direct_misattributed_units,
        COALESCE(os.not_observed_units, 0) as direct_not_observed_units,
        -- Initialize totals same as direct for leaf nodes
        COALESCE(os.expected_units, 0) as total_expected_units,
        COALESCE(os.aligned_units, 0) as total_aligned_units,
        COALESCE(os.misattributed_units, 0) as total_misattributed_units,
        COALESCE(os.not_observed_units, 0) as total_not_observed_units,
        o.direct_headcount as total_headcount,
        o.direct_revenue as total_revenue,
        o.direct_gross_margin as total_gross_margin
    FROM v_org_tree o
    LEFT JOIN org_ownership_stats os ON os.org_unit_id = o.org_unit_id
    WHERE NOT EXISTS (
        SELECT 1 FROM v_org_tree child WHERE child.parent_id = o.org_unit_id
    )
    
    UNION ALL
    
    -- Recursive case: nodes with children
    SELECT 
        p.org_unit_id,
        p.code,
        p.name,
        p.parent_id,
        p.depth,
        p.path,
        p.path_codes,
        p.direct_headcount,
        p.direct_revenue,
        p.direct_cos,
        p.direct_sga,
        p.direct_gross_margin,
        p.direct_gm_pct,
        COALESCE(os.expected_units, 0) as direct_expected_units,
        COALESCE(os.aligned_units, 0) as direct_aligned_units,
        COALESCE(os.misattributed_units, 0) as direct_misattributed_units,
        COALESCE(os.not_observed_units, 0) as direct_not_observed_units,
        -- Calculate totals including children
        COALESCE(os.expected_units, 0) + COALESCE(SUM(c.total_expected_units), 0) as total_expected_units,
        COALESCE(os.aligned_units, 0) + COALESCE(SUM(c.total_aligned_units), 0) as total_aligned_units,
        COALESCE(os.misattributed_units, 0) + COALESCE(SUM(c.total_misattributed_units), 0) as total_misattributed_units,
        COALESCE(os.not_observed_units, 0) + COALESCE(SUM(c.total_not_observed_units), 0) as total_not_observed_units,
        p.direct_headcount + COALESCE(SUM(c.total_headcount), 0) as total_headcount,
        p.direct_revenue + COALESCE(SUM(c.total_revenue), 0) as total_revenue,
        p.direct_gross_margin + COALESCE(SUM(c.total_gross_margin), 0) as total_gross_margin
    FROM v_org_tree p
    LEFT JOIN org_ownership_stats os ON os.org_unit_id = p.org_unit_id
    INNER JOIN recursive_rollup c ON c.parent_id = p.org_unit_id
    GROUP BY 
        p.org_unit_id, p.code, p.name, p.parent_id, p.depth, p.path, p.path_codes,
        p.direct_headcount, p.direct_revenue, p.direct_cos, p.direct_sga, 
        p.direct_gross_margin, p.direct_gm_pct,
        os.expected_units, os.aligned_units, os.misattributed_units, os.not_observed_units
)
SELECT 
    *,
    CASE 
        WHEN total_expected_units > 0 
        THEN ROUND(100.0 * total_aligned_units / total_expected_units, 1)
        ELSE NULL 
    END as alignment_pct,
    CASE 
        WHEN total_revenue > 0 
        THEN ROUND(100.0 * total_gross_margin / total_revenue, 1)
        ELSE NULL 
    END as total_gm_pct
FROM recursive_rollup;

-- 2. Stream tree with unit ownership details
CREATE OR REPLACE VIEW v_stream_tree_with_ownership AS
WITH stream_unit_ownership AS (
    -- Get ownership details for units in each stream
    SELECT 
        au.stream_id,
        au.unit_id,
        au.code as unit_code,
        au.name as unit_name,
        vrt.expected_role,
        vrt.expected_org,
        vrt.observed_role,
        vrt.observed_org,
        vrt.status,
        vrt.evidence_count,
        vrt.last_evidence_at,
        ueo.accountable_role_id as expected_role_id,
        ueo.accountable_org_unit_id as expected_org_id,
        uoo.accountable_role_id as observed_role_id,
        uoo.accountable_org_unit_id as observed_org_id
    FROM atomic_unit au
    LEFT JOIN v_rosetta_truth vrt ON vrt.unit_code = au.code
    LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id = au.unit_id
    LEFT JOIN LATERAL (
        SELECT accountable_role_id, accountable_org_unit_id 
        FROM unit_observed_ownership 
        WHERE unit_id = au.unit_id 
        ORDER BY observed_as_of DESC 
        LIMIT 1
    ) uoo ON true
),
stream_stats AS (
    -- Calculate stats for each stream
    SELECT 
        stream_id,
        COUNT(*) as total_units,
        SUM(CASE WHEN status = 'Aligned' THEN 1 ELSE 0 END) as aligned_units,
        SUM(CASE WHEN status = 'Misattributed' THEN 1 ELSE 0 END) as misattributed_units,
        SUM(CASE WHEN status = 'Not Observed' THEN 1 ELSE 0 END) as not_observed_units
    FROM stream_unit_ownership
    GROUP BY stream_id
)
SELECT 
    st.*,
    COALESCE(ss.total_units, 0) + COALESCE(st.linked_child_units, 0) as total_unit_count,
    COALESCE(ss.aligned_units, 0) as aligned_units,
    COALESCE(ss.misattributed_units, 0) as misattributed_units,
    COALESCE(ss.not_observed_units, 0) as not_observed_units,
    CASE 
        WHEN COALESCE(ss.total_units, 0) > 0 
        THEN ROUND(100.0 * ss.aligned_units / ss.total_units, 1)
        ELSE NULL 
    END as alignment_pct
FROM v_stream_tree st
LEFT JOIN stream_stats ss ON ss.stream_id = st.stream_id;

-- 3. Units by stream with full ownership details for editing
CREATE OR REPLACE VIEW v_stream_units_with_ownership AS
SELECT 
    au.unit_id,
    au.code as unit_code,
    au.name as unit_name,
    s.stream_id,
    s.code as stream_code,
    s.name as stream_name,
    vrt.expected_role,
    vrt.expected_org,
    vrt.observed_role,
    vrt.observed_org,
    vrt.status,
    vrt.evidence_count,
    vrt.last_evidence_at,
    ueo.accountable_role_id as expected_role_id,
    ueo.accountable_org_unit_id as expected_org_id,
    uoo.accountable_role_id as observed_role_id,
    uoo.accountable_org_unit_id as observed_org_id
FROM atomic_unit au
JOIN stream s ON s.stream_id = au.stream_id
LEFT JOIN v_rosetta_truth vrt ON vrt.unit_code = au.code
LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id = au.unit_id
LEFT JOIN LATERAL (
    SELECT accountable_role_id, accountable_org_unit_id 
    FROM unit_observed_ownership 
    WHERE unit_id = au.unit_id 
    ORDER BY observed_as_of DESC 
    LIMIT 1
) uoo ON true
ORDER BY s.order_in_parent, au.order_in_stream;

-- 4. Fix v_observed_from_evidence to include missing columns
CREATE OR REPLACE VIEW v_observed_from_evidence AS
SELECT 
    el.evidence_id,
    el.unit_id,
    au.code as unit_code,
    au.name as unit_name,
    vs.code as stream_code,
    vs.name as stream_name,
    el.subject_ref,
    el.evidence_type::text,
    el.system_ref::text,
    el.occurred_at,
    el.notes,
    el.actor_person_id,
    COALESCE(p.full_name, 'System') as actor_name,
    r.name as actor_role,
    ou.name as actor_org
FROM evidence_log el
JOIN atomic_unit au ON au.unit_id = el.unit_id
JOIN stream vs ON vs.stream_id = au.stream_id
LEFT JOIN person p ON p.person_id = el.actor_person_id
LEFT JOIN person_fact pf ON pf.person_id = p.person_id 
    AND pf.fact_type = 'current_role'
    AND pf.is_current = true
LEFT JOIN org_role r ON r.role_id::text = pf.fact_value
LEFT JOIN person_fact pf2 ON pf2.person_id = p.person_id 
    AND pf2.fact_type = 'home_org'
    AND pf2.is_current = true
LEFT JOIN org_unit ou ON ou.org_unit_id::text = pf2.fact_value
ORDER BY el.occurred_at DESC;

-- 5. Fix financial view column names
CREATE OR REPLACE VIEW v_financial_data AS
SELECT 
    ou.org_unit_id,
    ou.code as org_code,
    ou.name as org_name,
    'org' as org_type,
    ou.parent_id as parent_org_id,
    p.code as parent_org_code,
    p.name as parent_org_name,
    COUNT(DISTINCT pf.person_id) as headcount,
    COALESCE(SUM(ff.revenue), 0) as revenue,
    COALESCE(SUM(ff.direct_cost), 0) as direct_cost,
    COALESCE(SUM(ff.revenue - ff.direct_cost), 0) as gross_margin,
    CASE 
        WHEN SUM(ff.revenue) > 0 
        THEN ROUND(100.0 * SUM(ff.revenue - ff.direct_cost) / SUM(ff.revenue), 1)
        ELSE 0 
    END as gross_margin_pct,
    NULL::numeric as sga_allocation,
    NULL::numeric as operating_income,
    NULL::numeric as operating_margin_pct,
    ff.period_month,
    ff.fact_type
FROM org_unit ou
LEFT JOIN org_unit p ON p.org_unit_id = ou.parent_id
LEFT JOIN person_fact pf ON pf.fact_type = 'home_org' 
    AND pf.is_current = true
LEFT JOIN financial_fact ff ON ff.org_unit_id = ou.org_unit_id
GROUP BY 
    ou.org_unit_id, ou.code, ou.name,
    ou.parent_id, p.code, p.name,
    ff.period_month, ff.fact_type;

-- 6. Option views for dropdowns
CREATE OR REPLACE VIEW v_org_options AS
SELECT 
    org_unit_id as value,
    code || ' - ' || name as label,
    code,
    name,
    parent_id
FROM org_unit
ORDER BY org_type DESC, name;

CREATE OR REPLACE VIEW v_role_options AS
SELECT 
    role_id as value,
    name as label,
    code,
    name
FROM org_role
ORDER BY name;