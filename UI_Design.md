## UI Design Overview

**Structure (Next.js App Router + Tailwind + PG + Zod)**

- **Pages:** `/org`, `/streams`, `/truth`, `/evidence`, `/kpis`, `/finance`
- **Endoints:** `POST /api/observed`, `POST /api/evidence`, `POST /api/kpi`, `GET /api/truth-row`
- **Components:** `TruthTable`, `EvidenceTable`, `KpiTable`, `OrgTree`, `StreamTree`, plus small UI primitives (Button, Select, StatusChip, SectionHeader)
- **DB Helpers:** `lib/db.ts` with a **fallback query** helper (tries `v_rosetta_truth`; if missing, falls back to `v_misattribution_delta`)

**Design choices aligned to your intent**

- **Narrative-first routing:** Org and Streams pages are “context,” Truth and Evidence are the **reality check**, KPIs shows **drivers vs outcomes**, Finance shows **dollars**. This sequencing mirrors your AI Lens → atomic-unit → ownership → evidence → outcomes → budget flow. 
- **History-preserving Observed:** The `POST /api/observed` route uses **append-only insert** (no upsert on `unit_id`) so you keep an auditable timeline of who owned what when (aligns with your “don’t lose history” requirement). Evidence auto-logs for every observed change. 
- **Stable contracts via views:** UI reads **`v_org_tree`**, **`v_stream_tree`**, **`v_rosetta_truth`** (or `v_misattribution_delta` fallback), **`v_observed_from_evidence`**, and **`v_financial_rollup`**. If you install the optional **8-fixes** view or a new **SG&A allocated** view, the Finance page will automatically use it. This means you can **evolve tables** without breaking the UI. 
- **Evidence-first operating model:** The Evidence page and auto-evidence hooks turn the **Rosetta narrative** into defensible facts quickly (pricing decisions, ownership changes, recruiting reqs, etc.). 

------

## What each page does (and why)

### 1) **/org** — Org tree, with direct metrics

- Pulls `v_org_tree` and renders a clean, nested tree: **HC, Revenue, COS, GM%** at each node (Pillar → COE/Dept → Practice). It keeps **direct** metrics on this page so leaders see “their” numbers where they sit. SG&A reallocation is handled on Finance. 

### 2) **/streams** — Value-stream tree

- Pulls `v_stream_tree` so you can traverse **WIN/DELIVER/COLLECT + TALENT/OPERATE** (plus SELL detail if you’ve linked WINA-*). CTA takes you to **/truth** filtered for the selected stream. This matches your 3+2 spine and atomic unit design. 

### 3) **/truth** — “Rosetta Truth” (Expected vs Observed)

- Tries **`v_rosetta_truth`** (from your 8-fixes idea) and falls back to **`v_misattribution_delta`**.
- **Status chips**: Aligned / Misattributed / Not Observed / Role Mismatch / Org Mismatch.
- **Set Observed** forms with role/org dropdowns, then **refreshes a single row** via `GET /api/truth-row` (fast, no full page reload).
- Aligns to your misattribution story across **Sales vs Delivery vs Talent**. 

### 4) **/evidence** — The proof

- Renders `v_observed_from_evidence` (unit, type, actor, org, when, notes).
- “Add Evidence” supports **unit** + **subject** + **type** + **notes** with optional actor role/org; stores to `evidence_log`. This de-risks “it’s my opinion” debates and matches your “tiny high-value logs” approach. 

### 5) **/kpis** — Causing ends (drivers) vs judging by ends (outcomes)

- Lists the KPI dictionary (from Analysis + operational drivers) with **latest** value and **targets** (from `kpi_target`).
- Inline **update** inserts into `kpi_measurement` and auto-logs evidence; this keeps leaders honest and turns KPI changes into traceable facts. 

### 6) **/finance** — Direct vs Allocated

- Shows `v_financial_rollup` (direct) and tries an **allocated** view (`v_financial_rollup_with_sga`) if you implement SG&A spreads (per the Section C/D/E ideas and allocations you’re experimenting with). You can keep the UI steady while you iterate allocation logic in SQL. 

------

## Key back-end behaviors

- **`POST /api/observed` (append-only):** writes to `unit_observed_ownership` (no upsert), then **auto-inserts evidence** for that ownership change. This preserves **history**, letting you show change over time and source-of-truth drift. 
- **`POST /api/evidence`:** adds evidence with optional actor role/org binding; idempotent if you later add a natural-key unique index (`unit_id, subject_ref, evidence_type`). 
- **`POST /api/kpi`:** records KPI measurement and **auto-logs evidence** (unit-scoped if KPI is attached to units; otherwise stream/firm-scoped). 
- **`GET /api/truth-row?unitCode=...`:** returns a single refreshed truth row (fast row-level requery) using the **same view fallback** logic as the page.

------

## Why this will look/feel good to execs

- **Crisp information density** (no noise; just the levers): status chips, clean tables, simple forms.
- **Narrative → proof → outcomes → dollars** in 6 clicks: executives can **see the fiction** (truth table), **add proof**(evidence), **watch the drivers** (KPIs), and **see dollars** (finance).
- **Safe-to-evolve**: UI relies on **views**; you can **refactor tables** (and even scrap parts of the current database) without breaking the console. 

------

## How this ties to your current artifacts

- **Analysis.md** (hierarchies, current KPIs) → pages and KPI catalog, plus the “drivers vs outcomes” split. 
- **Elire.md** (org tree, leaders, practice structures, budget lines, hours/rates) → the Org tree rollups and practice-level context. 
- **AI Lens** (misattribution narrative) → Truth Table + Evidence flow; the exact pain points (pricing/solutioning, scope control, recruiting) have **first-class unit coverage** and event types. 
- **Repomix (DB)** → uses the views already provided (`v_org_tree`, `v_stream_tree`, `v_financial_rollup`, `v_rosetta_stone_enhanced`, `v_misattribution_delta`). If you adopt the 8th SQL, the UI will **automatically**take advantage of `v_rosetta_truth` and enhanced evidence. 

------

## Run it

1. `cp .env.example .env.local` and set `DATABASE_URL`
2. `npm i` → `npm run dev` → open the pages in the navbar

------

## Notes and small polish roadmap

- **Row-level toasts**: I kept feedback minimal (fast refresh). If you want to add toasts, we can layer a tiny client hook—no heavy UI library needed.
- **Stream → Unit Drawer:** The Streams page already links to Truth; we can add a right-side drawer showing **systems** + **KPIs** for a selected unit by using `v_rosetta_stone_enhanced`. 
- **Finance SG&A Allocation:** If you keep the `sga_allocation` idea, expose it via a new `v_financial_rollup_with_sga` view; the Finance page will switch tabs cleanly (already coded).
- **Org/Truth overlays:** To quantify misattribution per org node, we can augment `v_rosetta_truth` with expected_org and a small group-by.