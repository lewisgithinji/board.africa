-- Migration 024: Fix evaluations UPDATE RLS policy
-- The "Users can update own draft evaluations" policy omitted WITH CHECK.
-- PostgreSQL reuses USING as the implicit WITH CHECK for UPDATE, so changing
-- status from 'draft' to 'submitted' violated the status = 'draft' check on
-- the new row.  An explicit WITH CHECK that drops the status filter fixes it.

DROP POLICY IF EXISTS "Users can update own draft evaluations" ON evaluations;

CREATE POLICY "Users can update own draft evaluations"
  ON evaluations FOR UPDATE
  USING (evaluator_id = auth.uid() AND status = 'draft')
  WITH CHECK (evaluator_id = auth.uid());
