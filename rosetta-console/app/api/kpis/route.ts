import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export interface KPIRow {
  kpi_id: number;
  kpi_code: string;
  kpi_name: string;
  kpi_description: string;
  kpi_type: 'leading' | 'lagging';
  agg_type: 'SUM' | 'RATIO_OF_SUMS' | 'WEIGHTED_AVG';
  unit_of_measure: string;
  current_value: number | null;
  target_value: number | null;
  threshold_yellow: number | null;
  threshold_red: number | null;
  status: 'green' | 'yellow' | 'red' | 'unknown';
  last_measured: string | null;
  stream_code: string | null;
  unit_code: string | null;
}

export async function GET() {
  try {
    // Get KPI rollup data from v_kpi_rollup (ui-fix.md Section E)
    const result = await query<KPIRow>(`
      SELECT 
        kr.kpi_id,
        k.code as kpi_code,
        k.name as kpi_name,
        k.description as kpi_description,
        k.kpi_type,
        k.agg_type,
        k.unit_of_measure,
        kr.current_value,
        kr.target_value,
        kr.threshold_yellow,
        kr.threshold_red,
        CASE 
          WHEN kr.current_value IS NULL THEN 'unknown'
          WHEN kr.current_value >= kr.target_value THEN 'green'
          WHEN kr.current_value >= kr.threshold_yellow THEN 'yellow'
          WHEN kr.current_value >= kr.threshold_red THEN 'red'
          ELSE 'red'
        END as status,
        kr.last_measured,
        kr.stream_code,
        kr.unit_code
      FROM v_kpi_rollup kr
      JOIN kpi k ON k.kpi_id = kr.kpi_id
      ORDER BY k.kpi_type DESC, kr.stream_code, k.name
    `);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Failed to fetch KPI data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI data' },
      { status: 500 }
    );
  }
}

// POST endpoint to record KPI measurements
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kpi_id, unit_id, measured_value, notes } = body;
    
    // Validate required fields
    if (!kpi_id || measured_value === undefined) {
      return NextResponse.json(
        { error: 'kpi_id and measured_value are required' },
        { status: 400 }
      );
    }
    
    // Insert KPI measurement
    const result = await query(`
      INSERT INTO kpi_measurement (
        kpi_id, unit_id, measured_as_of, measured_value, notes
      ) VALUES ($1, $2, NOW(), $3, $4)
      RETURNING *
    `, [kpi_id, unit_id || null, measured_value, notes || null]);
    
    // Log evidence
    if (unit_id) {
      await query(`
        INSERT INTO evidence_log (
          unit_id, subject_ref, evidence_type, system_ref, occurred_at, notes
        ) VALUES ($1, $2, 'kpi_measurement', 'UI', NOW(), $3)
      `, [
        unit_id,
        `KPI_${kpi_id}_${Date.now()}`,
        `KPI ${kpi_id} measured: ${measured_value}`
      ]);
    }
    
    return NextResponse.json(result[0]);
    
  } catch (error: any) {
    console.error('Failed to record KPI measurement:', error);
    return NextResponse.json(
      { error: 'Failed to record measurement' },
      { status: 500 }
    );
  }
}