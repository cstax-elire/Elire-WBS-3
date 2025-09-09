# Documentation Overview

## Current Documentation

### Primary References
- **[DatabaseDesign.md](DatabaseDesign.md)** ⭐ **AUTHORITATIVE** - Complete implementation guide with business logic, financial allocations, and validation approach
- **[database-architecture.md](database-architecture.md)** - ERD and structural overview (tables, relationships, views)
- **[table-reference.md](table-reference.md)** - Detailed specifications for all 21 tables
- **[../README.md](../README.md)** - Quick start guide and operational instructions

### Implementation Details
- **[implementation-notes.md](implementation-notes.md)** - Financial reallocation logic, validation approach, known gaps
- **[migration-log.md](migration-log.md)** - Record of 2025-09-09 directory reorganization
- **[DesignDecisions.md](DesignDecisions.md)** - Original design rationale (historical reference)

### Archived
- **[ARCHIVE/](ARCHIVE/)** - Completed or obsolete documentation

## Quick Navigation

### For Understanding the System
Start with [DatabaseDesign.md](DatabaseDesign.md) for the complete implementation story, including business logic and validation.

### For Developers
Review [database-architecture.md](database-architecture.md) for ERD and structure, then [table-reference.md](table-reference.md) for schema details.

### For Operations
See [../README.md](../README.md) for setup instructions and [implementation-notes.md](implementation-notes.md) for gotchas and gaps.

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