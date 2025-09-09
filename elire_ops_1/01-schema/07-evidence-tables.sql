-- ==============================
-- Evidence and Audit Tables
-- ==============================

CREATE TABLE evidence_log (
  evidence_id        BIGSERIAL PRIMARY KEY,
  unit_id            INT NOT NULL REFERENCES atomic_unit(unit_id) ON DELETE CASCADE,
  subject_ref        TEXT NOT NULL,
  evidence_type      TEXT NOT NULL,        -- e.g., 'solution_outline','pricing_decision','recruit_req'
  system_ref         TEXT,                 -- consider SOR FK later
  actor_person_id    INT REFERENCES person(person_id),
  actor_role_id      INT REFERENCES org_role(role_id),
  org_unit_id        INT REFERENCES org_unit(org_unit_id),
  occurred_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes              TEXT
);

-- Create indexes for evidence log
CREATE INDEX ix_evidence_unit_time ON evidence_log (unit_id, occurred_at DESC);
CREATE INDEX ix_evidence_subject   ON evidence_log (subject_ref);