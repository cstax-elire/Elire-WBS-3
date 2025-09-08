import { NextResponse } from 'next/server';
import { withTransaction, validateForeignKey } from '@/lib/db';
import { ObservedOwnershipRequest } from '@/types/database';
import { z } from 'zod';

// Schema validation for request body (ui-fix.md Section B - added actor and idempotency)
const observedOwnershipSchema = z.object({
  unit_id: z.number(),
  accountable_role_id: z.number().nullable().optional(),
  accountable_org_unit_id: z.number().nullable().optional(),
  source: z.string().optional().default('UI'),
  confidence_pct: z.number().min(0).max(1).optional().default(1.0),
  notes: z.string().optional(),
  actor_person_id: z.number().optional(),  // Actor capture
  idempotency_key: z.string().optional()   // Idempotency support
});

// Enhanced API implementation from v4 spec lines 493-605
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = observedOwnershipSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Use transaction for atomicity
    const result = await withTransaction(async (client) => {
      // 1. Validate unit exists
      const unitExists = await validateForeignKey(
        'atomic_unit',
        'unit_id',
        data.unit_id,
        client
      );
      
      if (!unitExists) {
        throw new Error(`Invalid unit_id: ${data.unit_id}`);
      }

      // 2. Validate role if provided
      if (data.accountable_role_id) {
        const roleExists = await validateForeignKey(
          'org_role',
          'role_id',
          data.accountable_role_id,
          client
        );
        
        if (!roleExists) {
          throw new Error(`Invalid role_id: ${data.accountable_role_id}`);
        }
      }

      // 3. Validate org if provided
      if (data.accountable_org_unit_id) {
        const orgExists = await validateForeignKey(
          'org_unit',
          'org_unit_id',
          data.accountable_org_unit_id,
          client
        );
        
        if (!orgExists) {
          throw new Error(`Invalid org_unit_id: ${data.accountable_org_unit_id}`);
        }
      }

      // 4. Insert ownership (append-only)
      const insertResult = await client.query(
        `INSERT INTO unit_observed_ownership 
         (unit_id, observed_as_of, accountable_role_id, 
          accountable_org_unit_id, source, confidence_pct, notes)
         VALUES ($1, NOW(), $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          data.unit_id,
          data.accountable_role_id || null,
          data.accountable_org_unit_id || null,
          data.source,
          data.confidence_pct,
          data.notes || null
        ]
      );

      // 5. Log evidence with actor and idempotency (ui-fix.md Section B)
      const subjectRef = data.idempotency_key || `OBS_${insertResult.rows[0].obs_id}`;
      
      // Check for existing evidence with same idempotency key
      if (data.idempotency_key) {
        const existingEvidence = await client.query(
          `SELECT 1 FROM evidence_log WHERE subject_ref = $1 LIMIT 1`,
          [subjectRef]
        );
        
        if (existingEvidence.rowCount === 0) {
          // Only insert if no existing evidence with this key
          await client.query(
            `INSERT INTO evidence_log 
             (unit_id, subject_ref, evidence_type, system_ref, occurred_at, notes, actor_person_id)
             VALUES ($1, $2, $3, $4, NOW(), $5, $6)
             ON CONFLICT (unit_id, subject_ref, evidence_type) DO NOTHING`,
            [
              data.unit_id,
              subjectRef,
              'ownership_update',
              'UI',
              `Ownership updated via API: ${data.notes || 'No notes'}`,
              data.actor_person_id || 1  // Default to person_id 1 for single-user mode
            ]
          );
        }
      } else {
        // No idempotency key - always insert
        await client.query(
          `INSERT INTO evidence_log 
           (unit_id, subject_ref, evidence_type, system_ref, occurred_at, notes, actor_person_id)
           VALUES ($1, $2, $3, $4, NOW(), $5, $6)`,
          [
            data.unit_id,
            subjectRef,
            'ownership_update',
            'UI',
            `Ownership updated via API: ${data.notes || 'No notes'}`,
            data.actor_person_id || 1  // Default to person_id 1 for single-user mode
          ]
        );
      }

      return insertResult.rows[0];
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Failed to update observed ownership:', error);
    
    // Handle specific database errors
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Foreign key constraint violation', detail: error.detail },
        { status: 400 }
      );
    }
    
    if (error.code === '23502') {
      return NextResponse.json(
        { error: 'Required field missing', detail: error.detail },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update ownership' },
      { status: 500 }
    );
  }
}

// GET endpoint removed - violates view contract (ui-fix.md Critical Bug #3)
// Use v_rosetta_truth or /api/streams/[code]/units for reading ownership data