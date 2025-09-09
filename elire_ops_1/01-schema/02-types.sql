-- ==============================
-- Custom Type Definitions
-- ==============================

-- KPI classification types
CREATE TYPE kpi_kind AS ENUM ('leading','lagging');
CREATE TYPE kpi_scope AS ENUM ('unit','stream','firm');