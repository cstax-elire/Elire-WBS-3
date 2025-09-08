-- Create missing view for evidence page
CREATE OR REPLACE VIEW v_observed_from_evidence AS
SELECT 
  el.unit_id,
  au.code AS unit_code,
  au.name AS unit_name,
  el.evidence_type,
  el.system_ref,
  COALESCE(p.full_name, 'System') AS actor,
  r.code AS actor_role,
  o.code AS actor_org,
  el.occurred_at,
  el.notes
FROM evidence_log el
JOIN atomic_unit au ON au.unit_id = el.unit_id
LEFT JOIN person p ON p.person_id = el.actor_person_id
LEFT JOIN org_role r ON r.role_id = el.actor_role_id
LEFT JOIN org_unit o ON o.org_unit_id = el.org_unit_id;