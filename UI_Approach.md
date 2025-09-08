# UI_Approach.md — Rosetta Console (Narrative‑first UI)

> **Goal:** A thin, stable UI that exposes **fiction vs reality** (Expected vs Observed ownership), shows **controllable drivers → outcomes**, and lets leaders **log proof** (evidence) — while decoupling from schema churn via **stable views & endpoints**.

This document is a single, implementation‑ready guide that specifies:
1) **Pages & components** (what each page shows and why),  
2) **Exact SQL queries** each page runs (with fallbacks if the optional `8-fixes.sql` is not yet applied),  
3) **API endpoints** (payloads, validation, SQL, and side‑effects),  
4) **Data contracts** (stable views the UI expects), and  
5) **Testing flows** to verify end‑to‑end behavior.

---

## 0) Architecture & principles

- **Narrative first:** Pages follow your story flow: **Org → Streams → Truth → Evidence → KPIs → Finance**. Database is an implementation detail behind stable **views**.
- **History is sacred:** **Do not upsert** observed ownership. **Append** new rows; the view picks the latest. (This preserves the **fiction vs reality over time** story.)
- **Evidence everywhere:** Any meaningful UI write (ownership change, KPI update) also writes an **evidence_log** row (immutable proof).
- **Stable contracts:** UI queries **views** only. If internals change, keep the view signatures stable.
- **Small, safe POSTs:** Endpoints are narrow, validated, and idempotent where appropriate (via uniqueness or ON CONFLICT for natural keys).

---

## 1) Pages, components & queries

### 1.1 **Org** — “Who we are” (people, dollars, margin)
**Route:** `/org`  
**Purpose:** Show the tree of **pillars → departments/COEs → practices**, with **headcount, direct revenue, direct COS, GM%**, and a toggle for **Allocated SG&A** to reveal true practice P&L.

**Primary query (tree):**
```sql
SELECT * FROM v_org_tree ORDER BY path_codes;
```
**Allocated SG&A toggle (finance panel):**
- **If `8-fixes.sql` applied:**  
  ```sql
  SELECT * FROM v_financial_rollup_with_sga ORDER BY org_unit, category;
  ```
- **Fallback (before `8-fixes.sql`):**  
  ```sql
  SELECT * FROM v_financial_rollup ORDER BY org_unit, category;
  ```

**Component:** `OrgTree` (props: `nodes`, `finance`)
- `nodes`: array of rows from `v_org_tree`  
  Fields used: `org_unit_id, code, name, parent_id, depth, direct_headcount, direct_revenue, direct_cos, direct_sga, direct_gross_margin, direct_gm_pct`
- `finance`: dictionary keyed by `org_unit` with category totals; recomputed panel when SG&A toggle is on.

---

### 1.2 **Streams** — “How we work” (value‑streams & units)
**Route:** `/streams`  
**Purpose:** Navigate **streams → units** and drill into a unit to see ownership, systems, KPIs, and recent evidence.

**Primary query (tree):**
```sql
SELECT * FROM v_stream_tree ORDER BY path_codes;
```

**Unit drawer (details):**
```sql
-- Enhanced Rosetta row for a unit
SELECT * 
FROM v_rosetta_stone_enhanced
WHERE unit_code = $1;
```
Also fetch recent evidence (if `8-fixes.sql` applied):
```sql
SELECT * 
FROM v_observed_from_evidence 
WHERE unit_code = $1
ORDER BY occurred_at DESC
LIMIT 25;
```

**Component:** `StreamTree` (props: `nodes`, `onSelectUnit(unitCode)`)

---

### 1.3 **Truth** — “Who actually owns the work?”
**Route:** `/truth`  
**Purpose:** One grid that shows **Expected** (role@org) vs **Observed** (role@org), **Status** (Aligned, Misattributed, Not Observed), plus **evidence counts** — and allows **setting Observed** safely.

**Primary query (preferred if `8-fixes.sql` applied):**
```sql
SELECT * FROM v_rosetta_truth ORDER BY stream_code, unit_code;
```

**Fallback query (before `8-fixes.sql`):** derive an equivalent view from current repo:
```sql
-- Approximate Truth using latest observed from v_misattribution_delta
SELECT
  stream        AS stream_code,
  unit_code,
  unit_name,
  expected_role AS expected_role,
  expected_org  AS expected_org,
  observed_role AS observed_role,
  observed_org  AS observed_org,
  attribution_status AS status
FROM v_misattribution_delta
ORDER BY stream, unit_code;
```

**Inline action:** Set Observed (opens dropdowns for **role** and **org**; no free‑text).  
On save → POST `/api/observed` (see §2.1).

**Component:** `TruthTable` (props: `rows`, `roles`, `orgs`)
- `rows`: from `v_rosetta_truth` (or fallback)  
- `roles`: `SELECT code, name FROM org_role ORDER BY name;`  
- `orgs`: `SELECT code, name FROM org_unit ORDER BY name;`

---

### 1.4 **Evidence** — “Chain of proof”
**Route:** `/evidence`  
**Purpose:** Read and add **evidence** rows linked to units/actors; filter by stream/unit/type/date.  
**Query (if `8-fixes.sql` applied):**
```sql
SELECT * FROM v_observed_from_evidence ORDER BY occurred_at DESC LIMIT 200;
```
**Fallback (before `8-fixes.sql`):**
```sql
SELECT 
  el.unit_id,
  au.code  AS unit_code,
  au.name  AS unit_name,
  el.evidence_type,
  el.system_ref,
  el.actor_person_id,
  el.actor_role_id,
  el.org_unit_id,
  el.occurred_at,
  el.notes
FROM evidence_log el
JOIN atomic_unit au ON au.unit_id = el.unit_id
ORDER BY occurred_at DESC
LIMIT 200;
```

**Add Evidence:** POST `/api/evidence` (see §2.2).

**Component:** `EvidenceTable` (props: `rows`, `onAdd`)

---

### 1.5 **KPIs** — “Drivers vs outcomes”
**Route:** `/kpis`  
**Purpose:** View all KPIs with **scope**, **target**, **latest value**, update a value, and see a small **trend**.  
**Query (catalog + latest):**
```sql
SELECT k.code, k.name, k.kind, k.scope, k.unit_of_measure, k.north_star,
       t.target_value, t.threshold_yellow, t.threshold_red,
       m.value_numeric, m.measured_at
FROM kpi k
LEFT JOIN kpi_target t ON t.kpi_id = k.kpi_id AND t.valid_to IS NULL
LEFT JOIN LATERAL (
  SELECT km.value_numeric, km.measured_at
  FROM kpi_measurement km
  WHERE km.kpi_id = k.kpi_id
  ORDER BY measured_at DESC
  LIMIT 1
) m ON TRUE
ORDER BY k.scope, k.code;
```
**Trend (last 12):**
```sql
SELECT value_numeric, measured_at
FROM kpi_measurement km
JOIN kpi k ON k.kpi_id = km.kpi_id
WHERE k.code = $1
ORDER BY measured_at DESC
LIMIT 12;
```

**Update:** POST `/api/kpi` (see §2.3).

**Component:** `KpiTable` (props: `rows`, `onUpdate`, `onFetchTrend(kpiCode)`)

---

### 1.6 **Finance** — “Follow the money”
**Route:** `/finance`  
**Purpose:** Compare **Direct** vs **Allocated** P&L by org unit; reconcile sources and targets to firm totals.

**Direct query:**
```sql
SELECT * FROM v_financial_rollup ORDER BY org_unit, category;
```
**Allocated query (if `8-fixes.sql` applied):**
```sql
SELECT * FROM v_financial_rollup_with_sga ORDER BY org_unit, category;
```

**Optional inline edits (advanced):**  
- People facts → POST `/api/personfact` (see §2.4)  
- Financial facts → POST `/api/financial` (see §2.5)

**Component:** `FinanceTable` (props: `direct`, `allocated`)

---

## 2) API endpoints (contracts, validation, SQL, side‑effects)

### 2.1 `POST /api/observed` — **Append an observed owner (role@org) for a unit**

**Why:** Preserve history. The “latest wins” in views; never overwrite past observations.

**Request JSON:**
```json
{
  "unitCode": "WIN-03",
  "roleCode": "DELIVERY_LEAD",
  "orgCode": "PILLAR_SERVICE_EXEC",
  "actorPerson": "Chris (Partner - COE Lead Cloud Enterprise)",  // optional convenience
  "actorRole": "PARTNER",                                       // optional convenience
  "notes": "Set via UI after intake interview"
}
```

**Validation:**
- `unitCode`, `roleCode`, `orgCode` must exist; else 400.
- Optional `actorPerson` and `actorRole` resolved to IDs if provided.

**SQL (append‑only)**
```sql
-- Insert new observed row (history preserved)
INSERT INTO unit_observed_ownership
  (unit_id, observed_as_of, accountable_role_id, accountable_org_unit_id, source, confidence_pct, notes)
SELECT u.unit_id, now(), r.role_id, o.org_unit_id, 'UI', 1.00, $5
FROM atomic_unit u, org_role r, org_unit o
WHERE u.code=$1 AND r.code=$2 AND o.code=$3;

-- Side‑effect: evidence log (idempotent on natural key)
INSERT INTO evidence_log (unit_id, subject_ref, evidence_type, system_ref, actor_person_id, actor_role_id, org_unit_id, notes)
SELECT u.unit_id, 'ownership_update', 'ownership_update', 'UI',
       ap.person_id, ar.role_id, o.org_unit_id,
       CONCAT('Observed owner set to ', $2, '@', $3)
FROM atomic_unit u
LEFT JOIN person ap ON ap.full_name = $4
LEFT JOIN org_role ar ON ar.code = $6
JOIN org_unit o ON o.code = $3
WHERE u.code=$1
ON CONFLICT (unit_id, subject_ref, evidence_type) DO NOTHING;
```
> **Note:** If you created a unique index `ux_evidence_natural(unit_id, subject_ref, evidence_type)`, the `ON CONFLICT` guard prevents duplicates on refresh.

**Response:** `200 OK`

---

### 2.2 `POST /api/evidence` — **Log an evidence row**

**Request JSON:**
```json
{
  "unitCode": "WIN-03",
  "subject": "Opp-456",
  "type": "pricing_decision",      // enum: pricing_decision | proposal_redline | recruit_req | kpi_measurement | ownership_update | change_order | ...
  "system": "PSA",                 // enum: CRM | PSA | FIN | HCM | DOC | UI
  "notes": "Discount approval logged by Delivery Leader",
  "actorPerson": "Richard (Partner & Delivery Leader)",
  "actorRole": "DELIVERY_LEAD",
  "actorOrg": "PILLAR_SERVICE_EXEC"
}
```

**Validation:** `unitCode`, `subject`, `type` required. Enforce enums for `type` and `system` on the UI.

**SQL (idempotent natural key):**
```sql
INSERT INTO evidence_log (unit_id, subject_ref, evidence_type, system_ref, actor_person_id, actor_role_id, org_unit_id, notes)
SELECT u.unit_id, $2, $3, $4, ap.person_id, ar.role_id, ao.org_unit_id, $5
FROM atomic_unit u
LEFT JOIN person ap ON ap.full_name = $6
LEFT JOIN org_role ar ON ar.code = $7
LEFT JOIN org_unit ao ON ao.code = $8
WHERE u.code = $1
ON CONFLICT (unit_id, subject_ref, evidence_type) DO NOTHING;
```
**Response:** `200 OK`

---

### 2.3 `POST /api/kpi` — **Add a KPI measurement** *(auto‑logs evidence)*

**Request JSON:**
```json
{ "code": "DISCOUNT_CYCLE", "value": 22 }
```

**SQL:**
```sql
-- 1) Insert measurement
INSERT INTO kpi_measurement (kpi_id, measured_at, value_numeric, source)
SELECT k.kpi_id, CURRENT_DATE, $2, 'UI'
FROM kpi k WHERE k.code=$1;

-- 2) Auto‑evidence
INSERT INTO evidence_log (unit_id, subject_ref, evidence_type, system_ref, notes)
SELECT uk.unit_id, $1, 'kpi_measurement', 'UI',
       CONCAT('KPI ', k.code, ' measured at ', $2)
FROM kpi k JOIN unit_kpi uk ON uk.kpi_id=k.kpi_id
WHERE k.code=$1
UNION ALL
SELECT NULL, $1, 'kpi_measurement', 'UI',
       CONCAT('Firm/stream KPI ', k.code, ' measured at ', $2)
FROM kpi k
WHERE k.code=$1
  AND NOT EXISTS (SELECT 1 FROM unit_kpi uk WHERE uk.kpi_id=k.kpi_id);
```
**Response:** `200 OK`

---

### 2.4 `POST /api/personfact` — **Edit per‑person facts (advanced)**

**Request JSON:**
```json
{ "personId": 123, "period": "2025", "type": "actual", "billable_hours": 160, "bill_rate": 175, "cost_rate": 110 }
```

**SQL:**
```sql
INSERT INTO person_fact (person_id, period, type, billable_hours, bill_rate, cost_rate)
VALUES ($1,$2,$3,$4,$5,$6)
ON CONFLICT (person_id, period, type) DO UPDATE
  SET billable_hours = EXCLUDED.billable_hours,
      bill_rate      = EXCLUDED.bill_rate,
      cost_rate      = EXCLUDED.cost_rate;
```
**Response:** `200 OK`

---

### 2.5 `POST /api/financial` — **Insert an org‑level financial fact (advanced)**

**Request JSON:**
```json
{ "orgCode": "SE_CLOUD_HCM", "accountCode": "5001", "period": "2025-08", "type": "actual", "amount": 12345.67 }
```

**SQL:**
```sql
INSERT INTO financial_fact (account_id, org_unit_id, period, type, amount)
VALUES (
  (SELECT account_id FROM financial_account WHERE code=$2),
  (SELECT org_unit_id FROM org_unit WHERE code=$1),
  $3, $4, $5
);
```
**Response:** `200 OK`

---

## 3) Stable view contracts (what the UI expects)

> Keep these view signatures stable. You can evolve internals as needed.

### `v_org_tree`
- **Fields:** `org_unit_id, code, name, parent_id, depth, path, path_codes, direct_headcount, direct_revenue, direct_cos, direct_sga, direct_gross_margin, direct_gm_pct`

### `v_stream_tree`
- **Fields:** `stream_id, code, name, parent_id, is_enabler, order_in_parent, depth, path, path_codes, direct_unit_count, linked_child_units`

### `v_rosetta_stone_enhanced`
- **Fields:** `unit_id, unit_code, unit_name, stream_code, stream_name, parent_stream_code, expected_org_code, expected_org_name, expected_role_code, expected_role_name, systems, kpis, has_children, has_parent`

### `v_misattribution_delta` *(fallback truth)*
- **Fields:** `stream, parent_stream, unit_code, unit_name, expected_role, expected_org, observed_role, observed_org, attribution_status, is_misattributed, observed_as_of, observation_source, confidence_pct`

### `v_rosetta_truth` *(preferred truth; from 8‑fixes)*
- **Fields:** `unit_code, unit_name, stream_code, expected_role, expected_org, observed_role, observed_org, status, evidence_count, last_evidence_at`

### `v_observed_from_evidence` *(evidence reader; from 8‑fixes)*
- **Fields:** `unit_id, unit_code, unit_name, evidence_type, system_ref, actor, actor_role, actor_org, occurred_at, notes`

### `v_financial_rollup` & `v_financial_rollup_with_sga`
- **Fields:** `org_unit, category, amount_2025`

---

## 4) Components (props & responsibilities)

- **`OrgTree`**  
  Props: `{ nodes, finance, onToggleAllocated }`  
  Renders a hierarchical tree with node cards. Shows direct metrics; finance panel merges `finance` rows to present Direct vs Allocated P&L.

- **`StreamTree`**  
  Props: `{ nodes, onSelectUnit }`  
  Shows stream hierarchy; selecting a node triggers unit drawer.

- **`TruthTable`**  
  Props: `{ rows, roles, orgs, onSetObserved }`  
  Grid with color status. Role/org inputs are dropdowns. Calls `/api/observed` on save and then refetches the grid (or recomputes status locally).

- **`EvidenceTable`**  
  Props: `{ rows, onAdd }`  
  Shows recent evidence. “Add Evidence” form enforces enums and captures actor (user) if available.

- **`KpiTable`**  
  Props: `{ rows, onUpdate, onFetchTrend }`  
  Catalog with latest, targets, and inline update. Optional trend sparkline (client‑side charting).

- **`FinanceTable`**  
  Props: `{ direct, allocated }`  
  Two tabs: “Direct” vs “Allocated”. Shows reconciliation banner (allocated totals net to firm totals).

---

## 5) Security & identity

- **Actor capture:** If you have auth, resolve current user → `person.person_id` and `org_role.role_id`. Pass into `/api/evidence` automatically. If not, the UI prompts for `actorPerson` & `actorRole` once per session.
- **Input guards:** All role/org inputs are dropdowns from dictionaries (no free‑text). Evidence `type` and `system` are enums in the UI to avoid typos.
- **Idempotency:** Evidence uses natural key `(unit_id, subject_ref, evidence_type)` with `ON CONFLICT DO NOTHING` to keep refresh safe.

---

## 6) Testing flows (15‑minute demo)

**Flow A — Misattribution signal**  
1. `/truth` → set `WIN-02` Observed to `PRACTICE_LEAD@PILLAR_SERVICE_EXEC`.  
2. Grid flips that row to **Misattributed**; an evidence row appears with type `ownership_update`.  
3. `/evidence` shows the new row; `/streams` unit drawer shows Observed owner.

**Flow B — KPI proof loop**  
1. `/kpis` → update `DISCOUNT_CYCLE` to `22`.  
2. Evidence row auto‑logs with type `kpi_measurement`.  
3. `/streams` → open `WIN` to see the driver improving; later correlate to stream outcomes.

**Flow C — Finance reconciliation**  
1. `/finance` → compare `v_financial_rollup` vs `v_financial_rollup_with_sga` (toggle).  
2. Show that practice P&Ls change but firm totals reconcile (source negative, targets positive).

---

## 7) Directory & file stubs (Next.js app router)

```
/app
  /org/page.tsx        -- queries v_org_tree; passes to <OrgTree/>
  /streams/page.tsx    -- queries v_stream_tree; passes to <StreamTree/>
  /truth/page.tsx      -- queries v_rosetta_truth (or fallback); passes to <TruthTable/>
  /evidence/page.tsx   -- queries v_observed_from_evidence; passes to <EvidenceTable/>
  /kpis/page.tsx       -- queries KPIs + latest; passes to <KpiTable/>
  /finance/page.tsx    -- queries financial rollups; passes to <FinanceTable/>

/app/api
  /observed/route.ts   -- §2.1
  /evidence/route.ts   -- §2.2
  /kpi/route.ts        -- §2.3
  /personfact/route.ts -- §2.4 (optional)
  /financial/route.ts  -- §2.5 (optional)

/components
  OrgTree.tsx | StreamTree.tsx | TruthTable.tsx | EvidenceTable.tsx | KpiTable.tsx | FinanceTable.tsx

/lib
  db.ts                   -- pg Pool wrapper
```

**DB connector (`lib/db.ts`):**
```ts
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try { const res = await client.query(sql, params); return res.rows; }
  finally { client.release(); }
}
```

---

## 8) Implementation notes & guardrails

- **Observed write policy:** Always **INSERT** new `unit_observed_ownership`. The UI never `UPDATE`s past rows. Views select **latest** per unit.
- **Truth status recompute:** After a save, refetch the grid from the truth view instead of hard‑setting status in the client.
- **SG&A toggle:** Treat `v_financial_rollup_with_sga` as read‑only. Allocation rows are created by the back‑end SQL job (see `8-fixes.sql`); do not attempt to generate allocations client‑side.
- **Enums on client:** Maintain a local list for `evidence_type` and `system_ref` to keep data clean.
- **Performance:** All queries are single‑view reads; index `evidence_log(unit_id, occurred_at desc)` to keep Evidence fast.

---

## 9) What changes if schema evolves?

- Keep view signatures stable (this file is your **contract**). Internals (tables, joins, allocation logic) can change anytime without breaking the UI.
- If `v_rosetta_truth` is unavailable, the UI uses `v_misattribution_delta` as the functional fallback.
- If SG&A allocation changes method (headcount → revenue share), the UI remains the same; only the allocated view’s internals update.

---

## 10) Appendix — Enums & dictionaries

**Evidence types (suggested):**  
`kpi_measurement`, `ownership_update`, `pricing_decision`, `proposal_redline`, `change_order`, `recruit_req`, `handoff_check`, `invoice_error`, `other`

**Systems:** `CRM`, `PSA`, `FIN`, `HCM`, `DOC`, `UI`

**Role & Org pickers:** Sourced from `org_role` and `org_unit`; display names, submit **codes**.

---

**End of UI_Approach.md**