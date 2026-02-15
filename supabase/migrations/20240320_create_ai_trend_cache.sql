-- Create the cache table for AI trend intelligence
CREATE TABLE IF NOT EXISTS public.ai_trend_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  risk_level TEXT NOT NULL, -- LOW, MEDIUM, HIGH
  summary TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  confidence_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_trend_intelligence ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own org trend intelligence" ON public.ai_trend_intelligence
FOR SELECT TO authenticated USING (auth.uid() = org_id);

CREATE POLICY "Users can insert their own org trend intelligence" ON public.ai_trend_intelligence
FOR INSERT TO authenticated WITH CHECK (auth.uid() = org_id);

CREATE POLICY "Users can update their own org trend intelligence" ON public.ai_trend_intelligence
FOR UPDATE TO authenticated USING (auth.uid() = org_id);