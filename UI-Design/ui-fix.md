## **Pass/Fail (at a glance)**





**Fail (blocker).** The current UI violates the **View Contracts**, has **status logic contradictions** that corrupt summaries and filters, and the **edit flow** cannot persist valid observed ownership (wrong endpoint/payload). KPI/Finance/Evidence UIs are stubs, so key invariants are not surfaced. Details and precise fixes below.



------





## **How the implementation stacks up against the Ground‑Truth Invariants**







### **1) Ownership Truth Model (Expected vs Observed; append‑only; latest wins)**





- **Append‑only & latest‑wins are implemented in SQL**:

  

  - unit_observed_ownership is **insert‑only**; latest row is chosen via DISTINCT ON … ORDER BY observed_as_of DESC. This is used inside v_rosetta_truth.  

  

- **UI edit flow is broken** (cannot reliably persist):

  

  - StreamDetailView posts to /api/observed with **free‑text** role and org strings. There is **no** /api/observed route in the repo; the implemented endpoint is /api/observed-ownership and it expects **IDs** (accountable_role_id, accountable_org_unit_id) with allow‑listed/validated body. Result: edits won’t persist or will 400.  

  





**Verdict:** Data model is right; **UI write path is wrong** (critical).



------





### **2) Evidence Logging (every change; subject/type; actor; idempotency)**





- **POST /api/observed-ownership** **does log evidence** (subject = OBS_{obs_id}, type = ownership_update). Good. 
- **Actor not captured** on that write. evidence_log supports actor_person_id, actor_role_id, org_unit_id, and there’s an idempotency index option on (unit_id, subject_ref, evidence_type), but the API does **not** pass actor fields or accept an idempotency token. This misses the invariant (“actor, idempotency”).  





**Verdict:** **Partial**. Evidence rows exist, but missing **actor attribution** and **idempotency control** from the UI/API.



------





### **3) View Contracts (UI** 

### **must**

###  **read only views:** 

### **v_org_tree**

### **,** 

### **v_stream_tree**

### **,** 

### **v_rosetta_truth**

### **/**

### **v_misattribution_delta**

### **,** 

### **v_observed_from_evidence**

### **,** 

### **v_financial_rollup(_with_sga)**

### **)**





- The repo **claims** the UI reads only views. 

- **But implemented pages & APIs frequently hit raw tables**:

  

  - /stream/[code] page selects directly from atomic_unit, unit_expected_ownership, and LATERAL into unit_observed_ownership (raw tables). 
  - /streams page and its API query raw stream, atomic_unit, and unit_observed_ownership instead of v_stream_tree (and only optionally joins v_ownership_summary).  
  - GET /api/observed-ownership reads unit_observed_ownership directly for the latest record. **No view.** 
  - Truth page endpoint does call a **function** get_rosetta_truth_page (not a view); the function itself reads v_rosetta_truth. This is *close* but still not “views‑only”.  

  





**Verdict:** **Fail**. Multiple pages breach the “views‑only” contract.



------





### **4) Status Rules (Aligned / Misattributed / Not Observed)**





- **v_rosetta_truth emits only Aligned, Misattributed, Not Observed** (single “Misattributed”). 

- **UI & summary logic assume Role Mismatch and Org Mismatch**:

  

  - get_rosetta_truth_page maps the **Misattributed filter** to status IN ('Role Mismatch','Org Mismatch') — impossible with v_rosetta_truth → filter yields zero. 
  - v_ownership_summary counts misattributed_count as status IN ('Role Mismatch','Org Mismatch') while reading v_rosetta_truth. That will be **0** even when rows are “Misattributed”. 
  - The StatusBadge supports both “Misattributed” *and* “Role/Org Mismatch”, reflecting this inconsistency. 

  





**Verdict:** **Fail** (logic contradiction). Either change v_rosetta_truth to emit Role/Org breakdown *or* change UI + v_ownership_summary to treat “Misattributed” as a single state.



------





### **5) Truth Row Fallback (fallback to** 

### **v_misattribution_delta**

###  **if** 

### **v_rosetta_truth**

###  **missing)**





- No fallback observed in the API or component code; all pagination/summary paths assume v_rosetta_truth exists.  
- v_misattribution_delta **does** produce the finer states (Role/Org mismatch) — but the UI isn’t using it. 





**Verdict:** **Fail** (unimplemented fallback).



------





### **6) KPI Aggregations (SUM, RATIO_OF_SUMS, WEIGHTED_AVG — clear & traceable)**





- The **views** exist to support KPI/outcome rollups (v_stream_rollup, v_kpi_rollup) but the **UI pages are stubs** (/kpis Coming Soon). No surface for SUM/RATIO_OF_SUMS/WEIGHTED_AVG with traceability.  





**Verdict:** **Missing** (functional gap).



------





### **7) Security Guardrails (allow‑list, validated inputs)**





- **Good**: /api/observed-ownership uses Zod schema + explicit allowlist + FK validation, and logs evidence. 
- **But**: the *client* edit path (Stream page) isn’t wired to this route nor to IDs, so validations never trigger; also other modifying routes (e.g., KPI, Evidence) are not implemented yet.  





**Verdict:** **Partial**. Server guardrail OK where implemented; client wiring missing.



------





## **Critical Bugs (blockers)**





1. **Status mismatch corrupts filters and summaries**

   

   - get_rosetta_truth_page treats “Misattributed” as (Role Mismatch,Org Mismatch) while v_rosetta_truth only emits “Misattributed” (single). This will make the “Misattributed” filter show **no rows** and set **misattributed_count to 0** in summaries.

     Fix: either (A) change status logic everywhere to “Misattributed” (single), or (B) swap to v_misattribution_delta (rename attribution_status → status) and keep Role/Org detail.   

   

2. **Edit flow is pointed at the wrong endpoint with wrong payload**

   

   - Client posts to /api/observed with string values, but only /api/observed-ownership exists and expects **IDs**. Evidence: StreamDetailView vs API route.

     Fix: use dropdowns (sourced from v_role_options, v_org_options) that submit accountable_role_id/accountable_org_unit_id to /api/observed-ownership.   

   

3. **View Contract violation** (reads raw tables)

   

   - /stream/[code], /streams, and GET /api/observed-ownership hit raw tables instead of the published views. This undermines stability and “latest wins” guarantees.   

   

4. **No fallback to v_misattribution_delta**

   

   - If v_rosetta_truth changes or fails, the truth page dies. Add fallback to keep UI robust as schema evolves.  

   





------





## **Functional Gaps**





- **Evidence UI** (proof browsing & filters) is a placeholder; not consuming v_observed_from_evidence.  
- **KPI UI** (targets, measurements, cascade & rollups) is a placeholder; no surfacing of SUM/RATIO_OF_SUMS/WEIGHTED_AVG semantics. 
- **Finance UI** is a placeholder; not consuming v_financial_rollup/v_financial_rollup_with_sga. 
- **Ownership option dropdowns** for edits are missing; typing raw strings leads to invalid writes. (Use v_role_options, v_org_options.) 





------





## **Schema / UI Misalignments**





- **Status taxonomy**:

  

  - v_rosetta_truth → Misattributed (single).
  - v_misattribution_delta → Role Mismatch / Org Mismatch / Not Observed / Aligned.
  - UI & v_ownership_summary assume the **delta taxonomy** while sourcing v_rosetta_truth. **Pick one taxonomy and align all consumers.**   

  

- **Observed edit payload**: UI sends strings; API expects numeric FKs. Use the helper views for dropdowns to submit IDs.   





------





## **Design Flaws (beauty, clarity, proof)**





- **Proof of attribution not visible** on Truth screen (no side‑panel or drill to v_observed_from_evidence). You say “Evidence everywhere”, but the UI page is coming soon — no way to *show* the receipts inline.  
- **Navigation promises** (Org/KPIs/Finance/Evidence) lead to “Coming Soon” cards — elegant visually, but they conceal required invariants (KPI math, finance rollups, proof browsing). 
- **Streams page metrics** use raw joins and “ownership coverage” logic that indicates *existence* of any observation, not the “latest wins” truth via views. This erodes conceptual clarity. 





------





## **Recommendations (where to fix: UI, DB, or both)**







### **A. Normalize the status model (**

### **DB + UI**

### **)**





Option 1 — **Single status** in truth:



- Keep v_rosetta_truth returning **Aligned / Misattributed / Not Observed**.
- Change get_rosetta_truth_page filter and v_ownership_summary to count/filter **status = 'Misattributed'** (not Role/Org).  





Option 2 — **Richer status** everywhere:



- Switch Truth table to source from **v_misattribution_delta** (rename attribution_status → status) so you can display Role Mismatch vs Org Mismatch. Update get_rosetta_truth_page and v_ownership_summary accordingly. 





> Pick one, apply across API, SQL helpers, StatusBadge, and summaries. Don’t mix.





### **B. Fix the edit flow (**

### **UI**

### **)**





- Replace free‑text inputs with **dropdowns** bound to v_role_options and v_org_options, and post to /api/observed-ownership with **IDs**. Add optimistic update, then refresh the single truth row or page.  
- Add **actor capture** to the evidence log (single‑user → hardcode actor for now, but keep the fields). Allow an optional **idempotency key** (subject_ref) in the POST body and use the ux_evidence_natural uniqueness to dedupe. 







### **C. Honor the views‑only contract (**

### **UI**

### **)**





- Refactor reads to **views only**:

  

  - Streams: switch to v_stream_tree or a stream summary view; enrich with v_ownership_summary.

  - Stream detail: use v_rosetta_truth (or v_misattribution_delta if adopting Option 2) filtered by stream_code.

  - Observed GET: introduce a v_latest_observed (or rely on truth view fields) instead of hitting the base table.

    Evidence page should use v_observed_from_evidence.  

  







### **D. Implement truth fallback (**

### **UI**

### **)**





- In /api/truth/paginated, **try** get_rosetta_truth_page first; if it errors (view absent), **fallback** to a get_misattribution_delta_page function or a simple select from v_misattribution_delta with compatible columns.  







### **E. Surface KPI math & finance (**

### **UI**

### **)**





- Build /kpis to show, per KPI, the aggregation type (**SUM / RATIO_OF_SUMS / WEIGHTED_AVG**) and the exact rollup path; include “show SQL” or “explain card” for traceability.
- Build /finance to toggle **direct vs allocated** using v_financial_rollup vs v_financial_rollup_with_sga.  





------





## **Usability Gaps (quick hits)**





- **Seeded data not fully editable** due to the broken observed edit path. (Fix B.) 
- **Ownership rules not self‑explaining**: add a help popover in Truth clarifying the status taxonomy you standardize on (“how is ‘Misattributed’ computed?”).
- **Rollups hidden**: show the Ownership Summary card above the Truth grid (already present) and link counts to pre‑filtered views (e.g., click “Misattributed 7” → opens table filter). (Partially present; verify after status fix.)





------





## **Final Judgment**





- **Critical Bugs:** Status contradictions; broken edit endpoint/payload; views‑only contract violations; missing truth fallback. (Blockers.)
- **Functional Gaps:** Evidence/KPI/Finance UIs not implemented; no KPI aggregation transparency.
- **Schema/UI Misalignments:** Status taxonomy; edit payload types.
- **Design Flaws:** Proof not visible on Truth; nav leads to stubs for invariants‑critical areas.





**Conclusion: Fail** — Do **not** proceed until the above are addressed. The fastest path to green:



1. **Unify status model** (DB+UI) and fix get_rosetta_truth_page/v_ownership_summary.   
2. **Fix edit flow** to /api/observed-ownership with **ID dropdowns** (role/org). Capture **actor** in evidence.   
3. **Refactor reads to views only** across Streams/Detail/Observed GET. Add **truth fallback** to v_misattribution_delta.   
4. **Ship minimal Evidence view** against v_observed_from_evidence; **then** bring KPI & Finance out of “Coming Soon” using existing views.  