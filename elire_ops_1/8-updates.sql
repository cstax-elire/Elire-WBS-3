BEGIN;

-- --------------------------------------------------------------
-- A) DO NOT overwrite Expected. Capture current reality as Observed.
-- --------------------------------------------------------------
-- WIN-02 Discovery → Observed = PRACTICE_LEAD @ PILLAR_SERVICE_EXEC
INSERT INTO unit_observed_ownership (unit_id, observed_as_of, accountable_role_id, accountable_org_unit_id, source, confidence_pct, notes)
SELECT u.unit_id, now(),
       (SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       'policy_interview', 0.9, 'Discovery is consistently performed/owned by Delivery'
FROM atomic_unit u
WHERE u.code='WIN-02';

-- WIN-03 Pricing → Observed = DELIVERY_LEAD @ PILLAR_SERVICE_EXEC
INSERT INTO unit_observed_ownership (unit_id, observed_as_of, accountable_role_id, accountable_org_unit_id, source, confidence_pct, notes)
SELECT u.unit_id, now(),
       (SELECT role_id FROM org_role WHERE code='DELIVERY_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       'policy_interview', 0.9, 'Pricing/discount decisions reside in Delivery'
FROM atomic_unit u
WHERE u.code='WIN-03';

-- --------------------------------------------------------------
-- B) Evidence log + indexes + inference view
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence_log (
  evidence_id        BIGSERIAL PRIMARY KEY,
  unit_id            INT NOT NULL REFERENCES atomic_unit(unit_id) ON DELETE CASCADE,
  subject_ref        TEXT NOT NULL,
  evidence_type      TEXT NOT NULL,        -- e.g., 'solution_outline','pricing_decision','recruit_req'
  system_ref         TEXT,                 -- consider SOR FK later
  actor_person_id    INT REFERENCES person(person_id),
  actor_role_id      INT REFERENCES org_role(role_id),
  org_unit_id        INT REFERENCES org_unit(org_unit_id),
  occurred_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes              TEXT
);

CREATE INDEX IF NOT EXISTS ix_evidence_unit_time ON evidence_log (unit_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ix_evidence_subject   ON evidence_log (subject_ref);

-- Fallback: infer observed (role/org) from last 90 days of evidence if explicit Observed is missing
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

-- --------------------------------------------------------------
-- C) SG&A allocation with uniqueness + allocated rollup view
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sga_allocation (
  alloc_id            BIGSERIAL PRIMARY KEY,
  source_org_unit_id  INT NOT NULL REFERENCES org_unit(org_unit_id),
  target_org_unit_id  INT NOT NULL REFERENCES org_unit(org_unit_id),
  period              TEXT NOT NULL,
  type                TEXT NOT NULL DEFAULT 'budget',
  amount              NUMERIC NOT NULL,
  method              TEXT NOT NULL DEFAULT 'headcount'
);
-- prevent duplicates per run
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = current_schema() AND indexname = 'ux_sga_alloc_unique'
  ) THEN
    CREATE UNIQUE INDEX ux_sga_alloc_unique
      ON sga_allocation (source_org_unit_id, target_org_unit_id, period, type, method);
  END IF;
END$$;

-- Headcount-based allocation from FINOPS pillar to Delivery practices (SE_%)
WITH sga_source AS (
  SELECT SUM(ff.amount) AS total_sga
  FROM financial_fact ff
  JOIN financial_account fa ON fa.account_id = ff.account_id
  WHERE ff.period='2025' AND ff.type='budget'
    AND fa.category='SGA'
    AND ff.org_unit_id = (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_FINOPS')
),
targets AS (
  SELECT ou.org_unit_id,
         COUNT(p.person_id)::numeric AS headcount
  FROM org_unit ou
  LEFT JOIN person p ON p.org_unit_id = ou.org_unit_id
  WHERE ou.code LIKE 'SE_%'
  GROUP BY ou.org_unit_id
),
weights AS (
  SELECT t.org_unit_id,
         t.headcount / NULLIF(SUM(t.headcount) OVER (),0) AS w
  FROM targets t
),
alloc AS (
  SELECT (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_FINOPS') AS source_org_unit_id,
         w.org_unit_id AS target_org_unit_id,
         '2025'::text AS period,
         'budget'::text AS type,
         (SELECT total_sga FROM sga_source) * w.w AS amount,
         'headcount'::text AS method
  FROM weights w
)
INSERT INTO sga_allocation (source_org_unit_id,target_org_unit_id,period,type,amount,method)
SELECT a.*
FROM alloc a
ON CONFLICT (source_org_unit_id,target_org_unit_id,period,type,method) DO UPDATE
SET amount = EXCLUDED.amount;

-- Allocated financial view: reattribute SG&A (source negative, target positive)
CREATE OR REPLACE VIEW v_financial_rollup_with_sga AS
WITH base AS (
  SELECT ou.code AS org_unit, fa.category, SUM(ff.amount) AS amount_2025
  FROM financial_fact ff
  JOIN financial_account fa ON fa.account_id=ff.account_id
  LEFT JOIN org_unit ou ON ou.org_unit_id=ff.org_unit_id
  WHERE ff.period='2025' AND ff.type='budget'
  GROUP BY ou.code, fa.category
),
alloc_pos AS (
  SELECT ou.code AS org_unit, 'SGA'::text AS category, SUM(sa.amount) AS amount_2025
  FROM sga_allocation sa
  JOIN org_unit ou ON ou.org_unit_id = sa.target_org_unit_id
  GROUP BY ou.code
),
alloc_neg AS (
  SELECT ou.code AS org_unit, 'SGA'::text AS category, -SUM(sa.amount) AS amount_2025
  FROM sga_allocation sa
  JOIN org_unit ou ON ou.org_unit_id = sa.source_org_unit_id
  GROUP BY ou.code
)
SELECT org_unit, category, SUM(amount_2025) AS amount_2025
FROM (
  SELECT * FROM base
  UNION ALL SELECT * FROM alloc_pos
  UNION ALL SELECT * FROM alloc_neg
) x
GROUP BY org_unit, category
ORDER BY org_unit, category;

-- --------------------------------------------------------------
-- D) Fix v_rosetta_truth to use latest observed (avoid dup counts)
-- --------------------------------------------------------------
CREATE OR REPLACE VIEW v_rosetta_truth AS
WITH latest_observed AS (
  SELECT DISTINCT ON (uoo.unit_id)
         uoo.unit_id,
         uoo.accountable_role_id,
         uoo.accountable_org_unit_id
  FROM unit_observed_ownership uoo
  ORDER BY uoo.unit_id, uoo.observed_as_of DESC
),
obs AS (
  -- prefer explicit observed; fallback to inferred-from-evidence (last 90d)
  SELECT au.unit_id,
         COALESCE(lo.accountable_role_id, io.inferred_role_id) AS role_id,
         COALESCE(lo.accountable_org_unit_id, io.inferred_org_id) AS org_id
  FROM atomic_unit au
  LEFT JOIN latest_observed lo ON lo.unit_id = au.unit_id
  LEFT JOIN v_inferred_observed_90d io ON io.unit_id = au.unit_id
)
SELECT
  au.code AS unit_code,
  au.name AS unit_name,
  s.code  AS stream_code,
  exp_role.code AS expected_role,
  exp_org.code  AS expected_org,
  obs_role.code AS observed_role,
  obs_org.code  AS observed_org,
  CASE
    WHEN obs.role_id IS NULL AND obs.org_id IS NULL THEN 'Not Observed'
    WHEN exp_role.code IS DISTINCT FROM obs_role.code OR exp_org.code IS DISTINCT FROM obs_org.code
         THEN 'Misattributed'
    ELSE 'Aligned'
  END AS status,
  COUNT(ev.evidence_id) AS evidence_count,
  MAX(ev.occurred_at)   AS last_evidence_at
FROM atomic_unit au
JOIN stream s ON s.stream_id=au.stream_id
LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id=au.unit_id
LEFT JOIN org_role exp_role ON exp_role.role_id=ueo.accountable_role_id
LEFT JOIN org_unit exp_org  ON exp_org.org_unit_id=ueo.accountable_org_unit_id
LEFT JOIN obs               ON obs.unit_id=au.unit_id
LEFT JOIN org_role obs_role ON obs_role.role_id=obs.role_id
LEFT JOIN org_unit obs_org  ON obs_org.org_unit_id=obs.org_id
LEFT JOIN evidence_log ev   ON ev.unit_id=au.unit_id
GROUP BY au.code, au.name, s.code, exp_role.code, exp_org.code, obs_role.code, obs_org.code, obs.role_id, obs.org_id;

-- --------------------------------------------------------------
-- E) Idempotent seed evidence (natural key = unit + subject + type)
-- --------------------------------------------------------------
-- helper unique index (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname=current_schema() AND indexname='ux_evidence_natural'
  ) THEN
    CREATE UNIQUE INDEX ux_evidence_natural ON evidence_log (unit_id, subject_ref, evidence_type);
  END IF;
END$$;

INSERT INTO evidence_log (unit_id,subject_ref,evidence_type,system_ref,actor_person_id,actor_role_id,org_unit_id,notes)
SELECT (SELECT unit_id FROM atomic_unit WHERE code='WIN-02'),
       'Opp-123','solution_outline','CRM',
       (SELECT person_id FROM person WHERE full_name LIKE 'Edmund%'),
       (SELECT role_id FROM org_role WHERE code='PMO_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_PMO'),
       'Solution outline authored by PMO lead, not Sales'
ON CONFLICT (unit_id,subject_ref,evidence_type) DO NOTHING;

INSERT INTO evidence_log (unit_id,subject_ref,evidence_type,system_ref,actor_person_id,actor_role_id,org_unit_id,notes)
SELECT (SELECT unit_id FROM atomic_unit WHERE code='WIN-03'),
       'Opp-456','pricing_decision','PSA',
       (SELECT person_id FROM person WHERE full_name LIKE 'Richard%'),
       (SELECT role_id FROM org_role WHERE code='DELIVERY_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       'Discount approval logged by Delivery Leader'
ON CONFLICT (unit_id,subject_ref,evidence_type) DO NOTHING;

INSERT INTO evidence_log (unit_id,subject_ref,evidence_type,system_ref,actor_person_id,actor_role_id,org_unit_id,notes)
SELECT (SELECT unit_id FROM atomic_unit WHERE code='WIN-04'),
       'Opp-789','proposal_redline','DOC',
       (SELECT person_id FROM person WHERE full_name LIKE 'Tim%'),
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       'Proposal draft and redlines completed by Proposal Manager'
ON CONFLICT (unit_id,subject_ref,evidence_type) DO NOTHING;

INSERT INTO evidence_log (unit_id,subject_ref,evidence_type,system_ref,actor_person_id,actor_role_id,org_unit_id,notes)
SELECT (SELECT unit_id FROM atomic_unit WHERE code='TAL-01'),
       'Req-101','recruit_req','HCM',
       (SELECT person_id FROM person WHERE full_name LIKE 'Jason%'),
       (SELECT role_id FROM org_role WHERE code='ASSOC_PARTNER'),
       (SELECT org_unit_id FROM org_unit WHERE code='SE_CLOUD_ERP'),
       'Cloud ERP lead opened recruiting req directly'
ON CONFLICT (unit_id,subject_ref,evidence_type) DO NOTHING;


COMMIT;
