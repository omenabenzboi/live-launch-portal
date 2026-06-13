
ALTER TABLE public.approvals
  ADD COLUMN IF NOT EXISTS tool_name text,
  ADD COLUMN IF NOT EXISTS risk_level text NOT NULL DEFAULT 'restricted',
  ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS input_summary text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

ALTER TABLE public.approvals
  DROP CONSTRAINT IF EXISTS approvals_risk_level_check;
ALTER TABLE public.approvals
  ADD CONSTRAINT approvals_risk_level_check
  CHECK (risk_level IN ('safe','restricted','dangerous'));

CREATE INDEX IF NOT EXISTS approvals_conversation_idx
  ON public.approvals(conversation_id, created_at DESC);

DROP POLICY IF EXISTS "approvals owner update" ON public.approvals;
CREATE POLICY "approvals owner update"
  ON public.approvals FOR UPDATE TO authenticated
  USING (auth.uid() = requested_by)
  WITH CHECK (auth.uid() = requested_by);

ALTER TABLE public.servers
  ADD COLUMN IF NOT EXISTS workspace_root text,
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS adapter_mode text NOT NULL DEFAULT 'mock',
  ADD COLUMN IF NOT EXISTS last_health_at timestamptz;

ALTER TABLE public.servers
  DROP CONSTRAINT IF EXISTS servers_adapter_mode_check;
ALTER TABLE public.servers
  ADD CONSTRAINT servers_adapter_mode_check
  CHECK (adapter_mode IN ('mock','dry-run','remote-agent','ssh'));
