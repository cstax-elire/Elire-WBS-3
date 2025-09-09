# Implementation Notes

This document captures critical implementation details, known gaps, and workarounds for the elire_ops_1 database.

## Financial Reallocation Methodology

### The Problem
Original 2025 budget data was loaded at the pillar level, but accountability and decision-making happen at the practice level.

### The Solution (from 7-updates.sql)
1. **Compute billable revenue** from person_fact × rates for each practice
2. **Calculate allocation weights** based on each practice's contribution
3. **Redistribute pillar totals** down to practices proportionally
4. **Remove pillar-level entries** to avoid double counting

```sql
-- Example: Revenue allocation based on billable contribution
WITH practice_revenue AS (
  SELECT org_unit_id, 
         SUM(billable_hours * bill_rate) as billable_revenue
  FROM person_fact 
  WHERE type = 'budget'
  GROUP BY org_unit_id
)
-- Allocate pillar revenue to practices based on contribution
```

### Result
- Practice-level P&L becomes visible
- Accountability aligns with where decisions are made
- GM% can be calculated at each organizational node

## Capacity Normalization

### The Problem
Initial hours/person calculations showed impossible utilization:
- PeopleSoft Practice: 9,784 hrs/person (470% utilization!)
- Treasury practices: Similarly unrealistic

### The Solution
Added external capacity (EACPs and Subcontractors):
- PeopleSoft: +10 EACPs, +5 Subs
- Kyriba: +3 EACPs
- PeopleSoft Treasury: +2 EACPs

This brought hours/person to ~2,700 (130% utilization) - high but believable for a stretched team.

## Validation Approach

### The v_update_validation View
A single query health check that validates:
- WIN→SELL unit hierarchy links exist
- EXPAND stream and units are present
- Practice-specific rates are loaded
- External capacity is added
- Revenue is distributed to practices
- Hours/person are within reasonable bounds

### Usage
```sql
SELECT * FROM v_update_validation;
```

All checks should return positive counts or reasonable values.

## Known Gaps and Workarounds

### 1. Missing Role Codes
**Gap**: Expected ownership references roles that may not exist:
- COO
- CFO
- CONTROLLER
- RESOURCE_MGR

**Workaround**: 
```sql
-- Option 1: Add missing roles
INSERT INTO org_role (code, name) VALUES
  ('COO', 'Chief Operating Officer'),
  ('CFO', 'Chief Financial Officer'),
  ('CONTROLLER', 'Controller'),
  ('RESOURCE_MGR', 'Resource Manager');

-- Option 2: Map to existing equivalents
-- COO → DELIVERY_LEAD
-- CFO → DIR_ACCOUNTING
-- CONTROLLER → DIR_ACCOUNTING
-- RESOURCE_MGR → PMO_LEAD
```

### 2. Per-Person Cost Amounts
**Gap**: person_fact.cost_amount is NULL in budget seeds

**Reason**: Cost is computed from hours × cost_rate instead

**Future Fix**: Load actual cost amounts from ERP when available

### 3. KPI Rollup Math
**Gap**: No explicit definition of how unit drivers aggregate to stream outcomes

**Workaround**: Views use simple aggregations (SUM, AVG) but this should be configurable

**Future Fix**: Add kpi_rollup_definition table (see Backlog)

## The "Fiction vs Reality" Framework

### Core Concept
- **Expected Ownership** = The "fiction" - how we claim work is organized
- **Observed Ownership** = The "reality" - who actually does the work

### Implementation
- unit_expected_ownership = single record per unit (the playbook)
- unit_observed_ownership = append-only log (latest wins in views)
- v_misattribution_delta = the gap analysis

### Usage Pattern
```sql
-- Record observed reality
INSERT INTO unit_observed_ownership 
  (unit_id, accountable_role_id, accountable_org_unit_id, source, confidence_pct)
VALUES 
  (unit_id, role_id, org_id, 'interview', 0.85);

-- View the gaps
SELECT * FROM v_misattribution_delta 
WHERE status != 'Aligned';
```

## Evidence Location Enforcement

### Principle
System mappings don't enforce workflow, they enforce where evidence must live:
- WIN units → CRM (deals, opportunities)
- DELIVER units → PSA (projects, time)
- COLLECT units → FIN (invoices, payments)
- TALENT units → HCM (employees, recruiting)

### Purpose
Makes work auditable and AI-learnable by ensuring evidence is in predictable locations.

## Rate Precedence Rules

### Order of Precedence
1. **org_rate_card** (practice-specific) - HIGHEST PRIORITY
2. **rate_card** (role default) - FALLBACK

### Example
```sql
-- Kyriba consultant: $205/hr (practice-specific)
-- Generic consultant: $150/hr (role default)
-- Kyriba wins when calculating margins for Kyriba practice work
```

## Data Conventions

### Code Patterns
- **Unit codes**: STREAM-## (e.g., WIN-01, DEL-03)
- **Org codes**: UPPERCASE_WITH_UNDERSCORES (e.g., SE_CLOUD_HCM)
- **Role codes**: UPPERCASE_WITH_UNDERSCORES (e.g., PRACTICE_LEAD)
- **Stream codes**: UPPERCASE, underscores for sub-streams (e.g., WIN_LEAD)

### Type Usage
- **financial_fact.type**: 'budget' or 'actual'
- **person_fact.type**: 'budget' or 'actual'
- Start with 'budget', add 'actual' monthly for variance analysis

## Backlog Items (Not Yet Implemented)

From DatabaseDesign.md Section 9:

### 1. Light Evidence Logs
```sql
-- Pricing exceptions (WIN-03)
CREATE TABLE pricing_exception (
  exception_id SERIAL PRIMARY KEY,
  unit_id INT REFERENCES atomic_unit,
  requester_person_id INT,
  approver_person_id INT,
  cycle_hours NUMERIC,
  sold_margin NUMERIC,
  created_at TIMESTAMPTZ
);

-- Change orders (DEL-04)
CREATE TABLE change_order_event (
  event_id SERIAL PRIMARY KEY,
  unit_id INT REFERENCES atomic_unit,
  delta_amount NUMERIC,
  raiser_person_id INT,
  approver_person_id INT,
  created_at TIMESTAMPTZ
);

-- Recruiting reqs (TAL-01)
CREATE TABLE recruiting_req (
  req_id SERIAL PRIMARY KEY,
  unit_id INT REFERENCES atomic_unit,
  opened_by INT,
  filled_by INT,
  opened_at DATE,
  filled_at DATE
);
```

### 2. KPI Rollup Definition
Table to document how stream outcomes derive from unit drivers:
```sql
CREATE TABLE kpi_rollup_definition (
  outcome_kpi_id INT REFERENCES kpi,
  driver_kpi_id INT REFERENCES kpi,
  aggregation_method TEXT, -- 'SUM', 'AVG', 'WEIGHTED_AVG'
  weight_factor TEXT -- if weighted
);
```

### 3. Hotspot Dashboard Views
- v_misattribution_hotspots
- v_outcomes_dashboard
- v_stream_health

## Quick Fixes Checklist

When issues arise:

1. **Missing roles**: Add to org_role or map to equivalents
2. **Unrealistic hours**: Check for external capacity additions
3. **Double-counted revenue**: Ensure pillar-level entries are removed
4. **View not updating**: Check if using latest observed ownership
5. **Rate discrepancies**: Verify org_rate_card precedence