import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { DropdownOption, HierarchicalOption, StreamOption } from '@/types/database';

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;
    
    let result: any[] = [];
    
    switch (type) {
      case 'role':
      case 'roles':
        // Use v_role_options from 10-ui-helpers.sql
        result = await query<DropdownOption>(`
          SELECT * FROM v_role_options
        `);
        break;
        
      case 'org':
      case 'orgs':
        // Use v_org_options from 10-ui-helpers.sql
        result = await query<HierarchicalOption>(`
          SELECT * FROM v_org_options
        `);
        break;
        
      case 'stream':
      case 'streams':
        // Use v_stream_options from 10-ui-helpers.sql
        result = await query<StreamOption>(`
          SELECT * FROM v_stream_options
        `);
        break;
        
      case 'evidence-types':
        // Return constrained evidence types
        result = [
          { value: 'ownership_update', label: 'Ownership Update' },
          { value: 'kpi_measurement', label: 'KPI Measurement' },
          { value: 'pricing_decision', label: 'Pricing Decision' },
          { value: 'solution_outline', label: 'Solution Outline' },
          { value: 'proposal_redline', label: 'Proposal Redline' },
          { value: 'recruit_req', label: 'Recruitment Request' },
          { value: 'scope_change', label: 'Scope Change' },
          { value: 'milestone_complete', label: 'Milestone Complete' },
          { value: 'invoice_adjustment', label: 'Invoice Adjustment' }
        ];
        break;
        
      default:
        return NextResponse.json(
          { error: `Unknown option type: ${type}` },
          { status: 400 }
        );
    }
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error(`Failed to fetch ${params.type} options:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${params.type} options` },
      { status: 500 }
    );
  }
}