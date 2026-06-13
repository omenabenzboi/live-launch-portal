
-- 1. Provider configs: hide secret column from authenticated users; add validation tracking.
ALTER TABLE public.provider_configs
  ADD COLUMN IF NOT EXISTS last_validated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_validation_status TEXT,
  ADD COLUMN IF NOT EXISTS last_validation_error TEXT;

REVOKE SELECT ON public.provider_configs FROM authenticated;
GRANT SELECT (
  id, kind, name, base_url, default_model, enabled, models,
  last_validated_at, last_validation_status, last_validation_error,
  created_by, created_at, updated_at
) ON public.provider_configs TO authenticated;
GRANT ALL ON public.provider_configs TO service_role;

-- 2. Workspaces: control-plane columns.
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS allowed_paths TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS default_branch TEXT,
  ADD COLUMN IF NOT EXISTS repo_url TEXT,
  ADD COLUMN IF NOT EXISTS file_access_policy TEXT NOT NULL DEFAULT 'restricted',
  ADD COLUMN IF NOT EXISTS command_permission_level TEXT NOT NULL DEFAULT 'restricted-with-approval',
  ADD COLUMN IF NOT EXISTS active_provider_id UUID REFERENCES public.provider_configs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS active_storage_id UUID,
  ADD COLUMN IF NOT EXISTS active_database_id UUID;

-- 3. Database connections.
CREATE TABLE IF NOT EXISTS public.database_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  db_type TEXT NOT NULL,                       -- supabase | postgres | neon | rds | mysql | custom
  connection_url TEXT,                          -- secret: server-only
  secret_ref TEXT,                              -- optional name of a Lovable secret holding the URL
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_validated_at TIMESTAMPTZ,
  last_validation_status TEXT,
  last_validation_error TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT (
  id, name, db_type, secret_ref, enabled,
  last_validated_at, last_validation_status, last_validation_error,
  created_by, created_at, updated_at
) ON public.database_connections TO authenticated;
GRANT ALL ON public.database_connections TO service_role;
ALTER TABLE public.database_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "db read auth" ON public.database_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY "db admin write" ON public.database_connections FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER set_updated_at_db BEFORE UPDATE ON public.database_connections
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4. Storage backends.
CREATE TABLE IF NOT EXISTS public.storage_backends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,    -- supabase | s3 | r2 | vercel-blob | local | custom-s3
  bucket TEXT,
  region TEXT,
  endpoint TEXT,
  access_key_id TEXT,             -- secret
  secret_access_key TEXT,         -- secret
  secret_ref TEXT,                 -- optional Lovable secret name
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_validated_at TIMESTAMPTZ,
  last_validation_status TEXT,
  last_validation_error TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT (
  id, name, provider_type, bucket, region, endpoint, secret_ref,
  is_default, enabled, last_validated_at, last_validation_status,
  last_validation_error, created_by, created_at, updated_at
) ON public.storage_backends TO authenticated;
GRANT ALL ON public.storage_backends TO service_role;
ALTER TABLE public.storage_backends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "storage read auth" ON public.storage_backends FOR SELECT TO authenticated USING (true);
CREATE POLICY "storage admin write" ON public.storage_backends FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER set_updated_at_storage BEFORE UPDATE ON public.storage_backends
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 5. API integrations.
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  auth_type TEXT NOT NULL DEFAULT 'none',  -- none | bearer | api-key | basic | custom-header
  auth_header_name TEXT,                    -- e.g. "X-API-Key" for api-key
  auth_token TEXT,                          -- secret
  secret_ref TEXT,                           -- optional Lovable secret name
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  allow_agent_use BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  last_validated_at TIMESTAMPTZ,
  last_validation_status TEXT,
  last_validation_error TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT (
  id, name, base_url, auth_type, auth_header_name, secret_ref,
  enabled, allow_agent_use, description,
  last_validated_at, last_validation_status, last_validation_error,
  created_by, created_at, updated_at
) ON public.api_integrations TO authenticated;
GRANT ALL ON public.api_integrations TO service_role;
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api read auth" ON public.api_integrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "api admin write" ON public.api_integrations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER set_updated_at_api BEFORE UPDATE ON public.api_integrations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
