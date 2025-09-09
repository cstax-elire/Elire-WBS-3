# Original Design Decisions — `elire_ops_1`

**Note**: This document preserves the original design rationale from the initial database build. 
For current implementation details, see `database-design.md` and `table-reference.md`.

*Original companion to the SQL build+seed that explains assumptions, mappings, allocations, and how to evolve the dataset as you replace placeholders with actuals.*

------

## 0) Purpose & framing

This database implements your “**Rosetta Stone**” vision: each **atomic unit** is a join row that connects **Value Streams**, **Org/Pillars/COEs/Practices/People**, **KPIs** (leading vs. lagging), **Systems of Record**, and **Financials** so you can pivot the same truth through different hierarchies and see **ownership, accountability, and outcomes** in one place. This is anchored to your real Elire organization (*Elire.md*), your current KPI set (*Analysis.md*), and your modeling of SELL sub-stages and RACI patterns (*Modeling Ideas.md*).

------

## 1) Hierarchy model decisions

### 1.1 Value Stream tree

- **Streams (L1)**: `WIN`, `DELIVER`, `COLLECT`, `TALENT`, `OPERATE` (Customer-facing; Enablers). This is the primary spine for the Rosetta Stone. It matches the 3+2 model we agreed and your enumerated 20 atomic units.
- **SELL detail**: Additional **child streams** under `WIN`—`WIN_LEAD`, `WIN_REGISTER`, `WIN_TRIAGE`, `WIN_QUALIFY`, `WIN_OUTLINE`, `WIN_PRICE`, `WIN_PROPOSAL`, `WIN_NEGOTIATE`, `WIN_HANDOFF`—let you toggle coarse (20 units) vs. fine (SELL phases). Atomic units in these match your Modeling Ideas doc (Targeting, Deal Registration, Triage, Qualification, Solution Outline, Pricing, Proposal, Negotiation, Handoff).

**Why**: The value stream is the canonical “flow of work” lens. SELL is the most misattributed area (COEs doing sales work), so a deeper layer ensures you can demonstrate where ownership and cycle time are lost.

### 1.2 Org tree (truth in the tree)

- **Pillars (L1)**: `Leadership`, `Client Relationships`, `Service Execution`, `Talent`, `Finance & Operations`.
- **Departments (L2)**: under Client Relationships: `Sales`, `Marketing`, `Proposal Mgmt/Contracts`; under Finance & Ops: `Accounting`, `IT`; under Talent: `HR`, `Recruiting`; under Service Execution: **COEs** (MAS, EPM, Cloud Enterprise, Solution Center, On Premise, Treasury).
- **Practices (L3)**: e.g., MAS→`PMO` + `SAS`; EPM→`Planning & Analytics` + `Close & Consolidations`; Cloud Enterprise→`Cloud HCM`, `Cloud ERP`, `Cloud Technology`; Solution Center→`Managed Services`; On Premise→`PeopleSoft Practice`; Treasury→`Kyriba SaaS Treasury`, `PeopleSoft Treasury`.
- **People (L4)**: every **named leader** (Friend, Maske, Landon, Surma, Tavia, Richard, Chris, John, Jason, Arjun, Brian, Jeff, Ryan, Ed, Alex, Scott, Carlos, Abdel, Al, Edmund, Stephen, Maddie, Tim, Jake) seeded and attached to their real unit/role. Anonymous rows created where counts were given (e.g., **Sales team 11** → 2 named + 9 anonymous; **Cloud HCM 14** → 1 named + 13 anonymous) so headcount, costs, and hours roll up.

**Why**: You said “the app must show the truth.” Accountability must be visible at **department/practice level** where it currently isn’t explicitly defined; the tree structure allows rollups role→department→practice→COE→pillar→CEO.

------

## 2) Rosetta Stone join row

Each **atomic unit** (e.g., “WIN-03 Pricing & Margin Decision”) carries:

- **Stream** (e.g., `WIN`) and optional **SELL sub-stream**.
- **Expected Owner** (both a **role** and an **org unit**) — e.g., Sales Director at Client Relationships/Sales. (*Observed owner intentionally left blank for your UI*).
- **Systems**: where evidence should live — e.g., `CRM` (`WIN`), `PSA` (`DELIVER`), `FIN` (`COLLECT`, `OPERATE`), `HCM` (`TALENT`), `DOC`(`WIN-04`, `WIN-05`).
- **KPIs**: leading (controllables) and lagging (outcomes) linked at the unit (leading) or stream (lagging) level.
- **Financial link**: via org unit to budget accounts and per-person facts.

**Why**: This is the pivot that lets you view the same reality by **Value Stream** or by **Org tree** or by **Financial** or **KPI** and see the **same unit** telling the same story, just from a different angle.

------

## 3) Expected vs observed ownership

- **Expected** is pre-seeded from org/role responsibilities (Sales owns Qualification, Proposal owns Proposal, Legal owns Contract, PM/Delivery own Scope/Change, etc.).
- **Observed** (misattribution) is **blank** so your UI can capture reality — e.g., **COEs** actually doing Discovery, Pricing, and Proposal; **Sales** negotiating Scope mid-delivery; **Talent** work unowned. This matches your AI Lens (“Delivery makes the call”, “COEs write it”, “AEs renegotiate scope mid-delivery”, “Recruiting ad hoc”).

**Why**: You asked to do misattribution entry yourself to drive UI adoption and make deltas obvious (fiction vs truth).

------

## 4) KPI set & targets

### 4.1 “Current KPIs” (as-is)

- The full list you track today (SPI-derived) is seeded for **transparency**: pipeline coverage, SOW closed, RFP win rate, utilization, attrition, invoice rework, etc.
- Many are **lagging** and some are **perception-based** (SPI leadership index). We store them to reflect your **current state**—and so you can later compare against **operational drivers**.

### 4.2 “Operational KPIs” (the drivers+outcomes you’ll manage)

- **Leading** (unit-level, controllable):
  - `LEAD_RESP_TIME`, `QUAL_COMPLETE`, `OUTLINE_VALID`, `DISCOUNT_CYCLE`, `PROPOSAL_REUSE`, `HANDOFF_COMPLETE`, `TIME_TO_STAFF`, `SCOPE_CAPTURE`, `INVOICE_ERR`, `TIME_TO_FILL`, `CERTS_PER_FTE`, `PLAN_ACCURACY_90D`.
- **Lagging** (stream/firm outcomes):
  - `WIN_RATE`, `AVG_SOLD_MARGIN`, `REALIZATION`, `ON_TIME`, `UTILIZATION`, `DSO`, `EBITDA`, `ATTRITION`.

**Targets** seeded from SPI/market norms and your budget posture (*e.g.*, Utilization 75% target, Realization 95%, On-time 90%, DSO 45 days, Win-rate 40%). You can tune these targets in-app.

------

## 5) Financial model (2025 budget)

### 5.1 Accounts

- All accounts in your 2025 budget (revenue, COS, SG&A, etc.) are loaded with **codes 4000–8900** and **amounts**exactly as you published, classified into `Revenue`, `COS`, `SGA` categories.

### 5.2 Facts

- `financial_fact`: a single **2025** period with `type='budget'`, **tied to org units** so they roll up practice→COE→pillar→firm. You can later add `type='actual'` for budget vs actual.

### 5.3 Per-person facts

- `person_fact`: seeded with **2025 billable hours** and **rate assumptions** per person.
  - For **Delivery practices** where hours and average bill rates were given, we **divide total hours evenly** among all billable roles in the practice (Consultants, PM, Partners/Assoc Partners leading that practice) and assign the **avg bill rate** to each. **Cost rate** comes from `rate_card`.
  - Example allocations (hours & avg bill rate from Elire.md):
    - Cloud HCM: 41,462 hrs @ $168/hr across John + 13 consultants → ~2,962 hrs/person @ $168/hr.
    - Cloud ERP: 22,826 hrs @ $170/hr across Jason + 7 consultants → ~2,853 hrs/person @ $170/hr.
    - Cloud Tech: 11,520 hrs @ $180/hr across Arjun + 3 consultants → ~2,880 hrs/person @ $180/hr.
    - EPM Planning: 18,290 hrs @ $168/hr across Alex + 3 consultants → ~4,572 hrs/person @ $168/hr.
    - EPM Close: 12,796 hrs @ $165/hr across Scott + 4 consultants → ~2,559 hrs/person @ $165/hr.
    - On Prem PeopleSoft: 59,595 hrs @ $178/hr across Ryan + 6 consultants → ~8,513 hrs/person @ $178/hr.
    - MAS PMO: 2,600 hrs @ $194/hr across Edmund + 2 consultants → ~867 hrs/person @ $194/hr.
    - MAS SAS: 6,901 hrs @ $176/hr across Stephen + 3 consultants → ~1,725 hrs/person @ $176/hr.
    - Treasury Kyriba: 11,210 hrs @ $205/hr across Abdel + 3 consultants → ~2,802 hrs/person @ $205/hr.
    - Treasury PSFT: 8,751 hrs @ $194/hr across Al + 1 consultant → ~4,375 hrs/person @ $194/hr.

> **Important**: these **per-person seeds are placeholders** to make the rollups match your 2025 totals immediately. You will overwrite with **PSA actuals** over time (same table, `type='actual'`).

------

## 6) Systems of Record mapping

- WIN units → `CRM` (with `DOC` for proposal/contract; `PSA` also for pricing guardrails).
- DELIVER units → `PSA`.
- COLLECT + OPERATE → `FIN`.
- TALENT → `HCM`.

**Why**: This enforces “evidence lives where it should” and supports the AI-ready standard (“AI can’t learn from undefined work”).

------

## 7) What’s intentionally **left blank** (for your UI)

- **Observed ownership** (`unit_observed_ownership`) — you will set who actually owns each unit today. This is where misattribution becomes visible (COE doing pricing, Sales doing scope, Talent unowned).
- **Actuals** (`financial_fact.type='actual'`, `person_fact.type='actual'`) — load from PSA/ERP to measure budget vs actual.

------

## 8) How to validate and iterate (checklist)

### 8.1 Immediate checks

- `select * from v_rosetta_stone order by stream, unit_code;`
  Ensure each atomic unit shows expected role + org unit, systems, and linked KPIs.
- `select * from v_org_rollup;`
  Confirm headcount and 2025 budget are rolling to practice → COE → pillar as expected.
- `select * from v_financial_rollup;`
  Verify Revenue, COS, and SG&A totals match *Elire.md* summary lines.
- `select * from v_stream_rollup;`
  Ensure lagging KPIs appear per stream (values will be null until you load measurements).

### 8.2 Replace placeholders with actuals

- **Observed ownership**: update via UI to expose fiction vs reality and drive RACI conversations.
- **Actual hours and cost/revenue**: insert into `person_fact` with `type='actual'` from your PSA.
- **Actual financials**: insert into `financial_fact` with `type='actual'` from ERP by month/quarter.

### 8.3 Tighten KPIs

- Use your current SPI KPIs (as-is) for continuity; manage with **operational drivers** (leading) to move outcomes (lagging).
- As you operationalize your approach, tune **targets** and add derived **stream KPI measurements** (into `kpi_measurement`) to populate `v_stream_rollup`.

------

## 9) Risks & mitigation

- **Org changes** (new practices/coEs): the org tree is flexible (`parent_id`). Add nodes and reassign people; rollups will follow.
- **Per-person budgeting**: seeded averages may hide variance. Mitigate by loading actuals per person ASAP.
- **KPI overload**: you wanted **all current KPIs** seeded; use **views** and **UI filters** to focus on drivers + outcomes while the legacy set remains visible.
- **Attribution ambiguity**: expected owners don’t reflect reality; that’s intentional. Fill `unit_observed_ownership`via the UI and use the views to show deltas.

------

## 10) “Where to go from here” (roadmap)

1. **UI: Observed ownership** — build the inline editor on `unit_observed_ownership`; instantly show differences in the Rosetta Stone and misattribution hotspots.
2. **Actuals: PSA/ERP** — start loading `person_fact(type='actual')` and `financial_fact(type='actual')`(monthly).
3. **Driver dashboards** — render leading KPI dials (`DISCOUNT_CYCLE`, `SCOPE_CAPTURE`, `TIME_TO_FILL`) at atomic-unit level; pin to targets.
4. **Outcome dashboards** — render lagging KPI dials (`WIN_RATE`, `REALIZATION`, `ON_TIME`, `DSO`, `EBITDA`); correlate with drivers.
5. **Decision rights & guardrails** — codify discount guardrails; define scope change authority; make ownership hard at department/practice level and reflect it in expected ownership.
6. **Retire survey theater** — keep SPI’s leadership index for continuity; judge leadership by **ends** (EBITDA, realization, on-time) and **drivers** they actively manage.

------

## 11) Files used (anchor citations)

- **Elire Operating Model – Current State 2025** (org tree, leaders, headcount, practices, budget lines, hours, rates).
- **Analysis.md** (current KPI set, hierarchy intent, value streams, RACI roll-up concept).
- **Modeling Ideas.md** (SELL sub-stages, expected vs observed patterns, Owner test, North-star mapping).

------

## 12) What to update when your data changes

- **Org**: insert/update `org_unit`, `person`, and `org_role` rows (the trees update).
- **Expected ownership**: adjust `unit_expected_ownership` as you clarify RACI.
- **Observed ownership**: append to `unit_observed_ownership` with timestamps from your UI.
- **KPIs**: maintain `kpi` rows and `kpi_target`; load measurements into `kpi_measurement`.
- **Budget**: insert new `financial_fact` rows for new periods (e.g., `type='budget'` for 2026).
- **Actuals**: load `financial_fact(type='actual')` and `person_fact(type='actual')` by period.

------

### Final note

This design deliberately **does not overcomplicate the schema**, but it **does** encode the critical connections you asked for so that **trees, rollups, and attribution** appear naturally once you start editing observed ownership and loading actuals. It is purpose-built to **prove** the story you’ve been telling: *who really owns the work, how that affects outcomes and dollars, and where to move accountability so leadership is measured by ends and controllable drivers—not by surveys or anecdotes.*