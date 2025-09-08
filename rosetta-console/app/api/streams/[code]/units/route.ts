import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface TruthRow {
  unit_id: number;
  unit_code: string;
  unit_name: string;
  stream_code: string;
  expected_role: string;
  expected_role_id: number | null;
  expected_org: string;
  expected_org_id: number | null;
  observed_role: string;
  observed_role_id: number | null;
  observed_org: string;
  observed_org_id: number | null;
  status: string;
  evidence_count: number;
  last_evidence_at: string | null;
}

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const streamCode = params.code.toUpperCase();
    
    // Use v_rosetta_truth view and join to get IDs
    const result = await query<TruthRow>(`
      SELECT 
        au.unit_id,
        vrt.unit_code,
        vrt.unit_name,
        vrt.stream_code,
        vrt.expected_role,
        ueo.accountable_role_id as expected_role_id,
        vrt.expected_org,
        ueo.accountable_org_unit_id as expected_org_id,
        vrt.observed_role,
        obs.accountable_role_id as observed_role_id,
        vrt.observed_org,
        obs.accountable_org_unit_id as observed_org_id,
        vrt.status,
        vrt.evidence_count,
        vrt.last_evidence_at
      FROM v_rosetta_truth vrt
      JOIN atomic_unit au ON au.code = vrt.unit_code
      LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id = au.unit_id
      LEFT JOIN LATERAL (
        SELECT accountable_role_id, accountable_org_unit_id 
        FROM unit_observed_ownership 
        WHERE unit_id = au.unit_id 
        ORDER BY observed_as_of DESC 
        LIMIT 1
      ) obs ON true
      WHERE vrt.stream_code = $1
      ORDER BY vrt.unit_code
    `, [streamCode]);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to fetch stream units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream units' },
      { status: 500 }
    );
  }
}