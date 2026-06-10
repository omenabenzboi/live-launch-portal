
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
-- authenticated still needs EXECUTE because RLS policies reference has_role(auth.uid(), ...)
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
