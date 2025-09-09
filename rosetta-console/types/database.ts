// Database View Types from v4 Specification
// Matches the database views created in elire_ops_1 SQL scripts

// Core Rosetta Views
export interface RosettaEnhancedRow {
  unit_id: number;
  unit_code: string;
  unit_name: string;
  stream_id: number;
  stream_code: string;
  stream_name: string;
  parent_stream_code?: string;
  order_in_stream: number;
  expected_role?: string;
  expected_org?: string;
  observed_role?: string;
  observed_org?: string;
  observed_as_of?: Date;
  systems?: string[];
  kpis?: Array<{
    code: string;
    name: string;
    value?: number;
  }>;
}

export interface RosettaTruthRow {
  unit_code: string;
  unit_name: string;
  stream_code: string;
  expected_role: string;
  expected_org: string;
  observed_role: string;
  observed_org: string;
  status: 'Aligned' | 'Misattributed' | 'Not Observed' | 'Incomplete Expected';
  evidence_count: number;
  last_evidence_at?: Date;
  total_count?: number; // For paginated results
}

export interface MisattributionRow {
  stream: string;
  parent_stream?: string;
  unit_code: string;
  unit_name: string;
  expected_role: string;
  expected_org: string;
  observed_role: string;
  observed_org: string;
  attribution_status: 'Not Observed' | 'Incomplete Expected' | 'Misattributed' | 'Aligned';
  is_misattributed: boolean;
  observed_as_of?: Date;
  observation_source?: string;
  confidence_pct?: number;
}

// Tree Navigation
export interface OrgTreeNode {
  org_unit_id: number;
  code: string;
  name: string;
  parent_id?: number;
  depth: number;
  path: string;
  headcount?: number;
  direct_revenue?: number;
  direct_expense?: number;
  direct_margin?: number;
  allocated_revenue?: number;
  allocated_expense?: number;
  allocated_margin?: number;
  children?: OrgTreeNode[];
}

export interface StreamTreeNode {
  stream_id: number;
  code: string;
  name: string;
  parent_id?: number;
  is_enabler: boolean;
  order_in_parent: number;
  unit_count: number;
  aligned_count: number;
  misattributed_count: number;
  not_observed_count: number;
  alignment_pct: number;
  children?: StreamTreeNode[];
}

// Financial Views
export interface FinancialRow {
  org_unit_id: number;
  org_code: string;
  org_name: string;
  pillar?: string;
  practice?: string;
  budget_revenue: number;
  budget_expense: number;
  budget_margin: number;
  actual_revenue: number;
  actual_expense: number;
  actual_margin: number;
  variance_revenue: number;
  variance_expense: number;
  variance_margin: number;
}

export interface FinancialWithSGARow extends FinancialRow {
  allocated_sg_a: number;
  margin_after_sg_a: number;
  margin_pct: number;
}

// Evidence and KPIs
export interface EvidenceRow {
  evidence_id: number;
  unit_id: number;
  unit_code: string;
  unit_name: string;
  subject_ref: string;
  evidence_type: EvidenceType;
  system_ref: string;
  occurred_at: Date;
  actor_person?: string;
  actor_role?: string;
  org_unit?: string;
  notes?: string;
}

export interface StreamOutcomeRow {
  stream_code: string;
  stream_name: string;
  outcome_kpis: Array<{
    code: string;
    name: string;
    latest_value?: number;
    target_value?: number;
    status: 'green' | 'yellow' | 'red' | 'unknown';
  }>;
  driver_kpis: Array<{
    code: string;
    name: string;
    latest_value?: number;
    target_value?: number;
    status: 'green' | 'yellow' | 'red' | 'unknown';
  }>;
}

export interface KPIRollupRow {
  kpi_id: number;
  code: string;
  name: string;
  kind: 'leading' | 'lagging';
  scope: 'unit' | 'stream' | 'firm';
  latest_value?: number;
  target_value?: number;
  threshold_yellow?: number;
  threshold_red?: number;
  status: 'green' | 'yellow' | 'red' | 'unknown';
  trend?: 'up' | 'down' | 'flat';
  measured_at?: Date;
}

// UI Helper Views (from 10-ui-helpers.sql)
export interface DropdownOption {
  value: number;
  label: string;
  code: string;
  name?: string;
}

export interface HierarchicalOption extends DropdownOption {
  path: string;
  depth: number;
}

export interface StreamOption extends DropdownOption {
  is_enabler: boolean;
  order_in_parent: number;
}

export interface OwnershipSummary {
  stream: string;
  stream_name: string;
  total_units: number;
  aligned: number;
  misattributed: number;
  not_observed: number;
  alignment_pct: number;
}

// Evidence Types (constrained in database)
export type EvidenceType = 
  | 'ownership_update'
  | 'kpi_measurement'
  | 'pricing_decision'
  | 'solution_outline'
  | 'proposal_redline'
  | 'recruit_req'
  | 'scope_change'
  | 'milestone_complete'
  | 'invoice_adjustment';

// API Request/Response Types
export interface ObservedOwnershipRequest {
  unit_id: number;
  accountable_role_id?: number | null;
  accountable_org_unit_id?: number | null;
  source?: string;
  confidence_pct?: number;
  notes?: string;
}

export interface EvidenceLogRequest {
  unit_id: number;
  subject_ref: string;
  evidence_type: EvidenceType;
  system_ref?: string;
  actor_person_id?: number;
  actor_role_id?: number;
  org_unit_id?: number;
  notes?: string;
}

export interface KPITargetUpdate {
  kpi_id: number;
  unit_id?: number;
  target_value: number;
  threshold_yellow: number;
  threshold_red: number;
}

export interface PersonFactUpdate {
  person_id: number;
  fact_date: string;
  fact_type: 'allocation' | 'utilization' | 'rate';
  value_numeric?: number;
  value_text?: string;
  notes?: string;
}

export interface FinancialFactInsert {
  org_unit_id: number;
  account_id: number;
  period: string;
  scenario: 'budget' | 'actual' | 'forecast';
  amount: number;
  notes?: string;
}

// Pagination Types
export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter Types
export interface TruthFilters {
  stream?: string;
  status?: 'Aligned' | 'Misattributed' | 'Not Observed';
}

export interface EvidenceFilters {
  unit?: string;
  type?: EvidenceType;
  dateRange?: { from: Date; to: Date };
  actor?: string;
  stream?: string;
}

export interface KPIFilters {
  kind?: 'leading' | 'lagging';
  scope?: 'unit' | 'stream' | 'firm';
  status?: 'green' | 'yellow' | 'red' | 'unknown';
}

// Database Error Types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public detail?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Connection Pool Types
export interface TransactionClient {
  query: (text: string, params?: any[]) => Promise<any>;
  release: () => void;
}

export interface PoolConfig {
  connectionString?: string;
  max?: number; // Maximum number of clients in the pool
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}