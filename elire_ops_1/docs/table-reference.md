# Database Table Reference

## Core Dimension Tables

### 1. stream
**Purpose**: Defines the hierarchical value stream structure (WIN, DELIVER, COLLECT, etc.)

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| stream_id | SERIAL | PRIMARY KEY | Unique identifier |
| code | TEXT | UNIQUE NOT NULL | Stream code (e.g., 'WIN', 'DELIVER') |
| name | TEXT | NOT NULL | Human-readable name |
| parent_id | INT | REFERENCES stream(stream_id) | Parent stream for hierarchy |
| is_enabler | BOOLEAN | NOT NULL DEFAULT FALSE | True for support streams |
| order_in_parent | INT | | Display order within parent |

**Key Relationships**:
- Self-referential for hierarchy
- Referenced by atomic_unit, kpi_target, kpi_measurement

---

### 2. atomic_unit
**Purpose**: The fundamental work units that connect all dimensions in the Rosetta Stone

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| unit_id | SERIAL | PRIMARY KEY | Unique identifier |
| stream_id | INT | NOT NULL REFERENCES stream | Parent stream |
| code | TEXT | UNIQUE NOT NULL | Unit code (e.g., 'WIN-01') |
| name | TEXT | NOT NULL | Unit name |
| description | TEXT | | Detailed description |
| order_in_stream | INT | NOT NULL | Display order |

**Key Relationships**:
- Central table connecting to ownership, KPIs, systems, evidence
- Pattern: STREAM-## (e.g., WIN-01, DEL-03)

---

### 3. org_unit
**Purpose**: Organizational hierarchy from pillars down to practices

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| org_unit_id | SERIAL | PRIMARY KEY | Unique identifier |
| code | TEXT | UNIQUE NOT NULL | Org code (e.g., 'PILLAR_SERVICE_EXEC') |
| name | TEXT | NOT NULL | Organization name |
| parent_id | INT | REFERENCES org_unit | Parent org for hierarchy |

**Key Relationships**:
- Self-referential for hierarchy
- Referenced by person, ownership tables, financial_fact

---

### 4. org_role
**Purpose**: Defines roles within the organization

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| role_id | SERIAL | PRIMARY KEY | Unique identifier |
| code | TEXT | UNIQUE NOT NULL | Role code (e.g., 'SALES_DIR') |
| name | TEXT | NOT NULL | Role name |

**Key Relationships**:
- Referenced by person, ownership tables, rate cards

---

### 5. person
**Purpose**: Individual employees and their assignments

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| person_id | SERIAL | PRIMARY KEY | Unique identifier |
| full_name | TEXT | NOT NULL | Person's full name |
| role_id | INT | REFERENCES org_role | Person's role |
| org_unit_id | INT | REFERENCES org_unit | Person's organization |

**Key Relationships**:
- Links to person_fact for hours/rates
- Referenced by evidence_log

---

## Ownership Tables

### 6. unit_expected_ownership
**Purpose**: Design-based ownership assignments (who SHOULD own each unit)

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| unit_id | INT | PRIMARY KEY REFERENCES atomic_unit | Unit being owned |
| accountable_role_id | INT | REFERENCES org_role | Accountable role |
| accountable_org_unit_id | INT | REFERENCES org_unit | Accountable org |
| responsible_role_id | INT | REFERENCES org_role | Responsible role |
| responsible_org_unit_id | INT | REFERENCES org_unit | Responsible org |

**Key Relationships**:
- One-to-one with atomic_unit
- Defines RACI model (Accountable/Responsible)

---

### 7. unit_observed_ownership
**Purpose**: Actual ownership (who ACTUALLY owns each unit) - append-only

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| obs_id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| unit_id | INT | NOT NULL REFERENCES atomic_unit | Unit being owned |
| observed_as_of | TIMESTAMPTZ | NOT NULL DEFAULT now() | Observation timestamp |
| accountable_role_id | INT | REFERENCES org_role | Observed accountable role |
| accountable_org_unit_id | INT | REFERENCES org_unit | Observed accountable org |
| source | TEXT | | Data source |
| confidence_pct | NUMERIC | | Confidence level (0-1) |
| notes | TEXT | | Additional notes |

**Key Relationships**:
- Many-to-one with atomic_unit
- Latest record per unit represents current state

---

### 8. unit_hierarchy_link
**Purpose**: Links parent and child atomic units (e.g., WIN top-level to SELL details)

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| parent_unit_id | INT | REFERENCES atomic_unit | Parent unit |
| child_unit_id | INT | REFERENCES atomic_unit | Child unit |

**Constraints**: PRIMARY KEY (parent_unit_id, child_unit_id)

---

## System & Evidence Tables

### 9. system_of_record
**Purpose**: Defines systems where evidence should exist

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| sor_id | SERIAL | PRIMARY KEY | Unique identifier |
| code | TEXT | UNIQUE NOT NULL | System code (CRM, PSA, FIN, HCM, DOC) |
| name | TEXT | NOT NULL | System name |

---

### 10. unit_system
**Purpose**: Maps atomic units to their systems of record

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| unit_id | INT | NOT NULL REFERENCES atomic_unit | Unit |
| sor_id | INT | NOT NULL REFERENCES system_of_record | System |

**Constraints**: PRIMARY KEY (unit_id, sor_id)

---

### 11. evidence_log
**Purpose**: Immutable audit trail of all ownership changes and activities

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| evidence_id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| unit_id | INT | NOT NULL REFERENCES atomic_unit | Related unit |
| subject_ref | TEXT | NOT NULL | Reference identifier |
| evidence_type | TEXT | NOT NULL | Type of evidence |
| system_ref | TEXT | | Source system |
| actor_person_id | INT | REFERENCES person | Acting person |
| actor_role_id | INT | REFERENCES org_role | Acting role |
| org_unit_id | INT | REFERENCES org_unit | Organization context |
| occurred_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | Event timestamp |
| notes | TEXT | | Additional notes |

**Indexes**:
- ix_evidence_unit_time (unit_id, occurred_at DESC)
- ix_evidence_subject (subject_ref)

---

## KPI Tables

### 12. kpi
**Purpose**: KPI definitions with leading/lagging classification

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| kpi_id | SERIAL | PRIMARY KEY | Unique identifier |
| code | TEXT | UNIQUE NOT NULL | KPI code |
| name | TEXT | NOT NULL | KPI name |
| kind | kpi_kind | NOT NULL | 'leading' or 'lagging' |
| scope | kpi_scope | NOT NULL | 'unit', 'stream', or 'firm' |
| unit_of_measure | TEXT | | Unit of measurement |
| north_star | TEXT | | Target direction |

---

### 13. unit_kpi
**Purpose**: Maps KPIs to atomic units

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| unit_id | INT | NOT NULL REFERENCES atomic_unit | Unit |
| kpi_id | INT | NOT NULL REFERENCES kpi | KPI |

**Constraints**: PRIMARY KEY (unit_id, kpi_id)

---

### 14. kpi_target
**Purpose**: Target values and thresholds for KPIs

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| kpi_target_id | SERIAL | PRIMARY KEY | Unique identifier |
| kpi_id | INT | NOT NULL REFERENCES kpi | KPI |
| scope | kpi_scope | NOT NULL | Target scope |
| unit_id | INT | REFERENCES atomic_unit | Unit (if unit-scoped) |
| stream_id | INT | REFERENCES stream | Stream (if stream-scoped) |
| valid_from | DATE | NOT NULL | Start date |
| valid_to | DATE | | End date |
| target_value | NUMERIC | | Target value |
| threshold_yellow | NUMERIC | | Warning threshold |
| threshold_red | NUMERIC | | Critical threshold |

---

### 15. kpi_measurement
**Purpose**: Actual KPI measurements over time

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| measure_id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| kpi_id | INT | NOT NULL REFERENCES kpi | KPI |
| unit_id | INT | REFERENCES atomic_unit | Unit (if unit-level) |
| stream_id | INT | REFERENCES stream | Stream (if stream-level) |
| measured_at | DATE | NOT NULL | Measurement date |
| value_numeric | NUMERIC | | Measured value |
| source | TEXT | | Data source |

---

## Financial Tables

### 16. financial_account
**Purpose**: Chart of accounts

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| account_id | SERIAL | PRIMARY KEY | Unique identifier |
| code | TEXT | UNIQUE NOT NULL | Account code |
| name | TEXT | NOT NULL | Account name |
| category | TEXT | NOT NULL | Category (Revenue, COS, SGA) |

---

### 17. financial_fact
**Purpose**: Budget and actual financial data by org unit

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| fact_id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| account_id | INT | NOT NULL REFERENCES financial_account | Account |
| org_unit_id | INT | REFERENCES org_unit | Organization |
| period | TEXT | NOT NULL | Period (e.g., '2025') |
| type | TEXT | NOT NULL | 'budget' or 'actual' |
| amount | NUMERIC | NOT NULL | Amount |

---

### 18. rate_card
**Purpose**: Standard billing and cost rates by role

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| rate_id | SERIAL | PRIMARY KEY | Unique identifier |
| role_id | INT | REFERENCES org_role | Role |
| bill_rate | NUMERIC | | Billing rate |
| cost_rate | NUMERIC | | Cost rate |

---

### 19. org_rate_card
**Purpose**: Practice-specific rates (overrides standard rates)

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| org_rate_id | SERIAL | PRIMARY KEY | Unique identifier |
| org_unit_id | INT | NOT NULL REFERENCES org_unit | Organization |
| role_id | INT | NOT NULL REFERENCES org_role | Role |
| bill_rate | NUMERIC | | Billing rate |
| cost_rate | NUMERIC | | Cost rate |

**Constraints**: UNIQUE (org_unit_id, role_id)

---

### 20. person_fact
**Purpose**: Individual hours and rates (budget and actual)

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| fact_id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| person_id | INT | NOT NULL REFERENCES person | Person |
| period | TEXT | NOT NULL | Period (e.g., '2025') |
| type | TEXT | NOT NULL | 'budget' or 'actual' |
| billable_hours | NUMERIC | | Billable hours |
| cost_amount | NUMERIC | | Cost amount |
| bill_rate | NUMERIC | | Billing rate |
| cost_rate | NUMERIC | | Cost rate |

---

### 21. sga_allocation
**Purpose**: SG&A cost allocation rules

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| alloc_id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| source_org_unit_id | INT | NOT NULL REFERENCES org_unit | Source org |
| target_org_unit_id | INT | NOT NULL REFERENCES org_unit | Target org |
| period | TEXT | NOT NULL | Period |
| type | TEXT | NOT NULL DEFAULT 'budget' | Type |
| amount | NUMERIC | NOT NULL | Allocation amount |
| method | TEXT | NOT NULL DEFAULT 'headcount' | Allocation method |

**Indexes**: ux_sga_alloc_unique (source_org_unit_id, target_org_unit_id, period, type, method)

---

## Data Type Definitions

### Custom Types

#### kpi_kind
```sql
CREATE TYPE kpi_kind AS ENUM ('leading','lagging');
```
- **leading**: Controllable driver metrics at unit level
- **lagging**: Outcome metrics at stream/firm level

#### kpi_scope
```sql
CREATE TYPE kpi_scope AS ENUM ('unit','stream','firm');
```
- **unit**: Measured at atomic unit level
- **stream**: Measured at value stream level
- **firm**: Measured at company level

---

## Key Patterns & Conventions

### Naming Conventions
- **Unit codes**: `STREAM-##` format (e.g., WIN-01, DEL-03)
- **Org codes**: Uppercase with underscores (e.g., PILLAR_SERVICE_EXEC)
- **Role codes**: Uppercase with underscores (e.g., DELIVERY_LEAD)
- **Stream codes**: Uppercase, underscores for sub-streams (e.g., WIN_LEAD)

### Data Integrity Rules
1. **Append-only ownership**: Never update unit_observed_ownership, always insert
2. **Latest wins**: Views select most recent observation by timestamp
3. **Natural keys**: Use ON CONFLICT DO NOTHING for idempotent operations
4. **Evidence everywhere**: Every meaningful change creates evidence_log entry

### Common Query Patterns
```sql
-- Get latest observed ownership
SELECT DISTINCT ON (unit_id) *
FROM unit_observed_ownership
ORDER BY unit_id, observed_as_of DESC;

-- Rollup financial data through org hierarchy
WITH RECURSIVE org_tree AS (...)
SELECT SUM(amount) FROM financial_fact
JOIN org_tree USING (org_unit_id);

-- Compare expected vs observed ownership
SELECT e.*, o.*
FROM unit_expected_ownership e
LEFT JOIN LATERAL (
  SELECT * FROM unit_observed_ownership
  WHERE unit_id = e.unit_id
  ORDER BY observed_as_of DESC LIMIT 1
) o ON true;
```