import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export interface StreamTreeNode {
  stream_id: number;
  code: string;
  name: string;
  parent_id: number | null;
  is_enabler: boolean;
  depth: number;
  path: string;
  path_codes: string;
  direct_unit_count: number;
  linked_child_units: number;
  order_in_parent: number;
}

export async function GET() {
  try {
    // Fetch full stream hierarchy from v_stream_tree
    const result = await query<StreamTreeNode>(`
      SELECT
        stream_id,
        code,
        name,
        parent_id,
        is_enabler,
        depth,
        path,
        path_codes,
        direct_unit_count,
        linked_child_units,
        order_in_parent
      FROM v_stream_tree
      ORDER BY path_codes, order_in_parent
    `);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to fetch stream tree:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream tree' },
      { status: 500 }
    );
  }
}