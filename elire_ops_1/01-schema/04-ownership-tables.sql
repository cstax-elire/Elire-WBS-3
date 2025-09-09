-- ==============================
-- Ownership Management Tables
-- ==============================

-- Expected ownership (design-based)
CREATE TABLE unit_expected_ownership (
  unit_id INT PRIMARY KEY REFERENCES atomic_unit(unit_id) ON DELETE CASCADE,
  accountable_role_id INT REFERENCES org_role(role_id),
  accountable_org_unit_id INT REFERENCES org_unit(org_unit_id),
  responsible_role_id INT REFERENCES org_role(role_id),
  responsible_org_unit_id INT REFERENCES org_unit(org_unit_id)
);

-- Observed ownership (actual, append-only)
CREATE TABLE unit_observed_ownership (
  obs_id BIGSERIAL PRIMARY KEY,
  unit_id INT NOT NULL REFERENCES atomic_unit(unit_id) ON DELETE CASCADE,
  observed_as_of TIMESTAMPTZ NOT NULL DEFAULT now(),
  accountable_role_id INT REFERENCES org_role(role_id),
  accountable_org_unit_id INT REFERENCES org_unit(org_unit_id),
  source TEXT,
  confidence_pct NUMERIC,
  notes TEXT
);

-- Unit hierarchy linking (from 7-updates.sql)
CREATE TABLE unit_hierarchy_link (
  parent_unit_id INT REFERENCES atomic_unit(unit_id) ON DELETE CASCADE,
  child_unit_id  INT REFERENCES atomic_unit(unit_id) ON DELETE CASCADE,
  PRIMARY KEY (parent_unit_id, child_unit_id)
);