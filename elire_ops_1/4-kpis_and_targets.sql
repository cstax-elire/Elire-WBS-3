BEGIN;

-- ===========================================================
-- KPI dictionary (as-is SPI/Analysis.md set, tagged + targeted)
-- ===========================================================
-- Leading vs Lagging; Scope = unit/stream/firm; North Star = Financial/Client/People

-- Leadership “as-is” SPI survey KPIs (lagging, firm) – kept for completeness
INSERT INTO kpi (code,name,kind,scope,unit_of_measure,north_star) VALUES
('LEADERSHIP_CLARITY','SPI: Vision/Mission Understood','lagging','firm','score','People'),
('LEADERSHIP_CONFIDENCE','SPI: Confidence in Leadership','lagging','firm','score','People'),
('LEADERSHIP_EASE','SPI: Ease of Getting Things Done','lagging','firm','score','People'),
('LEADERSHIP_ALIGNMENT','SPI: Goals/Measurements Alignment','lagging','firm','score','People'),
('LEADERSHIP_FUTURE','SPI: Confidence in Future','lagging','firm','score','People'),
('LEADERSHIP_COMM','SPI: Communicates Effectively','lagging','firm','score','People'),
('LEADERSHIP_NIMBLE','SPI: Embraces Change','lagging','firm','score','People'),
('LEADERSHIP_INNOV','SPI: Innovation Focus','lagging','firm','score','People'),
('LEADERSHIP_DATA','SPI: Data-Driven','lagging','firm','score','People');

-- Client Relationships (from Analysis.md)
INSERT INTO kpi (code,name,kind,scope,unit_of_measure,north_star) VALUES
('DEAL_PIPELINE_COVER','Deal Pipeline / Qtr Forecast','lagging','stream','ratio','Financial'),
('SOW_CLOSED','SOW Closed Deals','lagging','stream','$','Financial'),
('BDR_OPPS','BDR-Generated Opportunities','lagging','stream','count','Financial'),
('RFP_WIN_RATE','RFP Win Rate (incl down-select)','lagging','stream','%','Financial'),
('MS_WON_PCT','Managed Services - % of Won','lagging','stream','%','Financial'),
('MKTG_PIPELINE','Marketing-Generated Pipeline','lagging','stream','$','Financial'),
('INBOUND_WEB_LEADS','Inbound Web Leads','lagging','stream','count','Client');

-- Finance & Operations (from Analysis.md)
INSERT INTO kpi (code,name,kind,scope,unit_of_measure,north_star) VALUES
('REV_PER_BILLABLE','Annual Rev per Billable','lagging','firm','$','Financial'),
('REV_PER_EMP','Annual Rev per Employee','lagging','firm','$','Financial'),
('REVENUE_LEAKAGE','Revenue Leakage','lagging','firm','$','Financial'),
('DAYS_TO_INVOICE','Days to Invoice','leading','unit','days','Financial'),
('HOURS_TO_FINANCIALS','Hours to Produce Financials','leading','firm','hours','Financial'),
('INVOICE_REWORK','Invoice Rework','leading','unit','%','Financial');

-- Service Execution (from Analysis.md)
INSERT INTO kpi (code,name,kind,scope,unit_of_measure,north_star) VALUES
('PATH_TO_CLOUD_PIPE','Path to Cloud Cumulative Pipeline','lagging','stream','$','Financial'),
('TARGETED_SALES_MSG_CNT','# Clients with Targeted Sales Message','lagging','stream','count','Client'),
('TARGETED_SALES_GEN','Sales from Targeted Messages','lagging','stream','$','Financial'),
('FEDERAL_SOW_SALES','Federal Client SOW Sales','lagging','stream','$','Financial'),
('PSA_CSAT','PSA Customer Satisfaction','lagging','stream','score','Client'),
('CLIENT_CSAT','Client Satisfaction','lagging','stream','score','Client');

-- Talent (from Analysis.md)
INSERT INTO kpi (code,name,kind,scope,unit_of_measure,north_star) VALUES
('EMP_SAT','Employee Satisfaction','lagging','firm','score','People'),
('ATTRITION','Total Employee Attrition YTD','lagging','firm','%','People'),
('DAYS_TO_RECRUIT','Days to Recruit & Hire','leading','unit','days','People'),
('PCT_BILLABLE','% of Employees Billable','lagging','firm','%','Financial');

-- “Operational” Rosetta KPIs (drivers + outcomes you’ll actually manage)
INSERT INTO kpi (code,name,kind,scope,unit_of_measure,north_star) VALUES
-- Leading (controllable @ unit)
('LEAD_RESP_TIME','Lead Response Time','leading','unit','minutes','Client'),
('QUAL_COMPLETE','Qualification Completeness','leading','unit','%','Client'),
('OUTLINE_VALID','Solution Outline Validated','leading','unit','%','Client'),
('DISCOUNT_CYCLE','Discount Decision Cycle','leading','unit','hours','Financial'),
('PROPOSAL_REUSE','Proposal Content Reuse','leading','unit','%','Financial'),
('HANDOFF_COMPLETE','Handoff Completeness','leading','unit','%','Client'),
('TIME_TO_STAFF','Time to Staff Role','leading','unit','days','People'),
('SCOPE_CAPTURE','Scope Capture Ratio','leading','unit','%','Financial'),
('INVOICE_ERR','Invoice Error Rate','leading','unit','%','Financial'),
('TIME_TO_FILL','Time to Fill (Recruiting)','leading','unit','days','People'),
('CERTS_PER_FTE','Certifications per FTE','leading','unit','count','People'),
('PLAN_ACCURACY_90D','Forecast Accuracy (90d)','leading','unit','%','Financial'),
-- Lagging (outcomes @ stream/firm)
('WIN_RATE','Win Rate','lagging','stream','%','Financial'),
('AVG_SOLD_MARGIN','Avg Sold GM%','lagging','stream','%','Financial'),
('REALIZATION','Margin Realization','lagging','stream','%','Financial'),
('ON_TIME','Projects Delivered On-Time','lagging','stream','%','Client'),
('UTILIZATION','Billable Utilization','lagging','stream','%','Financial'),
('DSO','Days Sales Outstanding','lagging','stream','days','Financial'),
('EBITDA','EBITDA Margin','lagging','firm','%','Financial');

-- =========================
-- KPI ↔ Atomic Unit (drivers)
-- =========================
-- WIN drivers
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='WIN-01' AND k.code IN ('LEAD_RESP_TIME','QUAL_COMPLETE');
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='WIN-02' AND k.code='OUTLINE_VALID';
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='WIN-03' AND k.code IN ('DISCOUNT_CYCLE','AVG_SOLD_MARGIN','REALIZATION');
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='WIN-04' AND k.code IN ('PROPOSAL_REUSE','WIN_RATE');
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='WIN-05' AND k.code IN ('WIN_RATE');

-- DELIVER drivers
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='DEL-01' AND k.code='HANDOFF_COMPLETE';
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='DEL-02' AND k.code IN ('TIME_TO_STAFF','UTILIZATION');
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='DEL-03' AND k.code='ON_TIME';
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='DEL-04' AND k.code IN ('SCOPE_CAPTURE','REALIZATION');
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='DEL-05' AND k.code IN ('ON_TIME','REALIZATION');

-- COLLECT drivers
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='COL-01' AND k.code='INVOICE_ERR';
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='COL-02' AND k.code='DSO';
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='COL-03' AND k.code='REALIZATION';

-- TALENT drivers
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='TAL-01' AND k.code='TIME_TO_FILL';
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='TAL-02' AND k.code='HANDOFF_COMPLETE';
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='TAL-03' AND k.code='CERTS_PER_FTE';
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='TAL-04' AND k.code='ATTRITION';

-- OPERATE drivers
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='OPS-01' AND k.code='PLAN_ACCURACY_90D';
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='OPS-02' AND k.code='EBITDA';
INSERT INTO unit_kpi (unit_id,kpi_id)
SELECT u.unit_id, k.kpi_id FROM atomic_unit u, kpi k WHERE u.code='OPS-03' AND k.code='EBITDA';

-- =========================
-- KPI Targets (benchmarks/budget-aligned)
-- =========================
-- Stream targets
INSERT INTO kpi_target (kpi_id,scope,stream_id,valid_from,target_value,threshold_yellow,threshold_red)
SELECT k.kpi_id,'stream',s.stream_id,current_date,
       CASE k.code WHEN 'WIN_RATE' THEN 0.40 WHEN 'AVG_SOLD_MARGIN' THEN 0.38 ELSE NULL END,
       CASE k.code WHEN 'WIN_RATE' THEN 0.35 WHEN 'AVG_SOLD_MARGIN' THEN 0.35 ELSE NULL END,
       CASE k.code WHEN 'WIN_RATE' THEN 0.30 WHEN 'AVG_SOLD_MARGIN' THEN 0.32 ELSE NULL END
FROM kpi k JOIN stream s ON s.code='WIN' WHERE k.code IN ('WIN_RATE','AVG_SOLD_MARGIN');

INSERT INTO kpi_target (kpi_id,scope,stream_id,valid_from,target_value,threshold_yellow,threshold_red)
SELECT k.kpi_id,'stream',s.stream_id,current_date,
       CASE k.code WHEN 'REALIZATION' THEN 0.95 WHEN 'ON_TIME' THEN 0.90 WHEN 'UTILIZATION' THEN 0.75 ELSE NULL END,
       CASE k.code WHEN 'REALIZATION' THEN 0.92 WHEN 'ON_TIME' THEN 0.85 WHEN 'UTILIZATION' THEN 0.70 ELSE NULL END,
       CASE k.code WHEN 'REALIZATION' THEN 0.90 WHEN 'ON_TIME' THEN 0.80 WHEN 'UTILIZATION' THEN 0.65 ELSE NULL END
FROM kpi k JOIN stream s ON s.code='DELIVER' WHERE k.code IN ('REALIZATION','ON_TIME','UTILIZATION');

INSERT INTO kpi_target (kpi_id,scope,stream_id,valid_from,target_value,threshold_yellow,threshold_red)
SELECT k.kpi_id,'stream',s.stream_id,current_date,
       CASE k.code WHEN 'DSO' THEN 45 ELSE NULL END,
       CASE k.code WHEN 'DSO' THEN 60 ELSE NULL END,
       CASE k.code WHEN 'DSO' THEN 75 ELSE NULL END
FROM kpi k JOIN stream s ON s.code='COLLECT' WHERE k.code='DSO';

-- Firm targets
INSERT INTO kpi_target (kpi_id,scope,unit_id,stream_id,valid_from,target_value,threshold_yellow,threshold_red)
SELECT k.kpi_id,'firm',NULL,NULL,current_date,0.15,0.13,0.11
FROM kpi k WHERE k.code='EBITDA';

INSERT INTO kpi_target (kpi_id,scope,unit_id,stream_id,valid_from,target_value,threshold_yellow,threshold_red)
SELECT k.kpi_id,'firm',NULL,NULL,current_date,0.12,0.14,0.16
FROM kpi k WHERE k.code='ATTRITION';

-- Unit-level dials
INSERT INTO kpi_target (kpi_id,scope,unit_id,valid_from,target_value,threshold_yellow,threshold_red)
SELECT k.kpi_id,'unit',u.unit_id,current_date,24,36,48
FROM kpi k, atomic_unit u WHERE k.code='DISCOUNT_CYCLE' AND u.code='WIN-03';

INSERT INTO kpi_target (kpi_id,scope,unit_id,valid_from,target_value,threshold_yellow,threshold_red)
SELECT k.kpi_id,'unit',u.unit_id,current_date,0.80,0.70,0.60
FROM kpi k, atomic_unit u WHERE k.code='SCOPE_CAPTURE' AND u.code='DEL-04';

INSERT INTO kpi_target (kpi_id,scope,unit_id,valid_from,target_value,threshold_yellow,threshold_red)
SELECT k.kpi_id,'unit',u.unit_id,current_date,45,60,75
FROM kpi k, atomic_unit u WHERE k.code='TIME_TO_FILL' AND u.code='TAL-01';

COMMIT;
