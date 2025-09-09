# Documentation Overview

## Current Documentation

### Core References
- **[database-design.md](database-design.md)** - Complete database architecture and design
- **[table-reference.md](table-reference.md)** - Detailed specifications for all 21 tables
- **[../README.md](../README.md)** - Quick start guide and operational instructions

### Implementation History
- **[migration-log.md](migration-log.md)** - Record of 2025-09-09 directory reorganization
- **[DesignDecisions.md](DesignDecisions.md)** - Original design rationale (historical reference)

### Archived
- **[ARCHIVE/](ARCHIVE/)** - Completed or obsolete documentation

## Quick Navigation

### For Developers
Start with the [README](../README.md) for setup instructions, then reference [table-reference.md](table-reference.md) for detailed schema information.

### For Database Design
Review [database-design.md](database-design.md) for architecture overview and ERD.

### For Historical Context
See [DesignDecisions.md](DesignDecisions.md) for original design thinking and [migration-log.md](migration-log.md) for structural changes.

## Key Concepts

### The Rosetta Stone Architecture
The database connects everything through **atomic units** - the smallest work elements that link:
- Value streams (WIN, DELIVER, COLLECT, etc.)
- Organizational hierarchy
- Ownership (expected vs observed)
- KPIs and metrics
- Financial data

### Current Implementation
- **23 atomic units** across 6 value streams
- **21 tables** for core data
- **21+ views** for analysis and UI support
- **150+ people** in organizational hierarchy
- **2025 budget** data loaded

## Maintenance Notes

When updating documentation:
1. Keep `database-design.md` as the primary architecture reference
2. Update `table-reference.md` when schema changes
3. Log significant changes in `migration-log.md`
4. Archive obsolete docs in `ARCHIVE/` folder