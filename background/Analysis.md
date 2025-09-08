- # Analysis.md — Standalone Narrative: How We Operate Today, Why Rollups Fail, and the introduction of the Value‑Stream Model 

  > **What this is**  
  > A **plain‑English, standalone narrative** of how we run the firm **today** (org trees and current KPIs), **why** that structure fails to give operating control, and **what** we’re introducing next: a **Value‑Stream rollup** with small, controllable “atomic units.”  
  > There are **no external references required** to read this file. All diagrams are embedded as ASCII. If our database changes tomorrow, the **narrative still stands**.

  > **How to use this**  
  >
  > - **Part I — Current State:** The trees and scoreboards we actually manage today (and their gaps).  
  > - **Part II — The Value‑Stream Rollup (Concept):** The 3+2 spine and the 20 atomic units with **verbose definitions**.  
  > - **Part III — Cadence & Proof:** Weekly/monthly rhythm and a 90‑day plan to demonstrate control.  
  > - **Appendix — Current KPI list, Org outline, and a generic implementation note** (optional).

  ---

  ## Part I — Current State (what we are actually running on)

  ### 1) The organization tree we manage by (pillars → departments/COEs → practices → people)

  We manage the business through the **org tree**. Budgets and headcount live here; responsibilities are implied here. This is the day‑to‑day view leaders use.

  ```
  Firm
  ├─ Leadership
  ├─ Client Relationships
  │  ├─ Sales
  │  ├─ Marketing
  │  └─ Proposal Management & Contracts
  ├─ Service Execution
  │  ├─ Management Advisory Services (PMO, SAS)
  │  ├─ Cloud Enterprise (Cloud HCM, Cloud ERP, Cloud Technology)
  │  ├─ Solution Center (Managed Services)
  │  ├─ On‑Premise (PeopleSoft)
  │  ├─ EPM & Analytics (Planning & Analytics; Close & Consolidations)
  │  └─ Treasury (Kyriba SaaS Treasury; PeopleSoft Treasury)
  ├─ Talent
  │  ├─ HR
  │  └─ Recruiting
  └─ Finance & Operations
     ├─ Accounting
     └─ IT
  ```

  **What truly rolls up here today**

  - **Headcount & budget** roll up cleanly **practice → COE → pillar → firm**.  
  - **Work doesn’t**: the work itself isn’t defined at a small enough level, so ownership blurs and leaders pick up other pillars’ jobs.  
  - **Evidence is scattered**: decisions and proof often live in email/slides vs the systems where they belong, which breaks auditability and AI‑readiness.

  > **Bottom line:** The org tree is **necessary** (for budget/staffing/accountability by practice) but **insufficient** to run work. It lacks the **granularity** where ownership is unambiguous and levers are controllable.

  ---

  ### 2) What we measure today (the current KPI catalog — and why it doesn’t create control)

  We track a broad KPI set by pillar. This provides familiarity but **not** operating control because many metrics are **lagging**, **survey‑based**, or **not controllable** by the people measured.

  **Leadership (survey/“SPI index” style)**  

  - Vision/mission understood; confidence in leadership; ease of getting things done; alignment of goals and measurements; confidence in future; communication effectiveness; embraces change; innovation focus; “becoming more data‑driven”.

  **Client Relationships**  

  - Pipeline vs quarterly bookings; SOW closed ($); BDR‑generated opps; RFP win rate; % of won that are Managed Services; marketing‑generated pipeline ($); inbound web leads.

  **Finance & Operations**  

  - Revenue per billable consultant; revenue per employee; revenue leakage; days to invoice; hours to produce financials; invoice rework.

  **Service Execution**  

  - Path‑to‑cloud cumulative pipeline; # clients with targeted strategic messages; sales from those messages; federal SOW sales; PSA CSAT; client satisfaction.

  **Talent**  

  - Employee satisfaction; total attrition YTD; days to recruit & hire (standard roles); % employees billable.

  **Why this doesn’t give operating control**  

  - **Controllability:** Many items above can’t be directly controlled by the team reporting them (e.g., firmwide sentiment or totals).  
  - **Measurability:** Several rely on **surveys** or **manual tallies**; definitions aren’t always audit‑ready.  
  - **Rollup logic:** There’s **no common rollup** from team‑level activity to **firm outcomes**; each pillar publishes its own scoreboard.  
  - **Ownership:** Because work isn’t defined at a small enough unit, “who actually owns the lever” is unclear; leaders often carry work from other pillars.

  ---

  ### 3) Three repeating stories (where rollups and ownership break)

  **A) “Can we discount 10%?” — Pricing routes to Delivery**  
  Because scope, risk, staffing, timeline, and feasibility live in Delivery, the 10% question lands there. Sales books the deal; **Delivery absorbs the compromises**. Evidence sits in inboxes, not CRM/PSA. Result: **long decision cycles**, sold margin appears fine, **realization suffers**.

  **B) Mid‑flight scope changes — Sales inside Delivery**  
  AEs renegotiate scope during delivery; change control is bypassed. Result: **low scope‑capture**, schedule pain, margin leakage presented later as “relationship maintenance”.

  **C) Panic hiring — Talent isn’t owned at a small enough level**  
  COE leaders do midnight workforce planning; reqs open late; interviews done by the busiest people. Result: **time‑to‑fill balloons**, **senior burnout**, uneven utilization masked by averages.

  > **Root cause across all three:** We manage **pillars and outcomes**, not the **small pieces of work** where one owner has a lever to pull and where proof lives in a system.

  ---

  ## Part II — The Value‑Stream Rollup we’re introducing (conceptual)

  We will **keep** the org tree for budgets and staffing. We will **operate** the work through a different spine: **Value Streams → Atomic Units**. This spine gives us **controllable dials** and **clean rollups**.

  ### 4) The spine at a glance (3 customer streams + 2 enablers)

  - **Customer value streams:** **WIN → DELIVER → COLLECT**  
  - **Enablers:** **TALENT** and **OPERATE**  
  - *(Optional customer motion: **EXPAND** sits alongside WIN when we focus on land‑and‑expand.)*

  **How they connect (conceptual)**  

  ```
  TALENT enables → WIN & DELIVER
  OPERATE enables → all streams
  WIN feeds → DELIVER feeds → COLLECT
  ```

  ### 5) The 20 atomic units (the leaves where one “A” owns a lever) — with verbose definitions

  > **How to read these:** Each atomic unit includes **what it is**, the **decision(s)** inside it, **where evidence belongs**, **controllable driver dials**, and a **clear ownership boundary** example. This is the altitude at which we can assign exactly one **Accountable (“A”)** owner and manage a weekly dial.

  #### WIN — Create & convert opportunities (5)

  1) **WIN‑01 Lead Qualification (MQL→SQL decision)**  
     - **What it is:** Decide quickly and consistently whether a lead is worth pursuit (ICP fit, intent, speed).  
     - **Decisions:** Pursue vs park; route to the right team; define next touch & SLA.  
     - **Evidence:** CRM (lead record, qualification fields, timestamps).  
     - **Driver dials:** *Lead Response Time; Qualification Completeness*.  
     - **Ownership boundary:** Sales owns the go/no‑go and routing; Delivery is consulted for feasibility, not accountable for intake speed.

  2) **WIN‑02 Discovery & Solutioning (understand need)**  
     - **What it is:** Clarify the business problem, constraints, and solution outline at scoping fidelity (not full design).  
     - **Decisions:** Problem framing; rough effort bands; risks/assumptions.  
     - **Evidence:** CRM notes + lightweight solution outline artifact.  
     - **Driver dials:** *Solution Outline Validated* (% of pursuits with client‑validated outline).  
     - **Ownership boundary:** Sales leads discovery; Delivery contributes specific SMEs. If Delivery writes the entire solution, we’ve shifted into misattribution.

  3) **WIN‑03 Pricing & Margin Decision (set terms)**  
     - **What it is:** Set price & expected margin; approve/deny discounts within guardrails.  
     - **Decisions:** Price point; discount approval; trade‑offs (scope/timeline/quality).  
     - **Evidence:** CRM/PSA pricing fields; decision log; cycle time.  
     - **Driver dials:** *Discount Decision Cycle; Avg Sold Margin (as an outcome signal)*.  
     - **Ownership boundary:** Sales is accountable only if they can meet evidence + guardrail standards. Otherwise the A moves to where the decision is truly made (often Delivery leadership).

  4) **WIN‑04 Proposal Development (create offer)**  
     - **What it is:** Assemble a compliant, reusable proposal/SOW from approved content; minimize redlines.  
     - **Decisions:** Which modules/terms; reuse vs bespoke; risks called out.  
     - **Evidence:** Document/CLM repository with versioned content.  
     - **Driver dials:** *Proposal Content Reuse (%)*.  
     - **Ownership boundary:** Proposal Management is accountable for assembly; Delivery provides specific content blocks; Sales provides client context.

  5) **WIN‑05 Contract Execution (close deal)**  
     - **What it is:** Negotiate & sign MSA/SOW with clear acceptance criteria and risks.  
     - **Decisions:** Legal positions; acceptance/exit; commercial exceptions.  
     - **Evidence:** CLM; approved redline log; signature timestamps.  
     - **Driver dials:** *Win Rate* (lagging at stream), *Cycle time* (if tracked).  
     - **Ownership boundary:** Legal/Contracts is accountable for contractual integrity; Sales/Delivery advise.


  #### DELIVER — Execute client work (5)

  6) **DEL‑01 Project Handoff (sales→delivery)**  
     - **What it is:** Formal handoff: risks, assumptions, staffing signal, success criteria.  
     - **Decisions:** Accept/return deal; readiness gates; initial plan.  
     - **Evidence:** PSA project record; handoff checklist.  
     - **Driver dials:** *Handoff Completeness (%)*.  
     - **Ownership boundary:** PMO/Delivery (A). Sales participates but isn’t accountable for readiness.

  7) **DEL‑02 Resource Assignment (match skills)**  
     - **What it is:** Assign named resources with the right skills and timing.  
     - **Decisions:** Who, when, for how long; bench vs external capacity.  
     - **Evidence:** PSA resourcing; approvals timestamps.  
     - **Driver dials:** *Time to Staff; Utilization (as an outcome signal)*.  
     - **Ownership boundary:** Practice leadership/Resource management (A).

  8) **DEL‑03 Milestone Delivery (hit dates)**  
     - **What it is:** Deliver milestones predictably with visibility and quality.  
     - **Decisions:** Schedule adherence; scope trade‑offs; issue escalation.  
     - **Evidence:** PSA tasks/milestones; RAID log.  
     - **Driver dials:** *On‑Time Delivery (% milestones on plan)*.  
     - **Ownership boundary:** PM owns cadence; technical leads deliver within plan.

  9) **DEL‑04 Scope/Change Management (control creep)**  
     - **What it is:** Capture and monetize scope deltas with discipline.  
     - **Decisions:** What is in/out; who approves; pricing for change.  
     - **Evidence:** PSA change orders; approvals; billed vs identified deltas.  
     - **Driver dials:** *Scope Capture Ratio* (billed delta / identified delta).  
     - **Ownership boundary:** PM/Delivery (A) owns the gate. Sales can influence, but cannot bypass.

  10) **DEL‑05 Project Closure (get sign‑off)**  
      - **What it is:** Formal acceptance; lessons learned; reference creation.  
      - **Decisions:** Acceptance criteria met; warranty obligations; reference ask.  
      - **Evidence:** PSA closeout checklist; CSAT; reference artifacts.  
      - **Driver dials:** *On‑Time; Realization (as outcome signals)*.  
      - **Ownership boundary:** PM accountable for closure discipline.


  #### COLLECT — Turn work into cash (3)

  11) **COL‑01 Invoice Generation (bill correctly)**  
      - **What it is:** Accurate, on‑time invoices with required backup.  
      - **Decisions:** Billing triggers; dispute handling; error correction.  
      - **Evidence:** ERP/Financials; invoice log with error codes.  
      - **Driver dials:** *Invoice Error Rate; Days to Invoice*.  
      - **Ownership boundary:** Accounting (A); PM provides timesheet/approval evidence.

  12) **COL‑02 Collections (get payment)**  
      - **What it is:** Collect cash; resolve disputes; escalate when needed.  
      - **Decisions:** Escalation thresholds; settlement terms.  
      - **Evidence:** ERP AR aging; dispute notes.  
      - **Driver dials:** *DSO (lagging by stream); Dispute resolution cycle*.  
      - **Ownership boundary:** Accounting (A) with clear escalation to Delivery/Exec when needed.

  13) **COL‑03 Revenue Recognition (book it)**  
      - **What it is:** Recognize revenue per policy; audit‑ready.  
      - **Decisions:** Method (T&M vs FF milestones); adjustments.  
      - **Evidence:** ERP; rev rec schedules; audit trail.  
      - **Driver dials:** *Realization (as outcome correlation)*.  
      - **Ownership boundary:** Finance (A).


  #### TALENT — Get and keep the right people (4)

  14) **TAL‑01 Recruiting (find people)**  
      - **What it is:** Open reqs; source candidates; extend offers.  
      - **Decisions:** Req approval; sourcing channels; offer terms.  
      - **Evidence:** HCM/ATS; req & candidate pipeline with timestamps.  
      - **Driver dials:** *Time to Fill*.  
      - **Ownership boundary:** HR/Recruiting (A) with COE input on must‑have skills.

  15) **TAL‑02 Onboarding (make productive)**  
      - **What it is:** Access, training, buddy, first assignment.  
      - **Decisions:** Day‑1 access; training plan; first staffed role.  
      - **Evidence:** HCM onboarding tasks; completion; first‑bill date.  
      - **Driver dials:** *Handoff Completeness (%)*; “Time to first bill”.  
      - **Ownership boundary:** HR (process) + Delivery (first assignment) — HR is the A for the process being complete.

  16) **TAL‑03 Development (grow skills/certs)**  
      - **What it is:** Certifications, skilling plans, coverage models.  
      - **Decisions:** Priority certifications; study time; mentoring assignments.  
      - **Evidence:** LMS/cert tracker; skill matrix.  
      - **Driver dials:** *Certifications per FTE*; coverage ratios.  
      - **Ownership boundary:** Talent (A) with practice leaders as customers.

  17) **TAL‑04 Retention (keep performers)**  
      - **What it is:** Engagement, mobility, burnout prevention.  
      - **Decisions:** Rotation; backfill; recognition; compensation levers.  
      - **Evidence:** HCM engagement; mobility logs; exit interviews.  
      - **Driver dials:** *Retention leading indicators* (e.g., internal moves, PTO usage balance); **Attrition** is firm‑level lagging.  
      - **Ownership boundary:** Talent (A) + line managers accountable for local actions.


  #### OPERATE — Run the business machine (3)

  18) **OPS‑01 Planning & Forecasting (predict future)**  
      - **What it is:** 90‑day rolling plan across CRM/PSA/ERP/HCM.  
      - **Decisions:** Hiring vs bench; rate cards; practice targets.  
      - **Evidence:** Integrated forecast snapshots; variance logs.  
      - **Driver dials:** *Plan Accuracy (90d)*.  
      - **Ownership boundary:** Finance (A) with Delivery/Talent inputs.

  19) **OPS‑02 Performance Management (track & improve)**  
      - **What it is:** Weekly/monthly/quarterly rhythm that drives decisions (not theater).  
      - **Decisions:** Corrective actions on dials; target resets for mix/seasonality.  
      - **Evidence:** Meeting decisions log; KPI snapshots.  
      - **Driver dials:** *EBITDA at firm (lagging)*; adherence to rhythm.  
      - **Ownership boundary:** COO/Delivery leader (A) for the operating rhythm itself.

  20) **OPS‑03 Risk & Compliance (stay safe)**  
      - **What it is:** Risk register; controls; audit readiness.  
      - **Decisions:** Mitigations; policy exceptions; audits.  
      - **Evidence:** Risk/controls logs; audit files.  
      - **Driver dials:** *Control adherence*; *issue cycle time*.  
      - **Ownership boundary:** Finance/Operations (A).

---

  ### 6) How rollups will work now (drivers → outcomes → firm)

  **Principle:** *Manage what teams can control; judge leaders by outcomes.*

  ```
  Atomic Unit (leading, controllable) ──► Stream (lagging outcomes) ──► Firm (portfolio outcomes)
  e.g., Discount Decision Cycle        ──► Win Rate / Avg Sold Margin ──► EBITDA
        Scope Capture Ratio            ──► Realization / On‑Time       ──► EBITDA
        Time to Fill                   ──► Utilization                 ──► Attrition / EBITDA
  ```

  We will keep today’s pillar metrics **as context**. We will **run the business** on a small set of **driver dials at units** and **outcome scoreboards at streams/firm**.

---

  ### 7) Today vs Proposed — pillar rollups (ASCII diagrams, fully embedded)

  **Client Relationships → WIN**  

  ```
  TODAY (pillar scoreboard)
  Pipeline • SOW $ • RFP win% • Inbound leads • Managed Services %
      │
      └─ Gap: No shared dial that a Sales Director can move *this week* to change next month’s Win Rate.
         Decisions and proof are scattered; Delivery is pulled in ad hoc.
  
  PROPOSED (value‑stream rollup)
  Lead Response Time • Qualification Completeness • Discount Decision Cycle • Proposal Reuse  (unit dials, owned in CRM/CLM)
              └────────────── rolls up to ──────────────►  WIN RATE • AVG SOLD MARGIN  (stream outcomes)
                                                                  └────────► EBITDA  (firm)
  Key shifts: one “A” per unit; guardrails for pricing; reuse content; discovery at scoping fidelity.
  ```

  **Service Execution → DELIVER**  

  ```
  TODAY
  Path‑to‑Cloud pipeline • PSA CSAT • “Project green” averages
      └─ Gap: Averages hide scope leakage and late staffing; no weekly lever to force capture or accelerate staffing.
  
  PROPOSED
  Handoff Completeness • Time to Staff • Scope Capture Ratio • On‑Time  (unit dials, owned in PSA)
              └────────────── rolls up to ──────────────►  REALIZATION • ON‑TIME • UTILIZATION  (stream outcomes)
                                                                └────────► EBITDA  (firm)
  Key shifts: formal handoff gate; resourcing SLA; scope gate with pricing; milestone discipline.
  ```

  **Talent → TALENT**  

  ```
  TODAY
  Employee satisfaction • % billable • “45‑day time‑to‑hire” (averaged)
      └─ Gap: Panic hiring; seniors covering; uneven utilization hidden by averages.
  
  PROPOSED
  Time to Fill • Onboarding Handoff • Certifications per FTE  (unit dials, owned in HCM/LMS)
              └────────────── rolls up to ──────────────►  UTILIZATION (stream) • ATTRITION (firm)
  Key shifts: skill‑specific reqs with SLA; first‑bill tracking; certification coverage model.
  ```

  **Finance & Operations → COLLECT + OPERATE**  

  ```
  TODAY
  Revenue/Employee • Days to Invoice • Hours to close
      └─ Gap: Backward‑looking; little control on delivery choices or resourcing timing.
  
  PROPOSED
  Invoice Error Rate • Plan Accuracy (90d)  (unit dials, owned in ERP/forecast)
              └────────────── rolls up to ──────────────►  DSO (stream) • EBITDA (firm)
  Key shifts: billing proof standard; forecast variance ritual; earlier signals on staffing and pricing.
  ```

  **Leadership**  

  ```
  TODAY
  SPI survey index (sentiment about leadership)
  
  PROPOSED
  Owns the outcomes scoreboard (by stream + firm)
  Enforces:  one “A” per unit • evidence in system • drivers managed weekly • targets are time‑bounded
  Key shifts: judge leaders by ends; require teams to manage causes.
  ```

---

  ### 8) What changes for each pillar (keep for context / operate / judge)

  - **Client Relationships** — *Keep (context):* pipeline, RFP win%. *Operate:* response time, qualification completeness, discount cycle, proposal reuse. *Judge:* **Win Rate, Avg Sold Margin**.  
  - **Service Execution** — *Keep:* CSAT. *Operate:* handoff completeness, time‑to‑staff, scope capture, on‑time. *Judge:* **Realization, On‑Time, Utilization**.  
  - **Talent** — *Keep:* employee satisfaction. *Operate:* time‑to‑fill, onboarding handoff, certifications per FTE. *Judge:* **Attrition (firm), Utilization (stream)**.  
  - **Finance & Ops** — *Keep:* revenue/employee. *Operate:* invoice error rate, plan accuracy (90d). *Judge:* **DSO, EBITDA**.  
  - **Leadership** — *Operate:* governance of decision rights & boundaries. *Judge:* **stream outcomes** and **firm outcomes**.

---

  ## Part III — Cadence & proof

  ### 9) Weekly / Monthly rhythm

  - **Weekly (operators):** Update observed ownership where reality differs; review **Pricing**, **Scope/Change**, **Recruiting** first; manage the **driver dials** and assign actions.  
  - **Monthly (board):** Review **stream outcomes** (Win Rate, Avg Sold Margin, Realization, On‑Time, Utilization, DSO) and **firm outcomes** (EBITDA, Attrition); adjust targets for mix/seasonality.

  ### 10) The first 90 days (what we will prove)

  - **0–30 days — Discover & instrument:** Map observed “A” for the 20 units (+ SELL/EXPAND where live). Mandate evidence capture in CRM/PSA/CLM/HCM. Load 6–12 months of outcomes.  
  - **31–60 days — Fix the few that move the many:** Targets: *Discount Cycle < 24h; Scope Capture ≥ 80%; Time to Fill ≤ 45d.* Clarify discount/scope decision rights.  
  - **61–90 days — Scale:** Pilot in **Cloud Enterprise** + **On‑Prem**; show deltas in misattribution, driver KPIs, and early outcomes; decide what to institutionalize.

---

  ## Appendix — Current KPIs, Org outline, and optional implementation note

  ### A) Full current KPI list (verbatim, grouped by pillar)

  **Leadership (survey index):** vision/mission understood; confidence in leadership; ease of getting things done; goals/measurements alignment; confidence in future; communicates effectively; embraces change; innovation focus; becoming more data‑driven.  

  **Client Relationships:** pipeline vs quarterly bookings (rolling 4Q); SOW closed; BDR‑generated opportunities; RFP win rate (incl. down‑select); Managed Services % of won; marketing‑generated pipeline; inbound web leads.  

  **Finance & Operations:** annual consulting revenue per billable consultant; annual consulting revenue per employee; revenue leakage; days to invoice; hours to produce financials; invoice rework.  

  **Service Execution:** path‑to‑cloud cumulative pipeline; # clients with targeted messages; sales from those efforts; federal client SOW sales; PSA CSAT; client satisfaction survey.  

  **Talent:** employee satisfaction; total employee attrition YTD; days to recruit & hire; % employees billable.

---

  ### B) Org outline (current state one‑sheet)

  **Pillars:** Leadership; **Client Relationships** (Sales, Marketing, Proposals/Contracts); **Service Execution** (COEs: MAS—PMO/SAS; Cloud Enterprise—HCM/ERP/Tech; Solution Center—Managed Services; On‑Prem—PeopleSoft; EPM—Planning & Close; Treasury—Kyriba/PSFT Treasury); **Talent** (HR, Recruiting); **Finance & Ops** (Accounting, IT).  
  **Leaders & sizes (examples):** Sales Directors (Friend, Maske); Marketing Director (Maddie); Proposal Manager (Tim); HR Director (Surma); Accounting Director (Tavia); Delivery Leader (Richard); COE/Practice leads (e.g., Cloud HCM—John; Cloud ERP—Jason; Cloud Tech—Arjun; PeopleSoft—Ryan; EPM—Alex & Scott; Treasury—Carlos/Abdel/Al).

---

  ### C) Optional: how to express this in **any** data system (tool‑agnostic)

  - **Concepts:** *Value Streams, Atomic Units, Expected vs Observed Ownership, Systems of Record, KPIs (leading/lagging with scope unit/stream/firm), Targets, Measurements, Org tree, Financial facts*.  
  - **Portable views:**  
    - **Rosetta** — one row per atomic unit (stream, owner, systems, driver KPIs).  
    - **Misattribution Delta** — Expected vs Observed with status (Aligned / Role Mismatch / Org Mismatch / Not Observed).  
    - **Stream Health** — current **leading** driver dials by stream.  
    - **Outcomes Scoreboard** — current **lagging** outcomes by stream/firm.  
    - **Org/Financial Rollups** — headcount and budgets by practice → COE → pillar.  
  - **Note:** Names and schemas can evolve. The narrative above **does not** depend on table names.

---

  ### D) Glossary (shared language)

  - **Value Stream:** The end‑to‑end flow of client value (WIN → DELIVER → COLLECT).  
  - **Atomic Unit:** The smallest meaningful chunk of work/decision we manage; where **one** Accountable (“A”) owns a controllable driver and evidence lives in a system of record.  
  - **Leading vs Lagging KPI:** *Leading* = controllable, managed weekly at units; *Lagging* = outcomes, judged monthly at streams/firm.  
  - **System of Record:** The application where the authoritative proof lives (CRM, PSA, ERP/Financials, HCM, CLM/Docs).  
  - **Misattribution:** Expected owner in the playbook differs from observed owner in reality; we fix the system, not the person.  
  - **Rollup:** The way unit‑level drivers aggregate to stream outcomes and then to firm outcomes (drivers → outcomes → EBITDA/Attrition).
