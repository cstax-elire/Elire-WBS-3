-- ==============================
-- Financial Management Tables
-- ==============================

CREATE TABLE financial_account (
  account_id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE financial_fact (
  fact_id BIGSERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES financial_account(account_id),
  org_unit_id INT REFERENCES org_unit(org_unit_id),
  period TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'budget' or 'actual'
  amount NUMERIC NOT NULL
);

-- People facts & rates
CREATE TABLE rate_card (
  rate_id SERIAL PRIMARY KEY,
  role_id INT REFERENCES org_role(role_id),
  bill_rate NUMERIC,
  cost_rate NUMERIC
);

-- Practice-specific rates (from 7-updates.sql)
CREATE TABLE org_rate_card (
  org_rate_id SERIAL PRIMARY KEY,
  org_unit_id INT NOT NULL REFERENCES org_unit(org_unit_id) ON DELETE CASCADE,
  role_id     INT NOT NULL REFERENCES org_role(role_id),
  bill_rate   NUMERIC,
  cost_rate   NUMERIC,
  UNIQUE (org_unit_id, role_id)
);

CREATE TABLE person_fact (
  fact_id BIGSERIAL PRIMARY KEY,
  person_id INT NOT NULL REFERENCES person(person_id),
  period TEXT NOT NULL,
  type TEXT NOT NULL, -- 'budget' or 'actual'
  billable_hours NUMERIC,
  cost_amount NUMERIC,
  bill_rate NUMERIC,
  cost_rate NUMERIC
);

-- SG&A allocation (from 8-updates.sql)
CREATE TABLE sga_allocation (
  alloc_id            BIGSERIAL PRIMARY KEY,
  source_org_unit_id  INT NOT NULL REFERENCES org_unit(org_unit_id),
  target_org_unit_id  INT NOT NULL REFERENCES org_unit(org_unit_id),
  period              TEXT NOT NULL,
  type                TEXT NOT NULL DEFAULT 'budget',
  amount              NUMERIC NOT NULL,
  method              TEXT NOT NULL DEFAULT 'headcount'
);

-- Create unique index for SG&A allocation
CREATE UNIQUE INDEX ux_sga_alloc_unique
  ON sga_allocation (source_org_unit_id, target_org_unit_id, period, type, method);