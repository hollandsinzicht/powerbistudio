-- ===== LEADS TABLE =====
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  vertical TEXT NOT NULL CHECK (vertical IN ('beslissers', 'publieke-sector', 'isv', 'vakgenoot')),
  source TEXT NOT NULL CHECK (source IN ('calculator', 'checklist', 'architectuurgids', 'dax-fouten', 'contact')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  nurture_started_at TIMESTAMPTZ,
  nurture_completed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_leads_email ON public.leads (email);
CREATE INDEX idx_leads_vertical ON public.leads (vertical);
CREATE INDEX idx_leads_nurture ON public.leads (nurture_started_at)
  WHERE nurture_completed_at IS NULL AND unsubscribed_at IS NULL;

-- ===== NURTURE EMAILS TABLE =====
CREATE TABLE public.nurture_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vertical TEXT NOT NULL CHECK (vertical IN ('beslissers', 'publieke-sector', 'isv', 'vakgenoot')),
  sequence_number INT NOT NULL CHECK (sequence_number >= 0),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  delay_days INT NOT NULL CHECK (delay_days >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (vertical, sequence_number)
);

-- ===== NURTURE LOG TABLE =====
CREATE TABLE public.nurture_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  nurture_email_id UUID NOT NULL REFERENCES public.nurture_emails(id),
  sent_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT
);

CREATE INDEX idx_nurture_log_lead ON public.nurture_log (lead_id);
CREATE UNIQUE INDEX idx_nurture_log_unique ON public.nurture_log (lead_id, nurture_email_id);

-- ===== RLS POLICIES =====
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurture_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurture_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on leads"
  ON public.leads FOR ALL USING (true);

CREATE POLICY "Service role full access on nurture_emails"
  ON public.nurture_emails FOR ALL USING (true);

CREATE POLICY "Service role full access on nurture_log"
  ON public.nurture_log FOR ALL USING (true);
