-- ==============================
-- Core Dimension Tables
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

-- Systems of record
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