import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { personId, field, value } = await req.json();
  
  if (field === 'billable_hours' || field === 'bill_rate' || field === 'cost_rate') {
    await query(
      `INSERT INTO person_fact (person_id, period, type, ${field}) 
       VALUES ($1, '2025', 'budget', $2)
       ON CONFLICT (person_id, period, type) 
       DO UPDATE SET ${field} = $2`,
      [personId, value]
    );
  } else {
    await query(
      `UPDATE person SET ${field} = $1 WHERE person_id = $2`,
      [value, personId]
    );
  }
  return NextResponse.json({ success: true });
}