# Rosetta Console

A PostgreSQL-backed web application that reveals **fiction vs reality** (Expected vs Observed ownership),
connects **controllable drivers → outcomes**, and ties those decisions to **evidence** and **dollars**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database connection in .env.local
DATABASE_URL=postgresql://user@localhost:5432/elire_ops_1

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📊 Working Pages

### 🆕 **Workbench** (`/workbench`) - RECOMMENDED
The best interface combining tree navigation with inline editing:
- Toggle between **Streams** and **Org** hierarchies
- Click any node to see its units
- Edit ownership inline with dropdowns
- Real-time status updates
- URL state for bookmarking

### Core Pages

- **Truth Table** (`/truth`) — Grid view comparing expected vs observed ownership with pagination
- **Value Streams** (`/streams`) — Navigate all 6 streams (WIN, DELIVER, COLLECT, EXPAND, TALENT, OPERATE)
- **Evidence Log** (`/evidence`) — Complete audit trail with filters by stream/type/unit
- **KPIs** (`/kpis`) — Leading/lagging metrics with aggregation transparency
- **Finance** (`/finance`) — Toggle between direct P&L and allocated (with SG&A)

## 🔧 Database Setup

Run these SQL scripts in order:
```bash
psql -d your_database -f elire_ops_1/1-tables_and_types.sql
psql -d your_database -f elire_ops_1/2-seed.sql
psql -d your_database -f elire_ops_1/3-value_streams_systems_attribution.sql
psql -d your_database -f elire_ops_1/4-kpis_and_targets.sql
psql -d your_database -f elire_ops_1/5-Financials_rates.sql
psql -d your_database -f elire_ops_1/6-rosetta_stone.sql
psql -d your_database -f elire_ops_1/7-updates.sql
psql -d your_database -f elire_ops_1/8-updates.sql
psql -d your_database -f elire_ops_1/10-ui-helpers-sql.sql
psql -d your_database -f elire_ops_1/11-ui-fix-status-model.sql
```

## 📡 API Endpoints

- `GET /api/tree/streams` — Stream hierarchy from v_stream_tree
- `GET /api/tree/org` — Org hierarchy from v_org_tree
- `GET /api/truth/paginated` — Paginated truth data with filters
- `POST /api/observed-ownership` — Update observed ownership (append-only)
- `GET /api/evidence` — Evidence log entries
- `GET /api/kpis` — KPI rollup data
- `GET /api/finance` — Financial rollup (direct or allocated)

## 🏗️ Architecture

### Core Principles
- **Views-only reads**: UI reads from database views, never raw tables
- **Append-only writes**: Ownership changes create new records (history preserved)
- **Evidence everywhere**: Every change creates an audit log entry
- **Latest wins**: Views automatically select most recent observation

### Key Database Views
- `v_rosetta_truth` — Expected vs observed with computed status
- `v_stream_tree` — Hierarchical stream structure
- `v_org_tree` — Hierarchical org structure with financials
- `v_ownership_summary` — Aggregated alignment by stream
- `v_financial_rollup` — Direct P&L
- `v_financial_rollup_with_sga` — Allocated P&L with SG&A
- `v_observed_from_evidence` — Evidence formatted for UI

### Status Model
- **Aligned**: Both role and org match expected
- **Misattributed**: Role OR org differs from expected
- **Not Observed**: No observed ownership set yet

## 🛠️ Technology Stack

- **Frontend**: Next.js 14.2.5 with App Router
- **UI**: Shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS
- **Data**: TanStack Query + PostgreSQL
- **TypeScript**: Full type safety
