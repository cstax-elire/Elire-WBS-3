# Rosetta Console - Data-Driven Tree Architecture

## Core Philosophy: The Database IS the Solution

This document explains the fundamental architecture shift from UI-driven to database-driven design, implementing true WBS (Work Breakdown Structure) principles.

## The Problem with UI-Driven Design

Traditional approaches calculate business logic in the frontend:
```javascript
// ❌ BAD - UI calculating rollups
function calculateOrgRollup(nodes) {
  return nodes.reduce((sum, node) => {
    const childSum = calculateOrgRollup(node.children);
    return sum + node.value + childSum;
  }, 0);
}
```

This creates multiple problems:
- Business logic scattered across components
- Inconsistent calculations
- Performance issues with large datasets
- Difficult to maintain and test

## The Solution: Database-Driven Trees

All business logic lives in SQL views:
```sql
-- ✅ GOOD - Database calculating rollups
CREATE VIEW v_org_tree_with_ownership AS
WITH RECURSIVE rollup AS (
  -- Base: leaf nodes
  SELECT org_id, parent_id, 
         direct_units, direct_aligned
  FROM org_unit
  
  UNION ALL
  
  -- Recursive: aggregate children
  SELECT p.org_id, p.parent_id,
         p.direct_units + SUM(c.total_units),
         p.direct_aligned + SUM(c.total_aligned)
  FROM org_unit p
  JOIN rollup c ON c.parent_id = p.org_id
  GROUP BY p.org_id, p.parent_id
)
SELECT * FROM rollup;
```

The UI becomes a simple renderer:
```javascript
// ✅ GOOD - UI just displays what database provides
const { data } = await fetch('/api/tree/org-with-ownership');
return <TreeView nodes={data} />;
```

## Hierarchical Structure

### Organizational Hierarchy
```
LEADERSHIP (Pillar)
├── PILLAR_SERVICE_EXEC
│   ├── SERVICE_CLOUD (COE)
│   │   ├── CLOUD_ARCHITECTURE (Practice)
│   │   └── CLOUD_ENGINEERING (Practice)
│   └── SERVICE_DATA (COE)
│       ├── DATA_ENGINEERING (Practice)
│       └── DATA_SCIENCE (Practice)
└── PILLAR_CLIENT
    ├── CLIENT_SALES (COE)
    └── CLIENT_MARKETING (COE)
```

### Stream Hierarchy
```
WIN (Primary Stream)
├── WIN_LEAD (Sub-stream)
├── WIN_REGISTER (Sub-stream)
├── WIN_TRIAGE (Sub-stream)
├── WIN_QUALIFY (Sub-stream)
├── WIN_OUTLINE (Sub-stream)
├── WIN_PRICE (Sub-stream)
├── WIN_PROPOSAL (Sub-stream)
├── WIN_NEGOTIATE (Sub-stream)
└── WIN_HANDOFF (Sub-stream)
```

### Atomic Units (Leaf Level)
```
WIN-01: Lead Generation → belongs to WIN_LEAD
WIN-02: Lead Registration → belongs to WIN_REGISTER
WIN-03: Lead Triage → belongs to WIN_TRIAGE
...
```

## Data Flow Architecture

### Read Path (Database → UI)
```
PostgreSQL View
    ↓
API Endpoint (passthrough)
    ↓
React Query Cache
    ↓
Tree Component
    ↓
User Sees Hierarchical Data
```

### Write Path (UI → Database)
```
User Edits Ownership
    ↓
API POST /observed-ownership
    ↓
INSERT into unit_observed_ownership
    ↓
Database Trigger Updates Views
    ↓
React Query Invalidation
    ↓
UI Refreshes with New Rollups
```

## Key Database Views

### v_org_tree_with_ownership
Provides organizational hierarchy with ownership alignment rollups:
- Direct and total headcount
- Direct and total revenue/margin
- Ownership alignment stats (aligned/misattributed/not observed)
- Automatic rollup calculations through hierarchy

### v_stream_tree_with_ownership  
Provides stream hierarchy with unit ownership details:
- Stream structure with parent/child relationships
- Unit counts at each level
- Alignment percentages
- Links to atomic units for editing

### v_rosetta_truth
The source of truth for ownership comparison:
- Expected ownership (from org design)
- Observed ownership (from user input)
- Computed status (Aligned/Misattributed/Not Observed)
- Evidence trail links

## Component Architecture

### StreamTreeWithUnits Component
```typescript
// Core component structure
<StreamTree>
  <StreamNode>
    <NodeHeader />
    <NodeMetrics />
    {expanded && (
      <>
        <UnitList>
          <UnitRow>
            <ExpectedOwnership />
            <ObservedOwnership editable />
            <StatusBadge />
          </UnitRow>
        </UnitList>
        <ChildNodes recursive />
      </>
    )}
  </StreamNode>
</StreamTree>
```

### Key Features
1. **Lazy Loading**: Units load only when node expands
2. **Optimistic Updates**: UI updates before server confirms
3. **Smart Caching**: Only affected queries invalidate
4. **Inline Editing**: Dropdowns appear in place

## API Design Principles

### Good API Endpoint
```typescript
// Simple passthrough to view
export async function GET() {
  const result = await query(`
    SELECT * FROM v_org_tree_with_ownership
    ORDER BY path
  `);
  return NextResponse.json(result);
}
```

### Bad API Endpoint
```typescript
// Complex logic in API layer
export async function GET() {
  const nodes = await getNodes();
  const rollups = calculateRollups(nodes); // ❌ 
  const enriched = addMetrics(rollups);    // ❌
  return NextResponse.json(enriched);
}
```

## Performance Optimizations

### Database Level
- Materialized views for expensive calculations
- Proper indexes on foreign keys and filters
- Recursive CTEs for hierarchical queries

### UI Level
- Virtual scrolling for large trees
- Lazy loading of child nodes
- React Query caching strategy
- Memoization of expensive renders

## Testing Strategy

### Database Tests
```sql
-- Test rollup accuracy
WITH test AS (
  SELECT 
    org_id,
    direct_units,
    total_units,
    (SELECT SUM(direct_units) 
     FROM v_org_tree_with_ownership child 
     WHERE child.path LIKE parent.path || '%') as calculated_total
  FROM v_org_tree_with_ownership parent
)
SELECT * FROM test WHERE total_units != calculated_total;
```

### UI Tests
```typescript
// Test tree rendering
it('displays rollup values from database', async () => {
  const mockData = [
    { org_id: 1, total_units: 10, total_aligned: 8 }
  ];
  render(<OrgTree data={mockData} />);
  expect(screen.getByText('8/10 aligned')).toBeInTheDocument();
});
```

## Migration Path

### Phase 1: Create Enhanced Views ✅
- v_org_tree_with_ownership
- v_stream_tree_with_ownership
- API endpoints for new views

### Phase 2: Update UI Components ✅
- OrgTree to use ownership data
- StreamTree with inline editing
- Remove JavaScript rollup logic

### Phase 3: Optimize Performance
- Add materialized views where needed
- Implement pagination for large datasets
- Add filtering capabilities

## Conclusion

By moving business logic to the database:
- **Single source of truth**: Database views define business rules
- **Consistent calculations**: Same logic everywhere
- **Better performance**: Database optimizes queries
- **Easier maintenance**: Change view, not multiple components
- **Natural hierarchies**: SQL recursive CTEs handle trees elegantly

The UI becomes what it should be: a presentation layer that displays and collects data, with the database handling all complex logic and relationships.