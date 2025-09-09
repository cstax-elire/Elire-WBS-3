# Elire Operations Database (elire_ops_1)

## Overview

The `elire_ops_1` database implements a "Rosetta Stone" architecture that connects organizational value streams, ownership structures, KPIs, and financial data through atomic work units. This enables multi-dimensional analysis of work attribution, performance metrics, and financial outcomes across the organization.

## Quick Start

### Prerequisites
- PostgreSQL 12+ installed and running
- `psql` command-line tool available
- Bash shell (for scripts)

### Installation

1. **Initialize the database from scratch:**
   ```bash
   cd scripts
   ./init-database.sh
   ```
   This will create the database, schema, seed data, and views.

2. **Connect to the database:**
   ```bash
   psql -d elire_ops_1
   ```

3. **Verify installation:**
   ```sql
   -- View the Rosetta Stone core data
   SELECT * FROM v_rosetta_stone LIMIT 10;
   
   -- Check for misattributed work
   SELECT * FROM v_rosetta_truth WHERE is_misattributed = true;
   
   -- View organizational hierarchy
   SELECT * FROM v_org_tree WHERE depth = 1;
   ```

## Directory Structure

```
elire_ops_1/
├── 01-schema/              # Core database schema
│   ├── 01-database-init.sql
│   ├── 02-types.sql
│   ├── 03-core-tables.sql
│   ├── 04-ownership-tables.sql
│   ├── 05-kpi-tables.sql
│   ├── 06-financial-tables.sql
│   └── 07-evidence-tables.sql
│
├── 02-seed/                # Initial data
│   ├── 01-org-hierarchy.sql
│   ├── 02-value-streams.sql
│   └── 03-expected-ownership.sql
│
├── 03-views/               # Database views
│   ├── 01-rosetta-core.sql
│   └── 02-ownership-views.sql
│
├── 04-migrations/          # Schema updates
│   └── [date-prefixed migration files]
│
├── docs/                   # Documentation
│   ├── database-design.md
│   ├── table-reference.md
│   └── cleanup-recommendations.md
│
├── scripts/                # Utility scripts
│   ├── init-database.sh
│   └── refresh-views.sh
│
└── README.md              # This file
```

## Core Concepts

### 1. Atomic Units
The fundamental work units that connect all dimensions:
- **WIN** (5 units): Lead qualification, discovery, pricing, proposals, contracts
- **DELIVER** (5 units): Handoff, resourcing, delivery, scope management, closure
- **EXPAND** (3 units): Cross-sell, upsell, advocacy
- **COLLECT** (3 units): Invoicing, collections, revenue recognition
- **TALENT** (4 units): Recruiting, onboarding, development, retention
- **OPERATE** (3 units): Planning, performance management, compliance

### 2. Value Streams
Primary workflow spine organizing work:
- Customer-facing: WIN, DELIVER, EXPAND, COLLECT
- Enablers: TALENT, OPERATE

### 3. Organizational Hierarchy
```
Pillars (5)
├── Departments/COEs (12)
│   └── Practices (13)
│       └── People (150+)
```

### 4. Ownership Model
- **Expected Ownership**: Design-based (who SHOULD own)
- **Observed Ownership**: Actual (who ACTUALLY owns)
- **Misattribution**: Gap between expected and observed

## Key Database Objects

### Tables (21)
- **Core**: stream, atomic_unit, org_unit, org_role, person
- **Ownership**: unit_expected_ownership, unit_observed_ownership
- **KPI**: kpi, unit_kpi, kpi_target, kpi_measurement
- **Financial**: financial_account, financial_fact, rate_card, person_fact
- **Evidence**: evidence_log

### Views (21+)
- **v_rosetta_stone**: Core pivot view
- **v_rosetta_truth**: Expected vs observed comparison
- **v_org_tree**: Organizational hierarchy with rollups
- **v_stream_tree**: Value stream hierarchy
- **v_misattribution_delta**: Ownership gaps
- **v_financial_rollup**: P&L aggregations

## Common Operations

### Refresh Views After Data Updates
```bash
cd scripts
./refresh-views.sh
```

### Check Misattribution
```sql
-- Units with wrong ownership
SELECT * FROM v_rosetta_truth 
WHERE is_misattributed = true
ORDER BY stream_code, unit_code;

-- Summary by organization
SELECT * FROM v_ownership_summary
ORDER BY alignment_pct DESC;
```

### Financial Analysis
```sql
-- Direct P&L by org
SELECT * FROM v_financial_rollup
WHERE org_unit LIKE 'SE_%';

-- With SG&A allocation
SELECT * FROM v_financial_rollup_with_sga
WHERE category = 'SGA';
```

### Set Observed Ownership
```sql
-- Record actual ownership (append-only)
INSERT INTO unit_observed_ownership 
  (unit_id, accountable_role_id, accountable_org_unit_id, source, confidence_pct)
SELECT 
  u.unit_id,
  (SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'),
  (SELECT org_unit_id FROM org_unit WHERE code='SE_CLOUD_HCM'),
  'interview',
  0.95
FROM atomic_unit u WHERE u.code = 'WIN-02';
```

## Data Management

### Loading New Data

1. **Add to appropriate seed file** in `02-seed/`
2. **Create migration** in `04-migrations/` with date prefix
3. **Run initialization** or apply migration:
   ```bash
   psql -d elire_ops_1 -f 04-migrations/2024-09-10-new-data.sql
   ```

### Backup and Restore

```bash
# Backup
pg_dump elire_ops_1 > backup_$(date +%Y%m%d).sql

# Restore
psql -c "DROP DATABASE IF EXISTS elire_ops_1;"
psql -c "CREATE DATABASE elire_ops_1;"
psql -d elire_ops_1 < backup_20240910.sql
```

## Development Guidelines

### Adding New Tables
1. Add CREATE TABLE to appropriate schema file in `01-schema/`
2. Add seed data to `02-seed/`
3. Create views in `03-views/`
4. Document in `docs/table-reference.md`

### Creating Migrations
Use date-prefixed filenames:
```
04-migrations/2024-09-10-add-new-feature.sql
```

### Naming Conventions
- **Tables**: lowercase with underscores
- **Views**: prefix with `v_`
- **Unit codes**: `STREAM-##` (e.g., WIN-01)
- **Org codes**: UPPERCASE_WITH_UNDERSCORES
- **Role codes**: UPPERCASE_WITH_UNDERSCORES

## Troubleshooting

### Database Already Exists
The init script will prompt to drop and recreate. Choose 'n' to abort.

### Views Not Updating
Run the refresh script:
```bash
./scripts/refresh-views.sh
```

### Permission Issues
Ensure PostgreSQL user has CREATE DATABASE privileges:
```sql
ALTER USER your_user CREATEDB;
```

## Related Documentation

- [Database Design](docs/database-design.md) - Complete architecture overview
- [Table Reference](docs/table-reference.md) - Detailed table specifications
- [Cleanup Recommendations](docs/cleanup-recommendations.md) - Migration from old structure

## Support

For questions or issues, refer to:
1. Design documentation in `docs/`
2. Original design decisions in `docs/DesignDecisions.md`
3. CLAUDE.md in parent directory for AI guidance