-- Migration 022: Board Evaluations & Performance
-- Phase 16: Self-assessments, peer reviews, board evaluations, and performance reports

-- 1. Evaluation templates (reusable question sets)
CREATE TABLE IF NOT EXISTS evaluation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT,
  evaluation_type VARCHAR(30) NOT NULL CHECK (evaluation_type IN ('self_assessment', 'peer_review', 'board_evaluation')),
  -- questions JSONB array: [{id, question, type: rating|scale|text|multi_choice, options?, required}]
  questions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Evaluations (individual instances of someone filling a template)
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES evaluation_templates(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES profiles(id),       -- person doing the evaluation
  subject_id UUID REFERENCES board_members(id),             -- person being evaluated (NULL for board_evaluation)
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  -- responses JSONB map: {question_id: answer_value}
  responses JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One evaluation per evaluator per subject per template
  UNIQUE(evaluator_id, subject_id, template_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_eval_templates_org ON evaluation_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_eval_templates_type ON evaluation_templates(evaluation_type);
CREATE INDEX IF NOT EXISTS idx_evaluations_org ON evaluations(organization_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator ON evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_subject ON evaluations(subject_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_template ON evaluations(template_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);

-- 4. Enable RLS
ALTER TABLE evaluation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DO $$
BEGIN
    -- Templates: anyone in the org can read active templates; owner manages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view active templates for their org') THEN
        CREATE POLICY "Users can view active templates for their org"
          ON evaluation_templates FOR SELECT
          USING (organization_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Org owners can manage evaluation templates') THEN
        CREATE POLICY "Org owners can manage evaluation templates"
          ON evaluation_templates FOR ALL
          USING (organization_id = auth.uid());
    END IF;

    -- Evaluations: evaluator can read/write own; org owner can read all
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own evaluations') THEN
        CREATE POLICY "Users can view own evaluations"
          ON evaluations FOR SELECT
          USING (evaluator_id = auth.uid() OR organization_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create evaluations') THEN
        CREATE POLICY "Users can create evaluations"
          ON evaluations FOR INSERT
          WITH CHECK (evaluator_id = auth.uid() AND organization_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own draft evaluations') THEN
        CREATE POLICY "Users can update own draft evaluations"
          ON evaluations FOR UPDATE
          USING (evaluator_id = auth.uid() AND status = 'draft');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Org owners can delete evaluations') THEN
        CREATE POLICY "Org owners can delete evaluations"
          ON evaluations FOR DELETE
          USING (organization_id = auth.uid());
    END IF;
END $$;

-- 6. Updated-at triggers
DROP TRIGGER IF EXISTS update_eval_templates_updated_at ON evaluation_templates;
CREATE TRIGGER update_eval_templates_updated_at
  BEFORE UPDATE ON evaluation_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evaluations_updated_at ON evaluations;
CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
