# UI Implementation Specification v4.0

*Production-ready with performance optimizations and complete error handling*

## 1. System Architecture

### Technology Stack

```yaml
Frontend:
  - Next.js 14.2.5 (App Router)
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui components
  - React Query for data fetching
  - Virtual scrolling for large datasets
  
Backend:
  - PostgreSQL (local)
  - Node.js API routes
  - pg driver with connection pooling
  - Transaction support for multi-table operations

Key Patterns:
  - Append-only writes for ownership
  - Optimistic UI updates with rollback
  - Server-side pagination with client-side caching
  - Single user (no auth)
  - Evidence logging for all meaningful changes
  - Foreign key validation on all writes
```

### Database Views Contract (VERIFIED)

```typescript
// Core views that exist and are tested
interface DatabaseViews {
  // Core Rosetta views
  'v_rosetta_stone_enhanced': RosettaEnhancedRow;
  'v_rosetta_truth': RosettaTruthRow;
  'v_misattribution_delta': MisattributionRow;
  
  // Tree navigation
  'v_org_tree': OrgTreeNode;
  'v_stream_tree': StreamTreeNode;
  
  // Financial views  
  'v_financial_rollup': FinancialRow;
  'v_financial_rollup_with_sga': FinancialWithSGARow;
  
  // Evidence and KPIs
  'v_observed_from_evidence': EvidenceRow;
  'v_stream_rollup': StreamOutcomeRow;
  'v_kpi_rollup': KPIRollupRow;
  
  // UI Helper views (NEW in 10-ui-helpers.sql)
  'v_role_options': DropdownOption;
  'v_org_options': HierarchicalOption;
  'v_stream_options': StreamOption;
  'v_ownership_summary': OwnershipSummary;
  
  // Pagination function
  'get_rosetta_truth_page': PaginatedTruthFunction;
}
```

## 2. Page Specifications

### `/truth` - Ownership Truth Table (WITH PAGINATION)

#### Data Sources

```typescript
// Paginated data fetching
async function getTruthData(
  page: number = 1,
  pageSize: number = 50,
  filters?: {
    stream?: string;
    status?: string;
  }
) {
  const offset = (page - 1) * pageSize;
  
  const result = await sql`
    SELECT * FROM get_rosetta_truth_page(
      ${pageSize}::int,
      ${offset}::int,
      ${filters?.stream}::text,
      ${filters?.status}::text
    )`;
  
  return {
    data: result.rows,
    totalCount: result.rows[0]?.total_count || 0,
    pageCount: Math.ceil((result.rows[0]?.total_count || 0) / pageSize)
  };
}

// Summary statistics
async function getOwnershipSummary() {
  return sql`SELECT * FROM v_ownership_summary ORDER BY stream`;
}
```

#### Interactions with Validation

```typescript
// Ownership update with transaction and validation
async function updateOwnership(
  unitId: number,
  field: 'role' | 'org',
  value: number | null
) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Validate foreign key if not null
    if (value !== null) {
      const table = field === 'role' ? 'org_role' : 'org_unit';
      const column = field === 'role' ? 'role_id' : 'org_unit_id';
      
      const exists = await client.query(
        `SELECT 1 FROM ${table} WHERE ${column} = $1`,
        [value]
      );
      
      if (exists.rowCount === 0) {
        throw new Error(`Invalid ${field} ID: ${value}`);
      }
    }
    
    // 2. Append to observed ownership
    const columnName = field === 'role' 
      ? 'accountable_role_id' 
      : 'accountable_org_unit_id';
    
    await client.query(
      `INSERT INTO unit_observed_ownership (
        unit_id, observed_as_of, ${columnName}, source, confidence_pct, notes
      ) VALUES ($1, NOW(), $2, 'UI', 1.0, $3)`,
      [unitId, value, `Updated ${field} via Truth page`]
    );
    
    // 3. Log evidence
    await client.query(
      `INSERT INTO evidence_log (
        unit_id, subject_ref, evidence_type, system_ref, occurred_at, notes
      ) VALUES ($1, $2, 'ownership_update', 'UI', NOW(), $3)`,
      [unitId, `OWNERSHIP_${Date.now()}`, `Changed ${field} to ${value}`]
    );
    
    await client.query('COMMIT');
    return { success: true };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

#### NULL Handling

```tsx
// Component handles missing roles/orgs gracefully
function OwnershipCell({ 
  value, 
  expected,
  type,
  onUpdate 
}: OwnershipCellProps) {
  const options = useQuery(
    ['options', type],
    () => fetch(`/api/options/${type}`).then(r => r.json())
  );
  
  // Handle UNDEFINED expected ownership
  if (expected === 'UNDEFINED') {
    return (
      <div className="text-muted-foreground italic">
        Not defined in system
      </div>
    );
  }
  
  // Handle NOT_SET observed ownership
  if (value === 'NOT_SET') {
    return (
      <InlineEdit
        value={null}
        options={options.data || []}
        placeholder="Click to set"
        onSave={onUpdate}
      />
    );
  }
  
  return (
    <InlineEdit
      value={value}
      options={options.data || []}
      onSave={onUpdate}
    />
  );
}
```

### `/streams` - Value Stream Navigator (INCLUDES EXPAND)

#### Data Sources

```sql
-- All 6 streams including EXPAND
SELECT * FROM v_stream_tree 
WHERE parent_id IS NULL
ORDER BY order_in_parent;

-- Stream-specific units
SELECT * FROM v_rosetta_stone_enhanced
WHERE stream_code = ${streamCode}
ORDER BY order_in_stream;
```

#### Stream Cards

```tsx
function StreamGrid() {
  const streams = [
    { code: 'WIN', name: 'Win Work', icon: Trophy },
    { code: 'DELIVER', name: 'Deliver Work', icon: Package },
    { code: 'COLLECT', name: 'Collect Cash', icon: DollarSign },
    { code: 'EXPAND', name: 'Expand Clients', icon: TrendingUp }, // NEW
    { code: 'TALENT', name: 'Talent Engine', icon: Users },
    { code: 'OPERATE', name: 'Operate Business', icon: Settings }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {streams.map(stream => (
        <StreamCard key={stream.code} {...stream} />
      ))}
    </div>
  );
}
```

### `/org` - Organization Hierarchy

#### Dropdown Population

```typescript
// Use new helper views for dropdowns
async function getOrgOptions() {
  const result = await sql`
    SELECT * FROM v_org_options 
    ORDER BY depth, path`;
  
  return result.rows.map(row => ({
    value: row.value,
    label: row.label,
    depth: row.depth,
    code: row.code
  }));
}

async function getRoleOptions() {
  const result = await sql`
    SELECT * FROM v_role_options`;
  
  return result.rows.map(row => ({
    value: row.value,
    label: row.label,
    code: row.code
  }));
}
```

### `/evidence` - Evidence Log with Types

#### Constrained Evidence Types

```typescript
// Evidence types are now constrained in database
type EvidenceType = 
  | 'ownership_update'
  | 'kpi_measurement'
  | 'pricing_decision'
  | 'solution_outline'
  | 'proposal_redline'
  | 'recruit_req'
  | 'scope_change'
  | 'milestone_complete'
  | 'invoice_adjustment';

interface EvidenceFilters {
  unit?: string;
  type?: EvidenceType;
  dateRange?: { from: Date; to: Date };
  actor?: string;
  stream?: string; // NEW: filter by stream
}
```

### `/kpis` - KPI Management

#### Batch Updates with Transaction

```typescript
async function updateKPITargets(
  updates: Array<{
    kpiId: number;
    unitId?: number;
    target: number;
    yellowThreshold: number;
    redThreshold: number;
  }>
) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const update of updates) {
      // Validate KPI exists
      const kpiExists = await client.query(
        'SELECT 1 FROM kpi WHERE kpi_id = $1',
        [update.kpiId]
      );
      
      if (kpiExists.rowCount === 0) {
        throw new Error(`Invalid KPI ID: ${update.kpiId}`);
      }
      
      // Update or insert target
      await client.query(`
        INSERT INTO kpi_target (
          kpi_id, unit_id, valid_from, target_value, 
          threshold_yellow, threshold_red, scope
        ) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, 
          CASE WHEN $2 IS NULL THEN 'firm' ELSE 'unit' END)
        ON CONFLICT (kpi_id, COALESCE(unit_id, 0), valid_from)
        DO UPDATE SET
          target_value = EXCLUDED.target_value,
          threshold_yellow = EXCLUDED.threshold_yellow,
          threshold_red = EXCLUDED.threshold_red
      `, [
        update.kpiId,
        update.unitId,
        update.target,
        update.yellowThreshold,
        update.redThreshold
      ]);
      
      // Log evidence
      if (update.unitId) {
        await client.query(`
          INSERT INTO evidence_log (
            unit_id, subject_ref, evidence_type, 
            system_ref, occurred_at, notes
          ) VALUES ($1, $2, 'kpi_measurement', 'UI', NOW(), $3)
        `, [
          update.unitId,
          `KPI_TARGET_${update.kpiId}`,
          `Updated KPI target to ${update.target}`
        ]);
      }
    }
    
    await client.query('COMMIT');
    return { success: true };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## 3. Component Library Updates

### Pagination Component

```typescript
// components/DataTablePagination.tsx
export function DataTablePagination({
  pageCount,
  currentPage,
  onPageChange,
  pageSize,
  totalCount
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1} to{' '}
          {Math.min(currentPage * pageSize, totalCount)} of{' '}
          {totalCount} results
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageCount)}
          disabled={currentPage === pageCount}
        >
          Last
        </Button>
      </div>
    </div>
  );
}
```

### Summary Dashboard Component

```typescript
// components/OwnershipSummary.tsx
export function OwnershipSummary() {
  const { data } = useQuery(['ownership-summary'], 
    () => fetch('/api/summary/ownership').then(r => r.json())
  );
  
  if (!data) return <Skeleton className="h-32" />;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {data.map((stream: any) => (
        <Card key={stream.stream}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{stream.stream_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stream.alignment_pct}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stream.aligned} of {stream.total_units} aligned
            </div>
            {stream.misattributed > 0 && (
              <Badge variant="destructive" className="mt-2">
                {stream.misattributed} misattributed
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## 4. API Endpoints with Validation

### Enhanced API Security

```typescript
// api/observed-ownership/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Validate unit exists
    const unitCheck = await client.query(
      'SELECT 1 FROM atomic_unit WHERE unit_id = $1',
      [body.unit_id]
    );
    
    if (unitCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'Invalid unit_id' },
        { status: 400 }
      );
    }
    
    // 2. Validate role if provided
    if (body.accountable_role_id) {
      const roleCheck = await client.query(
        'SELECT 1 FROM org_role WHERE role_id = $1',
        [body.accountable_role_id]
      );
      
      if (roleCheck.rowCount === 0) {
        return NextResponse.json(
          { error: 'Invalid role_id' },
          { status: 400 }
        );
      }
    }
    
    // 3. Validate org if provided
    if (body.accountable_org_unit_id) {
      const orgCheck = await client.query(
        'SELECT 1 FROM org_unit WHERE org_unit_id = $1',
        [body.accountable_org_unit_id]
      );
      
      if (orgCheck.rowCount === 0) {
        return NextResponse.json(
          { error: 'Invalid org_unit_id' },
          { status: 400 }
        );
      }
    }
    
    // 4. Allowlist fields
    const allowed = [
      'unit_id',
      'accountable_role_id',
      'accountable_org_unit_id',
      'source',
      'confidence_pct',
      'notes'
    ];
    
    const filtered = Object.keys(body)
      .filter(key => allowed.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: body[key] }), {});
    
    // 5. Insert ownership
    const insertResult = await client.query(
      `INSERT INTO unit_observed_ownership 
       (unit_id, observed_as_of, accountable_role_id, 
        accountable_org_unit_id, source, confidence_pct, notes)
       VALUES ($1, NOW(), $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        filtered.unit_id,
        filtered.accountable_role_id || null,
        filtered.accountable_org_unit_id || null,
        filtered.source || 'UI',
        filtered.confidence_pct || 1.0,
        filtered.notes || null
      ]
    );
    
    // 6. Log evidence
    await client.query(
      `INSERT INTO evidence_log 
       (unit_id, subject_ref, evidence_type, system_ref, occurred_at, notes)
       VALUES ($1, $2, $3, $4, NOW(), $5)`,
      [
        filtered.unit_id,
        `OBS_${insertResult.rows[0].obs_id}`,
        'ownership_update',
        'UI',
        `Ownership updated via API`
      ]
    );
    
    await client.query('COMMIT');
    
    return NextResponse.json(insertResult.rows[0]);
    
  } catch (error: any) {
    await client.query('ROLLBACK');
    
    return NextResponse.json(
      { error: error.message || 'Database error' },
      { status: 500 }
    );
    
  } finally {
    client.release();
  }
}
```

## 5. Database Setup Script

```bash
#!/bin/bash
# setup-database.sh

echo "Setting up Rosetta Console database..."

# Run migrations in order
for script in elire_ops_1/*.sql; do
  echo "Running $script..."
  psql -d $DATABASE_URL -f $script
  if [ $? -ne 0 ]; then
    echo "Error running $script"
    exit 1
  fi
done

echo "Running UI helpers..."
psql -d $DATABASE_URL -f elire_ops_1/10-ui-helpers.sql

echo "Validating setup..."
psql -d $DATABASE_URL -c "SELECT * FROM v_ui_validation;"

echo "Database setup complete!"
```

## 6. Performance Optimizations

### Virtual Scrolling for Large Lists

```typescript
// Use @tanstack/react-virtual for large datasets
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedUnitList({ units }: { units: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: units.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <UnitRow unit={units[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Query Caching Strategy

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      
      // Retry failed requests
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
      
      // Background refetch
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always'
    }
  }
});
```

## 7. Implementation Checklist

### Pre-Development Setup
- [ ] Run `10-ui-helpers.sql` to add missing roles and helper views
- [ ] Verify all views exist with `SELECT * FROM v_ui_validation`
- [ ] Set up connection pool with proper size (10-20 connections)
- [ ] Configure environment variables

### Week 1: Core Functionality
- [ ] Setup Next.js project with TypeScript and dependencies
- [ ] Implement connection pool with transaction support
- [ ] Build `/truth` page with pagination and NULL handling
- [ ] Build `/streams` page including EXPAND stream
- [ ] Build `/org` page with hierarchical dropdowns
- [ ] Implement evidence logging for all updates
- [ ] Add foreign key validation to all API endpoints

### Week 2: Complete Implementation
- [ ] Build `/evidence` page with constrained types
- [ ] Build `/kpis` page with batch updates
- [ ] Build `/finance` page with toggle views
- [ ] Add ownership summary dashboard
- [ ] Implement virtual scrolling for large datasets
- [ ] Add comprehensive error handling
- [ ] Performance test with 10k+ rows
- [ ] Add loading states and skeletons
- [ ] Implement optimistic updates with rollback

### Week 3: Polish and Testing
- [ ] Add data export functionality
- [ ] Implement keyboard navigation
- [ ] Add confirmation dialogs for destructive actions
- [ ] Create user documentation
- [ ] Performance profiling and optimization
- [ ] Error boundary implementation
- [ ] Accessibility audit (WCAG 2.1 AA)

## 8. Error Handling Patterns

### Database Connection Errors

```typescript
// lib/db.ts
class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public detail?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on validation errors
      if (error.code === '23503' || error.code === '23502') {
        throw new DatabaseError(
          'Validation error',
          error.code,
          error.detail
        );
      }
      
      // Exponential backoff for connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}
```

### UI Error Boundaries

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    
    // Send to error tracking service
    if (typeof window !== 'undefined') {
      // Track error
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'An unexpected error occurred'}
          </AlertDescription>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Reload Page
          </Button>
        </Alert>
      );
    }
    
    return this.props.children;
  }
}
```

## 9. Testing Utilities

### Database Test Helpers

```typescript
// test/db-helpers.ts
export async function seedTestData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Clear existing test data
    await client.query(`
      DELETE FROM unit_observed_ownership 
      WHERE source = 'TEST'
    `);
    
    // Add test observations
    const units = await client.query(
      'SELECT unit_id FROM atomic_unit LIMIT 5'
    );
    
    for (const unit of units.rows) {
      await client.query(`
        INSERT INTO unit_observed_ownership
        (unit_id, observed_as_of, accountable_role_id, source)
        VALUES ($1, NOW(), 
          (SELECT role_id FROM org_role LIMIT 1),
          'TEST')
      `, [unit.unit_id]);
    }
    
    await client.query('COMMIT');
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function cleanupTestData() {
  await sql`
    DELETE FROM unit_observed_ownership 
    WHERE source = 'TEST'
  `;
  
  await sql`
    DELETE FROM evidence_log 
    WHERE system_ref = 'TEST'
  `;
}
```

---

