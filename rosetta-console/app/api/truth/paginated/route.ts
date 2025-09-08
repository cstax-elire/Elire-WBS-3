import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RosettaTruthRow, PaginatedResult } from '@/types/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const filterStream = searchParams.get('stream') || null;
    const filterStatus = searchParams.get('status') || null;
    
    // Validate parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    const offset = (page - 1) * pageSize;
    
    // Call the paginated function from 10-ui-helpers.sql
    const result = await query<RosettaTruthRow>(`
      SELECT * FROM get_rosetta_truth_page(
        $1::int,
        $2::int,
        $3::text,
        $4::text
      )`,
      [pageSize, offset, filterStream, filterStatus]
    );
    
    // Extract total count from first row (if exists)
    const totalCount = result.length > 0 ? (result[0].total_count || 0) : 0;
    const pageCount = Math.ceil(totalCount / pageSize);
    
    // Remove total_count from the data rows
    const data = result.map(row => {
      const { total_count, ...rest } = row;
      return rest;
    });
    
    const paginatedResult: PaginatedResult<RosettaTruthRow> = {
      data,
      totalCount,
      pageCount,
      currentPage: page,
      pageSize
    };
    
    return NextResponse.json(paginatedResult);
    
  } catch (error: any) {
    console.error('Failed to fetch paginated truth data, attempting fallback:', error);
    
    // Fallback to v_misattribution_delta (ui-fix.md Critical Bug #4)
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '50');
      const filterStream = searchParams.get('stream') || null;
      const filterStatus = searchParams.get('status') || null;
      const offset = (page - 1) * pageSize;
      
      const fallbackResult = await query<any>(`
        WITH filtered_data AS (
          SELECT
            au.unit_id,
            vmd.unit_code,
            vmd.unit_name,
            vmd.stream_code,
            vmd.expected_role,
            vmd.expected_org,
            vmd.observed_role,
            vmd.observed_org,
            vmd.attribution_status as status,
            vmd.evidence_count,
            vmd.last_evidence_at,
            COUNT(*) OVER() as total_count
          FROM v_misattribution_delta vmd
          JOIN atomic_unit au ON au.code = vmd.unit_code
          WHERE
            ($1::text IS NULL OR vmd.stream_code = $1)
            AND ($2::text IS NULL OR vmd.attribution_status = $2)
        )
        SELECT * FROM filtered_data
        ORDER BY stream_code, unit_code
        LIMIT $3 OFFSET $4
      `, [filterStream, filterStatus, pageSize, offset]);
      
      const totalCount = fallbackResult.length > 0 ? (fallbackResult[0].total_count || 0) : 0;
      const pageCount = Math.ceil(totalCount / pageSize);
      
      const data = fallbackResult.map(row => {
        const { total_count, ...rest } = row;
        return rest;
      });
      
      return NextResponse.json({
        data,
        totalCount,
        pageCount,
        currentPage: page,
        pageSize,
        usedFallback: true  // Indicate fallback was used
      });
      
    } catch (fallbackError: any) {
      console.error('Fallback also failed:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to fetch truth data from both primary and fallback sources' },
        { status: 500 }
      );
    }
  }
}