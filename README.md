# Elire WBS Phase 3 - Rosetta Console

A PostgreSQL-backed business intelligence dashboard that implements the "Rosetta Stone" concept - connecting value streams, organizational units, people, KPIs, systems of record, and financials into a unified operational view.

## Overview

The Rosetta Console provides a value stream-centric interface for managing organizational ownership, attribution, KPIs, and financial data. It exposes misattribution between expected and observed ownership, enabling organizations to identify and correct operational inefficiencies.

## Key Features

### Value Stream Dashboard
- **Three-panel layout**: Stream navigator, units grid, and KPI cascade
- **Real-time ownership tracking**: Expected vs. observed ownership with status indicators
- **Inline editing**: Click-to-edit functionality for all data points
- **Misattribution visibility**: Color-coded status (aligned/misattributed/not observed)
- **Financial impact**: Shows the cost of misattribution ($2.4M example)

### Stream Detail Pages (`/stream/[code]`)
- Dedicated views for each value stream (WIN, DELIVER, COLLECT, TALENT, OPERATE)
- Simplified inline editing without dropdowns unless clicked
- Real-time status updates

### Data Management
- **Append-only history**: Never updates observed ownership, always inserts new records
- **Evidence trail**: All changes create immutable audit log entries
- **Natural key idempotency**: Safe data refreshes using ON CONFLICT DO NOTHING

## Tech Stack

- **Frontend**: Next.js 14.2.5 with App Router, React, Tailwind CSS
- **Backend**: PostgreSQL with complex relational schema
- **API**: RESTful endpoints for all data operations

## Project Structure

```
├── rosetta-console/          # Next.js application
│   ├── app/                  # App router pages and API routes
│   │   ├── api/             # API endpoints for data updates
│   │   ├── stream/[code]/   # Dynamic stream detail pages
│   │   └── page.tsx         # Main dashboard
│   ├── components/          # React components
│   │   ├── ValueStreamDashboard.tsx
│   │   ├── StreamDetailView.tsx
│   │   ├── EditOwnership.tsx
│   │   └── StatusBadge.tsx
│   └── lib/                 # Database utilities
│       └── db.ts           # PostgreSQL connection pool
│
├── elire_ops_1/            # Database schema and migrations
│   ├── 1-tables_and_types.sql
│   ├── 2-seed.sql
│   ├── 3-value_streams_systems_attribution.sql
│   ├── 4-kpis_and_targets.sql
│   ├── 5-Financials_rates.sql
│   ├── 6-rosetta_stone.sql
│   ├── 7-updates.sql
│   └── 8-updates.sql
│
├── UI-UPDATES-*.md         # UI implementation specifications
└── CLAUDE.md              # AI assistant instructions

```

## Database Setup

1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable in `.env.local`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/your_database
   ```
3. Run migrations in order:
   ```bash
   psql -d your_database -f elire_ops_1/1-tables_and_types.sql
   psql -d your_database -f elire_ops_1/2-seed.sql
   psql -d your_database -f elire_ops_1/3-value_streams_systems_attribution.sql
   psql -d your_database -f elire_ops_1/4-kpis_and_targets.sql
   psql -d your_database -f elire_ops_1/5-Financials_rates.sql
   psql -d your_database -f elire_ops_1/6-rosetta_stone.sql
   psql -d your_database -f elire_ops_1/7-updates.sql
   psql -d your_database -f elire_ops_1/8-updates.sql
   ```

## Running the Application

1. Install dependencies:
   ```bash
   cd rosetta-console
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000

## Core Concepts

### Atomic Units
The fundamental work units (20 core units plus SELL sub-phases) that connect all dimensions of the organization.

### Value Streams
Primary workflow spine:
- **WIN**: Sales and business development
- **DELIVER**: Service delivery and execution
- **COLLECT**: Revenue collection and finance
- **TALENT**: People and talent management
- **OPERATE**: Operations and infrastructure

### Ownership Model
- **Expected Ownership**: Pre-defined based on organizational design
- **Observed Ownership**: Actual ownership tracked in real-time
- **Misattribution**: Gaps between expected and observed ownership

### Evidence System
Immutable audit trail of all ownership changes and KPI measurements, ensuring complete traceability.

## API Endpoints

- `POST /api/observed` - Set observed ownership (append-only)
- `POST /api/expected` - Update expected ownership
- `POST /api/unit-kpi` - Record unit KPI measurements
- `POST /api/unit/add` - Add new atomic units
- `POST /api/unit/delete` - Delete atomic units
- `POST /api/person` - Update person data
- `POST /api/evidence` - Log evidence entries

## Key Database Views

- `v_rosetta_stone_enhanced` - Core view joining units with streams, orgs, systems, and KPIs
- `v_rosetta_truth` - Expected vs observed ownership with status flags
- `v_org_tree` - Hierarchical org structure with financial rollups
- `v_stream_tree` - Value stream hierarchy with unit counts
- `v_financial_rollup` - Direct P&L by org unit
- `v_observed_from_evidence` - Evidence log formatted for UI display

## Development Status

### Completed
- ✅ Value stream-centric dashboard (UI_UPDATES-2.md)
- ✅ Stream detail pages with inline editing (UI_UPDATES-3.md)
- ✅ Database schema and views
- ✅ API routes for all CRUD operations
- ✅ Real-time ownership tracking
- ✅ Evidence logging system

### Future Enhancements
- Financial actuals integration (currently budget only)
- PSA system integration for real-time person allocations
- Advanced KPI analytics and predictions
- Role-based access control
- Export functionality for reports

## License

Proprietary - All rights reserved

## Support

For questions or issues, please contact the Elire operations team.