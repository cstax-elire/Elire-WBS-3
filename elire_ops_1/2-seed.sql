BEGIN;

-- =========================
-- ORG UNITS (Pillars, Depts, COEs, Practices)
-- =========================

-- Pillars (top-level)
INSERT INTO org_unit (code,name,parent_id) VALUES
('PILLAR_LEADERSHIP','Leadership',NULL),
('PILLAR_CLIENT_REL','Client Relationships',NULL),
('PILLAR_SERVICE_EXEC','Service Execution',NULL),
('PILLAR_TALENT','Talent',NULL),
('PILLAR_FINOPS','Finance & Operations',NULL);

-- Leadership sub-unit for CEOs (optional container)
INSERT INTO org_unit (code,name,parent_id) VALUES
('LEADERSHIP_CEO','Co-CEOs',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_LEADERSHIP'));

-- Client Relationships departments
INSERT INTO org_unit (code,name,parent_id) VALUES
('CLIENT_SALES','Sales',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_CLIENT_REL')),
('CLIENT_MARKETING','Marketing',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_CLIENT_REL')),
('CLIENT_PROPOSAL','Proposal Management & Contracts',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_CLIENT_REL'));

-- Finance & Operations departments (and a small IT sub-unit)
INSERT INTO org_unit (code,name,parent_id) VALUES
('FINOPS_ACCOUNTING','Accounting',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_FINOPS')),
('FINOPS_IT','IT',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_FINOPS'));

-- Talent departments
INSERT INTO org_unit (code,name,parent_id) VALUES
('TALENT_HR','HR',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_TALENT')),
('TALENT_RECRUITING','Recruiting',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_TALENT'));

-- Service Execution COEs
INSERT INTO org_unit (code,name,parent_id) VALUES
('SE_COE_MAS','Management Advisory Services (MAS)',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')),
('SE_COE_EPM','EPM & Analytics COE',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')),
('SE_COE_CLOUD','Cloud Enterprise COE',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')),
('SE_COE_SOLN','Solution Center COE',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')),
('SE_COE_ONPREM','On Premise COE',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC')),
('SE_COE_TREASURY','Treasury COE',(SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'));

-- MAS practices
INSERT INTO org_unit (code,name,parent_id) VALUES
('SE_MAS_PMO','PMO',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_MAS')),
('SE_MAS_SAS','Strategic Advisory Services (SAS)',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_MAS'));

-- EPM practices
INSERT INTO org_unit (code,name,parent_id) VALUES
('SE_EPM_PLANNING','Planning & Analytics',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_EPM')),
('SE_EPM_CLOSE','Close & Consolidations',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_EPM'));

-- Cloud Enterprise practices
INSERT INTO org_unit (code,name,parent_id) VALUES
('SE_CLOUD_HCM','Cloud HCM',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_CLOUD')),
('SE_CLOUD_ERP','Cloud ERP',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_CLOUD')),
('SE_CLOUD_TECH','Cloud Technology',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_CLOUD'));

-- Solution Center practices
INSERT INTO org_unit (code,name,parent_id) VALUES
('SE_SOLN_MS','Managed Services',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_SOLN'));

-- On Premise practices
INSERT INTO org_unit (code,name,parent_id) VALUES
('SE_ONPREM_PSFT','PeopleSoft Practice',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_ONPREM'));

-- Treasury practices
INSERT INTO org_unit (code,name,parent_id) VALUES
('SE_TREASURY_KYRIBA','Kyriba SaaS Treasury',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_TREASURY')),
('SE_TREASURY_PSFT','PeopleSoft Treasury',(SELECT org_unit_id FROM org_unit WHERE code='SE_COE_TREASURY'));

-- =========================
-- ROLES
-- =========================
INSERT INTO org_role (code,name) VALUES
('CO_CEO','Co-CEO'),
('PARTNER','Partner'),
('ASSOC_PARTNER','Associate Partner'),
('DELIVERY_LEAD','Partner & Delivery Leader (COO)'),
('PRACTICE_LEAD','Practice Lead'),
('PMO_LEAD','PMO Lead'),
('SALES_DIR','Sales Director'),
('SALES_REP','Sales / BDR / Inside Sales'),
('MKTG_DIR','Marketing Director'),
('MKTG_SPEC','Marketing Specialist'),
('PROPOSAL_MGR','Proposal Manager'),
('PROPOSAL_SPEC','Proposal Specialist'),
('HR_LEAD','Director of HR'),
('SR_RECRUITER','Senior Recruiter'),
('DIR_ACCOUNTING','Director of Accounting'),
('STAFF_ACCOUNTANT','Staff Accountant'),
('IT_RESOURCE','IT Resource'),
('PM','Project Manager'),
('CONSULTANT','Consultant');

-- =========================
-- PEOPLE (Named)
-- =========================

-- Leadership
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Grant (Co-CEO)', (SELECT role_id FROM org_role WHERE code='CO_CEO'), (SELECT org_unit_id FROM org_unit WHERE code='LEADERSHIP_CEO')),
('Michael (Co-CEO)', (SELECT role_id FROM org_role WHERE code='CO_CEO'), (SELECT org_unit_id FROM org_unit WHERE code='LEADERSHIP_CEO'));

-- Client Relationships
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Friend (Sales Director)', (SELECT role_id FROM org_role WHERE code='SALES_DIR'), (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')),
('Maske (Sales Director)', (SELECT role_id FROM org_role WHERE code='SALES_DIR'), (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')),
('Landon (Partner - Oversees Marketing & Proposal/Contracts)', (SELECT role_id FROM org_role WHERE code='PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_CLIENT_REL')),
('Maddie (Marketing Director)', (SELECT role_id FROM org_role WHERE code='MKTG_DIR'), (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_MARKETING')),
('Tim (Proposal Manager)', (SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'), (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL')),
('Jake (Proposal Specialist)', (SELECT role_id FROM org_role WHERE code='PROPOSAL_SPEC'), (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_PROPOSAL'));

-- Finance & Operations
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Tavia (Director of Accounting)', (SELECT role_id FROM org_role WHERE code='DIR_ACCOUNTING'), (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING'));

-- Talent
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Surma (Director of HR)', (SELECT role_id FROM org_role WHERE code='HR_LEAD'), (SELECT org_unit_id FROM org_unit WHERE code='TALENT_HR'));

-- Service Execution Leadership
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Richard (Partner & Delivery Leader)', (SELECT role_id FROM org_role WHERE code='DELIVERY_LEAD'), (SELECT org_unit_id FROM org_unit WHERE code='PILLAR_SERVICE_EXEC'));

-- MAS Leaders
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Edmund (PMO Lead)', (SELECT role_id FROM org_role WHERE code='PMO_LEAD'), (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_PMO')),
('Stephen (SAS Lead)', (SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'), (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_SAS'));

-- Cloud Enterprise Leaders
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Chris (Partner - COE Lead Cloud Enterprise)', (SELECT role_id FROM org_role WHERE code='PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_COE_CLOUD')),
('John (Associate Partner - Cloud HCM Lead)', (SELECT role_id FROM org_role WHERE code='ASSOC_PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_CLOUD_HCM')),
('Jason (Associate Partner - Cloud ERP Lead)', (SELECT role_id FROM org_role WHERE code='ASSOC_PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_CLOUD_ERP')),
('Arjun (Partner - Cloud Technology Lead)', (SELECT role_id FROM org_role WHERE code='PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_CLOUD_TECH'));

-- Solution Center Leader
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Brian (Partner - Solution Center Lead)', (SELECT role_id FROM org_role WHERE code='PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_COE_SOLN'));

-- On Premise Leaders
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Jeff (Partner - On Premise COE Lead)', (SELECT role_id FROM org_role WHERE code='PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_COE_ONPREM')),
('Ryan (PeopleSoft Practice Lead)', (SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'), (SELECT org_unit_id FROM org_unit WHERE code='SE_ONPREM_PSFT'));

-- EPM & Analytics Leaders
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Ed (Partner - EPM COE Lead)', (SELECT role_id FROM org_role WHERE code='PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_COE_EPM')),
('Alex (Partner - Planning & Analytics Lead)', (SELECT role_id FROM org_role WHERE code='PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_EPM_PLANNING')),
('Scott (Partner - Close & Consolidations Lead)', (SELECT role_id FROM org_role WHERE code='PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_EPM_CLOSE'));

-- Treasury Leaders
INSERT INTO person (full_name, role_id, org_unit_id) VALUES
('Carlos (Partner - Treasury COE Lead)', (SELECT role_id FROM org_role WHERE code='PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_COE_TREASURY')),
('Abdel (Kyriba SaaS Treasury Lead)', (SELECT role_id FROM org_role WHERE code='PRACTICE_LEAD'), (SELECT org_unit_id FROM org_unit WHERE code='SE_TREASURY_KYRIBA')),
('Al (Partner - PeopleSoft Treasury Lead)', (SELECT role_id FROM org_role WHERE code='PARTNER'), (SELECT org_unit_id FROM org_unit WHERE code='SE_TREASURY_PSFT'));

-- =========================
-- PEOPLE (Anonymous – to match staff counts)
-- =========================

-- Client Relationships: Sales total = 11 (include Friend & Maske), add 9 staff
INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'Sales_Rep_' || i, (SELECT role_id FROM org_role WHERE code='SALES_REP'), (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_SALES')
FROM generate_series(1,9) AS g(i);

-- Client Relationships: Marketing total = 3 (include Maddie), add 2 specialists
INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'Marketing_Specialist_' || i, (SELECT role_id FROM org_role WHERE code='MKTG_SPEC'), (SELECT org_unit_id FROM org_unit WHERE code='CLIENT_MARKETING')
FROM generate_series(1,2) AS g(i);

-- Client Relationships: Proposal Mgmt total = 2 (Tim + Jake already cover the 2) → no anon needed

-- Finance & Ops: total = 6 (Tavia + 4 Staff Accountants + 1 IT)
INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'Staff_Accountant_' || i, (SELECT role_id FROM org_role WHERE code='STAFF_ACCOUNTANT'), (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_ACCOUNTING')
FROM generate_series(1,4) AS g(i);

INSERT INTO person (full_name, role_id, org_unit_id)
VALUES ('IT_Resource_1', (SELECT role_id FROM org_role WHERE code='IT_RESOURCE'), (SELECT org_unit_id FROM org_unit WHERE code='FINOPS_IT'));

-- Talent: total = 2 (Surma + Senior Recruiter)
INSERT INTO person (full_name, role_id, org_unit_id)
VALUES ('Senior_Recruiter_1', (SELECT role_id FROM org_role WHERE code='SR_RECRUITER'), (SELECT org_unit_id FROM org_unit WHERE code='TALENT_RECRUITING'));

-- MAS practices: PMO = 3 (Edmund + 2), SAS = 4 (Stephen + 3)
INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'PMO_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_PMO')
FROM generate_series(1,2) AS g(i);

INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'SAS_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_MAS_SAS')
FROM generate_series(1,3) AS g(i);

-- Cloud Enterprise practices: HCM=14 (John +13), ERP=8 (Jason +7), Tech=4 (Arjun +3)
INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'Cloud_HCM_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_CLOUD_HCM')
FROM generate_series(1,13) AS g(i);

INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'Cloud_ERP_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_CLOUD_ERP')
FROM generate_series(1,7) AS g(i);

INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'Cloud_Tech_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_CLOUD_TECH')
FROM generate_series(1,3) AS g(i);

-- Solution Center: Managed Services = 5 consultants (Brian at COE level)
INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'Managed_Services_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_SOLN_MS')
FROM generate_series(1,5) AS g(i);

-- On Premise: PeopleSoft = 7 (Ryan +6)
INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'PeopleSoft_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_ONPREM_PSFT')
FROM generate_series(1,6) AS g(i);

-- EPM practices: Planning=4 (Alex +3), Close=5 (Scott +4)
INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'EPM_Planning_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_EPM_PLANNING')
FROM generate_series(1,3) AS g(i);

INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'EPM_Close_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_EPM_CLOSE')
FROM generate_series(1,4) AS g(i);

-- Treasury practices: Kyriba=4 (Abdel +3), PSFT Treasury=2 (Al +1)
INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'Kyriba_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_TREASURY_KYRIBA')
FROM generate_series(1,3) AS g(i);

INSERT INTO person (full_name, role_id, org_unit_id)
SELECT 'PSFT_Treasury_Consultant_' || i, (SELECT role_id FROM org_role WHERE code='CONSULTANT'), (SELECT org_unit_id FROM org_unit WHERE code='SE_TREASURY_PSFT')
FROM generate_series(1,1) AS g(i);

COMMIT;
