BEGIN;

-- Streams (top-level)
INSERT INTO stream (code,name,is_enabler,order_in_parent) VALUES
('WIN','Win Work',false,1),
('DELIVER','Deliver Work',false,2),
('COLLECT','Collect Cash',false,3),
('TALENT','Talent Engine',true,4),
('OPERATE','Operate Business',true,5);

-- SELL detailed phases (child streams under WIN)
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

-- 20 Atomic Units (top-level) – EXACT list you specified
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

-- SELL detail: fine-grained atomic units under child streams
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

-- Ensure a Legal role exists for contract execution
INSERT INTO org_role (code,name)
SELECT 'LEGAL','Legal Counsel'
WHERE NOT EXISTS (SELECT 1 FROM org_role WHERE code='LEGAL');

-- =========================
-- EXPECTED OWNERSHIP (Role + Org Unit)
-- =========================

-- WIN top-level 5
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WIN-01';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WIN-02';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WIN-03';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_SPEC'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL')
FROM atomic_unit u WHERE u.code='WIN-04';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='LEGAL'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WIN-05';

-- SELL detail (WINA-01..09)
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WINA-01';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PARTNER'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_CLIENT_REL'),
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WINA-02';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WINA-03';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WINA-04';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WINA-05';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WINA-06';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_SPEC'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL')
FROM atomic_unit u WHERE u.code='WINA-07';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='LEGAL'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WINA-08';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='COO'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       (SELECT role_id FROM org_role WHERE code='PM'),
       (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_PMO')
FROM atomic_unit u WHERE u.code='WINA-09';

-- DELIVER (5)
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='COO'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       (SELECT role_id FROM org_role WHERE code='PM'),(SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_PMO')
FROM atomic_unit u WHERE u.code='DEL-01';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       (SELECT role_id FROM org_role WHERE code='RESOURCE_MGR'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')
FROM atomic_unit u WHERE u.code='DEL-02';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='PM'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       (SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')
FROM atomic_unit u WHERE u.code='DEL-03';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='PM'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       (SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')
FROM atomic_unit u WHERE u.code='DEL-04';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='PM'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       (SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')
FROM atomic_unit u WHERE u.code='DEL-05';

-- COLLECT (3)
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='CONTROLLER'),(SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING'),
       NULL,NULL
FROM atomic_unit u WHERE u.code='COL-01';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='CONTROLLER'),(SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING'),
       NULL,NULL
FROM atomic_unit u WHERE u.code='COL-02';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='CFO'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_FINOPS'),
       NULL,NULL
FROM atomic_unit u WHERE u.code='COL-03';

-- TALENT (4)
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='HR_LEAD'),(SELECT org_unit_id FROM org_unit WHERE code='TALENT_HR'),
       (SELECT role_id FROM org_role WHERE code='SR_RECRUITER'),(SELECT org_unit_id FROM org_unit WHERE code='TALENT_RECRUITING')
FROM atomic_unit u WHERE u.code='TAL-01';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='HR_LEAD'),(SELECT org_unit_id FROM org_unit WHERE code='TALENT_HR'),
       NULL,NULL
FROM atomic_unit u WHERE u.code='TAL-02';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='HR_LEAD'),(SELECT org_unit_id FROM org_unit WHERE code='TALENT_HR'),
       NULL,NULL
FROM atomic_unit u WHERE u.code='TAL-03';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='HR_LEAD'),(SELECT org_unit_id FROM org_unit WHERE code='TALENT_HR'),
       NULL,NULL
FROM atomic_unit u WHERE u.code='TAL-04';

-- OPERATE (3)
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='CFO'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_FINOPS'),
       NULL,NULL
FROM atomic_unit u WHERE u.code='OPS-01';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='COO'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       NULL,NULL
FROM atomic_unit u WHERE u.code='OPS-02';

INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,(SELECT role_id FROM org_role WHERE code='CFO'),(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_FINOPS'),
       NULL,NULL
FROM atomic_unit u WHERE u.code='OPS-03';

-- =========================
-- SYSTEMS OF RECORD mapping
-- =========================
INSERT INTO system_of_record (code,name) VALUES
('CRM','Customer Relationship Management'),
('PSA','Professional Services Automation'),
('FIN','Financials / ERP'),
('HCM','Human Capital Management'),
('DOC','Document/CLM')
ON CONFLICT (code) DO NOTHING;

-- Top-level 20 units → systems
INSERT INTO unit_system (unit_id,sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u JOIN system_of_record s ON (
   (u.code like 'WIN-%' AND s.code='CRM') OR
   (u.code='WIN-04' AND s.code='DOC') OR
   (u.code='WIN-05' AND s.code='DOC') OR
   (u.code='WIN-03' AND s.code='PSA') OR
   (u.code like 'DEL-%' AND s.code='PSA') OR
   (u.code like 'COL-%' AND s.code='FIN') OR
   (u.code like 'TAL-%' AND s.code='HCM') OR
   (u.code like 'OPS-%' AND s.code='FIN')
);

-- SELL detail → systems
INSERT INTO unit_system (unit_id,sor_id)
SELECT u.unit_id, s.sor_id
FROM atomic_unit u JOIN system_of_record s ON (
   (u.code='WINA-01' AND s.code='CRM') OR
   (u.code='WINA-02' AND s.code='CRM') OR
   (u.code='WINA-03' AND s.code='CRM') OR
   (u.code='WINA-04' AND s.code='CRM') OR
   (u.code='WINA-05' AND s.code='CRM') OR
   (u.code='WINA-06' AND s.code='CRM') OR
   (u.code='WINA-06' AND s.code='PSA') OR
   (u.code='WINA-07' AND s.code='DOC') OR
   (u.code='WINA-08' AND s.code='DOC') OR
   (u.code='WINA-09' AND s.code='PSA')
);

COMMIT;
