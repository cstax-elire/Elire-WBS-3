# Rosetta Console v4.0 - Data-Driven Hierarchical UI

A PostgreSQL-backed web application that reveals **fiction vs reality** through hierarchical trees showing ownership alignment, with the database structure driving all business logic and rollups.

## 🎯 Core Vision

**THE DATABASE IS THE SOLUTION** - UI is just a thin visualization layer over properly structured SQL views. All rollups, hierarchies, and relationships are calculated in the database, not JavaScript.

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

## 📊 Key Pages - Hierarchical Trees with Rollups

### 🌳 **Organization Tree** (`/org`) 
Navigate the org hierarchy with ownership alignment rollups:
- **Structure**: Pillars → COEs → Practices
- **Metrics**: Headcount, Revenue, Margin, Ownership Alignment
- **Rollups**: See how misattribution cascades up the org tree
- **Data Source**: `v_org_tree_with_ownership` view

### 🔀 **Value Streams** (`/streams`)
Editable ownership at the atomic unit level:
- **Structure**: Streams → Sub-streams → Atomic Units  
- **Editing**: Click "Click to set" to assign ownership with dropdowns
- **Real-time**: Changes immediately update rollups
- **Data Source**: `v_stream_tree_with_ownership` view

### 📋 **Truth Table** (`/truth`)
Paginated grid view for bulk operations:
- Expected vs Observed ownership comparison
- Filtering by stream, org, or status
- Pagination for large datasets

### Other Pages
- **Evidence Log** (`/evidence`) — Audit trail of all changes
- **KPIs** (`/kpis`) — Leading/lagging metrics  
- **Finance** (`/finance`) — P&L views (direct and allocated)

## 🏗️ Architecture - Database-Driven Design

### Critical Principle: WBS-Style Strict Hierarchies
```
Organization Hierarchy:         Stream Hierarchy:
    LEADERSHIP                      WIN
    ├── PILLAR_SERVICE_EXEC         ├── WIN_LEAD
    │   ├── SERVICE_CLOUD           ├── WIN_REGISTER
    │   └── SERVICE_DATA            ├── WIN_TRIAGE
    └── PILLAR_CLIENT               └── WIN_QUALIFY...
        ├── CLIENT_SALES        
        └── CLIENT_MARKETING    Atomic Units (at leaves):
                                   - WIN-01: Lead Generation
                                   - WIN-02: Lead Registration
                                   - etc.
```

### Database Views Handle Everything
```sql
-- Org tree with ownership rollups (calculated in SQL)
v_org_tree_with_ownership

-- Stream tree with unit ownership details  
v_stream_tree_with_ownership

-- Truth table with status calculation
v_rosetta_truth
```

### API Endpoints Are Simple Passthroughs
```javascript
// GOOD - Simple passthrough to database view
const result = await query('SELECT * FROM v_org_tree_with_ownership');

// BAD - Calculating rollups in JavaScript
const rollup = nodes.reduce((sum, node) => sum + node.value, 0);
```

## 🔧 Database Setup

Run these SQL scripts in order:
```bash
psql -d elire_ops_1 -f elire_ops_1/1-tables_and_types.sql
psql -d elire_ops_1 -f elire_ops_1/2-seed.sql
psql -d elire_ops_1 -f elire_ops_1/3-value_streams_systems_attribution.sql
psql -d elire_ops_1 -f elire_ops_1/4-kpis_and_targets.sql
psql -d elire_ops_1 -f elire_ops_1/5-Financials_rates.sql
psql -d elire_ops_1 -f elire_ops_1/6-rosetta_stone.sql
psql -d elire_ops_1 -f elire_ops_1/7-updates.sql
psql -d elire_ops_1 -f elire_ops_1/8-updates.sql
psql -d elire_ops_1 -f elire_ops_1/10-ui-helpers.sql
```

## 📡 API Endpoints

### Tree/Hierarchy Endpoints (READ-ONLY)
- `GET /api/tree/org-with-ownership` — Org tree with ownership stats
- `GET /api/tree/streams-with-ownership` — Stream tree with ownership stats
- `GET /api/streams/[code]/units` — Units for a specific stream

### Data Modification (WRITE)
- `POST /api/observed-ownership` — Set observed ownership (append-only)
- `POST /api/evidence` — Log evidence entries

### Option Lists
- `GET /api/options/org` — Organization dropdown options
- `GET /api/options/role` — Role dropdown options

## 🎨 UI Components

### StreamTreeWithUnits
The core component for editable hierarchical data:
- Displays stream hierarchy with expand/collapse
- Shows ownership alignment badges
- Inline editing with dropdowns
- Real-time updates with cache invalidation

### Key Features
- **Dropdowns tied to database**: Options come from `org_unit` and `org_role` tables
- **Optimistic updates**: UI updates immediately, rollback on error
- **Smart caching**: Only invalidate affected queries

## 📈 Status Model

- **Aligned** ✅: Observed matches expected
- **Misattributed** ⚠️: Observed differs from expected  
- **Not Observed** ⭕: No ownership set yet

## 🛠️ Technology Stack

- **Frontend**: Next.js 14.2.5 with App Router
- **UI**: Shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS
- **Data**: TanStack Query + PostgreSQL
- **TypeScript**: Full type safety

## 🔑 Key Insights

### Why Trees Over Tables?
- Tables show flat data; trees show relationships
- Misattribution cascades are visible in hierarchy
- Natural place for rollup calculations
- Intuitive editing at the leaf level

### The Rosetta Stone Concept
Everything connects through atomic units:
- Each unit has ONE stream (work type)
- Each unit has ONE expected owner (by design)
- Each unit has ONE observed owner (reality)
- The gap reveals organizational fiction vs reality

### Data Principles
- **Append-only history**: Never UPDATE, always INSERT
- **Latest wins**: Views select most recent observation
- **Evidence everywhere**: Every change logged
- **Database-driven**: SQL views contain business logic