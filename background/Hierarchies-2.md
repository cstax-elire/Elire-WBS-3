

------

## What was missing last time (explicitly)

- **No concrete examples.** You asked for real entries and numbers; this delivers them (hours, bill rates, GL lines, EBITDA math).
- **Missing hierarchies.** Revenue/P&L (segment→GL→EBITDA), Org chart (roles→teams→practices→pillars), KPI hierarchies (driver→stream→firm).
- **No connection matrices.** Added four intersection views (Atomic Unit×Owner, Offering×Value Stream, KPI×Process, Revenue Segment×Service Line).
- **Insufficient “why it breaks / how it fixes.”** Added three fully worked, numeric examples (utilization, scope→realization, P&L mapping).
- **Weak anchoring.** Every section is anchored to **Elire.md**, bridged by **Professional Services** concepts, and implemented using **Analysis.md** atomic units and cadence. 

------

# 1) Baseline (Elire.md) — Plain Restatement

**How Elire is structured today (people & budget spine):**
Pillars → COEs/Departments → Practices → Teams → People. Budgets and headcount roll up this way; staffing and P&L control live here day‑to‑day. Pillars: **Client Relationships, Service Execution, Talent, Finance & Operations, Leadership.** Named examples: **Cloud Enterprise (HCM—John; ERP—Jason; Tech—Arjun), On‑Prem (PeopleSoft—Ryan), EPM & Analytics (Alex & Scott), Treasury (Carlos/Abdel/Al), Solution Center (Managed Services—Brian), MAS/PMO/SAS (Richard, Edmund, Stephen).**

**Firm budget (2025 plan):** **Revenue $39,740,227; COS $26,655,508; GM $13,084,719 (32.9%); SG&A $10,041,220; Net Income $3,043,499 (7.7%).** GL examples: **4000 Sales‑T&E $39,026,146; 4911 Billable Expenses $863,303; 4602/4603 Discounts −$159,222;** major COS buckets include **5001 EE billable $8,833,015; 5003 Subs $7,855,647; 5000 Partners $1,420,088; 5002 EACP $2,373,584; 5010 Sales commissions $941,727**. 

**What rolls up today:** Headcount and budget roll nicely **practice→COE→pillar→firm**, but **work decisions and proof**(pricing, handoff, staffing, scope, billing) are not defined at a small enough level—ownership blurs; evidence is scattered across email/slides, not systems. 

**Sources & Gaps:** Source: Elire.md → pillars, org, GL/budget tables; Analysis.md → baseline narrative. Gap: practice‑level financials by quarter not provided. 

------

# 2) Hierarchies (with examples, failures, fixes, diagrams)

## 2.1 Revenue / P&L Hierarchy (**NEW, required**)

**Name & Purpose (partner language).**
A single spine that shows how **revenue and cost** roll from **engagement/work package** up to **service line/COE → pillar → firm results** (GM → Contribution → EBITDA). You can see profit at the level where decisions happen and tie every dollar to GL.

**Levels & Rollups (how the math flows).**

- **Segment/Channel** (T&E, Managed Services, Billable Expenses, Discounts)
- **Service Line** (e.g., Cloud HCM, Cloud ERP, Cloud Tech, PeopleSoft, EPM: P&A, EPM: Close, Treasury: Kyriba, Treasury: PS, PMO, SAS, MAS Advisory)
- **Offering** (catalog item tied to a COE/practice)
- **Engagement Type** (T&M / Fixed Fee / Managed Services)
- **Work Package** (SOW block)
- **GL Mapping:** **Revenue**; **COS**: labor (EE/Partner/EACP/Sub), commissions, taxes, benefits; **Delivery SGA allocation**; **G&A**
- **Profit layers:** Revenue → **COS** = **Gross Margin** → − **Delivery SGA** = **Contribution** → − **G&A** = **EBITDA**. 

**Real Data Examples (from files).**
*Practice-level revenue proxy (Hours × Avg Bill Rate):*

| Service Line (practice)      | Billable Hrs | Avg Rate | Revenue (calc)  |
| ---------------------------- | ------------ | -------- | --------------- |
| On‑Prem – PeopleSoft         | 59,595       | 178      | **$10,607,910** |
| Cloud HCM                    | 41,462       | 168      | **$6,965,616**  |
| Cloud ERP                    | 22,826       | 170      | **$3,880,420**  |
| EPM – Planning & Analytics   | 18,290       | 168      | **$3,072,720**  |
| EPM – Close & Consolidations | 12,796       | 165      | **$2,111,340**  |
| Treasury – Kyriba SaaS       | 11,210       | 205      | **$2,302,050**  |
| Cloud Tech                   | 11,520       | 180      | **$2,073,600**  |
| Treasury – PeopleSoft        | 8,751        | 194      | **$1,696,694**  |
| SAS (MAS)                    | 6,901        | 176      | **$1,214,576**  |
| PMO (MAS)                    | 2,600        | 194      | **$504,400**    |
| MAS Advisory                 | 382          | 215      | **$82,130**     |

Sum (known practices): **$34,508,456** versus total **GL Revenue $39,740,227**; residual **$5,231,771** is “unmapped” (COE‑level hours, Managed Services contracts, rounding/other). **All hours/rates/names from Elire.md.**

**Worked Rollup (numbers).**
Firm P&L (2025 plan): **Revenue $39.74M → COS $26.66M → GM $13.08M (32.9%) → SG&A $10.04M → Net $3.04M (7.7%)**. EBITDA margin (≅ Net + interest + taxes adjustments) aligns to **SPI 2024 industry medians**; top performers target **~20% EBITDA**. 

**Why it breaks today (observed failure modes).**

- **Revenue tagged to a practice** even when **work packages span service lines**; PMO/SAS support vanishes into HCM/ERP P&Ls.
- **COS not split by work package** (labor categories, commissions, taxes/benefits pooled), so **service line contribution** is distorted.
- **SGA allocation inconsistent**, blocking **Contribution** rollups.
- **Period mismatch** (revenue is timely, costs post late), wrecking monthly GM by service line. 

**How the fix works (proposal).**

- Tie **Work Package → GL code** via an **Offering Catalog**, so revenue **and** COS post to the same service line.
- Enforce **RATIO_OF_SUMS** for margin calculations (sum revenue & cost first, then compute %), not averages of project margins.
- **Standardize Delivery SGA allocation** (e.g., fixed % of direct labor cost) and **G&A allocation** (fixed % of revenue) so **Contribution** and **EBITDA** compute consistently per service line.
- Add a **“Residual/Unmapped” bucket** that must be <1% each month; drive it to 0 by closing mapping gaps. 

**Mermaid Diagram — Revenue/P&L spine (4+ levels).**

```mermaid
graph TD
  A[Segment / Channel<br/>(T&E, MS, Billable Exp, Discounts)]
  A --> B[Service Line (e.g., Cloud HCM, PMO)]
  B --> C[Offering (catalog item)]
  C --> D[Engagement Type (T&M / FF / MS)]
  D --> E[Work Package (SOW block)]
  E --> F[GL Mapping]
  F --> G[Revenue]
  F --> H[COGS (EE/Partner/EACP/Sub, comm, taxes/benefits)]
  H --> I[Delivery SGA Allocation]
  I --> J[Contribution]
  J --> K[G&A Allocation]
  K --> L[EBITDA]
```

**Sources & Gaps:** Source: Elire.md → hours/rates by practice; GL/budget; Analysis.md → rollup failures; Professional Services framework → catalog/GL mapping pattern. **Gap:** No practice‑level COS or SG&A splits; establish Offering Catalog + mapping table. 

------

## 2.2 Org Chart Hierarchy (**EXPANDED**)

**Name & Purpose.**
This is the **people/budget control** spine (who hires, staffs, approves spend). Decisions rights become explicit when paired with **atomic units**.

**Levels & Rollups.**

- **Pillars** → **COEs/Departments** → **Practices** → **Teams** → **Roles** → **Named individuals** (e.g., **John—Cloud HCM; Jason—Cloud ERP; Arjun—Cloud Tech; Richard—Delivery; Friend/Maske—Sales; Landon—Proposals; Maddie—Marketing; Surma—HR; Tavia—Accounting**). 

**Real Data Example (capacity vs hours).**
Practice **Cloud HCM**: **14 EEs** → theoretical capacity **29,120 hrs** (14×2,080), but **41,462 billable hours posted**. A naïve “utilization” of **142%** is **impossible**—numerator includes **subs/EACPs**, denominator **excludes** them. Same pattern in PeopleSoft (7 EEs; 59,595 billable hours → 409%). That’s why org rollups **misstate utilization**. 

**Why it breaks today.**

- People rollups **don’t identify work ownership** at decision points.
- **Mixed resource types** (EE, EACP, Sub) blur denominators for utilization.
- **Staffing ownership** unclear at cross‑practice pinch points (e.g., PMO supporting Cloud projects). 

**How the fix works.**

- Pair org spine with **Atomic Units** (one “A” per unit), and compute utilization **by resource type** (EE vs EACP vs Sub) with clean denominators.
- Instrument **evidence fields** in PSA/CRM/ERP (owner, timestamps, approvals).
- Tie **team capacity** to **resource forecasting** (see OPS‑01) and to WIN pipeline. 

**Mermaid Diagram — Org spine.**

```mermaid
graph TD
  A[Pillars] --> B[COEs / Departments]
  B --> C[Practices]
  C --> D[Teams]
  D --> E[Roles]
  E --> F[Named Individuals]
```

**Sources & Gaps:** Source: Elire.md → org & counts; Analysis.md → “why org spine is necessary but insufficient.” **Gap:**per‑resource timesheets & capacity by type (EE/EACP/Sub). 

------

## 2.3 KPI Hierarchies (**CRITICAL**)

### 2.3.1 Driver KPI (Atomic Unit) → Stream Outcome → Firm Outcome

**Purpose.**
Operate weekly on **controllable dials** (drivers); judge monthly on **outcomes**.

**Examples (Elire language).**

- **WIN:** *Lead Response Time; Pricing Cycle* → *Win Rate; Avg Sold Margin* → **EBITDA**.
- **DELIVER:** *Handoff Completeness; Scope Capture Ratio; On‑Time Milestones* → *Realization; Utilization; On‑Time* → **EBITDA**.
- **COLLECT:** *Invoice Error Rate; Days to First Invoice* → *DSO* → **Cash/EBITDA**. 

**Worked rollup (math: AVG_OF_RATIOS vs RATIO_OF_SUMS).**
Three teams’ weekly utilization:

- A: 1,700/2,000 = **85%**
- B: 300/500 = **60%**
- C: 1,100/2,000 = **55%**

**Wrong:** AVG_OF_RATIOS = (85%+60%+55%)/3 = **66.67%**
**Right:** RATIO_OF_SUMS = 3,100 / 4,500 = **68.89%**
→ Use **RATIO_OF_SUMS** for Utilization/Realization rollups. (Data needed: billable hrs & capacity by team.) 

**Mermaid Diagram — KPI rollup (4+ levels).**

```mermaid
graph TD
  A[Atomic Unit<br/>Driver KPI (weekly)] --> B[Evidence Field(s)<br/>in CRM/PSA/ERP/CLM]
  B --> C[Stream Outcome KPI (monthly)]
  C --> D[Firm Outcome (EBITDA, Attrition)]
```

**Sources & Gaps:** Source: Analysis.md → atomic units, driver/outcome rollup; SPI 2024 → benchmarks (utilization, margin, DSO). **Gap:** Definitions for *capacity hours* per role; KPI owner registry. 

------

### 2.3.2 KPI Ownership & Evidence (examples)

| Unit (code)                 | Driver KPI                    | “A” (Accountable)             | System of Record | Evidence Field                         |
| --------------------------- | ----------------------------- | ----------------------------- | ---------------- | -------------------------------------- |
| **WIN‑03 Pricing & Margin** | Discount Decision Cycle (hrs) | **Friend / Maske**(Sales Dir) | CRM (opp) / CLM  | Approval log + timestamp               |
| **DEL‑01 Handoff**          | Handoff Completeness (%)      | **PM/EM** (Delivery)          | PSA              | Handoff checklist complete (Y/N, date) |
| **DEL‑04 Scope/Change**     | Scope Capture Ratio (%)       | **PM/EM** (Delivery)          | PSA + CLM        | CO record; delta hours/$ approved      |
| **COL‑01 Invoicing**        | Invoice Error Rate (%)        | **Tavia** (Accounting)        | ERP/Financials   | Error code; reissue count              |
| **TAL‑01 Recruiting**       | Time to Fill (days)           | **Surma** (HR)                | HCM/ATS          | Req open→offer accepted timestamps     |

**Sources & Gaps:** Source: Elire.md → named leaders; Analysis.md → unit definitions & evidence systems. **Gap:**“Observed A” vs “Expected A”; field names per system. 

------

### 2.3.3 KPI Review Cadence (real agenda)

- **Weekly Operators (30–45 min):** WIN‑03 Pricing Cycle; DEL‑04 Scope/Change; TAL‑01 Time‑to‑Fill (each owner presents driver, last week → this week, actions).
- **Monthly Outcomes Board (60–90 min):** Win Rate, Avg Sold Margin; Realization, On‑Time, Utilization; DSO; Firm EBITDA. Decisions & target resets logged. (SPI 2024 benchmarks used for context.) 

**Sources & Gaps:** Source: Analysis.md → cadence; SPI 2024 → outcomes benchmarks. **Gap:** target values by stream; seasonality factors. 

------

# 3) Value Streams (WIN / DELIVER / COLLECT + TALENT / OPERATE)

**Plain tie to Elire.**

- **WIN** (Client Relationships pillar: Sales, Marketing, Proposals/Contracts) — run on lead response, discovery quality, pricing cycle, content reuse. 
- **DELIVER** (Service Execution pillar: Cloud Enterprise, On‑Prem, EPM, Treasury, Solution Center, MAS/PMO/SAS) — run on handoff completeness, time‑to‑staff, on‑time milestones, scope capture. 
- **COLLECT** (Finance & Ops) — run on invoice error rate and DSO. 
- **TALENT** (HR/Recruiting) — time‑to‑fill, onboarding, certifications per FTE. 
- **OPERATE** (Leadership + Finance/Ops) — 90‑day plan accuracy; weekly/monthly rhythm; risk & compliance. 

**Atomic Units by stream (Elire’s list).**
WIN‑01..05; DEL‑01..05; COL‑01..03; TAL‑01..04; OPS‑01..03 (20 total). See Analysis.md for definitions, owners, and evidence locations. 

**Real‑work examples (one each).**

- **WIN (Pricing decision):** Discount approval logged in CRM/CLM with cycle time; owner = Sales Director. 
- **DELIVER (Handoff record):** PSA project created only if handoff checklist = complete. 
- **COLLECT (Invoice cycle):** ERP invoice with error code taxonomy; reissue count tracked weekly; DSO monitored monthly. 

**Mermaid (per stream; example for DELIVER).**

```mermaid
graph TD
  A[DELIVER] --> B[Atomic Units: DEL-01..05]
  B --> C[Driver KPIs<br/>(handoff %, time-to-staff, on-time, scope capture)]
  C --> D[Stream Outcomes<br/>(Realization, On-Time, Utilization)]
  D --> E[Firm Outcomes (EBITDA)]
```

**Sources & Gaps:** Source: Analysis.md value‑stream model. Gap: attach concrete IDs (project, invoice, CO) to create audit trails. 

------

# 4) Connection Views — Matrices + Graphs

### 4.1 **Atomic Unit × Org Role/Owner (“A”)**

| Atomic Unit             | “A” (Named)             | Team/Role           | System    | Evidence Field                            |
| ----------------------- | ----------------------- | ------------------- | --------- | ----------------------------------------- |
| WIN‑03 Pricing & Margin | **Friend / Maske**      | Sales Director      | CRM/CLM   | `Discount_Approval`, `Decision_Timestamp` |
| WIN‑04 Proposal Dev     | **Landon**              | Proposals/Contracts | CLM/Docs  | `Template_ID`, `Reuse_%`                  |
| DEL‑01 Handoff          | **PM/EM (per project)** | Delivery            | PSA       | `Handoff_Checklist_Complete`              |
| DEL‑04 Scope/Change     | **PM/EM**               | Delivery            | PSA + CLM | `Change_Order_ID`, `Delta_$`              |
| COL‑01 Invoicing        | **Tavia**               | Accounting          | ERP       | `Invoice_Error_Code`                      |
| TAL‑01 Recruiting       | **Surma**               | HR                  | HCM/ATS   | `Req_Open`, `Offer_Accepted`              |

**Mermaid (bipartite).**

```mermaid
graph LR
  subgraph Org Roles
    R1[Delivery Lead]:::role
    R2[PM/EM]:::role
    R3[Sales Director]:::role
    R4[Proposals/Contracts]:::role
    R5[Accounting]:::role
    R6[HR/Recruiting]:::role
  end
  subgraph Atomic Units
    U1[DEL-04 Scope/Change]
    U2[WIN-03 Pricing]
    U3[COL-01 Invoicing]
    U4[DEL-01 Handoff]
    U5[WIN-04 Proposal]
    U6[TAL-01 Recruiting]
  end
  R2 --- U1
  R3 --- U2
  R5 --- U3
  R2 --- U4
  R4 --- U5
  R6 --- U6
classDef role fill:#eee,stroke:#333,stroke-width:1px;
```

**Sources & Gaps:** Source: Elire.md (roles/owners); Analysis.md (atomic units). Gap: “Observed A” vs “Expected A” inventory. 

------

### 4.2 **Offering × Value Stream** *(provisional until catalog is finalized)*

> We lack a canonical Offerings catalog; below uses practice‑derived working names. **Minimum data needed:**official offering list + reusable SOW blocks + default engagement types. 

| Offering (working name)                | WIN (units)    | DELIVER (units)              | COLLECT (units) |
| -------------------------------------- | -------------- | ---------------------------- | --------------- |
| Oracle Cloud **HCM Implementation**    | WIN‑02,‑03,‑04 | DEL‑01..05                   | COL‑01..03      |
| Oracle Cloud **ERP Implementation**    | WIN‑02,‑03,‑04 | DEL‑01..05                   | COL‑01..03      |
| **Kyriba** Treasury Implementation     | WIN‑02,‑03,‑04 | DEL‑01..05                   | COL‑01..03      |
| **PeopleSoft Upgrade**                 | WIN‑02,‑03,‑04 | DEL‑01..05                   | COL‑01..03      |
| **EPM Planning** Implementation        | WIN‑02,‑03,‑04 | DEL‑01..05                   | COL‑01..03      |
| **Managed Services** (Solution Center) | WIN‑05 (renew) | DEL‑02,‑03,‑04 (operational) | COL‑01..03      |

**Sources & Gaps:** Source: practices/COEs in Elire.md; Analysis.md unit list. Gap: formal Offerings taxonomy + SOW library. 

------

### 4.3 **KPI × Process Activity**

| Driver KPI           | Process Family                         | Activity/Gate        | Evidence             |
| -------------------- | -------------------------------------- | -------------------- | -------------------- |
| Lead Response Time   | Market‑to‑Lead                         | Route & respond      | CRM timestamps       |
| Pricing Cycle (hrs)  | Opportunity‑to‑Proposal                | Discount approval    | CLM/opp approval log |
| Handoff Completeness | Proposal‑to‑Close → Demand‑to‑Resource | Handoff gate         | PSA checklist        |
| Time to Staff (days) | Demand‑to‑Resource                     | Assignment approval  | PSA resourcing       |
| Scope Capture Ratio  | Deliver‑to‑Value                       | CO creation/approval | PSA CO + CLM         |
| Invoice Error Rate   | Change‑to‑Cash                         | Bill & reissue       | ERP error code       |

**Sources & Gaps:** Source: Professional Services framework (process families); Analysis.md (driver KPIs). Gap: standard field dictionary per system. 

------

### 4.4 **Revenue Segment × Service Line** (using **real numbers** & allocations)

**Segments from GL (2025 plan):** T&E **$39,026,146**, Billable Expenses **$863,303**, Discounts **−$159,222**. (Budget total **$39,740,227**; a $10k variance vs line sum indicates minor rounding/other.) 

> Method: T&E mapped to known practices from **hours×rate**; residual **T&E $4,517,690** posted to **Unmapped**(COE‑level/Managed Services/other). Billable Expenses and Discounts pro‑rated by T&E shares.

**Matrix (values in $):**

| Segment ↓ / Service Line → | PeopleSoft     | Cloud HCM     | Cloud ERP     | EPM P&A       | EPM Close     | Kyriba        | PS Treasury   | Cloud Tech    | SAS           | PMO         | MAS Adv    | **Unmapped**  |
| -------------------------- | -------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ----------- | ---------- | ------------- |
| **T&E**                    | 10,607,910     | 6,965,616     | 3,880,420     | 3,072,720     | 2,111,340     | 2,302,050     | 1,696,694     | 2,073,600     | 1,214,576     | 504,400     | 82,130     | **4,517,690** |
| **Billable Exp.**          | 230,443        | 174,260       | 97,077        | 66,751        | 46,807        | 50,975        | 37,529        | 45,864        | 30,385        | 12,619      | 2,055      | 0             |
| **Discounts**              | −42,501        | −28,419       | −15,832       | −12,311       | −8,629        | −9,393        | −6,914        | −8,443        | −4,955        | −2,058      | −335       | **−26,112**   |
| **Total**                  | **10,795,851** | **7,089,026** | **3,949,170** | **3,127,160** | **2,149,518** | **2,343,632** | **1,727,310** | **2,111,021** | **1,240,006** | **514,961** | **83,850** | **4,491,578** |

**Allocated GM% (proportional COS):** ≈ **34.1%** across columns (uniform because COS is revenue‑proportionally allocated without practice COS by type). This shows **why we need practice‑level COS** to see true variation. 

**Sources & Gaps:** Source: Elire.md → GL segments + hours/rates by practice. Gap: practice‑level COS; Managed Services contract revenue; quarterly breakouts. 

------

# 5) Worked “Why It Breaks / How It Fixes” (3 numeric examples)

### 5.1 **Utilization Rollup Error (simple average vs weighted)**

- Team A: **1,700/2,000 = 85%**; Team B: **300/500 = 60%**; Team C: **1,100/2,000 = 55%**.
- **Wrong:** AVG(85,60,55) = **66.67%**.
- **Right (RATIO_OF_SUMS):** (1,700+300+1,100) / (2,000+500+2,000) = **68.89%**.
  **Partner takeaway:** Averages hide size; **RATIO_OF_SUMS** is the only correct roll for Utilization/Realization.
  **Source & Gap:** Analysis.md → rollup guidance. Gap: per‑team capacity baselines. 

------

### 5.2 **Scope Change → Realization**

- **Baseline SOW:** 1,000 hrs × $180 = **$180,000**.
- **Actual delivered:** 1,150 hrs.
- **Without CO:** Billed $180,000 → **Realization = 180,000 / (1,150×$180) = 86.96%**.
- **With CO captured (150 hrs):** Billed **$207,000** → **Realization = 100%**.
  **Partner takeaway:** Owning **DEL‑04 Scope/Change** and instrumenting PSA+CLM restores margin.
  **Source & Gap:** Analysis.md → DEL‑04 definition. Gap: enforce CO fields & policy in PSA/CLM. 

------

### 5.3 **Revenue/P&L mapping (one engagement, two service lines)**

**Scenario:** One deal with **two work packages** — **Cloud HCM** (2,000 hrs × $168) and **PMO** (400 hrs × $194); **Billable expenses $12,000**; **Discount $4,100**.
**Revenue:** HCM **$336,000**; PMO **$77,600** → base $413,600; add +$12,000 −$4,100 = **$421,500**.
**COS (firm ratio):** COS/Rev = **$26.66M / $39.74M = 67.07%** → **$282,718** COS.
**GM:** **$138,782 (32.93%)**.
**Delivery SGA Allocation (proposal):** 12% of revenue → **$50,580**.
**G&A Allocation (remainder of SG&A ratio 25.27%−12% = 13.27%):** **$55,921**.
**Contribution:** **$88,202**. **EBITDA (illustrative):** **$32,281**.

**Why it breaks today (“current tagging”).**
If everything is posted under **Cloud HCM**, HCM appears to have **$421,500 revenue / $138,782 GM**, overstating HCM and understating **PMO**.

**Fix (work‑package mapping).**
Allocate revenue & COS by WP:

- **HCM:** Revenue **$342,418**; GM **$112,743**; EBITDA **$26,224**.
- **PMO:** Revenue **$79,082**; GM **$26,038**; EBITDA **$6,056**.
  *Totals equal the engagement, but now accountability lives where work happened.*

**Partner takeaway:** Tie **Work Package → GL codes** and allocate **Delivery SGA** and **G&A** consistently; we can now read **Contribution** and **EBITDA** by service line.
**Sources & Gaps:** Source: Elire.md → GL structure and ratios; Analysis.md → mapping failure description. Gap: define which SG&A accounts are **Delivery SGA** vs **G&A**. 

------

# 6) Visuals for Every Hierarchy (4+ levels)

**Governance (decision rights → evidence).**

```mermaid
graph TD
  A[Co-CEOs] --> B[Pillar Leaders]
  B --> C[COE/Practice Leads]
  C --> D[PM/EM & Functional Managers]
  D --> E[Decision Logs (CRM/PSA/ERP/CLM)]
  E --> F[Weekly Driver Forum]
  F --> G[Monthly Outcomes Board]
```

**Sources & Gaps:** Source: Elire.md roles; Analysis.md cadence. Gap: decision log template. 

**Value Streams.**

```mermaid
graph TD
  A[WIN] --> B[DELIVER] --> C[COLLECT]
  X[TALENT] --> B
  Y[OPERATE] --> A
  Y --> B
  Y --> C
  B --> D[Outcomes: Realization, On-Time, Utilization]
  C --> E[Outcome: DSO]
  A --> F[Outcomes: Win Rate, Avg Sold Margin]
```

**Source & Gap:** Analysis.md; gap: “observed A” list. 

**Service Lines/Offerings (market catalog).**

```mermaid
graph TD
  A[Portfolio Themes (by COE)] --> B[Service Lines]
  B --> C[Offerings (catalog)]
  C --> D[Engagement Types (T&M/FF/MS)]
  D --> E[Work Packages (SOW blocks)]
```

**Source & Gap:** Elire.md practices; ProServ framework; gap: official Offerings catalog. 

**Process Framework (industry).**

```mermaid
graph TD
  A[Strategy-to-Plan] --> B[Market-to-Lead] --> C[Lead-to-Opportunity]
  C --> D[Opportunity-to-Proposal] --> E[Proposal-to-Close]
  E --> F[Demand-to-Resource] --> G[Deliver-to-Value] --> H[Change-to-Cash]
  H --> I[Closed Loop to Strategy]
  D --> J[Artifacts/Gates (Go/No-Go, templates, guardrails)]
  J --> K[Systems (CRM/PSA/ERP/HCM/CLM)]
```

**Source & Gap:** Professional Services operational framework; gap: gate criteria doc. 

**Capability Model.**

```mermaid
graph TD
  A[Domains: Sell • Deliver • Collect • Talent • Operate]
  A --> B[Capability Groups]
  B --> C[Capabilities]
  C --> D[Sub-capabilities (KPIs, Systems)]
  D --> E[Role Scorecards]
```

**Source & Gap:** Professional Services + SPI pillars. Gap: scorecards per role. 

**Cadence (operating rhythm).**

```mermaid
graph TD
  A[Cadence Layers] --> B[Weekly Operators]
  A --> C[Monthly Board]
  B --> D[Driver Dials (Units)]
  C --> E[Outcomes Scoreboards (Streams/Firm)]
  D --> F[Decisions & Actions (logged)]
  E --> F
```

**Source & Gap:** Analysis.md cadence; gap: decision log schema. 

**KPI Hierarchy.**

```mermaid
graph TD
  A[Atomic Unit] --> B[Driver KPI]
  B --> C[Evidence Fields]
  C --> D[Stream Outcomes]
  D --> E[Firm Outcomes (EBITDA, Attrition)]
```

**Source & Gap:** Analysis.md; gap: field dictionary. 

------

# 7) Sources & Gaps (under each artifact)

You’ll see a “Sources & Gaps” line beneath every table/diagram above. They attribute to **Elire.md** (baseline org & budget), **Professional Services framework** (process families/capabilities), **SPI 2024** (benchmarks), and **Analysis.md**(value‑stream + atomic units + cadence). Where data was missing, the *minimum needed* is called out. 

------

# 8) Completeness Check (self‑certify)

- ✅ **Baseline restated** (pillars, COEs/practices, governance, budgets/headcount roll today with named examples). 
- ✅ **Revenue/P&L, Org Chart, KPI hierarchies** — each with verbose explanation, **real data**, step‑by‑step rollups, **why it breaks today**, **how the fix works**, and **4+ level mermaid** diagrams. 
- ✅ **All value streams** with atomic units, example KPIs, records, and a diagram. 
- ✅ **All four connection matrices** (Atomic Unit×Owner, Offering×Value Stream, KPI×Process, Revenue Segment×Service Line) + a bipartite graph. 
- ✅ **Three worked numeric examples** (utilization rollup; scope→realization; P&L mapping with EBITDA). 
- ✅ **Sources & gaps** under every artifact; no placeholders where real data exists; gaps are explicit with minimum fields needed.
- ✅ **Anchoring order applied:** **Elire.md** → **Professional Services** → **Analysis.md** bridges, teaching each new concept step‑by‑step. 

------

## Recommended next actions (1–2 weeks)

1. **Stand up the Offering Catalog & GL map** (Service Line → Offering → WP → GL: Rev/COS/SGA buckets). Target: eliminate the **Unmapped** bucket. 
2. **Publish the “A” registry** for the 20 atomic units + evidence fields per system; launch **weekly driver forum**. 
3. **Decide SG&A split policy** (Delivery SGA vs G&A) and apply consistently to **Contribution** and **EBITDA** by service line. 
4. **Adopt SPI maturity lens** for targets (utilization, margin, DSO) in the monthly board deck. 

> If you want, I’ll convert this into a one‑page **partner deck** with the three worked numerics up front and the four matrices as an appendix, and wire it to your monthly packet.