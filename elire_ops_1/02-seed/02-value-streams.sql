-- ==============================
-- Value Streams, Atomic Units, and Systems Seed Data
-- ==============================

BEGIN;

-- =========================
-- STREAMS (Top-level)
-- =========================
INSERT INTO stream (code,name,is_enabler,order_in_parent) VALUES
('WIN','Win Work',false,1),
('DELIVER','Deliver Work',false,2),
('EXPAND','Expand Existing Clients',false,3),  -- Added from 7-updates.sql
('COLLECT','Collect Cash',false,4),
('TALENT','Talent Engine',true,5),
('OPERATE','Operate Business',true,6);

-- =========================
-- SELL Sub-streams (under WIN)
-- =========================
INSERT INTO stream (code,name,parent_id,order_in_parent) VALUES
('WIN_LEAD','Lead & Targeting',(SELECT stream_id FROM stream WHERE code='WIN'),1),
('WIN_REGISTER','Partner Deal Registration',(SELECT stream_id FROM stream WHERE code='WIN'),2),
('WIN_TRIAGE','Lead Triage & Routing',(SELECT stream_id FROM stream WHERE code='WIN'),3),
('WIN_QUALIFY','Opportunity Qualification',(SELECT stream_id FROM stream WHERE code='WIN'),4),
('WIN_OUTLINE','Solution Outline & Effort',(SELECT stream_id FROM stream WHERE code='WIN'),5),
('WIN_PRICE','Pricing & Guardrails',(SELECT stream_id FROM stream WHERE code='WIN'),6),
('WIN_PROPOSAL','Proposal Development',(SELECT stream_id FROM stream WHERE code='WIN'),7),
('WIN_NEGOTIATE','Negotiation & Redlines',(SELECT stream_id FROM stream WHERE code='WIN'),8),
('WIN_HANDOFF','Close-Won → Handoff',(SELECT stream_id FROM stream WHERE code='WIN'),9);

-- =========================
-- ATOMIC UNITS - Top Level (20 Core Units)
-- =========================

-- WIN (5)
INSERT INTO atomic_unit (stream_id, code, name, order_in_stream, description)
SELECT s.stream_id, x.code, x.name, x.ord, x.descr
FROM stream s
JOIN (VALUES
 ('WIN-01','Lead Qualification (MQL→SQL decision)',1,'Decide if lead is worth pursuit (ICP fit + intent + speed).'),
 ('WIN-02','Discovery & Solutioning (understand need)',2,'Frame the client problem and sketch solution boundaries.'),
 ('WIN-03','Pricing & Margin Decision (set terms)',3,'Set price & margin; approve/deny discounts within guardrails.'),
 ('WIN-04','Proposal Development (create offer)',4,'Assemble a compliant, reusable proposal/SOW.'),
 ('WIN-05','Contract Execution (close deal)',5,'Negotiate & sign MSA/SOW with clear acceptance/risks.')
) as x(code,name,ord,descr)
ON s.code='WIN';

-- DELIVER (5)
INSERT INTO atomic_unit (stream_id, code, name, order_in_stream, description)
SELECT s.stream_id, x.code, x.name, x.ord, x.descr
FROM stream s
JOIN (VALUES
 ('DEL-01','Project Handoff (sales→delivery)',1,'Complete handoff: risks, assumptions, staffing signal.'),
 ('DEL-02','Resource Assignment (match skills)',2,'Assign named resources with right skills and timing.'),
 ('DEL-03','Milestone Delivery (hit dates)',3,'Deliver milestones predictably with visibility.'),
 ('DEL-04','Scope/Change Management (control creep)',4,'Capture and monetize scope deltas with discipline.'),
 ('DEL-05','Project Closure (get sign-off)',5,'Formal client acceptance; lessons learned; reference.')
) as x(code,name,ord,descr)
ON s.code='DELIVER';

-- EXPAND (3) - From 7-updates.sql
INSERT INTO atomic_unit (stream_id, code, name, order_in_stream, description)
SELECT s.stream_id, x.code, x.name, x.ord, x.descr
FROM stream s 
JOIN (VALUES
  ('EXP-01','Cross-sell Plays',1,'Bundle complementary modules; present ROI case.'),
  ('EXP-02','Upsell Success',2,'Grow footprint/tiers with outcome-based offers.'),
  ('EXP-03','Advocacy & References',3,'Create references, case studies, CAB participation.')
) AS x(code,name,ord,descr)
ON s.code='EXPAND';

-- COLLECT (3)
INSERT INTO atomic_unit (stream_id, code, name, order_in_stream, description)
SELECT s.stream_id, x.code, x.name, x.ord, x.descr
FROM stream s
JOIN (VALUES
 ('COL-01','Invoice Generation (bill correctly)',1,'Accurate, on-time invoices with backup.'),
 ('COL-02','Collections (get payment)',2,'Collect cash; resolve disputes; escalate as needed.'),
 ('COL-03','Revenue Recognition (book it)',3,'Recognize revenue per policy; audit-ready.')
) as x(code,name,ord,descr)
ON s.code='COLLECT';

-- TALENT (4)
INSERT INTO atomic_unit (stream_id, code, name, order_in_stream, description)
SELECT s.stream_id, x.code, x.name, x.ord, x.descr
FROM stream s
JOIN (VALUES
 ('TAL-01','Recruiting (find people)',1,'Open reqs; source candidates; extend offers.'),
 ('TAL-02','Onboarding (make productive)',2,'Access, training, buddy, first assignment.'),
 ('TAL-03','Development (grow skills/certs)',3,'Certifications, skilling plans, coverage.'),
 ('TAL-04','Retention (keep performers)',4,'Engagement, mobility, burnout prevention.')
) as x(code,name,ord,descr)
ON s.code='TALENT';

-- OPERATE (3)
INSERT INTO atomic_unit (stream_id, code, name, order_in_stream, description)
SELECT s.stream_id, x.code, x.name, x.ord, x.descr
FROM stream s
JOIN (VALUES
 ('OPS-01','Planning & Forecasting (predict future)',1,'90-day rolling plan across CRM/PSA/FIN/HCM.'),
 ('OPS-02','Performance Management (track/improve)',2,'Weekly/Monthly/Quarterly rhythm with decisions.'),
 ('OPS-03','Risk & Compliance (stay safe)',3,'Risk register; controls; audit readiness.')
) as x(code,name,ord,descr)
ON s.code='OPERATE';

-- =========================
-- SELL DETAIL UNITS (under WIN sub-streams)
-- =========================
INSERT INTO atomic_unit (stream_id, code, name, order_in_stream, description)
SELECT s.stream_id, x.code, x.name, x.ord, x.descr
FROM stream s
JOIN (VALUES
 ('WINA-01','Target Accounts & Market Focus',1,'Quarterly target list; ICP; segmentation.'),
 ('WINA-02','Partner Deal Registration',1,'Register opportunities; define rules of engagement.'),
 ('WINA-03','Lead Triage & Routing',1,'Classify/rout leads within SLA; enrich.'),
 ('WINA-04','MEDDPICC/BANT Qualification',1,'Complete qualification; go/no-go gate.'),
 ('WINA-05','Solution Outline (2–6 pages)',1,'Client-validated approach; ±20–30% effort band.'),
 ('WINA-06','Discount Decision within Guardrails',1,'Approve/deny exceptions; log cycle time & rationale.'),
 ('WINA-07','Proposal/SOW Assembly',1,'Use approved content; minimize redlines.'),
 ('WINA-08','Negotiation & Redlines',1,'Balance risk; tighten acceptance criteria.'),
 ('WINA-09','Close-Won → Delivery Handoff',1,'Formal handoff; risk register; staffing pre-plan.')
) as x(code,name,ord,descr)
ON s.code IN ('WIN_LEAD','WIN_REGISTER','WIN_TRIAGE','WIN_QUALIFY','WIN_OUTLINE','WIN_PRICE','WIN_PROPOSAL','WIN_NEGOTIATE','WIN_HANDOFF')
AND (
   (s.code='WIN_LEAD'      AND x.code='WINA-01') OR
   (s.code='WIN_REGISTER'  AND x.code='WINA-02') OR
   (s.code='WIN_TRIAGE'    AND x.code='WINA-03') OR
   (s.code='WIN_QUALIFY'   AND x.code='WINA-04') OR
   (s.code='WIN_OUTLINE'   AND x.code='WINA-05') OR
   (s.code='WIN_PRICE'     AND x.code='WINA-06') OR
   (s.code='WIN_PROPOSAL'  AND x.code='WINA-07') OR
   (s.code='WIN_NEGOTIATE' AND x.code='WINA-08') OR
   (s.code='WIN_HANDOFF'   AND x.code='WINA-09')
);

-- =========================
-- UNIT HIERARCHY LINKS (WIN to SELL detail)
-- =========================
INSERT INTO unit_hierarchy_link (parent_unit_id, child_unit_id)
SELECT p.unit_id, c.unit_id
FROM atomic_unit p, atomic_unit c
WHERE (p.code, c.code) IN (
  ('WIN-01','WINA-01'),   -- Lead Qualification → Target Accounts
  ('WIN-01','WINA-02'),   -- Lead Qualification → Partner Registration
  ('WIN-01','WINA-03'),   -- Lead Qualification → Triage & Routing
  ('WIN-01','WINA-04'),   -- Lead Qualification → MEDDPICC/BANT
  ('WIN-02','WINA-05'),   -- Discovery → Solution Outline
  ('WIN-03','WINA-06'),   -- Pricing → Discount Decision
  ('WIN-04','WINA-07'),   -- Proposal → Proposal Assembly
  ('WIN-05','WINA-08'),   -- Contract → Negotiation
  ('WIN-05','WINA-09')    -- Contract → Handoff
);

-- =========================
-- SYSTEMS OF RECORD
-- =========================
INSERT INTO system_of_record (code, name) VALUES
('CRM','Customer Relationship Management'),
('PSA','Professional Services Automation'),
('FIN','Financial System'),
('HCM','Human Capital Management'),
('DOC','Document Management'),
('UI','User Interface');

-- =========================
-- UNIT-SYSTEM MAPPINGS
-- =========================

-- WIN units → CRM primary, DOC for proposals/contracts
INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code LIKE 'WIN-%' AND s.code IN ('CRM');

-- Add DOC for proposal and contract units
INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code IN ('WIN-04','WIN-05') AND s.code = 'DOC';

-- Add PSA for pricing
INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code = 'WIN-03' AND s.code = 'PSA';

-- DELIVER units → PSA
INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code LIKE 'DEL-%' AND s.code = 'PSA';

-- EXPAND units → CRM and DOC
INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code IN ('EXP-01','EXP-02','EXP-03') 
  AND s.code IN ('CRM','DOC');

-- COLLECT units → FIN
INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code LIKE 'COL-%' AND s.code = 'FIN';

-- TALENT units → HCM
INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code LIKE 'TAL-%' AND s.code = 'HCM';

-- OPERATE units → FIN (and PSA for planning)
INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code LIKE 'OPS-%' AND s.code = 'FIN';

INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code = 'OPS-01' AND s.code IN ('CRM','PSA','HCM');

-- SELL detail units → same as parent WIN units
INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code LIKE 'WINA-%' AND s.code = 'CRM';

INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code IN ('WINA-07','WINA-08','WINA-09') AND s.code = 'DOC';

INSERT INTO unit_system (unit_id, sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u, system_of_record s
WHERE u.code IN ('WINA-05','WINA-06') AND s.code = 'PSA';

COMMIT;