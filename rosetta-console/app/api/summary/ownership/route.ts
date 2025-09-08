import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { OwnershipSummary } from '@/types/database';

export async function GET() {
  try {
    const result = await query<OwnershipSummary>(`
      SELECT * FROM v_ownership_summary 
      ORDER BY stream
    `);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to fetch ownership summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ownership summary' },
      { status: 500 }
    );
  }
}