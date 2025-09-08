# Rosetta Console (Next.js + Postgres)

A narrative-first UI that reveals **fiction vs reality** (Expected vs Observed ownership),
connects **controllable drivers → outcomes**, and ties those decisions to **evidence** and **dollars**.

## Quick start

1) `cp .env.example .env.local` and set `DATABASE_URL` to your Postgres.
2) Run the SQL build (1..7) and the optional **8-fixes.sql** for evidence + SG&A view.
3) `npm i` then `npm run dev`

## Pages

- `/org` — Org tree with direct metrics (headcount, revenue, COS, GM%).  
- `/streams` — Value stream tree; drill to /truth filtered by stream.  
- `/truth` — **Expected vs Observed** with status chips and inline **Set Observed** (dropdowns).  
- `/evidence` — Evidence log + add new proof (with actor/role/org capture).  
- `/kpis` — Catalog with targets, latest, and update (auto-evidence).  
- `/finance` — Direct vs **Allocated SG&A** (if `v_financial_rollup_with_sga` exists).

## Endpoints

- `POST /api/observed` — Append new observed owner; auto-logs evidence (append-only).  
- `POST /api/evidence` — Log proof for a unit/subject/type; idempotent by natural key if index exists.  
- `POST /api/kpi` — Add measurement; auto-logs evidence.  
- `GET /api/truth-row?unitCode=WIN-03` — Return a single truth row after edits.

## Design Notes

- Observed ownership is **insert-only**; the latest row wins in the view, preserving history.  
- Evidence is a **tiny, high-value** primitive that makes your case defensible.  
- The UI reads **views** (`v_org_tree`, `v_stream_tree`, `v_rosetta_truth` or `v_misattribution_delta`, `v_observed_from_evidence`, `v_financial_rollup(_with_sga)`) so internal schema can evolve safely.
