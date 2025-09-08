BEGIN;

-- ==========================================
-- Financial Accounts (full 2025 budget chart)
-- ==========================================
-- Revenue
INSERT INTO financial_account (code,name,category) VALUES
('4000','Sales - T&E','Revenue'),
('4200','Sales - Managed Services - Contract','Revenue'),
('4300','Sales - Managed Services - Overages','Revenue'),
('4301','Sales - Pass Through Consultancy','Revenue'),
('4400','Marketplace Service Contract','Revenue'),
('4600','Marketplace Subscription','Revenue'),
('4601','Discounted HR Hours (Coding)','Revenue'),
('4602','Sales Discount','Revenue'),
('4603','Purchase Discount','Revenue'),
('4911','Billable Expenses','Revenue'),
('4990','Miscellaneous Revenue','Revenue');

-- COS (major)
INSERT INTO financial_account (code,name,category) VALUES
('5000','COS - T&E Billable Hours - Partners','COS'),
('5001','COS - T&E Billable Hours - EEs','COS'),
('5002','COS - T&E Billable Hours - EACPs','COS'),
('5003','COS - T&E Billable Hours - Subs','COS'),
('5010','COS - T&E Sales Commissions','COS'),
('5011','COS - T&E Recruiting Commissions','COS'),
('5200','COS - Managed Services Hours - Partners','COS'),
('5201','COS - Managed Services Hours - EEs','COS'),
('5202','COS - Managed Services Hours - EACPs','COS'),
('5203','COS - Managed Services Hours - Subs','COS'),
('5210','COS - Managed Services Sales Commissions','COS'),
('5211','COS - Managed Services Recruiting Commissions','COS'),
('5700','COS - Intercompany - GSH Hours','COS'),
('5300','COS - Bonuses','COS'),
('5320','COS - Employee Benefits','COS'),
('5330','COS - Payroll Taxes','COS'),
('5400','COS - Software','COS'),
('5500','COS - Subscription Hours - Partners','COS'),
('5501','COS - Subscription Hours - EEs','COS'),
('5502','COS - Subscription Hours - EACPs','COS'),
('5503','COS - Subscription Hours - Subs','COS'),
('5510','COS - Subscription Sales Commissions','COS'),
('5910','NB Hours','COS'),
('5990','COS - Benefits','COS'),
('5912','COS - Non-Billable Expenses','COS'),
('5913','COS - Portal Fees','COS');

-- SG&A
INSERT INTO financial_account (code,name,category) VALUES
('6000','Salaries and Wages','SGA'),
('6001','Salaries and Wages (Contra)','SGA'),
('6004','Salaries and Wages (Overutilization)','SGA'),
('6005','Bonuses YE','SGA'),
('6006','Bonuses - Other','SGA'),
('6007','Practice Lead Commissions','SGA'),
('6010','Officers'' Compensation','SGA'),
('6011','Partner Performance Comp','SGA'),
('6012','Annual Performance Bonus','SGA'),
('6020','Employee Benefits','SGA'),
('6021','Office Parking','SGA'),
('6022','401k Match','SGA'),
('6023','Car Phone Allowance','SGA'),
('6025','EICP Grant Expense','SGA'),
('6040','Payroll Fees','SGA'),
('6050','Payroll Taxes','SGA'),
('6090','Recruiting','SGA'),
('6100','Marketing and Advertising','SGA'),
('6101','Marketing Gift Cards','SGA'),
('6105','Travel Expenses','SGA'),
('6110','Meals (50%)','SGA'),
('6111','Meals (100%)','SGA'),
('6112','Entertainment (0%)','SGA'),
('6113','Entertainment (100%)','SGA'),
('6115','Conferences Fees','SGA'),
('6119','Operating Lease Expense','SGA'),
('6121','Outside Services','SGA'),
('6122','Insurance','SGA'),
('6123','Legal and Professional Fees','SGA'),
('6125','Licenses and Fees','SGA'),
('6130','Telephone','SGA'),
('6131','Training and Education','SGA'),
('6135','Depreciation - Equipment','SGA'),
('6137','New Service Offering Development','SGA'),
('6139','Software','SGA'),
('6140','Office Supplies and Small Equipment','SGA'),
('6142','Freight and Postage','SGA'),
('6145','Bank Service Charges','SGA'),
('6160','Donations','SGA'),
('6180','Penalties','SGA'),
('6800','Income Tax','SGA'),
('8100','Interest Expense','SGA'),
('8900','Bad Debt','SGA');

-- =========================
-- 2025 Budget facts (amounts) – tied to org units at pillar level (you can reallocate in UI)
-- =========================

-- Revenue totals
INSERT INTO financial_fact (account_id,org_unit_id,period,type,amount)
SELECT fa.account_id, ou.org_unit_id, '2025','budget', v.amt
FROM financial_account fa, org_unit ou,
     (VALUES
       ('4000',39026146.00),
       ('4600',573326.00),
       ('4601',-573326.00),
       ('4602',-145813.00),
       ('4603',-13409.00),
       ('4911',863303.00)
     ) as v(code,amt)
WHERE fa.code=v.code AND ou.code='PILLAR_SERVICE_EXEC';

-- COS totals
INSERT INTO financial_fact (account_id,org_unit_id,period,type,amount)
SELECT fa.account_id, ou.org_unit_id, '2025','budget', v.amt
FROM financial_account fa, org_unit ou,
     (VALUES
       ('5000',1420088.00),
       ('5001',8833015.00),
       ('5002',2373584.00),
       ('5003',7855647.00),
       ('5010',941727.00),
       ('5011',171521.00),
       ('5700',89245.00),
       ('5300',1764783.00),
       ('5320',1083529.00),
       ('5330',920647.00),
       ('5400',11779.00),
       ('5910',249259.00),
       ('5990',863303.00),
       ('5912',50883.00),
       ('5913',6497.00)
     ) as v(code,amt)
WHERE fa.code=v.code AND ou.code='PILLAR_SERVICE_EXEC';

-- SG&A totals
INSERT INTO financial_fact (account_id,org_unit_id,period,type,amount)
SELECT fa.account_id, ou.org_unit_id, '2025','budget', v.amt
FROM financial_account fa, org_unit ou,
     (VALUES
       ('6000',2602798.00),
       ('6005',235411.00),
       ('6006',68912.00),
       ('6007',185046.00),
       ('6010',1199992.00),
       ('6011',595912.00),
       ('6012',1035400.00),
       ('6020',407032.00),
       ('6021',33600.00),
       ('6022',150913.00),
       ('6023',17168.00),
       ('6025',222668.00),
       ('6040',346797.00),
       ('6050',430969.00),
       ('6090',20515.00),
       ('6100',61675.00),
       ('6101',9500.00),
       ('6105',567646.00),
       ('6110',149922.00),
       ('6111',29592.00),
       ('6112',26592.00),
       ('6113',26787.00),
       ('6115',120581.00),
       ('6119',144000.00),
       ('6121',50000.00),
       ('6122',57979.00),
       ('6123',176505.00),
       ('6125',39125.00),
       ('6130',8070.00),
       ('6131',80140.00),
       ('6135',38124.00),
       ('6139',512379.00),
       ('6140',126671.00),
       ('6142',3700.00),
       ('6145',12200.00),
       ('6160',29500.00),
       ('6180',750.00),
       ('8100',132147.00),
       ('8900',82093.00),
       ('6800',6000.00)
     ) as v(code,amt)
WHERE fa.code=v.code AND ou.code='PILLAR_FINOPS';

-- =========================
-- Rate Cards (avg bill/cost rates by role/practice)
-- =========================
-- High-level: you will refine rates later; seeded to support per-person facts now.
-- Delivery consultants (practice-specific)
INSERT INTO rate_card (role_id,bill_rate,cost_rate)
SELECT (SELECT role_id FROM org_role WHERE code='CONSULTANT'), 168, 95;  -- default; practice-specific overrides next

-- Practice-specific overrides (insert additional rows; app will choose org-specific first)
-- Cloud HCM, ERP, Tech
INSERT INTO rate_card (role_id,bill_rate,cost_rate) VALUES
((SELECT role_id FROM org_role WHERE code='CONSULTANT'),168,95),  -- HCM
((SELECT role_id FROM org_role WHERE code='CONSULTANT'),170,98),  -- ERP
((SELECT role_id FROM org_role WHERE code='CONSULTANT'),180,105); -- Tech

-- MAS PMO / SAS
INSERT INTO rate_card (role_id,bill_rate,cost_rate) VALUES
((SELECT role_id FROM org_role WHERE code='CONSULTANT'),194,110), -- PMO
((SELECT role_id FROM org_role WHERE code='CONSULTANT'),176,100); -- SAS

-- EPM Planning / Close
INSERT INTO rate_card (role_id,bill_rate,cost_rate) VALUES
((SELECT role_id FROM org_role WHERE code='CONSULTANT'),168,96),  -- EPM Planning
((SELECT role_id FROM org_role WHERE code='CONSULTANT'),165,95);  -- EPM Close

-- OnPrem PeopleSoft
INSERT INTO rate_card (role_id,bill_rate,cost_rate) VALUES
((SELECT role_id FROM org_role WHERE code='CONSULTANT'),178,102);

-- Treasury Kyriba / PSFT Treasury
INSERT INTO rate_card (role_id,bill_rate,cost_rate) VALUES
((SELECT role_id FROM org_role WHERE code='CONSULTANT'),205,120), -- Kyriba
((SELECT role_id FROM org_role WHERE code='CONSULTANT'),194,112); -- PSFT Treasury

-- Accounting / HR / Sales generic cost rates (non-billable or internal charge)
INSERT INTO rate_card (role_id,bill_rate,cost_rate) VALUES
((SELECT role_id FROM org_role WHERE code='STAFF_ACCOUNTANT'),0,85),
((SELECT role_id FROM org_role WHERE code='DIR_ACCOUNTING'),0,120),
((SELECT role_id FROM org_role WHERE code='HR_LEAD'),0,115),
((SELECT role_id FROM org_role WHERE code='SR_RECRUITER'),0,95),
((SELECT role_id FROM org_role WHERE code='SALES_REP'),0,100),
((SELECT role_id FROM org_role WHERE code='SALES_DIR'),0,140),
((SELECT role_id FROM org_role WHERE code='PROPOSAL_MGR'),0,110),
((SELECT role_id FROM org_role WHERE code='PROPOSAL_SPEC'),0,85),
((SELECT role_id FROM org_role WHERE code='MKTG_DIR'),0,120),
((SELECT role_id FROM org_role WHERE code='MKTG_SPEC'),0,90),
((SELECT role_id FROM org_role WHERE code='PM'),175,110),
((SELECT role_id FROM org_role WHERE code='DELIVERY_LEAD'),200,150),
((SELECT role_id FROM org_role WHERE code='PARTNER'),215,160),
((SELECT role_id FROM org_role WHERE code='ASSOC_PARTNER'),200,145);

-- =========================
-- Per-Person Facts (2025 budget) – evenly divide practice totals
-- =========================
-- Helper CTE of practice totals from Elire.md (hours + avg bill rate)
WITH practice_totals AS (
  SELECT 'SE_MAS_PMO'::text unit_code, 2600::numeric hrs, 194::numeric rate UNION ALL
  SELECT 'SE_MAS_SAS', 6901, 176 UNION ALL
  SELECT 'SE_CLOUD_HCM', 41462, 168 UNION ALL
  SELECT 'SE_CLOUD_ERP', 22826, 170 UNION ALL
  SELECT 'SE_CLOUD_TECH', 11520, 180 UNION ALL
  SELECT 'SE_ONPREM_PSFT', 59595, 178 UNION ALL
  SELECT 'SE_EPM_PLANNING', 18290, 168 UNION ALL
  SELECT 'SE_EPM_CLOSE', 12796, 165 UNION ALL
  SELECT 'SE_TREASURY_KYRIBA', 11210, 205 UNION ALL
  SELECT 'SE_TREASURY_PSFT', 8751, 194
),
practice_people AS (
  SELECT ou.org_unit_id, ou.code unit_code, p.person_id, r.code role_code
  FROM org_unit ou
  JOIN person p ON p.org_unit_id=ou.org_unit_id
  LEFT JOIN org_role r ON r.role_id=p.role_id
  WHERE ou.code IN (SELECT unit_code FROM practice_totals)
),
alloc AS (
  SELECT
    t.unit_code,
    count(*) FILTER (WHERE pp.role_code='CONSULTANT' OR pp.role_code IN ('PARTNER','ASSOC_PARTNER','PM')) AS headcount_deliv,
    t.hrs,
    t.rate,
    (CASE WHEN count(*) FILTER (WHERE pp.role_code='CONSULTANT' OR pp.role_code IN ('PARTNER','ASSOC_PARTNER','PM'))>0
          THEN t.hrs / count(*) FILTER (WHERE pp.role_code='CONSULTANT' OR pp.role_code IN ('PARTNER','ASSOC_PARTNER','PM'))::numeric
          ELSE 0 END) AS hrs_per_person
  FROM practice_totals t
  JOIN practice_people pp ON pp.unit_code=t.unit_code
  GROUP BY t.unit_code, t.hrs, t.rate
)
INSERT INTO person_fact (person_id,period,type,billable_hours,cost_amount,bill_rate,cost_rate)
SELECT
  pp.person_id,
  '2025'::text,
  'budget'::text,
  CASE WHEN (pp.role_code='CONSULTANT' OR pp.role_code IN ('PARTNER','ASSOC_PARTNER','PM')) THEN a.hrs_per_person ELSE 0 END AS billable_hours,
  NULL::numeric,   -- leave cost_amount null here; COS accounts handle cost. You will overwrite with actuals later.
  CASE WHEN (pp.role_code='CONSULTANT' OR pp.role_code IN ('PARTNER','ASSOC_PARTNER','PM')) THEN a.rate ELSE rc.bill_rate END AS bill_rate,
  rc.cost_rate
FROM practice_people pp
JOIN alloc a ON a.unit_code=pp.unit_code
LEFT JOIN org_role rr ON rr.code=pp.role_code
LEFT JOIN rate_card rc ON rc.role_id=rr.role_id;

COMMIT;
