-- Migration 016: Professional Profiles, Experiences, Skills, and Certifications
-- This migration sets up the core data structures for Phase 11: Professional Profiles

-- 1. Create professional_profiles table
CREATE TABLE IF NOT EXISTS professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  headline TEXT,
  summary TEXT,
  board_readiness_score INTEGER DEFAULT 0,
  is_marketplace_visible BOOLEAN DEFAULT FALSE,
  availability_status VARCHAR(20) DEFAULT 'open' CHECK (availability_status IN ('looking', 'open', 'busy', 'unavailable')),
  desired_roles TEXT[], -- Array of roles like ['CEO', 'Non-Executive Director', 'Chairman']
  compensation_expectations JSONB, -- { "min": 50000, "currency": "USD", "type": "annual" }
  mobility_preference BOOLEAN DEFAULT TRUE,
  languages TEXT[],
  social_links JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  experience_type VARCHAR(20) DEFAULT 'executive' CHECK (experience_type IN ('executive', 'board', 'academic', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category VARCHAR(50), -- e.g., 'Finance', 'Governance', 'Tech', 'Legal'
  years_experience INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, name)
);

-- 4. Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes for performance
CREATE INDEX idx_prof_profiles_id ON professional_profiles(profile_id);
CREATE INDEX idx_experiences_profile ON experiences(profile_id);
CREATE INDEX idx_skills_profile ON skills(profile_id);
CREATE INDEX idx_certs_profile ON certifications(profile_id);
CREATE INDEX idx_prof_profiles_visible ON professional_profiles(is_marketplace_visible);

-- 6. Enable RLS
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- Professional Profiles
CREATE POLICY "Anyone can view visible professional profiles"
  ON professional_profiles FOR SELECT
  USING (is_marketplace_visible = TRUE OR auth.uid() = profile_id);

CREATE POLICY "Users can manage own professional profile"
  ON professional_profiles FOR ALL
  USING (auth.uid() = profile_id);

-- Experiences
CREATE POLICY "Anyone can view experiences of visible profiles"
  ON experiences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE professional_profiles.profile_id = experiences.profile_id
      AND professional_profiles.is_marketplace_visible = TRUE
    ) OR auth.uid() = profile_id
  );

CREATE POLICY "Users can manage own experiences"
  ON experiences FOR ALL
  USING (auth.uid() = profile_id);

-- Skills
CREATE POLICY "Anyone can view skills of visible profiles"
  ON skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE professional_profiles.profile_id = skills.profile_id
      AND professional_profiles.is_marketplace_visible = TRUE
    ) OR auth.uid() = profile_id
  );

CREATE POLICY "Users can manage own skills"
  ON skills FOR ALL
  USING (auth.uid() = profile_id);

-- Certifications
CREATE POLICY "Anyone can view certifications of visible profiles"
  ON certifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE professional_profiles.profile_id = certifications.profile_id
      AND professional_profiles.is_marketplace_visible = TRUE
    ) OR auth.uid() = profile_id
  );

CREATE POLICY "Users can manage own certifications"
  ON certifications FOR ALL
  USING (auth.uid() = profile_id);

-- 8. Updated At Triggers
CREATE TRIGGER update_prof_profiles_updated_at
  BEFORE UPDATE ON professional_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
