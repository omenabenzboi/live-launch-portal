REVOKE SELECT ON public.servers FROM authenticated;
GRANT SELECT (
  id, name, host, status, last_seen_at, workspace_root, enabled,
  adapter_mode, last_health_at, created_by, created_at, updated_at
) ON public.servers TO authenticated;
GRANT ALL ON public.servers TO service_role;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.approvals;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.approvals REPLICA IDENTITY FULL;