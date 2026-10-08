CREATE TABLE public.saved_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  city text NOT NULL,
  days int NOT NULL DEFAULT 1,
  budget text NOT NULL DEFAULT 'comfort',
  interests text[] NOT NULL DEFAULT '{}',
  plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_trips TO authenticated;
GRANT ALL ON public.saved_trips TO service_role;
ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.saved_trips FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.saved_trips FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.saved_trips FOR DELETE TO authenticated USING (auth.uid() = user_id);