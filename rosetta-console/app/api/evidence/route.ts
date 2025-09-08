import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export interface EvidenceRow {
  evidence_id: number;
  unit_id: number;
  unit_code: string;
  unit_name: string;
  stream_code: string;
  stream_name: string;
  subject_ref: string;
  evidence_type: string;
  system_ref: string;
  occurred_at: string;
  notes: string;
  actor_person_id: number | null;
  actor_name: string | null;
  actor_role: string | null;
  actor_org: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const unitCode = searchParams.get('unit');
    const evidenceType = searchParams.get('type');
    const streamCode = searchParams.get('stream');
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // Build query using v_observed_from_evidence (ui-fix.md Section E)
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    if (unitCode) {
      whereConditions.push(`unit_code = $${paramIndex++}`);
      params.push(unitCode);
    }
    
    if (evidenceType) {
      whereConditions.push(`evidence_type = $${paramIndex++}`);
      params.push(evidenceType);
    }
    
    if (streamCode) {
      whereConditions.push(`stream_code = $${paramIndex++}`);
      params.push(streamCode);
    }
    
    if (dateFrom) {
      whereConditions.push(`occurred_at >= $${paramIndex++}`);
      params.push(dateFrom);
    }
    
    if (dateTo) {
      whereConditions.push(`occurred_at <= $${paramIndex++}`);
      params.push(dateTo);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    const result = await query<EvidenceRow>(`
      SELECT 
        evidence_id,
        unit_id,
        unit_code,
        unit_name,
        stream_code,
        stream_name,
        subject_ref,
        evidence_type,
        system_ref,
        occurred_at,
        notes,
        actor_person_id,
        actor_name,
        actor_role,
        actor_org
      FROM v_observed_from_evidence
      ${whereClause}
      ORDER BY occurred_at DESC
      LIMIT $${paramIndex}
    `, [...params, limit]);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Failed to fetch evidence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evidence data' },
      { status: 500 }
    );
  }
}