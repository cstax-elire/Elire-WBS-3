# Directory Cleanup Recommendations for elire_ops_1

## Current State Analysis

### Issues Identified

1. **Duplicate Files**
   - `10-ui-helpers-sql.sql` and `10-ui-helpers.sql` appear to be different versions of the same functionality
   - Potential confusion about which version is current

2. **Inconsistent Naming**
   - Mix of descriptive names (e.g., `tables_and_types.sql`) and generic names (e.g., `updates.sql`)
   - Multiple "update" files without clear versioning strategy

3. **Unclear Execution Order**
   - While files are numbered, the purpose of each number isn't immediately clear
   - Some files build on others but dependencies aren't documented

4. **Mixed Content Types**
   - Schema definitions, seed data, views, and updates all intermixed
   - Documentation file (DesignDecisions.md) mixed with SQL files

## Recommended Directory Structure

```
elire_ops_1/
├── 01-schema/                    # Core schema definitions
│   ├── 01-database-init.sql      # Database creation
│   ├── 02-types.sql              # Custom type definitions
│   ├── 03-core-tables.sql        # Core dimension tables
│   ├── 04-ownership-tables.sql   # Ownership management tables
│   ├── 05-kpi-tables.sql         # KPI management tables
│   ├── 06-financial-tables.sql   # Financial tables
│   └── 07-evidence-tables.sql    # Audit and evidence tables
│
├── 02-seed/                      # Initial data loading
│   ├── 01-org-hierarchy.sql      # Organization structure
│   ├── 02-value-streams.sql      # Stream and atomic units
│   ├── 03-expected-ownership.sql # Expected ownership assignments
│   ├── 04-systems.sql            # Systems of record
│   ├── 05-kpis.sql              # KPI definitions and targets
│   └── 06-financials.sql         # 2025 budget data
│
├── 03-views/                     # View definitions
│   ├── 01-rosetta-core.sql      # Core Rosetta Stone views
│   ├── 02-hierarchy-views.sql    # Org and stream tree views
│   ├── 03-rollup-views.sql       # Aggregation and rollup views
│   ├── 04-ownership-views.sql    # Ownership comparison views
│   └── 05-ui-helper-views.sql    # UI-specific helper views
│
├── 04-migrations/                # Schema updates and fixes
│   ├── 2024-09-07-add-expand-stream.sql
│   ├── 2024-09-07-unit-hierarchy-links.sql
│   ├── 2024-09-07-org-rate-cards.sql
│   ├── 2024-09-07-sga-allocation.sql
│   └── 2024-09-08-ui-status-model.sql
│
├── 05-procedures/                # Stored procedures (future)
│   └── README.md                 # Placeholder for future procedures
│
├── 06-sample-data/               # Test and demo data
│   ├── observed-ownership.sql    # Sample observed ownership
│   └── evidence-entries.sql      # Sample evidence log
│
├── docs/                         # Documentation
│   ├── database-design.md       # Complete design document
│   ├── table-reference.md       # Detailed table specs
│   ├── DesignDecisions.md       # Original design rationale
│   └── deployment-guide.md      # How to deploy/refresh
│
├── scripts/                      # Utility scripts
│   ├── init-database.sh         # Full database initialization
│   ├── refresh-views.sh         # Refresh all views
│   └── validate-data.sql        # Data integrity checks
│
└── README.md                     # Overview and quick start
```

## Migration Plan

### Phase 1: Restructure Files (Immediate)

1. **Create new directory structure**
   ```bash
   mkdir -p 01-schema 02-seed 03-views 04-migrations 05-procedures 06-sample-data docs scripts
   ```

2. **Split current files into appropriate directories**
   - Extract table definitions from `1-tables_and_types.sql` → `01-schema/`
   - Move seed data from `2-seed.sql` and `3-value_streams_systems_attribution.sql` → `02-seed/`
   - Consolidate views from multiple files → `03-views/`
   - Move updates from `7-updates.sql`, `8-updates.sql` → `04-migrations/`

3. **Resolve duplicates**
   - Compare `10-ui-helpers-sql.sql` vs `10-ui-helpers.sql`
   - Keep the most recent/complete version
   - Document any differences in migration notes

### Phase 2: Create Management Scripts

1. **init-database.sh**
   ```bash
   #!/bin/bash
   # Initialize complete database from scratch
   
   DB_NAME="${1:-elire_ops_1}"
   
   echo "Creating database $DB_NAME..."
   psql -c "CREATE DATABASE $DB_NAME;"
   
   echo "Loading schema..."
   for file in 01-schema/*.sql; do
     echo "  Loading $file..."
     psql -d $DB_NAME -f $file
   done
   
   echo "Loading seed data..."
   for file in 02-seed/*.sql; do
     echo "  Loading $file..."
     psql -d $DB_NAME -f $file
   done
   
   echo "Creating views..."
   for file in 03-views/*.sql; do
     echo "  Loading $file..."
     psql -d $DB_NAME -f $file
   done
   
   echo "Database initialization complete!"
   ```

2. **refresh-views.sh**
   ```bash
   #!/bin/bash
   # Refresh all views (useful after data updates)
   
   DB_NAME="${1:-elire_ops_1}"
   
   for file in 03-views/*.sql; do
     echo "Refreshing views from $file..."
     psql -d $DB_NAME -f $file
   done
   ```

### Phase 3: Documentation Updates

1. **Create comprehensive README.md**
   - Quick start guide
   - Directory structure explanation
   - Common operations
   - Troubleshooting

2. **Add deployment-guide.md**
   - Step-by-step deployment instructions
   - Environment requirements
   - Configuration options
   - Rollback procedures

## Benefits of Reorganization

### 1. Clarity
- Clear separation of concerns (schema vs data vs views)
- Obvious execution order within each category
- Self-documenting structure

### 2. Maintainability
- Easy to find specific components
- Simpler to add new migrations
- Clear versioning strategy

### 3. Deployment
- Automated initialization scripts
- Repeatable deployment process
- Easy rollback capability

### 4. Development
- Developers can quickly understand structure
- Easy to test changes in isolation
- Clear boundaries for modifications

## Implementation Checklist

- [ ] Backup current database
- [ ] Create new directory structure
- [ ] Split and reorganize SQL files
- [ ] Resolve duplicate files
- [ ] Create initialization scripts
- [ ] Test complete rebuild from reorganized structure
- [ ] Update documentation
- [ ] Create migration guide for team
- [ ] Archive original structure for reference
- [ ] Update CI/CD pipelines if applicable

## Risk Mitigation

1. **Keep original structure intact** until new structure is validated
2. **Test thoroughly** with fresh database instance
3. **Document all changes** in migration log
4. **Create rollback script** to restore original if needed
5. **Communicate changes** to all team members

## Timeline

- **Week 1**: Create new structure, split files, resolve duplicates
- **Week 2**: Create scripts, test deployment
- **Week 3**: Documentation and team training
- **Week 4**: Full cutover to new structure

## Notes

- The numbered prefix system (01-, 02-, etc.) ensures correct execution order
- Date-prefixed migration files allow chronological tracking
- Separate docs/ folder keeps SQL files focused on implementation
- Scripts folder provides automation without cluttering main directory