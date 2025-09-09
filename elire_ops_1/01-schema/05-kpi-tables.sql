-- ==============================
-- KPI Management Tables
-- ==============================

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