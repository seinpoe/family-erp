-- The automatic helper is an internal database concern and is never a browser-accessible RPC endpoint.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
