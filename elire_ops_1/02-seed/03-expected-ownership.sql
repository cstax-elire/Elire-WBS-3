-- ==============================
-- Expected Ownership Assignments
-- ==============================

BEGIN;

-- =========================
-- WIN Units - Expected Ownership
-- =========================

-- WIN-01: Lead Qualification
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WIN-01';

-- WIN-02: Discovery & Solutioning
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WIN-02';

-- WIN-03: Pricing & Margin Decision
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WIN-03';

-- WIN-04: Proposal Development
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_SPEC'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL')
FROM atomic_unit u WHERE u.code='WIN-04';

-- WIN-05: Contract Execution
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='LEGAL'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WIN-05';

-- =========================
-- DELIVER Units - Expected Ownership
-- =========================

-- DEL-01: Project Handoff
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='DELIVERY_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       (SELECT role_id FROM org_role WHERE code='PM'),
       (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_PMO')
FROM atomic_unit u WHERE u.code='DEL-01';

-- DEL-02: Resource Assignment
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='DELIVERY_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'),
       (SELECT role_id FROM org_role WHERE code='PM'),
       (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_PMO')
FROM atomic_unit u WHERE u.code='DEL-02';

-- DEL-03: Milestone Delivery
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PM'),
       (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_PMO'),
       (SELECT role_id FROM org_role WHERE code='CONSULTANT'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')
FROM atomic_unit u WHERE u.code='DEL-03';

-- DEL-04: Scope/Change Management
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PM'),
       (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_PMO'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='DEL-04';

-- DEL-05: Project Closure
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PM'),
       (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_PMO'),
       (SELECT role_id FROM org_role WHERE code='CONSULTANT'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')
FROM atomic_unit u WHERE u.code='DEL-05';

-- =========================
-- EXPAND Units - Expected Ownership
-- =========================

INSERT INTO unit_expected_ownership (unit_id, accountable_role_id, accountable_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u 
WHERE u.code IN ('EXP-01','EXP-02','EXP-03');

-- =========================
-- COLLECT Units - Expected Ownership
-- =========================

-- COL-01: Invoice Generation
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='DIR_ACCOUNTING'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING'),
       (SELECT role_id FROM org_role WHERE code='STAFF_ACCOUNTANT'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING')
FROM atomic_unit u WHERE u.code='COL-01';

-- COL-02: Collections
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='DIR_ACCOUNTING'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING'),
       (SELECT role_id FROM org_role WHERE code='STAFF_ACCOUNTANT'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING')
FROM atomic_unit u WHERE u.code='COL-02';

-- COL-03: Revenue Recognition
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='DIR_ACCOUNTING'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING'),
       (SELECT role_id FROM org_role WHERE code='STAFF_ACCOUNTANT'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING')
FROM atomic_unit u WHERE u.code='COL-03';

-- =========================
-- TALENT Units - Expected Ownership
-- =========================

-- TAL-01: Recruiting
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='HR_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='TALENT_HR'),
       (SELECT role_id FROM org_role WHERE code='SR_RECRUITER'),
       (SELECT org_unit_id FROM org_unit WHERE code='TALENT_RECRUITING')
FROM atomic_unit u WHERE u.code='TAL-01';

-- TAL-02: Onboarding
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='HR_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='TALENT_HR'),
       (SELECT role_id FROM org_role WHERE code='HR_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='TALENT_HR')
FROM atomic_unit u WHERE u.code='TAL-02';

-- TAL-03: Development
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='HR_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='TALENT_HR'),
       (SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')
FROM atomic_unit u WHERE u.code='TAL-03';

-- TAL-04: Retention
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='HR_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='TALENT_HR'),
       (SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'),
       (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')
FROM atomic_unit u WHERE u.code='TAL-04';

-- =========================
-- OPERATE Units - Expected Ownership
-- =========================

-- OPS-01: Planning & Forecasting
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='DIR_ACCOUNTING'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING'),
       (SELECT role_id FROM org_role WHERE code='STAFF_ACCOUNTANT'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING')
FROM atomic_unit u WHERE u.code='OPS-01';

-- OPS-02: Performance Management
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='CO_CEO'),
       (SELECT org_unit_id FROM org_unit WHERE code='LEADERSHIP_CEO'),
       (SELECT role_id FROM org_role WHERE code='DIR_ACCOUNTING'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING')
FROM atomic_unit u WHERE u.code='OPS-02';

-- OPS-03: Risk & Compliance
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='DIR_ACCOUNTING'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING'),
       (SELECT role_id FROM org_role WHERE code='STAFF_ACCOUNTANT'),
       (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING')
FROM atomic_unit u WHERE u.code='OPS-03';

-- =========================
-- SELL Detail Units - Expected Ownership (same as parent WIN units)
-- =========================

-- WINA-01, WINA-02, WINA-03, WINA-04: Lead/Qualification phases
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code IN ('WINA-01','WINA-02','WINA-03','WINA-04');

-- WINA-05: Solution Outline
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WINA-05';

-- WINA-06: Discount Decision
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='SALES_DIR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code='WINA-06';

-- WINA-07: Proposal/SOW Assembly
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='PROPOSAL_SPEC'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL')
FROM atomic_unit u WHERE u.code='WINA-07';

-- WINA-08, WINA-09: Negotiation and Handoff
INSERT INTO unit_expected_ownership (unit_id,accountable_role_id,accountable_org_unit_id,responsible_role_id,responsible_org_unit_id)
SELECT u.unit_id,
       (SELECT role_id FROM org_role WHERE code='LEGAL'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'),
       (SELECT role_id FROM org_role WHERE code='SALES_REP'),
       (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM atomic_unit u WHERE u.code IN ('WINA-08','WINA-09');

COMMIT;