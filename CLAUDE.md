# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Elire Work Breakdown Structure (WBS) Phase 3 project - a PostgreSQL database system and UI specification for managing organizational ownership, attribution, KPIs, and financial data. The system implements a "Rosetta Stone" concept that connects value streams, organizational units, people, KPIs, systems of record, and financials.

## Database Commands

### Setup and Migration
```bash
# Initialize the database (run in order)
psql -d your_database -f elire_ops_1/1-tables_and_types.sql
psql -d your_database -f elire_ops_1/2-seed.sql
psql -d your_database -f elire_ops_1/3-value_streams_systems_attribution.sql
psql -d your_database -f elire_ops_1/4-kpis_and_targets.sql
psql -d your_database -f elire_ops_1/5-Financials_rates.sql
psql -d your_database -f elire_ops_1/6-rosetta_stone.sql
psql -d your_database -f elire_ops_1/7-updates.sql
psql -d your_database -f elire_ops_1/8-updates.sql
```

### Common Queries
```sql
-- View the core Rosetta Stone data
SELECT * FROM v_rosetta_stone ORDER BY stream, unit_code;

-- Check organizational rollups
SELECT * FROM v_org_rollup;

-- View financial rollups
SELECT * FROM v_financial_rollup;

-- Check stream rollups
SELECT * FROM v_stream_rollup;

-- View truth table (expected vs observed ownership)
SELECT * FROM v_rosetta_truth ORDER BY stream_code, unit_code;

-- Check misattribution status
SELECT * FROM v_misattribution_delta WHERE is_misattributed = true;
```

## Architecture Overview

### Core Concepts

1. **Atomic Units**: The fundamental work units that connect all dimensions (20 core units plus SELL sub-phases)
2. **Value Streams**: Primary workflow spine - WIN, DELIVER, COLLECT, TALENT, OPERATE
3. **Organizational Hierarchy**: Pillars → Departments/COEs → Practices → People
4. **Ownership Model**: Expected (role@org) vs Observed (actual) ownership tracking
5. **Evidence System**: Immutable audit trail of all ownership changes and KPI measurements

### Key Database Views

- `v_rosetta_stone_enhanced`: Core view joining units with streams, orgs, systems, and KPIs
- `v_rosetta_truth`: Expected vs observed ownership with status flags
- `v_org_tree`: Hierarchical org structure with financial rollups
- `v_stream_tree`: Value stream hierarchy with unit counts
- `v_financial_rollup`: Direct P&L by org unit
- `v_financial_rollup_with_sga`: Allocated P&L including SG&A distribution
- `v_observed_from_evidence`: Evidence log formatted for UI display

### Data Principles

- **Append-only history**: Never update observed ownership rows - always INSERT new ones
- **Latest wins in views**: Views automatically select the most recent observation
- **Evidence everywhere**: Every meaningful change creates an evidence_log entry
- **Natural key idempotency**: Use ON CONFLICT DO NOTHING for safe refreshes

## UI Implementation Approach

The UI follows a narrative-first design with these pages:

1. **/org** - Organizational tree with headcount and financials
2. **/streams** - Value stream navigation and unit details
3. **/truth** - Expected vs Observed ownership grid
4. **/evidence** - Audit trail and proof logging
5. **/kpis** - Driver and outcome metrics management
6. **/finance** - Direct vs Allocated P&L views

API endpoints follow RESTful patterns:
- POST `/api/observed` - Set observed ownership (append-only)
- POST `/api/evidence` - Log evidence entries
- POST `/api/kpi` - Record KPI measurements
- POST `/api/personfact` - Update person-level facts
- POST `/api/financial` - Insert financial facts

## Important Notes

### Database Schema Evolution
- Keep view signatures stable as they form the UI contract
- Internal table changes are fine as long as views remain compatible
- Use `8-updates.sql` for schema improvements and new views

### Data Integrity Rules
- Unit codes follow pattern: `STREAM-##` (e.g., WIN-01, DELIVER-03)
- Organization codes use underscores: `PILLAR_SERVICE_EXEC`
- Role codes use underscores: `DELIVERY_LEAD`
- Evidence types are enumerated: `ownership_update`, `kpi_measurement`, `pricing_decision`, etc.
- System refs: `CRM`, `PSA`, `FIN`, `HCM`, `DOC`, `UI`

### Current State vs Future State
- Expected ownership is pre-seeded based on organizational design
- Observed ownership starts empty - to be filled via UI to expose misattribution
- Financial data has 2025 budget loaded; actuals to be added with type='actual'
- Person facts have placeholder allocations; replace with PSA actuals over time

### KPI Strategy
- Leading KPIs (controllable drivers) linked at unit level
- Lagging KPIs (outcomes) linked at stream/firm level
- Current SPI-derived KPIs maintained for continuity
- Operational KPIs added for true driver management

## Testing Approach

Key test scenarios:
1. **Misattribution signal**: Set observed owner different from expected, verify status changes
2. **Evidence trail**: Confirm all updates create evidence_log entries
3. **Financial rollups**: Verify practice → COE → pillar aggregations
4. **KPI cascade**: Update driver KPI, verify evidence creation
5. **SG&A allocation**: Toggle between direct and allocated views, confirm reconciliation