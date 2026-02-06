-- Phase 17: Africa Compliance Library
-- Regulatory reference database, compliance calendar, and checklists

-- ─── Regulatory reference (global, no org scoping) ───────────────────────────
CREATE TABLE compliance_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country VARCHAR(60) NOT NULL,
  category VARCHAR(40) NOT NULL CHECK (category IN (
    'corporate_governance', 'financial_reporting', 'anti_money_laundering',
    'data_protection', 'tax_compliance', 'securities', 'environmental', 'labor'
  )),
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  reference_code TEXT,
  description TEXT NOT NULL,
  key_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  effective_date DATE,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Per-organization compliance calendar ────────────────────────────────────
CREATE TABLE compliance_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  regulation_id UUID REFERENCES compliance_regulations(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT,
  event_type VARCHAR(30) NOT NULL DEFAULT 'deadline' CHECK (event_type IN (
    'deadline', 'review', 'filing', 'training', 'audit'
  )),
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN (
    'upcoming', 'overdue', 'completed', 'cancelled'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Compliance checklists ────────────────────────────────────────────────────
CREATE TABLE compliance_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  regulation_id UUID REFERENCES compliance_regulations(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT,
  category VARCHAR(40),
  due_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN (
    'draft', 'in_progress', 'completed', 'archived'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Checklist items ──────────────────────────────────────────────────────────
CREATE TABLE compliance_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES compliance_checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'skipped'
  )),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_regulations_country ON compliance_regulations(country);
CREATE INDEX idx_regulations_category ON compliance_regulations(category);
CREATE INDEX idx_calendar_org ON compliance_calendar_events(organization_id);
CREATE INDEX idx_calendar_due ON compliance_calendar_events(due_date);
CREATE INDEX idx_calendar_reg ON compliance_calendar_events(regulation_id);
CREATE INDEX idx_checklists_org ON compliance_checklists(organization_id);
CREATE INDEX idx_checklists_reg ON compliance_checklists(regulation_id);
CREATE INDEX idx_checklist_items_cl ON compliance_checklist_items(checklist_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE compliance_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklist_items ENABLE ROW LEVEL SECURITY;

-- Regulations: public read for all authenticated users
CREATE POLICY "Authenticated users can read regulations"
  ON compliance_regulations FOR SELECT
  USING (true);

-- Calendar events: org-scoped CRUD
CREATE POLICY "Users can view their org calendar events"
  ON compliance_calendar_events FOR SELECT
  USING (organization_id = auth.uid());

CREATE POLICY "Users can create calendar events for their org"
  ON compliance_calendar_events FOR INSERT
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Users can update their org calendar events"
  ON compliance_calendar_events FOR UPDATE
  USING (organization_id = auth.uid());

CREATE POLICY "Users can delete their org calendar events"
  ON compliance_calendar_events FOR DELETE
  USING (organization_id = auth.uid());

-- Checklists: org-scoped CRUD
CREATE POLICY "Users can view their org checklists"
  ON compliance_checklists FOR SELECT
  USING (organization_id = auth.uid());

CREATE POLICY "Users can create checklists for their org"
  ON compliance_checklists FOR INSERT
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Users can update their org checklists"
  ON compliance_checklists FOR UPDATE
  USING (organization_id = auth.uid());

CREATE POLICY "Users can delete their org checklists"
  ON compliance_checklists FOR DELETE
  USING (organization_id = auth.uid());

-- Checklist items: scoped through parent checklist
CREATE POLICY "Users can view items for their org checklists"
  ON compliance_checklist_items FOR SELECT
  USING (checklist_id IN (SELECT id FROM compliance_checklists WHERE organization_id = auth.uid()));

CREATE POLICY "Users can create items for their org checklists"
  ON compliance_checklist_items FOR INSERT
  WITH CHECK (checklist_id IN (SELECT id FROM compliance_checklists WHERE organization_id = auth.uid()));

CREATE POLICY "Users can update items for their org checklists"
  ON compliance_checklist_items FOR UPDATE
  USING (checklist_id IN (SELECT id FROM compliance_checklists WHERE organization_id = auth.uid()));

CREATE POLICY "Users can delete items for their org checklists"
  ON compliance_checklist_items FOR DELETE
  USING (checklist_id IN (SELECT id FROM compliance_checklists WHERE organization_id = auth.uid()));

-- ─── Updated-at triggers ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_compliance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendar_updated_at
  BEFORE UPDATE ON compliance_calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_compliance_timestamp();

CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON compliance_checklists
  FOR EACH ROW EXECUTE FUNCTION update_compliance_timestamp();

CREATE TRIGGER update_checklist_items_updated_at
  BEFORE UPDATE ON compliance_checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_compliance_timestamp();

-- ─── Seed: Africa regulatory database (12 countries, 20 regulations) ─────────
INSERT INTO compliance_regulations (country, category, title, reference_code, description, key_requirements, effective_date)
VALUES
  ('Nigeria', 'corporate_governance', 'Companies Act 2020', 'NG-CA-2020',
   'Primary law governing the incorporation and management of companies in Nigeria. Mandates board composition, AGM requirements, and fiduciary duties.',
   '["Minimum 2 directors for private companies","Annual general meeting within 9 months of year-end","Board must have majority independent directors for public companies","Annual returns filing with Corporate Affairs Commission"]',
   '2020-08-18'),

  ('Nigeria', 'anti_money_laundering', 'EFCC AML/CFT Act', 'NG-AML-2020',
   'Anti-money laundering and counter-financing of terrorism regulations enforced by the Economic and Financial Crimes Commission.',
   '["Customer due diligence for all clients","Suspicious activity reporting within 24 hours","Record retention for minimum 5 years","Staff AML training at least annually"]',
   '2020-05-01'),

  ('Nigeria', 'data_protection', 'NDPC Data Protection Regulation', 'NG-DPR-2023',
   'Regulation by the Nigeria Data Protection Commission governing the collection, storage, and processing of personal data.',
   '["Lawful basis required before data collection","Data protection impact assessment for high-risk processing","Right to erasure upon request","Breach notification within 72 hours"]',
   '2023-10-12'),

  ('South Africa', 'corporate_governance', 'King IV Corporate Governance Code', 'ZA-KING-IV',
   'Fourth edition of the King Code establishing principles of corporate governance for South African organizations.',
   '["Board majority independent directors","Separate Chair and CEO roles","Annual corporate governance report","Stakeholder engagement framework required"]',
   '2017-04-01'),

  ('South Africa', 'data_protection', 'Protection of Personal Information Act (POPIA)', 'ZA-POPIA',
   'South Africa primary data protection law governing the processing of personal information by public and private bodies.',
   '["Lawful basis for processing personal information","Data subject rights: access, correction, erasure","Information officer appointment required","Breach notification to Regulator and affected individuals"]',
   '2021-07-01'),

  ('South Africa', 'securities', 'JSE Listing Requirements', 'ZA-JSE-LR',
   'Requirements for companies listed on the Johannesburg Stock Exchange covering disclosure, governance, and trading.',
   '["Continuous disclosure of material information","Semi-annual and annual financial reporting","Board independence requirements enforced","Related party transaction approval mandatory"]',
   '2019-05-06'),

  ('Kenya', 'corporate_governance', 'Companies Act 2015', 'KE-CA-2015',
   'Kenya primary legislation for the incorporation, management, and winding up of companies.',
   '["Minimum one director for private companies","AGM within 6 months of financial year-end","Annual filing with Registrar of Companies","Directors must comply with fiduciary duties"]',
   '2015-09-01'),

  ('Kenya', 'anti_money_laundering', 'CBK AML/CFT Guidelines', 'KE-CBK-AML',
   'Central Bank of Kenya guidelines on anti-money laundering and counter-financing of terrorism.',
   '["Know Your Customer verification for all clients","Suspicious transaction reporting to Financial Intelligence Unit","Transaction monitoring systems required","Designated AML compliance officer"]',
   '2021-03-15'),

  ('Kenya', 'data_protection', 'Data Protection Act 2019', 'KE-DPA-2019',
   'Governs the collection, processing, and use of personal data in Kenya.',
   '["Registration with Office of the Data Protection Commissioner","Privacy impact assessment for high-risk processing","Cross-border data transfer controls required","Data subject access requests within 30 days"]',
   '2021-01-25'),

  ('Ghana', 'corporate_governance', 'Companies Act 2019 (Act 930)', 'GH-CA-2019',
   'Updated companies law covering incorporation, management, disclosure, and liquidation of companies in Ghana.',
   '["Minimum 1 director private, 2 for public companies","Annual returns filing with Registrar of Companies","Board meetings at least 4 times per year","Disclosure of director interests required"]',
   '2019-08-09'),

  ('Ghana', 'data_protection', 'Data Protection Act (Act 775)', 'GH-DPA-2012',
   'Law regulating the collection, processing, and dissemination of personal data in Ghana.',
   '["Registration of data controllers with NIC","Consent required for sensitive data processing","Right to access and correct personal data","Breach notification obligations apply"]',
   '2013-01-16'),

  ('Egypt', 'corporate_governance', 'Companies Law No. 948', 'EG-CL-2018',
   'Egyptian law governing the establishment, management, and dissolution of companies.',
   '["Minimum 3 directors for joint stock companies","Annual general meeting is mandatory","Independent auditor must be appointed","Financial statements due within 4 months of year-end"]',
   '2018-08-01'),

  ('Egypt', 'securities', 'FRA Corporate Governance Requirements', 'EG-FRA-CG',
   'Financial Regulatory Authority governance requirements for listed companies on the Egyptian stock exchange.',
   '["Board independence: at least one-third","Audit committee must be established","CEO and Chairman separation recommended","Annual corporate governance report required"]',
   '2020-01-01'),

  ('Tanzania', 'corporate_governance', 'Companies Act 2019', 'TZ-CA-2019',
   'Primary legislation governing company formation, management, and operations in Tanzania.',
   '["Directors duties and liabilities apply","Annual general meeting is required","Maintain statutory registers of members","Filing with Registrar of Companies mandatory"]',
   '2019-12-01'),

  ('Rwanda', 'corporate_governance', 'Company Law No. 07/2018', 'RW-CL-2018',
   'Law governing the establishment, management, and liquidation of companies in Rwanda.',
   '["Minimum 1 director for private companies","Annual return filing with Rwanda Governance Board","Board governance and fiduciary obligations","Registered office and corporate seal required"]',
   '2018-05-11'),

  ('Senegal', 'corporate_governance', 'OHADA Uniform Act on Commercial Companies', 'SN-OHADA',
   'OHADA Uniform Act governing commercial company formation and management across West Africa.',
   '["Minimum share capital requirements apply","Board composition and duties defined","Annual general meeting obligations","Financial statement preparation and filing required"]',
   '2015-01-16'),

  ('Uganda', 'corporate_governance', 'Companies Act 2012', 'UG-CA-2012',
   'Uganda primary law on the incorporation, management, and winding up of companies.',
   '["Minimum 1 director for private companies","AGM within 15 months of incorporation","Annual returns filing with Registrar required","Maintenance of statutory books mandatory"]',
   '2013-05-15'),

  ('Morocco', 'corporate_governance', 'Law on Joint Stock Companies', 'MA-SA-LAW',
   'Moroccan law governing joint stock companies covering governance and management.',
   '["Board of at least 3 directors required","Supervisory and management board structure optional","Annual shareholders meeting mandatory","Financial reporting and auditing requirements"]',
   '1996-07-25'),

  ('Cote d''Ivoire', 'corporate_governance', 'OHADA Uniform Act on Commercial Companies', 'CI-OHADA',
   'OHADA framework governing commercial companies in Cote d''Ivoire as an OHADA member state.',
   '["Compliance with OHADA Uniform Act provisions","Board governance standards apply","Annual filing requirements enforced","Shareholder rights and meeting rules defined"]',
   '2015-01-16'),

  ('Ethiopia', 'corporate_governance', 'Commercial Code (Amendment)', 'ET-CC-2019',
   'Amended commercial code governing business entities including companies in Ethiopia.',
   '["Minimum 2 directors for private companies","Annual general meeting is required","Statutory audit for larger companies","Registration with Ministry of Trade required"]',
   '2019-01-01');
