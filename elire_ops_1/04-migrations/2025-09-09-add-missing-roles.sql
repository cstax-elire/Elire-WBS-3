-- ==============================
-- Add Missing Role Codes
-- Date: 2025-09-09
-- Purpose: Add role codes referenced in expected ownership but not in org_role table
-- ==============================

BEGIN;

-- Add missing roles that are referenced in the DatabaseDesign.md
-- These roles may be referenced in unit_expected_ownership or other tables

-- Check if roles exist before inserting (idempotent)
INSERT INTO org_role (code, name) 
SELECT * FROM (VALUES
    ('COO', 'Chief Operating Officer'),
    ('CFO', 'Chief Financial Officer'),
    ('CONTROLLER', 'Controller'),
    ('RESOURCE_MGR', 'Resource Manager')
) AS new_roles(code, name)
WHERE NOT EXISTS (
    SELECT 1 FROM org_role 
    WHERE org_role.code = new_roles.code
);

-- Note: If you prefer to map these to existing roles instead, use these mappings:
-- COO → DELIVERY_LEAD (already exists)
-- CFO → Could map to executive level partner role
-- CONTROLLER → DIR_ACCOUNTING (already exists)
-- RESOURCE_MGR → PMO_LEAD (already exists)

-- Optional: Update any NULL role references that resulted from missing roles
-- This would only apply if inserts were allowed with NULL foreign keys

COMMIT;

-- Verification query
-- Run this after migration to confirm roles exist:
-- SELECT code, name FROM org_role 
-- WHERE code IN ('COO', 'CFO', 'CONTROLLER', 'RESOURCE_MGR')
-- ORDER BY code;