# DatabaseDesign.md — `elire_ops_1` (Updated)

**Purpose:** A single, durable “Rosetta Stone” that ties together **work**, **ownership**, **systems**, **KPIs**, and **money** so partners can see (1) who *should* own each decision vs who *does* today, (2) the controllable drivers that move outcomes, and (3) the financial footprint by practice — all from one source of truth.

---

## 0) Executive Summary — What changed since the previous design

1) **Added a new customer-facing stream: `EXPAND`** (land-and-expand motions) with three atomic units (`EXP-01..03`). Stream ordering adjusted so `COLLECT`, `TALENT`, `OPERATE` follow after EXPAND.  
*Why:* Makes cross‑sell/upsell and advocacy first-class work with explicit owners, systems, and KPIs.  [oai_citation:2‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

2) **Linked top‑level `WIN-*` units to fine‑grained SELL stages `WINA-*`** via a `unit_hierarchy_link` table (e.g., `WIN-03 Pricing` ↔ `WINA-06 Discount Decision`).  
*Why:* Lets us zoom between the 20-unit model and the SELL detail you run day‑to‑day without duplicating metrics.  [oai_citation:3‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

3) **Introduced `org_rate_card` (practice-aware rates)** alongside global `rate_card`.  
*Why:* Rate realism varies by practice; this avoids blunt averages and keeps margin math credible by unit and practice.  [oai_citation:4‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

4) **Fixed unrealistic capacity by adding external resources** (EACPs/Subs) to PeopleSoft and Treasury and **redistributed hours**.  
*Why:* Hours/person were impossible; this change makes utilization and revenue math believable immediately.  [oai_citation:5‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

5) **Reallocated 2025 Revenue and COS from pillar level to the practice level** based on billable revenue/cost contribution, and removed the pillar duplicates.  
*Why:* Puts accountability where decisions are made and enables practice P&L rollups.  [oai_citation:6‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

6) **Added hierarchy & insight views:** `v_org_tree`, `v_stream_tree`, `v_rosetta_stone_enhanced`, `v_misattribution_delta`, plus a `v_update_validation` checklist.  
*Why:* Out‑of‑the‑box navigation of org/stream hierarchies, ownership truth table, and a quick build sanity check.  [oai_citation:7‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

> Notes vs. the earlier design text: our original doc proposed optional tables like evidence logs and some example dashboards; those remain good *ideas* but are **not** in the current SQL. This update accurately reflects what’s implemented now and marks those as forward backlog (see §9).  [oai_citation:8‡DatabaseDesign.md](file-service://file-EQz3JyXMKnwYtxWVSnLGNx)

---

## 1) The model in one picture (3+2 streams → atomic units → outcomes)

- **Customer-facing streams:** `WIN`, `DELIVER`, `COLLECT`, and now **`EXPAND`**.  
- **Enablers:** `TALENT`, `OPERATE`.  
- **Atomic units** (the leaves where ownership must be unambiguous):
  - WIN (5), DELIVER (5), COLLECT (3), TALENT (4), OPERATE (3) — the original 20 — plus SELL detail `WINA-*` underneath `WIN` and the new `EXP-01..03`.  
- **Flow:** `TALENT` enables `WIN/DELIVER`; `OPERATE` enables all; `WIN → DELIVER → COLLECT`; `EXPAND` grows existing clients.  
*Why:* This is the minimal structure that exposes fiction vs. reality in ownership and makes drivers and outcomes measurable where the work actually happens.  [oai_citation:9‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

---

## 2) Entities & Keys (what exists and why)

### 2.1 Organization & People
- **`org_unit (org_unit_id, code, name, parent_id)`** — Pillars → Departments/COEs → Practices; forms the org tree. Unique `code`.  
  *Why:* Financials, people, and ownership roll up through this tree.  [oai_citation:10‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`org_role (role_id, code, name)`** — Canonical roles (Partner, Practice Lead, Sales Dir, etc.). Unique `code`.  [oai_citation:11‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`person (person_id, full_name, role_id, org_unit_id)`** — Named leaders + seeded staff; supports headcount and per‑person facts.  [oai_citation:12‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

### 2.2 Value Streams & Units of Work
- **`stream (stream_id, code, name, parent_id, is_enabler, order_in_parent)`** — Top streams (including **EXPAND**) and SELL child streams.  
  *Why:* The value stream is the primary “work spine”. SELL depth is where misattribution often happens.  [oai_citation:13‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`atomic_unit (unit_id, stream_id, code, name, description, order_in_stream)`** — The Rosetta “join row”.  
  *Why:* Every lens (owner, KPIs, systems, $) attaches here — the truth atom we pivot on.  [oai_citation:14‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`unit_hierarchy_link (parent_unit_id, child_unit_id)`** — Links coarse `WIN-*` to detailed `WINA-*`.  
  *Why:* Zoom between 20‑unit exec view and SELL operational view without duplicating metrics.  [oai_citation:15‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

### 2.3 Ownership (Expected vs. Observed)
- **`unit_expected_ownership (unit_id, accountable_role_id, accountable_org_unit_id, responsible_role_id, responsible_org_unit_id)`** — The official playbook.  
  *Why:* Encodes the **fiction** we’re testing; becomes the comparison baseline.  [oai_citation:16‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`unit_observed_ownership (obs_id, unit_id, observed_as_of, accountable_role_id, accountable_org_unit_id, source, confidence_pct, notes)`** — Append‑only reality.  
  *Why:* Captures who *actually* owns/does the work over time; fuels misattribution analytics.  [oai_citation:17‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

> **Heads‑up:** some expected rows reference roles like `COO`, `CFO`, `CONTROLLER`, `RESOURCE_MGR`. If those codes don’t exist in `org_role`, inserts will fall back to `NULL` (allowed); you can either (a) add these roles to `org_role` or (b) remap to current equivalents (e.g., `DELIVERY_LEAD`).  [oai_citation:18‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

### 2.4 Systems of Record
- **`system_of_record (sor_id, code, name)`** — CRM, PSA, FIN, HCM, DOC/CLM.  
- **`unit_system (unit_id, sor_id)`** — Where evidence for each unit should live (e.g., WIN→CRM, DELIVER→PSA, COLLECT/OPERATE→FIN, TALENT→HCM; proposal/contract → DOC).  
  *Why:* Ties work to the right system so it is auditable/AI‑learnable.  [oai_citation:19‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

### 2.5 KPIs & Measurements
- **Enums:** `kpi_kind` (`leading|lagging`), `kpi_scope` (`unit|stream|firm`).  
- **`kpi (kpi_id, code, name, kind, scope, unit_of_measure, north_star)`** — Full dictionary (legacy + operational).  
- **`unit_kpi (unit_id, kpi_id)`** — Which drivers/outcomes a unit controls or contributes to.  
- **`kpi_target (kpi_target_id, kpi_id, scope, [unit_id|stream_id], valid_from, valid_to, target_value, threshold_yellow, threshold_red)`** — Targets by scope/time.  
- **`kpi_measurement (measure_id, kpi_id, [unit_id|stream_id], measured_at, value_numeric, source)`** — Facts (monthly snapshots recommended).  
  *Why:* Clean separation of **controllable drivers** (unit) vs **ends** (stream/firm), with explicit targets and time bounds.  [oai_citation:20‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

### 2.6 Financials, Rates & People Facts
- **`financial_account (account_id, code, name, category)`** — 2025 budget chart (Revenue, COS, SGA).  [oai_citation:21‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`financial_fact (fact_id, account_id, org_unit_id, period, type, amount)`** — Budget/actuals by org unit.  
  *Why:* Practice‑level P&L rollups become possible (see §4.3).  [oai_citation:22‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`rate_card (role_id, bill_rate, cost_rate)`** — Global fallback by role.  
- **`org_rate_card (org_rate_id, org_unit_id, role_id, bill_rate, cost_rate)`** — **Practice‑specific** rates (e.g., Kyriba vs PMO vs Cloud HCM).  
  *Why:* Margin truth depends on practice‑specific rates; org‑aware rates trump role‑only defaults.  [oai_citation:23‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`person_fact (fact_id, person_id, period, type, billable_hours, cost_amount, bill_rate, cost_rate)`** — Per‑person hours/rates (budget now; actuals later).  
  *Why:* Enables both utilization math and revenue attribution by practice.  [oai_citation:24‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

---

## 3) Seeds & Allocation Logic (how the starter data was shaped)

### 3.1 Org & People
- Pillars, departments/COEs, and practices are seeded to reflect the real structure; named leaders are attached; anonymous staff fill in true counts (e.g., Sales team size, Cloud HCM/ERP staffing).  
*Why:* Lets headcount and cost rollups work immediately.  [oai_citation:25‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

### 3.2 Atomic Units & Ownership
- Top 20 `WIN/DELIVER/COLLECT/TALENT/OPERATE` units are created with descriptions and order; SELL detail `WINA-*` lives under dedicated child streams; expected ownership rows are seeded across WIN and SELL detail.  
*Why:* Establishes the ownership “fiction” to test against observed entries.  [oai_citation:26‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

### 3.3 KPIs & Targets
- Legacy KPIs (SPI-derived), operational drivers (leading), and outcomes (lagging) are loaded; sample targets are set at unit, stream, and firm scope (e.g., WIN rate 40%, Realization 95%, DSO 45d).  
*Why:* Gives you dials to manage now and outcomes to judge leadership by, later.  [oai_citation:27‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

### 3.4 Financials & Rates
- 2025 budget account lines (Revenue, COS, SGA) are loaded; **practice‑specific** rates added via `org_rate_card`; **external capacity** rows (EACPs/Subs) added for PeopleSoft/Treasury to normalize hours/person.  
- **Revenue & COS reallocation:** billable revenue and cost are computed from `person_fact` × rate, used to **allocate pillar totals down to practices**, and then the **pillar‑level Revenue/COS entries are removed** to avoid double counting.  
*Why:* Puts dollars where accountability lives and yields credible practice P&Ls out of the gate.  [oai_citation:28‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

---

## 4) Views (how you navigate, prove truth, and sanity‑check)

- **`v_rosetta_stone`** — For each atomic unit: stream, expected owner (role+org), systems, linked KPIs.  
  *Use:* The simple one‑pager for partner sessions.  [oai_citation:29‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`v_rosetta_stone_enhanced`** — Adds parent stream names, has_parent/has_children flags (from `unit_hierarchy_link`), and aggregates systems/KPIs.  
  *Use:* Zoom WIN↔SELL and confirm hierarchy wiring.  [oai_citation:30‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`v_misattribution_delta`** — Compares **expected** vs **latest observed** owners and flags `Aligned / Role Mismatch / Org Mismatch / Not Observed`, with source and confidence.  
  *Use:* “Where the fiction lives” — prioritize fixes.  [oai_citation:31‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`v_stream_rollup`** — Latest **lagging** outcomes by stream (from `kpi_measurement`).  
  *Use:* Board‑level outcomes.  [oai_citation:32‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`v_kpi_rollup`** — Mapping from outcomes to their driver KPIs by stream.  
  *Use:* Connects controllables to ends.  [oai_citation:33‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`v_org_rollup`** — Org node + headcount + 2025 budget rollup + parent hint.  
  *Use:* Practice/COE budget sanity and staffing visibility.  [oai_citation:34‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`v_financial_rollup`** — Totals by category (Revenue/COS/SGA) per org unit.  
  *Use:* Fast practice P&L lens without pivoting.  [oai_citation:35‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`v_org_tree` & `v_stream_tree`** — Recursive trees with depth, path, and useful counts (unit counts, linked children, direct revenue/COS/SGA; GM%).  
  *Use:* UI navigation + quick GM % at each node.  [oai_citation:36‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **`v_update_validation`** — Post‑build checks (WIN→SELL link count, EXPAND units, org‑specific rate count, EACP/Sub adds, number of practices with revenue, max hours/person).  
  *Use:* One query smoke test after a fresh build.  [oai_citation:37‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

---

## 5) Operating Mechanics — how to use the data in practice

1) **Record reality:** As you interview teams or scrape systems, append `unit_observed_ownership` rows (with `source` and `confidence_pct`). `v_misattribution_delta` will light up the gaps.  
*Outcome:* You can show “who actually makes pricing calls,” “who really manages scope,” etc., with dates and confidence.  [oai_citation:38‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

2) **Load KPI facts monthly:** Push outcomes (WIN rate, avg sold margin, realization, on‑time, utilization, DSO, EBITDA, attrition) into `kpi_measurement`.  
*Outcome:* `v_stream_rollup` and dashboards stop being theoretical and start showing trendlines.  [oai_citation:39‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

3) **Tune targets:** Use `kpi_target` per scope and seasonality; e.g., different `TIME_TO_FILL` targets by practice.  
*Outcome:* Unit owners are judged against realistic, time‑bounded targets.  [oai_citation:40‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

4) **Move dollars to practices:** Keep using practice‑aware rates and maintain financial facts by org unit (`financial_fact`) so practice GM% is visible in `v_org_tree`/`v_financial_rollup`.  
*Outcome:* Accountability sticks at the level where decisions are made.  [oai_citation:41‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

---

## 6) Data Governance & Conventions

- **Codes are canonical** (`WIN-03`, `WINA-06`, `SE_CLOUD_HCM`). Use them as join keys in downstream tools.  
- **Enumerations** enforce intent (`kpi_kind`, `kpi_scope`).  
- **Expected vs. observed**: `unit_expected_ownership` defines the RACI fiction; `unit_observed_ownership` is append‑only truth, last‑write wins in views.  
- **Systems mapping** is declarative: it doesn’t enforce workflow; it enforces the *evidence location*.  
- **Rates precedence:** `org_rate_card` (if present) overrides `rate_card`.  
- **Budget vs. Actuals:** `financial_fact.type` and `person_fact.type`. Start with `budget`; add `actual` monthly for real comparisons.  [oai_citation:42‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

---

## 7) Build & Runbook

**Load order (idempotent-friendly):**
1. `1-tables_and_types.sql` — schema and enums.  
2. `2-seed.sql` — org tree, roles, people.  
3. `3-value_streams_systems_attribution.sql` — streams, units, ownership, systems.  
4. `4-kpis_and_targets.sql` — KPIs, targets, unit↔KPI mapping.  
5. `5-Financials_rates.sql` — accounts, 2025 budget seeds, rate cards, per‑person facts.  
6. `6-rosetta_stone.sql` — core analytic views.  
7. `7-updates.sql` — production fixes and hierarchy/economic realism.  
8. `SELECT * FROM v_update_validation;` — quick health check.  
*All scripts and the validation view are in the repo bundle.*  [oai_citation:43‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

---

## 8) Known Gaps & Practical Fixes

- **Role codes in expected ownership:** If `COO`, `CFO`, `CONTROLLER`, `RESOURCE_MGR` aren’t present, add them to `org_role` or map them to current titles (`DELIVERY_LEAD`, Accounting leadership).  
- **Per‑person cost amounts:** Currently left `NULL` on budget seeds (we compute COS via rates). Load actual cost amounts once ERP integration is ready.  
- **KPI math consistency:** If you want to define stream‑level aggregations from unit drivers, add a small definition table (see backlog below).  [oai_citation:44‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

---

## 9) Backlog (from prior design that isn’t in SQL yet — recommended next)

These were proposed previously and remain valuable; they’re not yet implemented in the SQL, so treat them as near‑term backlog:

1) **Light evidence logs** (3 small tables):
   - `pricing_exception` (WIN‑03): who requested/approved, cycle hours, sold margin.  
   - `change_order_event` (DEL‑04): delta vs billed, who raised/approved.  
   - `recruiting_req` (TAL‑01): opened/filled, openers/fulfillers.  
   *Why:* Tiny data with outsized power to correlate misattribution → leakage → EBITDA.  [oai_citation:45‡DatabaseDesign.md](file-service://file-EQz3JyXMKnwYtxWVSnLGNx)

2) **KPI rollup definition** (optional): a table that documents how stream outcomes are derived from unit drivers (avg, weighted avg, sum).  
   *Why:* Makes rollup math explicit and changeable without rewriting views.  [oai_citation:46‡DatabaseDesign.md](file-service://file-EQz3JyXMKnwYtxWVSnLGNx)

3) **Hotspot dashboards** as views (`v_misattribution_hotspots`, `v_outcomes_dashboard`, `v_stream_health`) if you want pre‑canned summaries beyond the current views.  
   *Why:* Meeting‑ready summaries for partners/board.  [oai_citation:47‡DatabaseDesign.md](file-service://file-EQz3JyXMKnwYtxWVSnLGNx)

---

## 10) Why this design fits our operating standard

- **Business outcomes first:** Practice‑level P&L and stream outcomes are visible; ownership clarity reduces heroics.  
- **Delivered capabilities always:** All joins (owner, system, KPI, $) sit on the atomic unit so views and UI can pivot instantly.  
- **Fact‑anchored:** Seeds reflect the actual org, units, KPIs, accounts, rates, and production fixes in code — not slides.  [oai_citation:48‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)

---

### Appendix A — Quick Reference (Objects)

- **Core tables:** `org_unit`, `org_role`, `person`, `stream`, `atomic_unit`, `unit_hierarchy_link`, `unit_expected_ownership`, `unit_observed_ownership`, `system_of_record`, `unit_system`, `kpi`, `unit_kpi`, `kpi_target`, `kpi_measurement`, `financial_account`, `financial_fact`, `rate_card`, `org_rate_card`, `person_fact`.  [oai_citation:49‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)
- **Core views:** `v_rosetta_stone`, `v_rosetta_stone_enhanced`, `v_misattribution_delta`, `v_stream_rollup`, `v_kpi_rollup`, `v_org_rollup`, `v_financial_rollup`, `v_org_tree`, `v_stream_tree`, `v_update_validation`.  [oai_citation:50‡repomix-output.txt](file-service://file-57UgWP4FZVAErrZv544sT8)