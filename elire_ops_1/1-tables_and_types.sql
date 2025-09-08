-- Create database
CREATE DATABASE elire_ops_1;
\c elire_ops_1;

-- ==============================
-- Core dimensions
-- ==============================

-- Org hierarchy
CREATE TABLE org_unit (
  org_unit_id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id INT REFERENCES org_unit(org_unit_id)
);

CREATE TABLE org_role (
  role_id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE person (
  person_id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  role_id INT REFERENCES org_role(role_id),
  org_unit_id INT REFERENCES org_unit(org_unit_id)
);

-- Value streams and atomic units
CREATE TABLE stream (
  stream_id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id INT REFERENCES stream(stream_id),
  is_enabler BOOLEAN NOT NULL DEFAULT FALSE,
  order_in_parent INT
);

CREATE TABLE atomic_unit (
  unit_id SERIAL PRIMARY KEY,
  stream_id INT NOT NULL REFERENCES stream(stream_id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_in_stream INT NOT NULL
);

-- ==============================
-- Ownership
-- ==============================
CREATE TABLE unit_expected_ownership (
  unit_id INT PRIMARY KEY REFERENCES atomic_unit(unit_id) ON DELETE CASCADE,
  accountable_role_id INT REFERENCES org_role(role_id),
  accountable_org_unit_id INT REFERENCES org_unit(org_unit_id),
  responsible_role_id INT REFERENCES org_role(role_id),
  responsible_org_unit_id INT REFERENCES org_unit(org_unit_id)
);

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

-- ==============================
-- Systems of record
-- ==============================
CREATE TABLE system_of_record (
  sor_id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE unit_system (
  unit_id INT NOT NULL REFERENCES atomic_unit(unit_id) ON DELETE CASCADE,
  sor_id INT NOT NULL REFERENCES system_of_record(sor_id),
  PRIMARY KEY (unit_id, sor_id)
);

-- ==============================
-- KPIs
-- ==============================
CREATE TYPE kpi_kind AS ENUM ('leading','lagging');
CREATE TYPE kpi_scope AS ENUM ('unit','stream','firm');

CREATE TABLE kpi (
  kpi_id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  kind kpi_kind NOT NULL,
  scope kpi_scope NOT NULL,
  unit_of_measure TEXT,
  north_star TEXT
);

CREATE TABLE unit_kpi (
  unit_id INT NOT NULL REFERENCES atomic_unit(unit_id) ON DELETE CASCADE,
  kpi_id INT NOT NULL REFERENCES kpi(kpi_id),
  PRIMARY KEY (unit_id, kpi_id)
);

CREATE TABLE kpi_target (
  kpi_target_id SERIAL PRIMARY KEY,
  kpi_id INT NOT NULL REFERENCES kpi(kpi_id),
  scope kpi_scope NOT NULL,
  unit_id INT REFERENCES atomic_unit(unit_id),
  stream_id INT REFERENCES stream(stream_id),
  valid_from DATE NOT NULL,
  valid_to DATE,
  target_value NUMERIC,
  threshold_yellow NUMERIC,
  threshold_red NUMERIC
);

CREATE TABLE kpi_measurement (
  measure_id BIGSERIAL PRIMARY KEY,
  kpi_id INT NOT NULL REFERENCES kpi(kpi_id),
  unit_id INT REFERENCES atomic_unit(unit_id),
  stream_id INT REFERENCES stream(stream_id),
  measured_at DATE NOT NULL,
  value_numeric NUMERIC,
  source TEXT
);

-- ==============================
-- Financials
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

-- ==============================
-- People facts & rates
-- ==============================
CREATE TABLE rate_card (
  rate_id SERIAL PRIMARY KEY,
  role_id INT REFERENCES org_role(role_id),
  bill_rate NUMERIC,
  cost_rate NUMERIC
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

-- ==============================
-- Views (to be defined after seeds)
-- ==============================

